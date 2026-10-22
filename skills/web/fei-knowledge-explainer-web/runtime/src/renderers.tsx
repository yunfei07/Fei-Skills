import type { Scene } from './types';

function Flow({scene}:{scene:Scene}) {
  const steps = ((scene.data?.steps as string[]) || []);
  return <div className="flow" aria-label={scene.fallback}>{steps.map((step,i)=><div className="flow-step" key={step}><span>{step}</span>{i<steps.length-1 && <span className="arrow" aria-hidden="true">→</span>}</div>)}</div>;
}

function Compare({scene}:{scene:Scene}) {
  const left = (scene.data?.left as {label?:string;value?:string}) || {};
  const right = (scene.data?.right as {label?:string;value?:string}) || {};
  return <div className="compare" aria-label={scene.fallback}><div><small>{left.label}</small><strong>{left.value}</strong></div><div><small>{right.label}</small><strong>{right.value}</strong></div></div>;
}

function Network({scene}:{scene:Scene}) {
  const columns = ((scene.data?.columns as number[]) || [2,3,2]);
  const xs = columns.map((_,i)=>70 + i * (360 / Math.max(1,columns.length-1)));
  const points = columns.map((count,ci)=>Array.from({length:count},(_,ni)=>({x:xs[ci],y:40 + ni*(200/Math.max(1,count-1))})));
  const edges = points.slice(0,-1).flatMap((col,ci)=>col.flatMap(a=>points[ci+1].map(b=>({a,b}))));
  return <svg className="network" viewBox="0 0 500 280" role="img" aria-label={scene.fallback}><g className="edges">{edges.map((e,i)=><line key={i} x1={e.a.x} y1={e.a.y} x2={e.b.x} y2={e.b.y}/>)}</g><g>{points.flat().map((p,i)=><circle key={i} cx={p.x} cy={p.y} r="14"/>)}</g></svg>;
}

export default function SceneRenderer({scene}:{scene:Scene}) {
  if (scene.kind === 'flow') return <Flow scene={scene}/>;
  if (scene.kind === 'compare') return <Compare scene={scene}/>;
  if (scene.kind === 'network') return <Network scene={scene}/>;
  return <div className="text-visual"><span>01</span><span>→</span><span>meaning</span></div>;
}
