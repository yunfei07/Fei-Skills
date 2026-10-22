export type SceneKind = 'text' | 'flow' | 'compare' | 'network';
export type Scene = { id:string; title:string; summary:string; kind:SceneKind; narration?:string; fallback?:string; data?:Record<string, unknown> };
export type Chapter = { id:string; title:string; scenes:Scene[] };
export type Explainer = { version:'0.2'; title:string; audience:string; learning_objective?:string; chapters:Chapter[] };
