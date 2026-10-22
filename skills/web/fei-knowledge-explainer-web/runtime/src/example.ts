import type { Explainer } from './types';

export const example: Explainer = {
  version:'0.2',
  title:'Neural networks, without the mystery',
  audience:'Beginner',
  learning_objective:'Explain how inputs become a prediction through weighted connections and repeated layers.',
  chapters:[
    {id:'signals',title:'1. Signals become numbers',scenes:[
      {id:'input',title:'Start with inputs',summary:'A model receives measurable signals represented as numbers.',kind:'text',fallback:'Inputs are numeric measurements such as pixel brightness or sensor readings.'},
      {id:'weighted-flow',title:'Connections change influence',summary:'Each incoming value is multiplied by a weight before signals are combined.',kind:'flow',data:{steps:['input x1','× weight w1','sum','activation','output']},fallback:'Input values are scaled by weights, added together, transformed, then passed forward.'}
    ]},
    {id:'layers',title:'2. Layers build representations',scenes:[
      {id:'network',title:'Many simple units form a network',summary:'A layer transforms one vector of numbers into another.',kind:'network',data:{columns:[3,4,2]},fallback:'Three input nodes connect to four hidden nodes, which connect to two output nodes.'},
      {id:'training',title:'Training changes the weights',summary:'The model compares predictions with targets and adjusts weights to reduce error.',kind:'compare',data:{left:{label:'Before',value:'larger error'},right:{label:'After updates',value:'smaller error'}},fallback:'Training repeatedly changes weights so predictions better match targets.'}
    ]}
  ]
};
