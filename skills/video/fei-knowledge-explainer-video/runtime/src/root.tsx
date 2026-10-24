import React from 'react';
import {Composition} from 'remotion';
import {KnowledgeExplainerVideo} from './video';
import {example, smokeExample} from './data';
import {transformerBenchmark} from './transformerBenchmark';

const fps=30;
const frames=(input:typeof example)=>Math.ceil(input.chapters.flatMap(c=>c.scenes).reduce((sum,s)=>sum+(s.duration??5),0)*fps);

export const RemotionRoot=()=> <>
  <Composition id="FeiKnowledgeExplainer" component={KnowledgeExplainerVideo} durationInFrames={frames(example)} fps={fps} width={1920} height={1080} defaultProps={{explainer:example}} />
  <Composition id="FeiKnowledgeExplainerSmoke" component={KnowledgeExplainerVideo} durationInFrames={frames(smokeExample)} fps={fps} width={1280} height={720} defaultProps={{explainer:smokeExample}} />
  <Composition id="FeiTransformerBenchmark" component={KnowledgeExplainerVideo} durationInFrames={frames(transformerBenchmark)} fps={fps} width={1920} height={1080} defaultProps={{explainer:transformerBenchmark}} />
</>;
