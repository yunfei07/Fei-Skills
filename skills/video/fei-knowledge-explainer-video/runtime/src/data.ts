export type SceneKind='text'|'flow'|'compare'|'network'|'chart'|'spatial';
export type Scene={id:string;title:string;summary:string;kind:SceneKind;duration?:number;fallback?:string;data?:Record<string,unknown>};
export type Explainer={version:'0.3';profile?:'song-aesthetic'|string;title:string;audience:string;learning_objective?:string;chapters:{id:string;title:string;scenes:Scene[]}[]};

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
      {id:'training',title:'Training changes the weights',summary:'Repeated updates reduce prediction error.',kind:'chart',duration:6,data:{values:[0.92,0.71,0.55,0.43,0.35,0.29]},fallback:'Training loss decreases across successive updates.'}
    ]}
  ]
};
