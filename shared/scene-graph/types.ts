export type SceneKind = 'text' | 'flow' | 'compare' | 'network' | 'chart' | 'spatial';
export type VisualGrammar = 'projection-split'|'attention-map'|'parallel-heads'|'layer-stack'|'process-flow'|'comparison'|'focus-reveal';
export type MotionGrammar = 'ink-line-grow'|'layered-emergence'|'focus-reveal'|'quiet-parallel'|'paper-dissolve';

export type SpatialPoint = {x:number;y:number;z:number;size?:number;label?:string};
export type SpatialCamera = {position?:[number,number,number];target?:[number,number,number];motion?:'static'|'slow-push'|'slow-pull'|'lateral'};
export type DirectorPlan = {focus?:string;reading_order?:string[];transition?:string;stable_frame?:number;evidence?:'literal'|'measured'|'schematic'|'illustrative'};

export type Scene = {
  id:string; title:string; summary:string; kind:SceneKind;
  duration?:number; narration?:string; fallback?:string;
  visual_grammar?:VisualGrammar; motion_grammar?:MotionGrammar; director?:DirectorPlan;
  data?:Record<string,unknown> & {points?:SpatialPoint[];camera?:SpatialCamera;meaning?:string};
};
export type Chapter={id:string;title:string;scenes:Scene[]};
export type Explainer={version:'0.3';profile?:string;title:string;audience:string;learning_objective?:string;chapters:Chapter[]};
