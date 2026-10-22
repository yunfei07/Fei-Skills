import type {Explainer, Scene, SceneKind, SpatialPoint} from '../../../../../shared/scene-graph/types';
export type {Explainer, Scene, SceneKind, SpatialPoint};

export const example:Explainer={
  version:'0.3',
  profile:'song-aesthetic',
  title:'Neural networks, without the mystery',
  audience:'Beginner',
  learning_objective:'Explain how inputs become a prediction through weighted connections and repeated layers.',
  chapters:[
    {id:'signals',title:'Signals become numbers',scenes:[
      {id:'input',title:'Start with inputs',summary:'A model receives measurable signals represented as numbers.',kind:'text',duration:4,fallback:'Inputs are numeric measurements.'},
      {id:'weighted-flow',title:'Connections change influence',summary:'Each incoming value is multiplied by a weight before signals are combined.',kind:'flow',duration:6,data:{steps:['input x1','× weight w1','sum','activation','output']},fallback:'Inputs are weighted, combined, transformed and passed forward.'}
    ]},
    {id:'layers',title:'Layers build representations',scenes:[
      {id:'network',title:'Many simple units form a network',summary:'A layer transforms one vector of numbers into another.',kind:'network',duration:6,data:{columns:[3,4,2]},fallback:'Three input nodes connect to four hidden nodes and two output nodes.'},
      {id:'training',title:'Training changes the weights',summary:'Repeated updates reduce prediction error.',kind:'chart',duration:6,data:{values:[0.92,0.71,0.55,0.43,0.35,0.29]},fallback:'Training loss decreases across successive updates.'},
      {id:'latent-space',title:'Similar patterns can occupy nearby regions',summary:'A spatial scene can illustrate an embedding when depth itself helps explain grouping.',kind:'spatial',duration:7,data:{points:[{x:-1.3,y:0.5,z:0.3,size:0.15},{x:-0.9,y:0.2,z:0.1,size:0.12},{x:0.8,y:-0.1,z:-0.7,size:0.14},{x:1.2,y:0.3,z:-0.5,size:0.11}],camera:{position:[0,0,6],target:[0,0,0],motion:'slow-push'},meaning:'Distance is an illustrative metaphor for similarity here; these coordinates are not measured model outputs.'},fallback:'Two groups of points occupy separated regions to illustrate similarity in an abstract embedding.'}
    ]}
  ]
};
