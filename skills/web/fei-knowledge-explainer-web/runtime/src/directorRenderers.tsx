import type {Scene} from './types';

export function ProjectionSplit({scene}:{scene:Scene}){
  const source=String(scene.data?.source??'representation'); const branches=(scene.data?.branches as {label:string;role?:string}[])||[{label:'Q'},{label:'K'},{label:'V'}]; const ops=(scene.data?.operations as string[])||[];
  return <div className="director projection-split" aria-label={scene.fallback}><div className="vg-source">{source}</div><div className="vg-branches">{branches.map(b=><div className="vg-branch" key={b.label}><strong>{b.label}</strong><small>{b.role}</small></div>)}</div><div className="vg-operation-chain">{ops.map((o,i)=><span key={o}>{o}{i<ops.length-1&&<i>→</i>}</span>)}</div></div>;
}
export function AttentionMap({scene}:{scene:Scene}){
  const tokens=(scene.data?.tokens as string[])||['我','正在','读','书']; const weights=(scene.data?.weights as number[])||[.08,.12,.62,.18]; const focus=Number(scene.data?.focus_index??1); const xs=tokens.map((_,i)=>100+i*(520/Math.max(1,tokens.length-1))); const fx=xs[focus]??360;
  return <svg className="director attention-map" viewBox="0 0 720 300" role="img" aria-label={scene.fallback}><text className="focus-label" x={fx} y="42" textAnchor="middle">当前 token · {tokens[focus]}</text>{tokens.map((t,i)=>{const w=weights[i]??0;return <g key={t}><path d={`M ${fx} 62 Q ${(fx+xs[i])/2} ${95-Math.abs(fx-xs[i])*.05} ${xs[i]} 190`} style={{strokeWidth:1+8*w,opacity:.22+.78*w}}/><text className="weight" x={xs[i]} y="166" textAnchor="middle">{w.toFixed(2)}</text><text className="token" x={xs[i]} y="222" textAnchor="middle">{t}</text></g>})}</svg>;
}
export function ParallelHeads({scene}:{scene:Scene}){
  const heads=(scene.data?.heads as string[])||['Head 1','Head 2','Head 3','Head 4']; return <div className="director parallel-heads" aria-label={scene.fallback}><div className="heads-source">shared input</div><div className="head-lanes">{heads.map(h=><div className="head-lane" key={h}><span>{h}</span><i/></div>)}</div><div className="heads-merge">concat → projection</div></div>;
}
export function LayerStack({scene}:{scene:Scene}){
  const steps=(scene.data?.steps as string[])||['self-attention','residual + norm','feed-forward','residual + norm']; const repeat=String(scene.data?.repeat??'× N layers'); return <div className="director layer-stack" aria-label={scene.fallback}><div className="stack-core">{steps.map((s,i)=><div key={s} className="stack-step"><span>{String(i+1).padStart(2,'0')}</span><strong>{s}</strong></div>)}</div><div className="stack-repeat">{repeat}</div></div>;
}
export default function DirectorRenderer({scene}:{scene:Scene}){
  if(scene.visual_grammar==='projection-split') return <ProjectionSplit scene={scene}/>;
  if(scene.visual_grammar==='attention-map') return <AttentionMap scene={scene}/>;
  if(scene.visual_grammar==='parallel-heads') return <ParallelHeads scene={scene}/>;
  if(scene.visual_grammar==='layer-stack') return <LayerStack scene={scene}/>;
  return null;
}
