"""
build_data.py

Converts raw LILA BLACK parquet telemetry (player_data/{Date}/*.nakama-0)
into a compact, frontend-ready JSON dataset organized map-first:

    output/
      AmbroseValley.json        <- heatmap grids + match index for this map
      GrandRift.json
      Lockdown.json
      matches/
        AmbroseValley/{match_id}.json   <- full path + event data, one match
        GrandRift/{match_id}.json
        Lockdown/{match_id}.json

Usage:
    python build_data.py --input player_data --output output

Assumptions (documented, see ARCHITECTURE.md):
  - user_id is a UUID -> human, purely numeric -> bot (per README)
  - Position/BotPosition rows form a player's path; all other event types
    are discrete markers
  - A row's (x, z) represents the acting entity's location at that event
    (e.g. for "Kill" it's the killer's position, for "Killed" the victim's)
  - "kills" heatmap = Kill + BotKill rows (killer-side events)
    "deaths" heatmap = Killed + BotKilled + KilledByStorm rows (victim-side events)
    "traffic" heatmap = Position + BotPosition rows
  - Malformed/unreadable files are skipped and logged, not fatal
  - Paths longer than MAX_PATH_POINTS are evenly downsampled (playback/render
    perf) - discrete events are never downsampled
"""

import argparse
import json
import os
import re
import sys
from collections import defaultdict

import pyarrow.parquet as pq
import pandas as pd
import numpy as np

# ---- Config -----------------------------------------------------------

MAP_CONFIG = {
    "AmbroseValley": {"scale": 900, "origin_x": -370, "origin_z": -473},
    "GrandRift":     {"scale": 581, "origin_x": -290, "origin_z": -290},
    "Lockdown":      {"scale": 1000, "origin_x": -500, "origin_z": -500},
}

PATH_EVENTS = {"Position", "BotPosition"}
KILL_EVENTS = {"Kill", "BotKill"}
DEATH_EVENTS = {"Killed", "BotKilled", "KilledByStorm"}
LOOT_EVENTS = {"Loot"}
# Anything not in the above buckets is logged as unknown and still kept
# as a generic marker so we never silently drop data.

MAX_PATH_POINTS = 500      # per-player path downsample cap
GRID_SIZE = 64              # heatmap grid resolution (GRID_SIZE x GRID_SIZE bins)
IMG_SIZE = 1024              # minimap pixel dimensions

UUID_RE = re.compile(
    r"^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$"
)


def is_bot(user_id: str) -> bool:
    return not bool(UUID_RE.match(str(user_id)))


def world_to_pixel(x, z, map_id):
    cfg = MAP_CONFIG[map_id]
    u = (x - cfg["origin_x"]) / cfg["scale"]
    v = (z - cfg["origin_z"]) / cfg["scale"]
    px = u * IMG_SIZE
    py = (1 - v) * IMG_SIZE
    return px, py


def downsample(indices_len, max_points):
    """Return evenly-spaced indices (always including first & last)."""
    if indices_len <= max_points:
        return list(range(indices_len))
    step = indices_len / max_points
    idx = sorted(set(int(round(i * step)) for i in range(max_points)))
    if idx[-1] != indices_len - 1:
        idx.append(indices_len - 1)
    return idx


# ---- Step 1: read + normalize every file --------------------------------

def read_all_files(input_dir, log):
    """Yields one normalized DataFrame per successfully-read file."""
    day_dirs = sorted(
        d for d in os.listdir(input_dir)
        if os.path.isdir(os.path.join(input_dir, d)) and d.startswith("February_")
    )
    total, failed = 0, 0
    for day in day_dirs:
        day_path = os.path.join(input_dir, day)
        for fname in os.listdir(day_path):
            total += 1
            fpath = os.path.join(day_path, fname)
            try:
                table = pq.read_table(fpath)
                df = table.to_pandas()
            except Exception as e:
                failed += 1
                log["parse_failures"].append({"file": fname, "day": day, "error": str(e)})
                continue

            if df.empty:
                log["empty_files"].append(fname)
                continue

            # decode event bytes -> str
            df["event"] = df["event"].apply(
                lambda x: x.decode("utf-8") if isinstance(x, bytes) else x
            )

            # drop rows with null coords/ts (data quality guard)
            before = len(df)
            df = df.dropna(subset=["x", "y", "z", "ts", "event", "user_id", "match_id", "map_id"])
            dropped = before - len(df)
            if dropped:
                log["null_rows_dropped"] += dropped

            if df.empty:
                continue

            df["date"] = day
            df["is_bot"] = df["user_id"].apply(is_bot)
            # ts is datetime64[ms], astype("int64") gives total epoch milliseconds directly
            df["ts_ms"] = df["ts"].astype("int64")

            unknown_events = set(df["event"].unique()) - PATH_EVENTS - KILL_EVENTS - DEATH_EVENTS - LOOT_EVENTS
            if unknown_events:
                log["unknown_event_types"].update(unknown_events)

            yield df

    log["files_seen"] = total
    log["files_failed"] = failed


# ---- Step 2: group into matches, build per-match JSON --------------------

def build_match_record(match_df, match_id, map_id, date):
    players = []
    events = []

    # Calculate match start time to normalize all timestamps relative to match start (0 ms)
    min_ts = match_df["ts_ms"].min()

    for user_id, pdf in match_df.groupby("user_id"):
        pdf = pdf.sort_values("ts_ms")
        bot = bool(pdf["is_bot"].iloc[0])

        path_rows = pdf[pdf["event"].isin(PATH_EVENTS)]
        if len(path_rows) > 0:
            keep_idx = downsample(len(path_rows), MAX_PATH_POINTS)
            path_rows = path_rows.iloc[keep_idx]
            px, py = world_to_pixel(path_rows["x"].values, path_rows["z"].values, map_id)
            rel_ts = (path_rows["ts_ms"] - min_ts).astype(int).tolist()
            players.append({
                "user_id": user_id,
                "is_bot": bot,
                "path": {
                    "ts": rel_ts,
                    "px": np.round(px, 1).tolist(),
                    "py": np.round(py, 1).tolist(),
                },
            })
        else:
            players.append({"user_id": user_id, "is_bot": bot, "path": None})

        event_rows = pdf[~pdf["event"].isin(PATH_EVENTS)]
        for _, row in event_rows.iterrows():
            epx, epy = world_to_pixel(row["x"], row["z"], map_id)
            events.append({
                "ts": int(row["ts_ms"] - min_ts),
                "user_id": user_id,
                "is_bot": bot,
                "type": row["event"],
                "px": round(float(epx), 1),
                "py": round(float(epy), 1),
            })

    events.sort(key=lambda e: e["ts"])
    duration_ms = int(match_df["ts_ms"].max() - min_ts)

    return {
        "match_id": match_id,
        "map_id": map_id,
        "date": date,
        "duration_ms": duration_ms,
        "player_count": len(players),
        "human_count": sum(1 for p in players if not p["is_bot"]),
        "bot_count": sum(1 for p in players if p["is_bot"]),
        "players": players,
        "events": events,
    }


# ---- Step 3: heatmap grids (aggregated across all matches on a map) ------

def new_grid():
    return np.zeros((GRID_SIZE, GRID_SIZE), dtype=np.int64)


def accumulate_heatmaps(grids, map_id, df):
    bin_size = IMG_SIZE / GRID_SIZE

    def add(mask, key):
        rows = df[mask]
        if rows.empty:
            return
        px, py = world_to_pixel(rows["x"].values, rows["z"].values, map_id)
        gx = np.clip((px / bin_size).astype(int), 0, GRID_SIZE - 1)
        gy = np.clip((py / bin_size).astype(int), 0, GRID_SIZE - 1)
        np.add.at(grids[map_id][key], (gy, gx), 1)

    add(df["event"].isin(KILL_EVENTS), "kills")
    add(df["event"].isin(DEATH_EVENTS), "deaths")
    add(df["event"].isin(PATH_EVENTS), "traffic")


# ---- Main ------------------------------------------------------------

def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--input", required=True, help="path to player_data folder")
    ap.add_argument("--output", required=True, help="path to write output JSON")
    args = ap.parse_args()

    log = {
        "parse_failures": [],
        "empty_files": [],
        "null_rows_dropped": 0,
        "unknown_event_types": set(),
    }

    for map_id in MAP_CONFIG:
        os.makedirs(os.path.join(args.output, "matches", map_id), exist_ok=True)

    grids = {m: {"kills": new_grid(), "deaths": new_grid(), "traffic": new_grid()} for m in MAP_CONFIG}
    match_buffers = defaultdict(list)   # match_id -> list of DataFrames
    match_meta = {}                     # match_id -> (map_id, date)

    print("Reading files...")
    n_files = 0
    for df in read_all_files(args.input, log):
        n_files += 1
        map_id = df["map_id"].iloc[0]
        match_id_raw = df["match_id"].iloc[0]
        date = df["date"].iloc[0]

        if map_id not in MAP_CONFIG:
            log["unknown_event_types"].add(f"UNKNOWN_MAP:{map_id}")
            continue

        accumulate_heatmaps(grids, map_id, df)

        match_buffers[match_id_raw].append(df)
        match_meta[match_id_raw] = (map_id, date)

    print(f"Read {n_files} files, {len(match_buffers)} matches")

    print("Building per-match JSON...")
    match_index = defaultdict(list)  # map_id -> [ {match summary} ]
    for match_id_raw, dfs in match_buffers.items():
        map_id, date = match_meta[match_id_raw]
        match_df = pd.concat(dfs, ignore_index=True)
        clean_match_id = match_id_raw.replace(".nakama-0", "")

        record = build_match_record(match_df, clean_match_id, map_id, date)

        out_path = os.path.join(args.output, "matches", map_id, f"{clean_match_id}.json")
        with open(out_path, "w") as f:
            json.dump(record, f, separators=(",", ":"))

        match_index[map_id].append({
            "match_id": clean_match_id,
            "date": date,
            "player_count": record["player_count"],
            "human_count": record["human_count"],
            "bot_count": record["bot_count"],
            "duration_ms": record["duration_ms"],
        })

    print("Writing per-map summary files...")
    for map_id in MAP_CONFIG:
        match_index[map_id].sort(key=lambda m: (m["date"], m["match_id"]))
        summary = {
            "map_id": map_id,
            "grid_size": GRID_SIZE,
            "img_size": IMG_SIZE,
            "heatmaps": {
                "kills": grids[map_id]["kills"].tolist(),
                "deaths": grids[map_id]["deaths"].tolist(),
                "traffic": grids[map_id]["traffic"].tolist(),
            },
            "matches": match_index[map_id],
        }
        with open(os.path.join(args.output, f"{map_id}.json"), "w") as f:
            json.dump(summary, f, separators=(",", ":"))

    # ---- report ----
    log["unknown_event_types"] = sorted(log["unknown_event_types"])
    report_path = os.path.join(args.output, "_build_report.json")
    with open(report_path, "w") as f:
        json.dump(log, f, indent=2)

    print("\n--- Build report ---")
    print(f"Files seen:          {log['files_seen']}")
    print(f"Files failed to parse: {log['files_failed']}")
    print(f"Empty files:         {len(log['empty_files'])}")
    print(f"Null rows dropped:   {log['null_rows_dropped']}")
    print(f"Unknown event types: {log['unknown_event_types']}")
    print(f"Matches processed:   {len(match_buffers)}")
    print(f"Full report written to {report_path}")


if __name__ == "__main__":
    main()