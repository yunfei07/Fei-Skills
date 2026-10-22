import React from 'react';
import {Composition} from 'remotion';
import {KnowledgeExplainerVideo} from './video';
import {example} from './data';

const fps=30;
const durationInFrames=Math.ceil(example.chapters.flatMap(c=>c.scenes).reduce((sum,s)=>sum+(s.duration??5),0)*fps);

export const RemotionRoot=()=> <Composition
  id="FeiKnowledgeExplainer"
  component={KnowledgeExplainerVideo}
  durationInFrames={durationInFrames}
  fps={fps}
  width={1920}
  height={1080}
  defaultProps={{explainer:example}}
/>;
