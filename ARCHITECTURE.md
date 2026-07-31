# 🏛️ LILA BLACK - Technical Architecture Document

## 1. System Overview & Technology Stack Rationale

The **LILA BLACK Player Journey Telemetry Tool** is designed for high-performance spatial-temporal analysis of game matches. It handles 1,243 raw telemetry files spanning 796 matches across 3 distinct maps (`Ambrose Valley`, `Grand Rift`, `Lockdown`).

### Technology Selection Rationale

| Component | Choice | Technical Rationale |
| :--- | :--- | :--- |
| **Data Processing** | Python (PyArrow / Pandas) | Decodes columnar Parquet files (`.nakama-0`) at up to 10x speed vs pure Python. Pre-calculates $64 \times 64$ spatial heatmaps and downsamples high-density paths to eliminate client-side parsing bottlenecks. |
| **Frontend Framework** | React 18 + TypeScript | Component-driven UI state management with strict type safety for telemetry data schemas. Ensures clean separation between UI controls, data hooks, and rendering layers. |
| **Rendering Engine** | HTML5 2D Canvas API | Hardware-accelerated 2D canvas handles thousands of vector points, dashed bot paths, and animated event markers at a silky 60 FPS without DOM node bloating. |
| **Build Tooling** | Vite | Instant HMR and optimized production bundling for static site deployment (Vercel). |
| **Styling** | Vanilla CSS Tokens | **Graphite Tactical** design token system (`#121417` base, `#1A1D24` panel, `#14B8A6` Emerald Teal accent) provides zero-runtime overhead styling. |

---

## 2. End-to-End Data Pipeline Architecture

```
┌───────────────────────────┐      ┌───────────────────────────┐      ┌───────────────────────────┐
│ Raw Telemetry (.parquet) │ ───> │   Python Pipeline         │ ───> │ Static JSON Datasets      │
│ 1,243 Nakama Files        │      │   (build_data.py)         │      │ (public/data/*.json)      │
└───────────────────────────┘      └───────────────────────────┘      └───────────────────────────┘
                                                                                    │
                                                                                    ▼
┌───────────────────────────┐      ┌───────────────────────────┐      ┌───────────────────────────┐
│ Synchronized HTML5 Canvas │ <─── │ React Telemetry Hooks     │ <─── │ Client Fetch Engine       │
│ 60FPS Vector Overlay      │      │ (useTelemetry & Playback) │      │ (JSON on demand per match)│
└───────────────────────────┘      └───────────────────────────┘      └───────────────────────────┘
```

### Pipeline Steps (`data_pipeline/build_data.py`)
1. **Extraction & Relative Timestamps**: Reads raw PyArrow timestamps (`datetime64[ms]`), calculates match `min_ts`, and normalizes timestamps into clean relative offsets ($0 \text{ ms} \to \text{duration\_ms}$).
2. **Entity Classification**: Uses regex UUID matching on `user_id` to classify entities:
   - **Humans**: UUID format `8-4-4-4-12` hex characters.
   - **Bots**: Sequential integers or non-UUID strings (`"1"`, `"2"`, `"3"`).
3. **Spatial Normalization**: Translates raw world $(x, z)$ coordinates to normalized $1024 \times 1024$ pixel space $(px, py)$.
4. **Aggregation & Pre-computation**: Computes $64 \times 64$ grid matrices for Kills, Deaths, and Traffic heatmaps per map, eliminating frontend calculation latency.

---

## 3. Coordinate Projection & Spatial Math Formulas

Game engine coordinates $(x, y, z)$ utilize an inverted Z-axis relative to 2D image pixel space. The pipeline projects 3D world coordinates onto the $1024 \times 1024$ minimap grid using map-specific bounding parameters:

### Map World Parameters

| Map ID | Scale ($S$) | Origin X ($O_x$) | Origin Z ($O_z$) |
| :--- | :---: | :---: | :---: |
| **Ambrose Valley** | $900$ | $-370$ | $-473$ |
| **Grand Rift** | $581$ | $-290$ | $-290$ |
| **Lockdown** | $1000$ | $-500$ | $-500$ |

### 1. World-to-Pixel Projection Formula (Python Pipeline)

$$u = \frac{x - O_x}{S}, \quad v = \frac{z - O_z}{S}$$

$$px = u \times 1024, \quad py = (1 - v) \times 1024$$

### 2. Pixel-to-World Inverse Formula (Interactive Hover HUD)

When an analyst hovers or clicks on canvas pixel coordinate $(px, py)$:

$$u = \frac{px}{1024}, \quad v = 1 - \frac{py}{1024}$$

$$x = O_x + (u \times S), \quad z = O_z + (v \times S)$$

---

## 4. Key Data Assumptions

1. **Relative Timestamp Zeroing**: The match start time $t_0$ is assumed to be the minimum `ts` recorded across all position/event rows in that match.
2. **Downsampling Threshold**: Path trajectories exceeding 500 spatial points are downsampled using uniform temporal sampling to maintain lightweight JSON payload sizes (<100KB per match).
3. **Map Bounding Rectangles**: Minimap image graphics map linearly to the bounding square $[O_x, O_x + S] \times [O_z, O_z + S]$.

---

## 5. Architectural Trade-offs & Engineering Decisions

| Trade-off Area | Choice Made | Alternative Considered | Engineering Rationale |
| :--- | :--- | :--- | :--- |
| **Data Payload Format** | Static Pre-built JSON files | Real-time Backend API (FastAPI / Node) | Eliminates server hosting costs and backend maintenance. Allows 100% client-side caching & instant Vercel CDN delivery. |
| **Canvas vs SVG Rendering** | Dual-layer HTML5 Canvas | SVG DOM Elements | SVG creates thousands of DOM nodes during match playback, leading to memory leaks and frame drops. Canvas handles unlimited paths at 60 FPS. |
| **Heatmap Generation** | Pre-computed 64x64 Grid | Dynamic Kernel Density Estimation (KDE) | Client-side KDE calculations block the main JS thread during match switching. Pre-computing grid bins produces instant rendering. |
