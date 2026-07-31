import React, { useState } from 'react';
import { MapId, MAP_CONFIG, MapSummary, MatchRecord, HeatmapMode } from '../types';
import { Play, Pause, Target, Skull, Flame, Search } from 'lucide-react';

interface ControlsPanelProps {
  activeMap: MapId;
  onMapChange: (mapId: MapId) => void;
  selectedDate: string;
  onSelectDate: (date: string) => void;
  availableDates: string[];
  summary: MapSummary | null;
  selectedMatchId: string | null;
  onSelectMatchId: (matchId: string) => void;
  currentMatch: MatchRecord | null;
  heatmapMode: HeatmapMode;
  onSelectHeatmapMode: (mode: HeatmapMode) => void;
  heatmapOpacity: number;
  onChangeHeatmapOpacity: (val: number) => void;
  showHumans: boolean;
  onToggleHumans: () => void;
  showBots: boolean;
  onToggleBots: () => void;
  showKills: boolean;
  onToggleKills: () => void;
  showDeaths: boolean;
  onToggleDeaths: () => void;
  showLoot: boolean;
  onToggleLoot: () => void;
  showStorm: boolean;
  onToggleStorm: () => void;
  currentTimeMs: number;
  onSeek: (ms: number) => void;
  isPlaying: boolean;
  onTogglePlay: () => void;
  playbackSpeed: number;
  onChangeSpeed: (spd: number) => void;
}

export const ControlsPanel: React.FC<ControlsPanelProps> = ({
  activeMap,
  onMapChange,
  selectedDate,
  onSelectDate,
  availableDates,
  summary,
  selectedMatchId,
  onSelectMatchId,
  currentMatch,
  heatmapMode,
  onSelectHeatmapMode,
  heatmapOpacity,
  onChangeHeatmapOpacity,
  showHumans,
  onToggleHumans,
  showBots,
  onToggleBots,
  showKills,
  onToggleKills,
  showDeaths,
  onToggleDeaths,
  showLoot,
  onToggleLoot,
  showStorm,
  onToggleStorm,
  currentTimeMs,
  onSeek,
  isPlaying,
  onTogglePlay,
  playbackSpeed,
  onChangeSpeed,
}) => {
  const [matchSearchQuery, setMatchSearchQuery] = useState<string>('');

  const formatTime = (ms: number) => {
    const totalSec = Math.floor(ms / 1000);
    const mins = Math.floor(totalSec / 60);
    const secs = totalSec % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const filteredMatches = summary
    ? summary.matches.filter((m) => {
        const matchDate = selectedDate === 'ALL' || m.date === selectedDate;
        const matchIdMatch = !matchSearchQuery.trim() || m.match_id.toLowerCase().includes(matchSearchQuery.trim().toLowerCase());
        return matchDate && matchIdMatch;
      })
    : [];

  return (
    <aside
      className="panel-surface"
      style={{
        width: '25%',
        height: '100%',
        borderLeft: '1px solid var(--border-color)',
        padding: '24px 20px',
        display: 'flex',
        flexDirection: 'column',
        gap: '16px',
        overflowY: 'auto',
      }}
    >
      <div style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '12px' }}>
        <h2 style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-primary)' }}>
          Controls & Telemetry
        </h2>
        <p style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '2px' }}>
          Map, Heatmaps & Match Playback
        </p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {/* Map Selection Buttons */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          <label style={{ fontSize: '11px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px', color: 'var(--text-secondary)' }}>
            Map Selection
          </label>
          <div style={{ display: 'flex', gap: '6px' }}>
            {(['AmbroseValley', 'GrandRift', 'Lockdown'] as MapId[]).map((mapId) => {
              const isActive = activeMap === mapId;
              return (
                <button
                  key={mapId}
                  onClick={() => onMapChange(mapId)}
                  style={{
                    flex: 1,
                    padding: '8px 6px',
                    borderRadius: '8px',
                    fontSize: '11px',
                    fontWeight: isActive ? 600 : 500,
                    border: isActive ? '1px solid var(--accent-ops)' : '1px solid var(--border-color)',
                    background: isActive ? 'var(--accent-ops-bg)' : 'var(--panel-card)',
                    color: isActive ? 'var(--accent-ops)' : 'var(--text-secondary)',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
                    textAlign: 'center',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {MAP_CONFIG[mapId].name}
                </button>
              );
            })}
          </div>
        </div>

        {/* Date Filter Pills */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          <label style={{ fontSize: '11px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px', color: 'var(--text-secondary)' }}>
            Date Filter
          </label>
          <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
            <button
              onClick={() => onSelectDate('ALL')}
              style={{
                padding: '4px 8px',
                borderRadius: '6px',
                fontSize: '11px',
                border: 'none',
                background: selectedDate === 'ALL' ? 'var(--accent-ops)' : 'var(--panel-card)',
                color: selectedDate === 'ALL' ? '#000' : 'var(--text-secondary)',
                cursor: 'pointer',
                fontWeight: selectedDate === 'ALL' ? 600 : 400,
              }}
            >
              All
            </button>
            {availableDates.map((date) => (
              <button
                key={date}
                onClick={() => onSelectDate(date)}
                style={{
                  padding: '4px 8px',
                  borderRadius: '6px',
                  fontSize: '11px',
                  border: 'none',
                  background: selectedDate === date ? 'var(--accent-ops)' : 'var(--panel-card)',
                  color: selectedDate === date ? '#000' : 'var(--text-secondary)',
                  cursor: 'pointer',
                  fontWeight: selectedDate === date ? 600 : 400,
                }}
              >
                {date.replace('February_', 'Feb ')}
              </button>
            ))}
          </div>
        </div>

        {/* Heatmap Density Mode */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          <label style={{ fontSize: '11px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px', color: 'var(--text-secondary)' }}>
            Heatmap Overlay
          </label>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px' }}>
            {[
              { mode: 'none', label: 'Off', icon: Flame, color: '#64748b' },
              { mode: 'kills', label: 'Kills Density', icon: Target, color: '#EF4444' },
              { mode: 'deaths', label: 'Deaths Zone', icon: Skull, color: '#F43F5E' },
              { mode: 'traffic', label: 'High Traffic', icon: Flame, color: '#14B8A6' },
            ].map((item) => {
              const isSel = heatmapMode === item.mode;
              const IconComp = item.icon;
              return (
                <button
                  key={item.mode}
                  onClick={() => onSelectHeatmapMode(item.mode as HeatmapMode)}
                  style={{
                    padding: '8px',
                    borderRadius: '6px',
                    border: isSel ? `1px solid ${item.color}` : '1px solid var(--border-color)',
                    background: isSel ? 'rgba(255,255,255,0.06)' : 'var(--panel-card)',
                    color: isSel ? '#fff' : 'var(--text-secondary)',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    fontSize: '11px',
                  }}
                >
                  <IconComp size={14} color={item.color} />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </div>
          {heatmapMode !== 'none' && (
            <div style={{ marginTop: '4px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: 'var(--text-secondary)' }}>
                <span>Opacity</span>
                <span style={{ fontFamily: 'var(--font-mono)' }}>{Math.round(heatmapOpacity * 100)}%</span>
              </div>
              <input
                type="range"
                min={0.1}
                max={1}
                step={0.05}
                value={heatmapOpacity}
                onChange={(e) => onChangeHeatmapOpacity(Number(e.target.value))}
                style={{ width: '100%', accentColor: 'var(--accent-ops)', marginTop: '2px' }}
              />
            </div>
          )}
        </div>

        {/* Entity & Event Filters */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          <label style={{ fontSize: '11px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px', color: 'var(--text-secondary)' }}>
            Layer Filters
          </label>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px', fontSize: '11px' }}>
            {[
              { label: 'Humans', checked: showHumans, toggle: onToggleHumans, color: '#14B8A6' },
              { label: 'Bots', checked: showBots, toggle: onToggleBots, color: '#64748B' },
              { label: 'Kills', checked: showKills, toggle: onToggleKills, color: '#EF4444' },
              { label: 'Deaths', checked: showDeaths, toggle: onToggleDeaths, color: '#F43F5E' },
              { label: 'Storm', checked: showStorm, toggle: onToggleStorm, color: '#A855F7' },
              { label: 'Loot', checked: showLoot, toggle: onToggleLoot, color: '#F59E0B' },
            ].map((item, idx) => (
              <label key={idx} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '6px 8px', borderRadius: '6px', background: 'var(--panel-card)', border: '1px solid var(--border-color)', cursor: 'pointer' }}>
                <span style={{ color: item.color, fontWeight: 500 }}>{item.label}</span>
                <input type="checkbox" checked={item.checked} onChange={item.toggle} style={{ accentColor: 'var(--accent-ops)' }} />
              </label>
            ))}
          </div>
        </div>

        {/* Playback Controls & Timeline Scrub */}
        <div className="card-surface" style={{ padding: '12px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '12px' }}>
            <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>Playback Scrubber</span>
            <span style={{ fontFamily: 'var(--font-mono)', color: 'var(--accent-ops)', fontSize: '11px' }}>
              {formatTime(currentTimeMs)} / {formatTime(currentMatch ? currentMatch.duration_ms : 0)}
            </span>
          </div>

          <input
            type="range"
            min={0}
            max={currentMatch ? currentMatch.duration_ms : 100}
            value={currentTimeMs}
            onChange={(e) => onSeek(Number(e.target.value))}
            disabled={!currentMatch}
            style={{ width: '100%', accentColor: 'var(--accent-ops)', cursor: 'pointer' }}
          />

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <button
              onClick={onTogglePlay}
              disabled={!currentMatch}
              style={{
                padding: '6px 16px',
                borderRadius: '6px',
                border: 'none',
                background: isPlaying ? '#EF4444' : 'var(--accent-ops)',
                color: '#000',
                fontWeight: 700,
                fontSize: '12px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
              }}
            >
              {isPlaying ? <Pause size={14} fill="#000" /> : <Play size={14} fill="#000" />}
              <span>{isPlaying ? 'Pause' : 'Play'}</span>
            </button>

            <div style={{ display: 'flex', gap: '4px' }}>
              {[0.5, 1, 2, 4, 8].map((spd) => (
                <button
                  key={spd}
                  onClick={() => onChangeSpeed(spd)}
                  style={{
                    padding: '3px 6px',
                    borderRadius: '4px',
                    fontSize: '10px',
                    fontFamily: 'var(--font-mono)',
                    border: 'none',
                    background: playbackSpeed === spd ? 'var(--accent-ops)' : 'rgba(255,255,255,0.06)',
                    color: playbackSpeed === spd ? '#000' : 'var(--text-secondary)',
                    cursor: 'pointer',
                  }}
                >
                  {spd}x
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Match Index Selection List */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <label style={{ fontSize: '11px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px', color: 'var(--text-secondary)' }}>
              Match Index ({filteredMatches.length})
            </label>
          </div>

          {/* Search Bar for Match ID */}
          <div style={{ position: 'relative' }}>
            <Search size={13} color="var(--text-dim)" style={{ position: 'absolute', left: '8px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
            <input
              type="text"
              placeholder="Search Match ID..."
              value={matchSearchQuery}
              onChange={(e) => setMatchSearchQuery(e.target.value)}
              style={{
                width: '100%',
                padding: '6px 8px 6px 26px',
                borderRadius: '6px',
                border: '1px solid var(--border-color)',
                background: 'var(--panel-card)',
                color: 'var(--text-primary)',
                fontSize: '11px',
                fontFamily: 'var(--font-mono)',
                outline: 'none',
              }}
            />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', maxHeight: '220px', overflowY: 'auto' }}>
            {filteredMatches.map((m) => {
              const isSel = selectedMatchId === m.match_id;
              return (
                <div
                  key={m.match_id}
                  onClick={() => onSelectMatchId(m.match_id)}
                  style={{
                    padding: '8px 10px',
                    borderRadius: '6px',
                    background: isSel ? 'var(--accent-ops-bg)' : 'var(--panel-card)',
                    border: isSel ? '1px solid var(--accent-ops)' : '1px solid var(--border-color)',
                    cursor: 'pointer',
                    fontSize: '11px',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                  }}
                >
                  <div>
                    <div style={{ fontFamily: 'var(--font-mono)', fontWeight: 600, color: isSel ? 'var(--accent-ops)' : 'var(--text-primary)' }}>
                      {m.match_id.substring(0, 8)}...
                    </div>
                    <div style={{ fontSize: '10px', color: 'var(--text-secondary)', marginTop: '2px' }}>
                      {m.date.replace('February_', 'Feb ')} • {m.human_count}H / {m.bot_count}B
                    </div>
                  </div>
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', color: 'var(--text-dim)' }}>
                    {Math.round(m.duration_ms / 1000)}s
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </aside>
  );
};
