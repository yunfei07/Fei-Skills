export type SceneKind = 'text' | 'flow' | 'compare' | 'network' | 'chart' | 'spatial';
export type Scene = { id:string; title:string; summary:string; kind:SceneKind; narration?:string; fallback?:string; data?:Record<string, unknown> };
export type Chapter = { id:string; title:string; scenes:Scene[] };
export type ExplainerProfile = 'song-aesthetic' | string;
export type Explainer = { version:'0.3'; title:string; audience:string; profile?:ExplainerProfile; learning_objective?:string; chapters:Chapter[] };
