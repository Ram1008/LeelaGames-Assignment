# Player Journey Telemetry — LILA BLACK

**Explore match recordings through map playback, event filters, and spatial heatmaps.**

A React and TypeScript interface backed by a Python pipeline that converts Parquet telemetry into browser-readable data. Created as a LILA Games assignment.

[Open live demo](https://lila-black-telemetry.vercel.app/) · [Architecture](ARCHITECTURE.md) · [Analysis notes](INSIGHTS.md)

## Try it in one minute

1. Open the demo and choose a map.
2. Select a match and press Play.
3. Adjust playback speed and toggle the available heatmap layers.
4. Compare movement and event patterns across matches.

The deployed demo may evolve separately from this repository. Use the local setup below when evaluating the checked-in implementation.

## Engineering highlights

| Area | Implementation |
| --- | --- |
| Data preparation | Python processing of Parquet telemetry into match and map summaries. |
| Interactive interface | React, TypeScript, playback controls, and event filtering. |
| Spatial visualization | Coordinate conversion, path rendering, and density overlays. |
| Analysis | Separate architecture and insight documents explain the approach. |

## Run the checked-in frontend

```bash
git clone https://github.com/Ram1008/LeelaGames-Assignment.git
cd LeelaGames-Assignment/frontend
npm install
npm run dev
```

For data regeneration and detailed implementation notes, expand the guide below.

<details>
<summary>Data pipeline, features, and full setup guide</summary>


An end-to-end telemetry pipeline and interactive web-based player journey visualization tool built for **LILA Games - Assignment**.

This tool ingests multi-day spatial telemetry Parquet data (1,243 files, ~796 matches across 3 maps), projects game-world coordinates onto high-resolution minimaps, and provides real-time playback, heatmap density analytics, entity filtering, and interactive killfeed scrubbing.

---

## 🚀 Key Features

- **End-to-End Data Pipeline (`build_data.py`)**
  - **Automated Ingestion**: Parses 1,243 raw Nakama Parquet telemetry files across 5 calendar days (Feb 10–14).
  - **Timestamp Normalization**: Converts PyArrow `datetime64[ms]` timestamps into relative millisecond offsets starting at $0\text{ ms}$ per match.
  - **Regex Entity Classification**: Automatically segregates human players from AI bots using UUID regex matching on `user_id`.
  - **Trajectory Downsampling & Pre-Aggregated Heatmaps**: Downsamples high-density paths (>500 points) to keep match payloads under 100KB, while pre-computing $64 \times 64$ spatial matrices for Kills, Deaths, and Traffic heatmaps per map.

- **Synchronized Dual Layer Canvas Overlay**
  - **60 FPS Hardware-Accelerated Canvas**: Renders all visual telemetry on an HTML5 2D Canvas placed directly over the minimap image.
  - **Transform Lockstep Sync**: Automatically scales, translates, and rotates ($90^\circ$ anticlockwise steps) in 100% sync with mouse drag-pan and trackpad zoom gestures.
  - **Entity Path Distinction**: Renders Human trajectories with solid Emerald Teal (`#14B8A6`) paths and Bot trajectories with dashed Muted Slate (`#64748B`) paths.
  - **Custom Tactical Event Markers**:
    - *Kills / BotKills*: Signal Red (`#EF4444`) target crosshair reticle.
    - *Killed / BotKilled*: Maroon Rose (`#F43F5E`) death cross marker.
    - *KilledByStorm*: Storm Violet (`#A855F7`) glowing badge with a white lightning bolt (`⚡`) and outer pulse ring.
    - *Loot*: Amber Gold (`#F59E0B`) solid diamond marker.
  - **Animated Shrinking Storm Safe Zone**: Renders a dynamic storm boundary circle that contracts over match duration ($650\text{px} \to 120\text{px}$) with a semi-transparent outer storm tint and tactical safe zone badge.

- **Interactive Live Killfeed & Click-to-Jump**
  - **Real-Time Activity Stream**: Displays a color-coded feed of all discrete match events in chronological order on the left panel.
  - **Playback State Awareness**: Unlocked/past events light up brightly (`100% opacity`), while upcoming future events stay semi-transparent (`45% opacity`).
  - **Click-to-Jump Timeline Scrubbing**: Clicking any event entry in the killfeed immediately seeks the playback scrubber to that exact millisecond timestamp.

- **Heatmap Analytics Engine**
  - **Multi-Mode Density Overlays**: Toggles between Kills Density (Signal Red), Deaths Zone (Maroon Rose), and High Traffic (Emerald Teal).
  - **Custom Heat Intensity Scale**: Interpolates $64 \times 64$ spatial grid matrices with dynamic alpha blending.
  - **Real-Time Opacity Control**: Slider adjustment ($10\% \to 100\%$) allowing analysts to inspect ground terrain under density hotspots.

- **Graphite Tactical Theme & Modular Layout**
  - **Optimized 3-Column Interface**: 20% Left Panel (Data, Coordinates HUD, & Live Killfeed), 55% Center Minimap Viewport, and 25% Right Controls Panel.
  - **High-Contrast Dark Palette**: Tailored for game analysts (`#121417` dark graphite base, `#1A1D24` panel surface, `#242831` cards, `#14B8A6` Emerald Teal accent).
  - **Non-Passive Trackpad Prevention**: Intercepts native DOM wheel events to prevent full-page browser zooming while zooming the minimap.

- **Bidirectional Spatial Coordinate Mapping**
  - **Forward World-to-Pixel Projection**: Translates 3D in-game world coordinates into 2D minimap canvas pixel coordinates $(px, py)$.
  - **Inverse Pixel-to-World Reconstruction**: Real-time HUD calculating exact in-game world coordinates $(x, z)$ whenever the analyst hovers over any point on the minimap canvas.

---

## 🛠️ Technology Stack

- **Data Pipeline**: Python 3.10, PyArrow (Parquet decoding), Pandas, NumPy.
- **Frontend Core**: React 18, TypeScript, Vite.
- **Rendering & Visualization**: HTML5 2D Canvas API (hardware-accelerated path & marker drawing), Lucide Icons.
- **Styling**: Vanilla CSS with Graphite Tactical CSS custom properties design tokens.

---

## 💻 Local Setup & Execution Guide

### Prerequisites
- Node.js (v18.0.0 or higher) & npm
- Python 3.9+ (with PyArrow and Pandas installed)

### 1. Data Pipeline Execution (Parquet -> JSON)
If you wish to re-process the raw Parquet telemetry data from scratch:

Unzip the match_data.zip in the root directory.

```bash
# Navigate to data pipeline directory
cd data_pipeline

# Install required Python packages
pip install pyarrow pandas numpy

# Run the data processing pipeline
python build_data.py
```
*Outputs JSON summaries to `frontend/public/data/` (796 match files + 3 map summaries).*

### 2. Frontend Web Application Setup

```bash
# Navigate to the frontend directory
cd frontend

# Install node dependencies
npm install

# Start the local Vite development server
npm run dev
```
Open your browser at `http://localhost:5173`.

### 3. Production Build
```bash
cd frontend
npm run build
```

---

## 📁 Repository Structure

```
Leela-Assignment/
├── data_pipeline/
│   └── build_data.py             # Parquet processing, spatial projection & JSON export script
├── frontend/
│   ├── public/
│   │   ├── data/                 # Processed telemetry JSON files & map heatmaps
│   │   │   ├── AmbroseValley.json
│   │   │   ├── GrandRift.json
│   │   │   ├── Lockdown.json
│   │   │   └── matches/          # 796 individual match JSON records
│   │   └── minimaps/             # High-res map graphics
│   └── src/
│       ├── components/
│       │   ├── LeftPanel.tsx     # 20% Data, World Coordinates HUD & Live Killfeed
│       │   ├── MapViewport.tsx   # Center Minimap Viewport, Zoom/Pan & Canvas Overlay
│       │   └── ControlsPanel.tsx # 25% Map selector, Date filters, Heatmaps & Scrubber
│       ├── hooks/
│       │   ├── useTelemetryData.ts # Data fetching hook
│       │   └── usePlayback.ts      # Scrubber animation frame loop hook
│       ├── utils/
│       │   └── coordinates.ts      # Pure spatial math functions (x, z) ↔ (px, py)
│       ├── types.ts              # TypeScript schemas
│       ├── index.css             # Graphite Tactical design tokens
│       └── App.tsx               # Top-level composition
├── ARCHITECTURE.md               # 1-page technical architecture & spatial math document
├── INSIGHTS.md                   # 3 Level Design Insights derived from telemetry data
└── README.md                     # Setup & project documentation
```

---

## 🌐 Live Deployment
Deployed on Vercel: [https://lila-black-telemetry.vercel.app](https://lila-black-telemetry.vercel.app)
</details>
