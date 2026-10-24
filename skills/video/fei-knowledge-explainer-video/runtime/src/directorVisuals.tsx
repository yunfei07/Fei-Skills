import React from 'react';
import {interpolate,useCurrentFrame} from 'remotion';
import type {Scene} from '../../../../../shared/scene-graph/types';

const C={paper:'#F4F1E8',ink:'#24302B',soft:'#5F6B65',green:'#7F9488',cyan:'#A7B8B1',line:'#C7CEC8'};
const serif='Songti SC, STSong, Noto Serif CJK SC, Georgia, serif';
const reveal=(frame:number,start:number,end:number)=>interpolate(frame,[start,end],[0,1],{extrapolateLeft:'clamp',extrapolateRight:'clamp'});
const drawStyle=(p:number,width=2):React.CSSProperties=>({strokeDasharray:1,strokeDashoffset:1-p,opacity:p,strokeWidth:width});

export function ProjectionSplit({scene}:{scene:Scene}){
  const f=useCurrentFrame();
  const branch=reveal(f,8,34), operate=reveal(f,34,62), result=reveal(f,56,78);
  return <svg viewBox="0 0 1200 470" style={{width:1200,height:470,fontFamily:serif}} role="img" aria-label={scene.fallback}>
    <text x="600" y="42" textAnchor="middle" fill={C.ink} fontSize="30">token representation</text>
    <line x1="485" y1="58" x2="715" y2="58" stroke={C.green}/>
    {[[600,70,245,155],[600,70,600,155],[600,70,955,155]].map((v,i)=><path key={i} d={`M ${v[0]} ${v[1]} Q ${(v[0]+v[2])/2} 105 ${v[2]} ${v[3]}`} fill="none" stroke={C.cyan} pathLength="1" style={drawStyle(branch,2)}/>) }
    {['Q','K','V'].map((label,i)=>{const x=[245,600,955][i],role=['我要找什么','我能否匹配','我携带什么内容'][i];return <g key={label} opacity={branch}><text x={x} y="200" textAnchor="middle" fill={C.ink} fontSize="48">{label}</text><text x={x} y="230" textAnchor="middle" fill={C.soft} fontSize="19">{role}</text></g>})}
    <path d="M 245 245 Q 330 278 420 310" fill="none" stroke={C.cyan} pathLength="1" style={drawStyle(operate,2)}/>
    <path d="M 600 245 Q 515 278 420 310" fill="none" stroke={C.cyan} pathLength="1" style={drawStyle(operate,2)}/>
    <rect x="335" y="300" width="170" height="52" rx="0" fill="none" stroke={C.line} opacity={operate}/><text x="420" y="334" textAnchor="middle" fill={C.ink} fontSize="21" opacity={operate}>Q·Kᵀ / √dₖ</text>
    <path d="M 505 326 L 630 326" fill="none" stroke={C.green} pathLength="1" style={drawStyle(operate,2)}/><text x="570" y="312" textAnchor="middle" fill={C.soft} fontSize="17" opacity={operate}>scores</text>
    <rect x="630" y="300" width="145" height="52" fill="none" stroke={C.line} opacity={operate}/><text x="702" y="334" textAnchor="middle" fill={C.ink} fontSize="21" opacity={operate}>softmax</text>
    <path d="M 775 326 L 885 326" fill="none" stroke={C.green} pathLength="1" style={drawStyle(result,3)}/>
    <path d="M 955 245 Q 955 285 955 326 L 885 326" fill="none" stroke={C.cyan} pathLength="1" style={drawStyle(result,2)}/>
    <circle cx="915" cy="326" r="40" fill={C.paper} stroke={C.green} opacity={result}/><text x="915" y="334" textAnchor="middle" fill={C.ink} fontSize="22" opacity={result}>Σ α·V</text>
    <text x="915" y="402" textAnchor="middle" fill={C.soft} fontSize="20" opacity={result}>新的上下文表示</text>
  </svg>;
}

export function AttentionMap({scene}:{scene:Scene}){
  const f=useCurrentFrame();const tokens=(scene.data?.tokens as string[])||['我','正在','读','书'],weights=(scene.data?.weights as number[])||[.08,.12,.62,.18],focus=Number(scene.data?.focus_index??1),xs=tokens.map((_,i)=>180+i*(840/Math.max(1,tokens.length-1))),fx=xs[focus]??600;const grow=reveal(f,10,44);
  return <svg viewBox="0 0 1200 430" style={{width:1200,height:430,fontFamily:serif}}><text x={fx} y="54" textAnchor="middle" fill={C.ink} fontSize="30">当前 token · {tokens[focus]}</text>{tokens.map((t,i)=>{const w=weights[i]??0,path=`M ${fx} 78 Q ${(fx+xs[i])/2} ${140-Math.abs(fx-xs[i])*.04} ${xs[i]} 300`;return <g key={t}><path d={path} fill="none" stroke={C.green} strokeWidth={2+12*w} opacity={(.18+.82*w)*grow} pathLength="1" strokeDasharray="1" strokeDashoffset={1-grow}/><text x={xs[i]} y="274" textAnchor="middle" fill={C.soft} fontSize="20" opacity={reveal(f,34,52)}>{w.toFixed(2)}</text><text x={xs[i]} y="350" textAnchor="middle" fill={C.ink} fontSize="32">{t}</text></g>})}</svg>;
}

export function ParallelHeads({scene}:{scene:Scene}){
  const f=useCurrentFrame();const heads=(scene.data?.heads as string[])||['Head 1','Head 2','Head 3','Head 4'];const ys=[110,190,270,350];
  return <svg viewBox="0 0 1200 460" style={{width:1200,height:460,fontFamily:serif}} role="img" aria-label={scene.fallback}>
    <text x="105" y="228" textAnchor="middle" fill={C.ink} fontSize="27">shared input</text><line x1="40" y1="244" x2="170" y2="244" stroke={C.green}/>
    {heads.map((h,i)=>{const p=reveal(f,10+i*5,32+i*5),y=ys[i];return <g key={h}><path d={`M 170 240 Q 250 ${y} 335 ${y}`} fill="none" stroke={C.cyan} pathLength="1" style={drawStyle(p,2)}/><text x="380" y={y+7} fill={C.soft} fontSize="22" opacity={p}>{h}</text><line x1="470" y1={y} x2="790" y2={y} stroke={C.cyan} pathLength="1" style={drawStyle(p,2)}/><path d={`M 790 ${y} Q 870 ${y} 930 240`} fill="none" stroke={C.cyan} pathLength="1" style={drawStyle(p,2)}/></g>})}
    <circle cx="940" cy="240" r="6" fill={C.green} opacity={reveal(f,40,58)}/><line x1="946" y1="240" x2="1050" y2="240" stroke={C.green} pathLength="1" style={drawStyle(reveal(f,45,64),3)}/><text x="998" y="218" textAnchor="middle" fill={C.soft} fontSize="17" opacity={reveal(f,48,66)}>concat</text><text x="1068" y="248" fill={C.ink} fontSize="24" opacity={reveal(f,52,70)}>projection</text>
  </svg>;
}

export function LayerStack({scene}:{scene:Scene}){
  const f=useCurrentFrame();const p1=reveal(f,8,28),p2=reveal(f,28,50),repeat=reveal(f,52,72);
  const module=(y:number,label:string,p:number)=><g opacity={p}><rect x="410" y={y} width="380" height="70" fill="none" stroke={C.line}/><text x="600" y={y+44} textAnchor="middle" fill={C.ink} fontSize="29">{label}</text><path d={`M 380 ${y-22} L 380 ${y+100} Q 380 ${y+124} 405 ${y+124} L 810 ${y+124}`} fill="none" stroke={C.cyan} strokeWidth="2"/><text x="825" y={y+130} fill={C.soft} fontSize="18">+ norm</text></g>;
  return <svg viewBox="0 0 1200 470" style={{width:1100,height:440,fontFamily:serif}} role="img" aria-label={scene.fallback}>
    <text x="285" y="48" fill={C.soft} fontSize="18">input</text><line x1="330" y1="43" x2="600" y2="43" stroke={C.green}/><line x1="600" y1="43" x2="600" y2="95" stroke={C.green}/>
    {module(95,'self-attention',p1)}<line x1="600" y1="219" x2="600" y2="260" stroke={C.green} opacity={p2}/>{module(260,'feed-forward',p2)}
    <path d="M 850 95 L 910 95 L 910 400 L 850 400" fill="none" stroke={C.green} opacity={repeat}/><text x="940" y="250" fill={C.soft} fontSize="21" opacity={repeat} transform="rotate(90 940 250)">repeat · × N layers</text>
  </svg>;
}

export default function DirectorVisual({scene}:{scene:Scene}){if(scene.visual_grammar==='projection-split')return <ProjectionSplit scene={scene}/>;if(scene.visual_grammar==='attention-map')return <AttentionMap scene={scene}/>;if(scene.visual_grammar==='parallel-heads')return <ParallelHeads scene={scene}/>;if(scene.visual_grammar==='layer-stack')return <LayerStack scene={scene}/>;return null}
