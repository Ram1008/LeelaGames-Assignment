import React, { useRef, useEffect, useCallback } from 'react';
import { MapId, MAP_CONFIG, MapSummary, MatchRecord, DiscreteEvent, HeatmapMode } from '../types';
import { HoverCoordinates, pixelToWorld } from '../utils/coordinates';
import { ZoomIn, ZoomOut, RotateCcw } from 'lucide-react';

interface MapViewportProps {
  activeMap: MapId;
  summary: MapSummary | null;
  currentMatch: MatchRecord | null;
  currentTimeMs: number;
  heatmapMode: HeatmapMode;
  heatmapOpacity: number;
  showHumans: boolean;
  showBots: boolean;
  showKills: boolean;
  showDeaths: boolean;
  showLoot: boolean;
  showStorm: boolean;
  scale: number;
  setScale: React.Dispatch<React.SetStateAction<number>>;
  offset: { x: number; y: number };
  setOffset: React.Dispatch<React.SetStateAction<{ x: number; y: number }>>;
  rotation: number;
  setRotation: React.Dispatch<React.SetStateAction<number>>;
  isDragging: boolean;
  setIsDragging: (val: boolean) => void;
  dragStart: { x: number; y: number };
  setDragStart: (val: { x: number; y: number }) => void;
  setHoverCoord: (coord: HoverCoordinates | null) => void;
}

export const MapViewport: React.FC<MapViewportProps> = ({
  activeMap,
  summary,
  currentMatch,
  currentTimeMs,
  heatmapMode,
  heatmapOpacity,
  showHumans,
  showBots,
  showKills,
  showDeaths,
  showLoot,
  showStorm,
  scale,
  setScale,
  offset,
  setOffset,
  rotation,
  setRotation,
  isDragging,
  setIsDragging,
  dragStart,
  setDragStart,
  setHoverCoord,
}) => {
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const handleZoom = (delta: number) => {
    setScale((prev) => Math.min(Math.max(prev + delta, 0.5), 5));
  };

  const handleRotate = () => {
    setRotation((prev) => prev - 90);
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setDragStart({ x: e.clientX - offset.x, y: e.clientY - offset.y });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    const container = mapContainerRef.current;
    if (container) {
      const rect = container.getBoundingClientRect();
      const clickX = e.clientX - rect.left;
      const clickY = e.clientY - rect.top;

      const centerX = rect.width / 2;
      const centerY = rect.height / 2;

      const unscaledX = (clickX - centerX - offset.x) / scale + centerX;
      const unscaledY = (clickY - centerY - offset.y) / scale + centerY;

      const px = Math.min(Math.max(Math.round((unscaledX / rect.width) * 1024), 0), 1024);
      const py = Math.min(Math.max(Math.round((unscaledY / rect.height) * 1024), 0), 1024);

      const { wx, wz } = pixelToWorld(px, py, activeMap);
      setHoverCoord({ px, py, wx, wz });
    }

    if (isDragging) {
      setOffset({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y,
      });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  // Non-passive wheel event listener to prevent browser page zoom on trackpad pinch
  useEffect(() => {
    const el = mapContainerRef.current;
    if (!el) return;

    const handleWheelNative = (e: WheelEvent) => {
      e.preventDefault();
      e.stopPropagation();
      const zoomSensitivity = e.ctrlKey ? 0.03 : 0.12;
      const delta = e.deltaY < 0 ? zoomSensitivity : -zoomSensitivity;
      setScale((prev) => Math.min(Math.max(prev + delta, 0.5), 5));
    };

    el.addEventListener('wheel', handleWheelNative, { passive: false });
    return () => {
      el.removeEventListener('wheel', handleWheelNative);
    };
  }, [setScale]);

  // Canvas Telemetry Overlay Render Loop
  const renderCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const CANVAS_SIZE = 1024;
    canvas.width = CANVAS_SIZE;
    canvas.height = CANVAS_SIZE;

    ctx.clearRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);

    // 1. Render Aggregated Heatmap Density Layer
    if (heatmapMode !== 'none' && summary && summary.heatmaps[heatmapMode]) {
      const grid = summary.heatmaps[heatmapMode];
      const gridSize = summary.grid_size;
      const cellSize = CANVAS_SIZE / gridSize;

      let maxVal = 1;
      for (let r = 0; r < gridSize; r++) {
        for (let c = 0; c < gridSize; c++) {
          if (grid[r][c] > maxVal) maxVal = grid[r][c];
        }
      }

      ctx.save();
      ctx.globalAlpha = heatmapOpacity;

      for (let r = 0; r < gridSize; r++) {
        for (let c = 0; c < gridSize; c++) {
          const val = grid[r][c];
          if (val === 0) continue;
          const norm = Math.min(val / (maxVal * 0.4), 1);

          let color = '';
          if (heatmapMode === 'kills') {
            color = `rgba(239, 68, 68, ${norm * 0.85})`;
          } else if (heatmapMode === 'deaths') {
            color = `rgba(244, 63, 94, ${norm * 0.85})`;
          } else {
            color = `rgba(20, 184, 166, ${norm * 0.8})`;
          }

          ctx.fillStyle = color;
          ctx.beginPath();
          ctx.arc(c * cellSize + cellSize / 2, r * cellSize + cellSize / 2, cellSize * 0.9, 0, Math.PI * 2);
          ctx.fill();
        }
      }
      ctx.restore();
    }

    // 1.5 Render Shrinking Storm Safe Zone Ring
    if (showStorm && currentMatch && currentMatch.duration_ms > 0) {
      const matchProgress = Math.min(currentTimeMs / currentMatch.duration_ms, 1);

      // Storm ring center (center of minimap 512, 512)
      const cx = CANVAS_SIZE / 2;
      const cy = CANVAS_SIZE / 2;

      // Shrinks from 650px radius down to 120px radius as time advances
      const initialRadius = 650;
      const finalRadius = 120;
      const currentRadius = initialRadius - matchProgress * (initialRadius - finalRadius);

      ctx.save();

      // Darken outer storm zone beyond safe ring (cutout circle)
      ctx.beginPath();
      ctx.rect(0, 0, CANVAS_SIZE, CANVAS_SIZE);
      ctx.arc(cx, cy, currentRadius, 0, Math.PI * 2, true);
      ctx.fillStyle = 'rgba(168, 85, 247, 0.14)';
      ctx.fill();

      // Draw Glowing Dashed Storm Ring Edge
      ctx.lineWidth = 3;
      ctx.strokeStyle = '#A855F7';
      ctx.shadowColor = '#A855F7';
      ctx.shadowBlur = 12;
      ctx.setLineDash([10, 6]);
      ctx.beginPath();
      ctx.arc(cx, cy, currentRadius, 0, Math.PI * 2);
      ctx.stroke();

      // Storm Label Badge at top edge of safe zone
      ctx.setLineDash([]);
      ctx.shadowBlur = 0;
      ctx.fillStyle = 'rgba(26, 29, 36, 0.9)';
      ctx.strokeStyle = '#A855F7';
      ctx.lineWidth = 1;
      const labelX = cx;
      const labelY = cy - currentRadius;

      ctx.beginPath();
      ctx.roundRect(labelX - 44, labelY - 11, 88, 20, 4);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = '#A855F7';
      ctx.font = '600 10px JetBrains Mono, sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('⚡ SAFE ZONE', labelX, labelY - 1);

      ctx.restore();
    }

    // 2. Render Player Trajectory Paths
    if (currentMatch && currentMatch.players) {
      currentMatch.players.forEach((player) => {
        const isBot = player.is_bot;
        if ((isBot && !showBots) || (!isBot && !showHumans)) return;

        if (player.path && player.path.ts.length > 0) {
          const { ts, px, py } = player.path;

          let activeCount = 0;
          for (let i = 0; i < ts.length; i++) {
            if (ts[i] > currentTimeMs) break;
            activeCount++;
          }

          if (activeCount > 1) {
            ctx.save();
            ctx.beginPath();

            for (let i = 0; i < activeCount; i++) {
              if (i === 0) {
                ctx.moveTo(px[0], py[0]);
              } else {
                ctx.lineTo(px[i], py[i]);
              }
            }

            ctx.lineWidth = isBot ? 2 : 2.5;
            ctx.strokeStyle = isBot ? '#64748B' : '#14B8A6';
            if (isBot) {
              ctx.setLineDash([6, 6]);
            } else {
              ctx.setLineDash([]);
            }
            ctx.stroke();

            // Animated player head marker
            const lastIdx = activeCount - 1;
            const headX = px[lastIdx];
            const headY = py[lastIdx];

            ctx.setLineDash([]);
            ctx.fillStyle = isBot ? '#64748B' : '#14B8A6';
            ctx.beginPath();
            ctx.arc(headX, headY, isBot ? 4 : 5, 0, Math.PI * 2);
            ctx.fill();

            ctx.restore();
          }
        }
      });
    }

    // 3. Render Discrete Event Markers
    if (currentMatch && currentMatch.events) {
      currentMatch.events.forEach((ev: DiscreteEvent) => {
        if (ev.ts > currentTimeMs) return;

        const isKill = ev.type === 'Kill' || ev.type === 'BotKill';
        const isDeath = ev.type === 'Killed' || ev.type === 'BotKilled';
        const isStorm = ev.type === 'KilledByStorm';
        const isLoot = ev.type === 'Loot';

        if (isKill && !showKills) return;
        if (isDeath && !showDeaths) return;
        if (isStorm && !showStorm) return;
        if (isLoot && !showLoot) return;

        ctx.save();
        if (isKill) {
          ctx.strokeStyle = '#EF4444';
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.arc(ev.px, ev.py, 6, 0, Math.PI * 2);
          ctx.stroke();
          ctx.beginPath();
          ctx.moveTo(ev.px - 9, ev.py);
          ctx.lineTo(ev.px + 9, ev.py);
          ctx.moveTo(ev.px, ev.py - 9);
          ctx.lineTo(ev.px, ev.py + 9);
          ctx.stroke();
        } else if (isDeath) {
          ctx.strokeStyle = '#F43F5E';
          ctx.lineWidth = 2.5;
          ctx.beginPath();
          ctx.moveTo(ev.px - 5, ev.py - 5);
          ctx.lineTo(ev.px + 5, ev.py + 5);
          ctx.moveTo(ev.px + 5, ev.py - 5);
          ctx.lineTo(ev.px - 5, ev.py + 5);
          ctx.stroke();
        } else if (isStorm) {
          // Ultra Prominent Glowing Storm Death Badge & Callout Label
          ctx.save();

          // Outer pulse ring for high visibility
          ctx.shadowColor = '#A855F7';
          ctx.shadowBlur = 20;
          ctx.fillStyle = 'rgba(168, 85, 247, 0.35)';
          ctx.beginPath();
          ctx.arc(ev.px, ev.py, 16, 0, Math.PI * 2);
          ctx.fill();

          // Solid purple circle
          ctx.fillStyle = '#A855F7';
          ctx.strokeStyle = '#FFFFFF';
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.arc(ev.px, ev.py, 10, 0, Math.PI * 2);
          ctx.fill();
          ctx.stroke();

          // Crisp White Lightning Bolt symbol inside
          ctx.shadowBlur = 0;
          ctx.fillStyle = '#FFFFFF';
          ctx.beginPath();
          ctx.moveTo(ev.px + 1, ev.py - 6);
          ctx.lineTo(ev.px - 3, ev.py + 1);
          ctx.lineTo(ev.px, ev.py + 1);
          ctx.lineTo(ev.px - 1, ev.py + 6);
          ctx.lineTo(ev.px + 3, ev.py - 1);
          ctx.lineTo(ev.px, ev.py - 1);
          ctx.closePath();
          ctx.fill();

          // Floating Callout Badge above marker
          ctx.fillStyle = '#A855F7';
          ctx.strokeStyle = '#FFFFFF';
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.roundRect(ev.px - 45, ev.py - 28, 90, 18, 4);
          ctx.fill();
          ctx.stroke();

          ctx.fillStyle = '#FFFFFF';
          ctx.font = '700 9px JetBrains Mono, sans-serif';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText('⚡ STORM DEATH', ev.px, ev.py - 19);

          ctx.restore();
        } else if (isLoot) {
          ctx.fillStyle = '#F59E0B';
          ctx.beginPath();
          ctx.moveTo(ev.px, ev.py - 4);
          ctx.lineTo(ev.px + 4, ev.py);
          ctx.lineTo(ev.px, ev.py + 4);
          ctx.lineTo(ev.px - 4, ev.py);
          ctx.closePath();
          ctx.fill();
        }
        ctx.restore();
      });
    }
  }, [
    summary,
    currentMatch,
    heatmapMode,
    heatmapOpacity,
    showHumans,
    showBots,
    showKills,
    showDeaths,
    showLoot,
    showStorm,
    currentTimeMs,
  ]);

  useEffect(() => {
    renderCanvas();
  }, [renderCanvas]);

  return (
    <main style={{ flex: 1, height: '100%', display: 'flex', flexDirection: 'column', position: 'relative' }}>
      <div
        ref={mapContainerRef}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        style={{
          flex: 1,
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          overflow: 'hidden',
          cursor: isDragging ? 'grabbing' : 'grab',
          position: 'relative',
          touchAction: 'none',
        }}
      >
        <div
          style={{
            width: '100%',
            height: '100%',
            transform: `translate(${offset.x}px, ${offset.y}px) scale(${scale}) rotate(${rotation}deg)`,
            transformOrigin: 'center center',
            transition: isDragging ? 'none' : 'transform 0.2s ease-out',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            position: 'relative',
          }}
        >
          {/* Base Minimap Image */}
          <img
            src={MAP_CONFIG[activeMap].image}
            alt={MAP_CONFIG[activeMap].name}
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'contain',
              pointerEvents: 'none',
            }}
          />

          {/* Synchronized Telemetry Drawing Canvas */}
          <canvas
            ref={canvasRef}
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              objectFit: 'contain',
              pointerEvents: 'none',
            }}
          />
        </div>

        {/* Zoom & Rotation Control Buttons */}
        <div
          style={{
            position: 'absolute',
            bottom: '20px',
            right: '20px',
            display: 'flex',
            gap: '6px',
            background: 'rgba(26, 29, 36, 0.85)',
            backdropFilter: 'blur(12px)',
            border: '1px solid var(--border-color)',
            borderRadius: '8px',
            padding: '4px',
            boxShadow: '0 8px 24px rgba(0,0,0,0.3)',
            zIndex: 30,
          }}
        >
          <button
            onClick={() => handleZoom(0.25)}
            title="Zoom In"
            style={{ background: 'none', border: 'none', padding: '6px', cursor: 'pointer', color: 'var(--text-primary)', borderRadius: '4px', display: 'flex', alignItems: 'center' }}
          >
            <ZoomIn size={18} />
          </button>
          <button
            onClick={() => handleZoom(-0.25)}
            title="Zoom Out"
            style={{ background: 'none', border: 'none', padding: '6px', cursor: 'pointer', color: 'var(--text-primary)', borderRadius: '4px', display: 'flex', alignItems: 'center' }}
          >
            <ZoomOut size={18} />
          </button>
          <button
            onClick={handleRotate}
            title="Rotate 90° Anticlockwise"
            style={{ background: 'none', border: 'none', padding: '6px', cursor: 'pointer', color: 'var(--text-primary)', borderRadius: '4px', display: 'flex', alignItems: 'center' }}
          >
            <RotateCcw size={18} />
          </button>
        </div>
      </div>
    </main>
  );
};
