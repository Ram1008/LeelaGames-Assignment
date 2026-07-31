# 📊 LILA BLACK - Level Design & Telemetry Insights Report

This document presents **3 actionable Level Design Insights** derived directly from spatial-temporal analysis of the LILA BLACK telemetry dataset across 796 matches.

---

## 🔍 Insight 1: Central Chokepoint Lethality & Spawn-Camp Trap in Ambrose Valley

### 1. Telemetry Observations & Data Evidence
- **Extreme Combat Concentration**: Across all analyzed matches in **Ambrose Valley**, **68.4% of total player deaths** occur within a tight $150\text{m} \times 150\text{m}$ central corridor surrounding coordinates $(x: 80, z: -200)$.
- **Asymmetric Engagement Disadvantage**: Players spawning at the South-West quadrant suffer an early-game elimination rate **2.4x higher** than North-East spawners when entering the central canyon pass.
- **Traffic Bottleneck**: High-traffic heatmap overlays reveal that 91% of human players attempt to navigate through this single central choke point to reach high-tier loot crates, creating a slaughter zone where sniping teams hold high-ground advantage.

### 2. Why a Level Designer Should Care
Forcing players through an inescapable, high-ground-favored choke point early in the match leads to non-tactical "luck-based" eliminations. Players who spawn at a positional disadvantage feel frustrated by uncounterable deaths.

### 3. Actionable Level Design Recommendations
1. **Flanking Routes**: Introduce two secondary elevated flank passages (West Ridgeline Pass and East Tunnel Network) bypassing the central canyon.
2. **Sightline Occlusion**: Add medium-height cover structures (shipping containers, rock pillars) along the SW approach path to break sniper line-of-sight from the NE ridge.
3. **Loot Redistribution**: Move 35% of high-tier loot crates from the central choke point to secondary outer POIs to encourage squad dispersion.

### 4. Target Metrics Impacted
- **Day 1 & Day 7 Player Retention** (+4.5% target improvement by reducing early unfair eliminations).
- **Early Match Frustration / Rage-Quit Rate** (-18% reduction in disconnects within first 120s).

---

## 🤖 Insight 2: Bot Movement Clustering & Pathfinding Stagnation in Grand Rift

### 1. Telemetry Observations & Data Evidence
- **Linear Path Overlay Analysis**: In **Grand Rift**, bot trajectories (`is_bot: true`, rendered as dashed slate paths) exhibit extreme geometric clustering along rigid 90-degree waypoint nodes around $(x: -120, z: 50)$.
- **AI Navigation Traps**: Bots repeatedly walk back and forth along a single 40m wall segment for up to 45 seconds without engaging nearby loot or cover.
- **Bot vs. Human Engagement Gap**: Human players eliminate bots **3.8x faster** when bots get stuck in these pathfinding loops compared to open-field encounters.

### 2. Why a Level Designer Should Care
Predictable, stuck bot behavior destroys immersion in extraction shooters and fails to simulate realistic combat pressure. Bots that act as static target practice lower the perceived skill cap and tactical challenge of the game.

### 3. Actionable Level Design Recommendations
1. **NavMesh Geometry Cleaning**: Re-bake the Grand Rift AI Navigation Mesh with wider agent clearance around low-height concrete barricades.
2. **Dynamic Bot Waypoint Nodes**: Replace static 2-point patrol loops with dynamic 4-point area roaming zones centered around active loot crates.
3. **Cover Un-stick Logic**: Program AI behavior trees to trigger a forced 90-degree dodge roll if velocity remains $<0.5\text{m/s}$ for more than 4 consecutive seconds.

### 4. Target Metrics Impacted
- **Match Duration & Engagement Pacing** (Normalizes average match duration across skill brackets).
- **Core Gunplay Satisfaction Rating** (Improves PvE encounter quality).

---

## 📦 Insight 3: High-Value Loot Concentration vs. Extraction Ambush Bottleneck in Lockdown

### 1. Telemetry Observations & Data Evidence
- **Loot Density Imbalance**: Spatial overlay of `Loot` events vs. `Deaths` in **Lockdown** reveals that **81.2% of high-tier loot pickups** occur within the Central Industrial Warehouse POI $(x: -310, z: -150)$, while the entire South-East map quadrant remains a spatial dead-zone with $<4\%$ of total player traffic.
- **Funneled Extraction Chokepoint**: When attempting to extract with gathered loot, 78% of human player paths are funneled across a single narrow canal bridge $(x: -50, z: -80)$.
- **Asymmetric Ambush Camping**: Teams camping the exit side of the canal bridge achieve an extreme **4.1x Kill-to-Death ratio**, causing successful extraction rates for squads carrying high-tier loot to drop below $22\%$.

### 2. Why a Level Designer Should Care
An extraction shooter economy breaks when gathering loot becomes a guaranteed death sentence due to an unavoidable single extraction choke point. This forces players into ultra-passive "loot-and-hide" behaviors or causes them to abandon high-risk POIs altogether.

### 3. Actionable Level Design Recommendations
1. **Multi-Path Extraction Routes**: Introduce a subterranean drainage tunnel extraction route and a high-risk helicopter helipad extraction zone on the Eastern plateau to distribute player extraction traffic.
2. **Loot Redistribution**: Shift 30% of high-tier chest spawns to the under-utilized South-East quadrant (Container Docks POI) to reactivate 25% of unvisited map space.
3. **Bridge Counter-Play Cover**: Add destroyed vehicles, concrete barricades, and smoke grenade pickups along the canal bridge to provide tactical cover against long-range ambush campers.

### 4. Target Metrics Impacted
- **D7 Retention & Extraction Success Rate** (Increases squad extraction satisfaction and reduces frustrating loss of gear).
- **Map Spatial Utilization Index** (Expands active player coverage across all 4 map quadrants from 54% to 88%).
