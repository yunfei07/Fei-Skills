export type SceneKind = 'text' | 'flow' | 'compare' | 'network' | 'chart' | 'spatial';

export type SpatialPoint = {
  x: number;
  y: number;
  z: number;
  size?: number;
  label?: string;
};

export type SpatialCamera = {
  position?: [number, number, number];
  target?: [number, number, number];
  motion?: 'static' | 'slow-push' | 'slow-pull' | 'lateral';
};

export type Scene = {
  id: string;
  title: string;
  summary: string;
  kind: SceneKind;
  duration?: number;
  narration?: string;
  fallback?: string;
  data?: Record<string, unknown> & {
    points?: SpatialPoint[];
    camera?: SpatialCamera;
    meaning?: string;
  };
};

export type Chapter = {id: string; title: string; scenes: Scene[]};

export type Explainer = {
  version: '0.3';
  profile?: string;
  title: string;
  audience: string;
  learning_objective?: string;
  chapters: Chapter[];
};
