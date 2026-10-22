import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import type { Scene } from './types';

function Flow({scene}:{scene:Scene}) {
  const steps = ((scene.data?.steps as string[]) || []);
  return <div className="flow" aria-label={scene.fallback}>{steps.map((step,i)=><div className="flow-step" key={step}><span>{step}</span>{i<steps.length-1 && <span className="arrow" aria-hidden="true">—</span>}</div>)}</div>;
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
  return <svg className="network" viewBox="0 0 500 280" role="img" aria-label={scene.fallback}><g className="edges">{edges.map((e,i)=><line key={i} x1={e.a.x} y1={e.a.y} x2={e.b.x} y2={e.b.y}/>)}</g><g>{points.flat().map((p,i)=><circle key={i} cx={p.x} cy={p.y} r="11"/>)}</g></svg>;
}

function Chart({scene}:{scene:Scene}) {
  const values = ((scene.data?.values as number[]) || [18,31,46,39,58]);
  const labels = ((scene.data?.labels as string[]) || values.map((_,i)=>String(i+1)));
  const max = Math.max(...values,1);
  const pts = values.map((v,i)=>({x:46 + i*(408/Math.max(1,values.length-1)), y:228-(v/max)*160}));
  const d = pts.map((p,i)=>`${i?'L':'M'} ${p.x} ${p.y}`).join(' ');
  return <svg className="chart" viewBox="0 0 500 260" role="img" aria-label={scene.fallback}>
    <line className="axis" x1="42" y1="228" x2="462" y2="228" />
    <path className="series" d={d}/>
    {pts.map((p,i)=><g key={i}><circle cx={p.x} cy={p.y} r="5"/><text x={p.x} y="248" textAnchor="middle">{labels[i] ?? i+1}</text></g>)}
  </svg>;
}

function Spatial({scene}:{scene:Scene}) {
  const host = useRef<HTMLDivElement>(null);
  useEffect(()=>{
    const el = host.current; if (!el) return;
    const width = Math.max(320, el.clientWidth), height = 320;
    const renderer = new THREE.WebGLRenderer({antialias:true, alpha:true});
    renderer.setPixelRatio(Math.min(window.devicePixelRatio,2)); renderer.setSize(width,height); el.appendChild(renderer.domElement);
    const scene3 = new THREE.Scene(); scene3.fog = new THREE.Fog(0xF4F1E8,4.5,10);
    const camera = new THREE.PerspectiveCamera(28,width/height,.1,100); camera.position.set(0,1.4,6.2); camera.lookAt(0,0,0);
    const group = new THREE.Group(); scene3.add(group);
    const material = new THREE.MeshStandardMaterial({color:0x7F9488,roughness:.88,metalness:0});
    const count = Number(scene.data?.count ?? 7);
    for(let i=0;i<count;i++){
      const mesh = new THREE.Mesh(new THREE.SphereGeometry(.22,32,32),material.clone());
      const a = (i/Math.max(1,count-1))*Math.PI*1.35-.7; mesh.position.set(Math.cos(a)*1.8,(i-count/2)*.16,Math.sin(a)*.85); group.add(mesh);
    }
    const light = new THREE.HemisphereLight(0xFBFAF6,0xA7B8B1,2.2); scene3.add(light);
    const key = new THREE.DirectionalLight(0xFBFAF6,2.1); key.position.set(3,4,5); scene3.add(key);
    const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches; let frame=0;
    const draw=()=>{ group.rotation.y += reduce?0:.0018; renderer.render(scene3,camera); if(!reduce) frame=requestAnimationFrame(draw); };
    draw();
    const ro = new ResizeObserver(()=>{const w=Math.max(320,el.clientWidth); renderer.setSize(w,height); camera.aspect=w/height; camera.updateProjectionMatrix(); renderer.render(scene3,camera);}); ro.observe(el);
    return ()=>{cancelAnimationFrame(frame);ro.disconnect();renderer.dispose();el.replaceChildren();};
  },[scene]);
  return <div className="spatial" ref={host} role="img" aria-label={scene.fallback}/>;
}

export default function SceneRenderer({scene}:{scene:Scene}) {
  if (scene.kind === 'flow') return <Flow scene={scene}/>;
  if (scene.kind === 'compare') return <Compare scene={scene}/>;
  if (scene.kind === 'network') return <Network scene={scene}/>;
  if (scene.kind === 'chart') return <Chart scene={scene}/>;
  if (scene.kind === 'spatial') return <Spatial scene={scene}/>;
  return <div className="text-visual"><span>一</span><span>·</span><span>理</span></div>;
}
