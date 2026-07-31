import React from 'react';
import { MapId, MAP_CONFIG, MatchRecord } from '../types';
import { HoverCoordinates } from '../utils/coordinates';
import { Crosshair, User, Bot, Target, Skull, Zap, Box, Flame } from 'lucide-react';

interface LeftPanelProps {
  activeMap: MapId;
  hoverCoord: HoverCoordinates | null;
  currentMatch: MatchRecord | null;
  currentTimeMs: number;
  onSeek: (ms: number) => void;
}

export const LeftPanel: React.FC<LeftPanelProps> = ({
  activeMap,
  hoverCoord,
  currentMatch,
  currentTimeMs,
  onSeek,
}) => {
  return (
    <aside
      className="panel-surface"
      style={{
        width: '20%',
        height: '100%',
        borderRight: '1px solid var(--border-color)',
        padding: '24px 20px',
        display: 'flex',
        flexDirection: 'column',
        gap: '16px',
        overflowY: 'auto',
      }}
    >
      <div style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '16px' }}>
        <h1 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--text-primary)', letterSpacing: '-0.2px' }}>
          LILA BLACK
        </h1>
        <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginTop: '4px' }}>
          Player Journey Telemetry
        </p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
        <h2 style={{ fontSize: '12px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px', color: 'var(--text-secondary)' }}>
          Data & Description
        </h2>

        {/* Active Map Details */}
        <div className="card-surface" style={{ padding: '12px' }}>
          <div style={{ fontSize: '11px', color: 'var(--text-dim)', textTransform: 'uppercase', marginBottom: '4px' }}>Active Map</div>
          <div style={{ fontSize: '15px', fontWeight: 600, color: 'var(--accent-ops)' }}>
            {MAP_CONFIG[activeMap].name}
          </div>
          <div style={{ fontSize: '11px', color: 'var(--text-secondary)', marginTop: '4px', fontFamily: 'var(--font-mono)' }}>
            Scale: {MAP_CONFIG[activeMap].scale} | Origin: ({MAP_CONFIG[activeMap].origin_x}, {MAP_CONFIG[activeMap].origin_z})
          </div>
        </div>

        {/* World Coordinate Tracking Card */}
        <div className="card-surface" style={{ padding: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px', color: 'var(--text-dim)', textTransform: 'uppercase' }}>
            <Crosshair size={13} color="var(--accent-ops)" />
            <span>World Coordinate Tracking</span>
          </div>
          {hoverCoord ? (
            <div style={{ marginTop: '8px', fontFamily: 'var(--font-mono)', fontSize: '12px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <div>World (X, Z): <span style={{ color: 'var(--accent-ops)', fontWeight: 600 }}>({hoverCoord.wx}, {hoverCoord.wz})</span></div>
              <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>Minimap (PX, PY): ({hoverCoord.px}, {hoverCoord.py})</div>
            </div>
          ) : (
            <div style={{ fontSize: '11px', color: 'var(--text-dim)', marginTop: '6px', fontStyle: 'italic' }}>
              Hover over minimap to inspect coordinates
            </div>
          )}
        </div>

        {/* Symbol & Legend Reference Card */}
        <div className="card-surface" style={{ padding: '12px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <div style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
            Map Symbols & Legend
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '12px' }}>
            {/* Human Path */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div style={{ width: '20px', height: '3px', background: '#14B8A6', borderRadius: '2px' }} />
                <span style={{ color: 'var(--text-primary)' }}>Human Path</span>
              </div>
              <span style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>Solid Teal</span>
            </div>

            {/* Bot Path */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div style={{ width: '20px', height: '0px', borderTop: '2px dashed #64748B' }} />
                <span style={{ color: 'var(--text-primary)' }}>Bot Path</span>
              </div>
              <span style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>Dashed Slate</span>
            </div>

            {/* Kill Marker */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                  <circle cx="7" cy="7" r="4" stroke="#EF4444" strokeWidth="1.5"/>
                  <line x1="1" y1="7" x2="13" y2="7" stroke="#EF4444" strokeWidth="1.5"/>
                  <line x1="7" y1="1" x2="7" y2="13" stroke="#EF4444" strokeWidth="1.5"/>
                </svg>
                <span style={{ color: 'var(--text-primary)' }}>Kill (Killer Location)</span>
              </div>
              <span style={{ fontSize: '11px', color: '#EF4444', fontWeight: 500 }}>Signal Red</span>
            </div>

            {/* Death Marker */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                  <line x1="3" y1="3" x2="11" y2="11" stroke="#F43F5E" strokeWidth="2.5" strokeLinecap="round"/>
                  <line x1="11" y1="3" x2="3" y2="11" stroke="#F43F5E" strokeWidth="2.5" strokeLinecap="round"/>
                </svg>
                <span style={{ color: 'var(--text-primary)' }}>Killed (Victim Death Spot)</span>
              </div>
              <span style={{ fontSize: '11px', color: '#F43F5E', fontWeight: 500 }}>Maroon Rose</span>
            </div>

            {/* Storm Death */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                  <circle cx="7" cy="7" r="6" fill="#A855F7" stroke="#FFFFFF" strokeWidth="1"/>
                  <path d="M7.5 2.5 L4.5 7.5 H7 L6.5 11.5 L9.5 6.5 H7 L7.5 2.5 Z" fill="#FFFFFF"/>
                </svg>
                <span style={{ color: 'var(--text-primary)' }}>KilledByStorm</span>
              </div>
              <span style={{ fontSize: '11px', color: '#A855F7', fontWeight: 500 }}>Storm Violet</span>
            </div>

            {/* Loot Event */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                  <polygon points="7,2 12,7 7,12 2,7" fill="#F59E0B"/>
                </svg>
                <span style={{ color: 'var(--text-primary)' }}>Loot Picked Up</span>
              </div>
              <span style={{ fontSize: '11px', color: '#F59E0B', fontWeight: 500 }}>Amber Gold</span>
            </div>

            {/* Heatmap Overlay Density Reference */}
            <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '8px', marginTop: '4px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <div style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                Heatmap Overlay Density
              </div>

              {/* Traffic Heatmap */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Flame size={13} color="#14B8A6" />
                    <span style={{ color: 'var(--text-primary)' }}>Traffic Density</span>
                  </div>
                  <span style={{ color: '#14B8A6', fontSize: '10px' }}>Teal</span>
                </div>
                <div style={{ height: '4px', borderRadius: '2px', background: 'linear-gradient(to right, transparent, rgba(20, 184, 166, 0.4), #14B8A6)' }} />
              </div>

              {/* Kills Heatmap */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Target size={13} color="#EF4444" />
                    <span style={{ color: 'var(--text-primary)' }}>Kills Hotzone</span>
                  </div>
                  <span style={{ color: '#EF4444', fontSize: '10px' }}>Signal Red</span>
                </div>
                <div style={{ height: '4px', borderRadius: '2px', background: 'linear-gradient(to right, transparent, rgba(239, 68, 68, 0.4), #EF4444)' }} />
              </div>

              {/* Deaths Heatmap */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Skull size={13} color="#F43F5E" />
                    <span style={{ color: 'var(--text-primary)' }}>Deaths Hotzone</span>
                  </div>
                  <span style={{ color: '#F43F5E', fontSize: '10px' }}>Maroon Rose</span>
                </div>
                <div style={{ height: '4px', borderRadius: '2px', background: 'linear-gradient(to right, transparent, rgba(244, 63, 94, 0.4), #F43F5E)' }} />
              </div>
            </div>
          </div>
        </div>

        {/* Selected Match KPI Card */}
        {currentMatch && (
          <div className="card-surface" style={{ padding: '12px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <div style={{ fontSize: '11px', color: 'var(--text-dim)', textTransform: 'uppercase' }}>Selected Match KPI</div>
            <div style={{ fontSize: '12px', color: 'var(--text-primary)', fontFamily: 'var(--font-mono)' }}>
              ID: {currentMatch.match_id.substring(0, 10)}...
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px' }}>
              <span style={{ color: 'var(--accent-ops)' }}><User size={13} /> {currentMatch.human_count} Humans</span>
              <span style={{ color: 'var(--text-secondary)' }}><Bot size={13} /> {currentMatch.bot_count} Bots</span>
            </div>
            <div style={{ fontSize: '11px', color: 'var(--text-secondary)', borderTop: '1px solid var(--border-color)', paddingTop: '6px' }}>
              Events Logged: <strong style={{ color: 'var(--text-primary)' }}>{currentMatch.events.length}</strong>
            </div>
          </div>
        )}

        {/* Logged Match Events Feed - Interactive Live Killfeed */}
        {currentMatch && currentMatch.events && currentMatch.events.length > 0 && (
          <div className="card-surface" style={{ padding: '12px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ fontSize: '11px', color: 'var(--text-dim)', textTransform: 'uppercase', fontWeight: 600, letterSpacing: '0.5px' }}>
                Live Killfeed ({currentMatch.events.length})
              </div>
              <span style={{ fontSize: '10px', color: 'var(--accent-ops)', fontStyle: 'italic' }}>
                Click to jump
              </span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '5px', maxHeight: '200px', overflowY: 'auto' }}>
              {currentMatch.events.map((ev, idx) => {
                const isStorm = ev.type === 'KilledByStorm';
                const isKill = ev.type === 'Kill' || ev.type === 'BotKill';
                const isDeath = ev.type === 'Killed' || ev.type === 'BotKilled';
                const isLoot = ev.type === 'Loot';

                const isPast = ev.ts <= currentTimeMs;
                const playerTag = ev.is_bot ? `Bot [${ev.user_id.substring(0, 4)}]` : `Human [${ev.user_id.substring(0, 4)}]`;

                let label = '';
                let color = '#94A3B8';

                if (isStorm) {
                  label = `${playerTag} ⚡ died to Storm`;
                  color = '#A855F7';
                } else if (isKill) {
                  label = `${playerTag} 🎯 eliminated enemy`;
                  color = '#EF4444';
                } else if (isDeath) {
                  label = `${playerTag} 💀 was eliminated`;
                  color = '#F43F5E';
                } else if (isLoot) {
                  label = `${playerTag} 📦 looted item`;
                  color = '#F59E0B';
                } else {
                  label = `${playerTag} ${ev.type}`;
                }

                return (
                  <div
                    key={idx}
                    onClick={() => onSeek(ev.ts)}
                    title={`Click to jump playback to ${ev.ts}ms`}
                    style={{
                      fontSize: '11px',
                      padding: '6px 8px',
                      borderRadius: '6px',
                      background: isPast
                        ? isStorm
                          ? 'rgba(168, 85, 247, 0.2)'
                          : 'rgba(255, 255, 255, 0.07)'
                        : 'rgba(255, 255, 255, 0.02)',
                      border: isPast
                        ? isStorm
                          ? '1px solid rgba(168, 85, 247, 0.5)'
                          : '1px solid var(--border-color)'
                        : '1px solid transparent',
                      opacity: isPast ? 1 : 0.45,
                      cursor: 'pointer',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      transition: 'all 0.15s ease',
                    }}
                  >
                    <span style={{ color, fontWeight: isStorm ? 700 : 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {label}
                    </span>
                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', color: 'var(--text-dim)', marginLeft: '6px' }}>
                      {Math.round(ev.ts / 1000)}s
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </aside>
  );
};
