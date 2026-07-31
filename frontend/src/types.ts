export type MapId = 'AmbroseValley' | 'GrandRift' | 'Lockdown';

export interface MapWorldParams {
  name: string;
  image: string;
  scale: number;
  origin_x: number;
  origin_z: number;
}

export const MAP_CONFIG: Record<MapId, MapWorldParams> = {
  AmbroseValley: {
    name: 'Ambrose Valley',
    image: '/minimaps/AmbroseValley_Minimap.png',
    scale: 900,
    origin_x: -370,
    origin_z: -473,
  },
  GrandRift: {
    name: 'Grand Rift',
    image: '/minimaps/GrandRift_Minimap.png',
    scale: 581,
    origin_x: -290,
    origin_z: -290,
  },
  Lockdown: {
    name: 'Lockdown',
    image: '/minimaps/Lockdown_Minimap.jpg',
    scale: 1000,
    origin_x: -500,
    origin_z: -500,
  },
};

export interface MatchIndexItem {
  match_id: string;
  date: string;
  player_count: number;
  human_count: number;
  bot_count: number;
  duration_ms: number;
}

export interface MapSummary {
  map_id: MapId;
  grid_size: number;
  img_size: number;
  heatmaps: {
    kills: number[][];
    deaths: number[][];
    traffic: number[][];
  };
  matches: MatchIndexItem[];
}

export interface PlayerPath {
  ts: number[];
  px: number[];
  py: number[];
}

export interface PlayerData {
  user_id: string;
  is_bot: boolean;
  path: PlayerPath | null;
}

export interface DiscreteEvent {
  ts: number;
  user_id: string;
  is_bot: boolean;
  type: string;
  px: number;
  py: number;
}

export interface MatchRecord {
  match_id: string;
  map_id: MapId;
  date: string;
  duration_ms: number;
  player_count: number;
  human_count: number;
  bot_count: number;
  players: PlayerData[];
  events: DiscreteEvent[];
}

export type HeatmapMode = 'none' | 'kills' | 'deaths' | 'traffic';
