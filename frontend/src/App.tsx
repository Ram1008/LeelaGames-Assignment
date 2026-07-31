import React, { useState } from 'react';
import { MapId, HeatmapMode } from './types';
import { useTelemetryData } from './hooks/useTelemetryData';
import { usePlayback } from './hooks/usePlayback';
import { HoverCoordinates } from './utils/coordinates';
import { LeftPanel } from './components/LeftPanel';
import { MapViewport } from './components/MapViewport';
import { ControlsPanel } from './components/ControlsPanel';

export const App: React.FC = () => {
  const [activeMap, setActiveMap] = useState<MapId>('AmbroseValley');
  const [selectedDate, setSelectedDate] = useState<string>('ALL');

  // Custom Hooks for Telemetry Data & Playback Loop
  const { summary, selectedMatchId, setSelectedMatchId, currentMatch } = useTelemetryData(activeMap);
  const { currentTimeMs, setCurrentTimeMs, isPlaying, togglePlay, playbackSpeed, setPlaybackSpeed } = usePlayback(currentMatch);

  // Layer Toggles
  const [heatmapMode, setHeatmapMode] = useState<HeatmapMode>('kills');
  const [heatmapOpacity, setHeatmapOpacity] = useState<number>(0.65);
  const [showHumans, setShowHumans] = useState<boolean>(true);
  const [showBots, setShowBots] = useState<boolean>(true);
  const [showKills, setShowKills] = useState<boolean>(true);
  const [showDeaths, setShowDeaths] = useState<boolean>(true);
  const [showLoot, setShowLoot] = useState<boolean>(true);
  const [showStorm, setShowStorm] = useState<boolean>(true);

  // Viewport Transform State
  const [scale, setScale] = useState<number>(1);
  const [offset, setOffset] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [rotation, setRotation] = useState<number>(0);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [dragStart, setDragStart] = useState<{ x: number; y: number }>({ x: 0, y: 0 });

  // Hover Coordinates
  const [hoverCoord, setHoverCoord] = useState<HoverCoordinates | null>(null);

  const availableDates = ['February_10', 'February_11', 'February_12', 'February_13', 'February_14'];

  const handleMapChange = (mapId: MapId) => {
    setActiveMap(mapId);
    setScale(1);
    setOffset({ x: 0, y: 0 });
    setRotation(0);
  };

  return (
    <div style={{ display: 'flex', width: '100vw', height: '100vh', overflow: 'hidden', background: 'var(--bg-app)' }}>
      {/* Left 20% Data & Description Panel */}
      <LeftPanel
        activeMap={activeMap}
        hoverCoord={hoverCoord}
        currentMatch={currentMatch}
        currentTimeMs={currentTimeMs}
        onSeek={setCurrentTimeMs}
      />

      {/* Center Minimap Viewport & Canvas Overlay */}
      <MapViewport
        activeMap={activeMap}
        summary={summary}
        currentMatch={currentMatch}
        currentTimeMs={currentTimeMs}
        heatmapMode={heatmapMode}
        heatmapOpacity={heatmapOpacity}
        showHumans={showHumans}
        showBots={showBots}
        showKills={showKills}
        showDeaths={showDeaths}
        showLoot={showLoot}
        showStorm={showStorm}
        scale={scale}
        setScale={setScale}
        offset={offset}
        setOffset={setOffset}
        rotation={rotation}
        setRotation={setRotation}
        isDragging={isDragging}
        setIsDragging={setIsDragging}
        dragStart={dragStart}
        setDragStart={setDragStart}
        setHoverCoord={setHoverCoord}
      />

      {/* Right 30% Controls & Playback Scrubber Panel */}
      <ControlsPanel
        activeMap={activeMap}
        onMapChange={handleMapChange}
        selectedDate={selectedDate}
        onSelectDate={setSelectedDate}
        availableDates={availableDates}
        summary={summary}
        selectedMatchId={selectedMatchId}
        onSelectMatchId={setSelectedMatchId}
        currentMatch={currentMatch}
        heatmapMode={heatmapMode}
        onSelectHeatmapMode={setHeatmapMode}
        heatmapOpacity={heatmapOpacity}
        onChangeHeatmapOpacity={setHeatmapOpacity}
        showHumans={showHumans}
        onToggleHumans={() => setShowHumans(!showHumans)}
        showBots={showBots}
        onToggleBots={() => setShowBots(!showBots)}
        showKills={showKills}
        onToggleKills={() => setShowKills(!showKills)}
        showDeaths={showDeaths}
        onToggleDeaths={() => setShowDeaths(!showDeaths)}
        showLoot={showLoot}
        onToggleLoot={() => setShowLoot(!showLoot)}
        showStorm={showStorm}
        onToggleStorm={() => setShowStorm(!showStorm)}
        currentTimeMs={currentTimeMs}
        onSeek={setCurrentTimeMs}
        isPlaying={isPlaying}
        onTogglePlay={togglePlay}
        playbackSpeed={playbackSpeed}
        onChangeSpeed={setPlaybackSpeed}
      />
    </div>
  );
};

export default App;
