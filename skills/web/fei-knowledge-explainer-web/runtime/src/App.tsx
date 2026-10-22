import { useMemo, useState } from 'react';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { example } from './example';
import type { Scene } from './types';
import SceneRenderer from './renderers';

export default function App() {
  const scenes = useMemo(()=>example.chapters.flatMap(ch=>ch.scenes.map(scene=>({...scene,chapter:ch.title}))),[]);
  const [index,setIndex] = useState(0);
  const current = scenes[index] as Scene & {chapter:string};
  const progress = ((index+1)/scenes.length)*100;
  return <main data-profile={example.profile ?? 'song-aesthetic'}>
    <header className="topbar"><div className="brand">Fei · 知微</div><div className="audience">{example.profile ?? 'song-aesthetic'} · {example.audience}</div></header>
    <section className="intro"><h1>{example.title}</h1><p>{example.learning_objective}</p></section>
    <section className="stage" aria-live="polite">
      <aside><div className="chapter">{current.chapter}</div><div className="scene-count">{String(index+1).padStart(2,'0')} / {String(scenes.length).padStart(2,'0')}</div></aside>
      <article><h2>{current.title}</h2><p>{current.summary}</p><div className="visual"><SceneRenderer scene={current}/></div><p className="fallback">{current.fallback}</p></article>
    </section>
    <footer><div className="progress" aria-hidden="true"><span style={{width:`${progress}%`}}/></div><div className="controls"><button onClick={()=>setIndex(Math.max(0,index-1))} disabled={index===0}><ArrowLeft size={18}/> Previous</button><button onClick={()=>setIndex(Math.min(scenes.length-1,index+1))} disabled={index===scenes.length-1}>Next <ArrowRight size={18}/></button></div></footer>
  </main>;
}
