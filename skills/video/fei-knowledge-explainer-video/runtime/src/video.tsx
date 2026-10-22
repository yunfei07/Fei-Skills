import React from 'react';
import {AbsoluteFill, Sequence, interpolate, useCurrentFrame, useVideoConfig} from 'remotion';
import type {Explainer, Scene} from './data';

const C={paper:'#F4F1E8',paperDeep:'#ECE8DC',ink:'#24302B',inkSoft:'#5F6B65',green:'#7F9488',cyan:'#A7B8B1',mist:'#D9DFDA',line:'#C7CEC8',white:'#FBFAF6'};
const serif='Songti SC, STSong, Noto Serif CJK SC, Georgia, serif';

const SceneVisual=({scene}:{scene:Scene})=>{
  const frame=useCurrentFrame();
  const opacity=interpolate(frame,[0,16],[0,1],{extrapolateRight:'clamp'});
  const shift=interpolate(frame,[0,24],[18,0],{extrapolateRight:'clamp'});
  const wrap:React.CSSProperties={opacity,transform:`translateY(${shift}px)`,width:'100%',height:'100%',display:'flex',alignItems:'center',justifyContent:'center'};

  if(scene.kind==='flow'){
    const steps=((scene.data?.steps as string[])||[]);
    return <div style={{...wrap,gap:34,flexWrap:'wrap'}}>{steps.map((s,i)=><React.Fragment key={s}><div style={{fontFamily:serif,fontSize:34,color:C.ink,borderBottom:`1px solid ${C.line}`,padding:'12px 8px'}}>{s}</div>{i<steps.length-1&&<span style={{color:C.cyan,fontSize:28}}>—</span>}</React.Fragment>)}</div>;
  }
  if(scene.kind==='network'){
    const cols=((scene.data?.columns as number[])||[3,4,2]);
    const xs=cols.map((_,i)=>220+i*(1080/Math.max(1,cols.length-1)));
    const points=cols.map((n,ci)=>Array.from({length:n},(_,ni)=>({x:xs[ci],y:120+ni*(520/Math.max(1,n-1))})));
    return <svg viewBox="0 0 1520 760" style={{...wrap,maxWidth:1500}}>{points.slice(0,-1).flatMap((col,ci)=>col.flatMap(a=>points[ci+1].map((b,j)=><line key={`${ci}-${a.x}-${j}`} x1={a.x} y1={a.y} x2={b.x} y2={b.y} stroke={C.line} strokeWidth="2"/>)))}{points.flat().map((p,i)=><circle key={i} cx={p.x} cy={p.y} r="22" fill={C.paper} stroke={C.green} strokeWidth="3"/>)}</svg>;
  }
  if(scene.kind==='chart'){
    const values=((scene.data?.values as number[])||[0.2,0.5,0.35,0.7]);
    const max=Math.max(...values,1); const min=Math.min(...values,0); const span=Math.max(max-min,0.0001);
    const pts=values.map((v,i)=>({x:160+i*(1200/Math.max(1,values.length-1)),y:620-((v-min)/span)*420}));
    return <svg viewBox="0 0 1520 760" style={{...wrap,maxWidth:1500}}><line x1="120" y1="640" x2="1400" y2="640" stroke={C.line} strokeWidth="2"/><line x1="120" y1="120" x2="120" y2="640" stroke={C.line} strokeWidth="2"/><polyline fill="none" stroke={C.green} strokeWidth="6" points={pts.map(p=>`${p.x},${p.y}`).join(' ')}/>{pts.map((p,i)=><circle key={i} cx={p.x} cy={p.y} r="10" fill={C.paper} stroke={C.ink} strokeWidth="3"/>)}</svg>;
  }
  if(scene.kind==='compare'){
    const left=(scene.data?.left as {label?:string;value?:string})||{}; const right=(scene.data?.right as {label?:string;value?:string})||{};
    return <div style={{...wrap,display:'grid',gridTemplateColumns:'1fr 1fr',gap:0,maxWidth:1280}}><div style={{padding:60,borderRight:`1px solid ${C.line}`}}><div style={{fontSize:24,color:C.inkSoft}}>{left.label}</div><div style={{fontFamily:serif,fontSize:64,color:C.ink,marginTop:22}}>{left.value}</div></div><div style={{padding:60}}><div style={{fontSize:24,color:C.inkSoft}}>{right.label}</div><div style={{fontFamily:serif,fontSize:64,color:C.ink,marginTop:22}}>{right.value}</div></div></div>;
  }
  if(scene.kind==='spatial'){
    return <div style={{...wrap,position:'relative'}}><div style={{width:560,height:360,border:`1px solid ${C.line}`,transform:'skewY(-8deg)',background:C.paperDeep}}/><div style={{position:'absolute',fontFamily:serif,fontSize:32,color:C.inkSoft}}>spatial relation · static fallback</div></div>;
  }
  return <div style={{...wrap,fontFamily:serif,fontSize:96,color:C.ink,letterSpacing:'0.03em'}}>一念 · 一层 · 一变</div>;
};

const SceneFrame=({scene,chapter,index,total}:{scene:Scene;chapter:string;index:number;total:number})=>{
  const frame=useCurrentFrame(); const {durationInFrames}=useVideoConfig();
  const fadeOut=interpolate(frame,[Math.max(durationInFrames-16,0),durationInFrames],[1,0],{extrapolateLeft:'clamp'});
  return <AbsoluteFill style={{background:C.paper,color:C.ink,padding:'74px 104px 66px',fontFamily:'system-ui, sans-serif',opacity:fadeOut}}>
    <div style={{display:'flex',justifyContent:'space-between',fontSize:22,color:C.inkSoft,borderBottom:`1px solid ${C.line}`,paddingBottom:18}}><span>{chapter}</span><span>{String(index+1).padStart(2,'0')} / {String(total).padStart(2,'0')}</span></div>
    <div style={{paddingTop:58}}><h1 style={{fontFamily:serif,fontWeight:500,fontSize:76,lineHeight:1.14,margin:0,maxWidth:1300}}>{scene.title}</h1><p style={{fontSize:30,lineHeight:1.65,color:C.inkSoft,maxWidth:1050,marginTop:24}}>{scene.summary}</p></div>
    <div style={{flex:1,minHeight:0,display:'flex',alignItems:'center'}}><SceneVisual scene={scene}/></div>
    <div style={{borderTop:`1px solid ${C.line}`,paddingTop:18,fontSize:20,color:C.inkSoft}}>{scene.fallback}</div>
  </AbsoluteFill>;
};

export const KnowledgeExplainerVideo=({explainer}:{explainer:Explainer})=>{
  const fps=30; const flat=explainer.chapters.flatMap(ch=>ch.scenes.map(scene=>({scene,chapter:ch.title})));
  let cursor=0;
  return <AbsoluteFill style={{background:C.paper}}>{flat.map(({scene,chapter},index)=>{const frames=Math.max(1,Math.round((scene.duration??5)*fps)); const from=cursor; cursor+=frames; return <Sequence key={scene.id} from={from} durationInFrames={frames}><SceneFrame scene={scene} chapter={chapter} index={index} total={flat.length}/></Sequence>;})}</AbsoluteFill>;
};
