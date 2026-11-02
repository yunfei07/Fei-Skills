import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

function esc(value='') {
  return String(value).replace(/[&<>"']/g, ch => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));
}
function parseRatio(ratio='9:16') {
  const [w,h] = ratio.split(':').map(Number); const width=1080;
  return (!w||!h)?{width,height:1920}:{width,height:Math.round(width*h/w)};
}
function titleMode(title='') { const n=[...String(title)].length; return n<=16?'title-short':n<=24?'title-medium':'title-long'; }
function inferGrammar(data) {
  if (data.visual_grammar) return {grammar:data.visual_grammar,fallback:false};
  const map={
    'beginner-onboarding':'onboarding-path',
    'technical-architecture':'node-edge-boundary',
    'process-guide':'connected-step-path',
    'data-comparison':'quantitative-comparison'
  };
  if (map[data.profile] && data.visual_data) return {grammar:map[data.profile],fallback:false};
  if (data.profile==='knowledge-explainer' && data.visual_data) {
    const m={transform:'before-after',branch:'decision-tree',accumulate:'layer-stack',focus:'focus-reveal',repeat:'cycle',relate:'spatial-relations',compare:'paired-comparison'};
    return {grammar:m[data.explanatory_verb]||'editorial-fallback',fallback:!m[data.explanatory_verb]};
  }
  return {grammar:'editorial-fallback',fallback:true};
}
function sectionNotes(data) {
  return (data.sections||[]).slice(0,6).map((s,i)=>`<div class="note"><span>${String(i+1).padStart(2,'0')}</span><div><b>${esc(s.heading)}</b><p>${esc((s.content||[]).join(' · '))}</p></div></div>`).join('');
}
function exactBlock(data) {
  if (!(data.exact_strings||[]).length) return '';
  return `<div class="exact"><div class="cap">EXACT</div>${data.exact_strings.map(x=>`<code>${esc(x)}</code>`).join('')}</div>`;
}
function onboarding(data) {
  const steps=data.visual_data?.steps||[];
  const setup=steps.filter(s=>s.kind==='setup');
  const actions=steps.filter(s=>s.kind!=='setup');
  return `<div class="onboard">
    <div class="product-object"><div class="terminal-bar"></div><div class="product-title">${esc(data.hero.message)}</div><div class="product-sub">${esc(data.hero.visual_subject)}</div></div>
    <div class="setup-strip">${setup.map((s,i)=>`<div class="setup-item"><i>${i+1}</i><b>${esc(s.label)}</b><span>${esc(s.detail||'')}</span></div>`).join('')}</div>
    <div class="path">${actions.map((s,i)=>`<div class="path-step ${s.kind||'action'}"><div class="num">${i+1}</div><b>${esc(s.label)}</b><span>${esc(s.detail||'')}</span></div>${i<actions.length-1?'<div class="arrow">↓</div>':''}`).join('')}</div>
  </div>`;
}
function architecture(data) {
  const nodes=data.visual_data?.nodes||[];
  const edges=data.visual_data?.edges||[];
  const core=nodes.filter(n=>!n.external), ext=nodes.filter(n=>n.external);
  return `<div class="arch">
    <div class="external-row">${ext.map(n=>`<div class="node external">${esc(n.label)}</div>`).join('<div class="edge">↓</div>')}</div>
    <div class="boundary"><div class="boundary-label">SYSTEM BOUNDARY</div><div class="node-row">${core.map((n,i)=>`<div class="node"><small>${esc(n.lane||'CORE')}</small>${esc(n.label)}</div>${i<core.length-1?`<div class="edge"><span>→</span><em>${esc(edges.find(e=>e.from===n.id)?.label||'')}</em></div>`:''}`).join('')}</div></div>
    <div class="edge-list">${edges.map(e=>`<span>${esc(e.from)} → ${esc(e.to)}${e.label?` · ${esc(e.label)}`:''}</span>`).join('')}</div>
  </div>`;
}
function processGuide(data) {
  const steps=data.visual_data?.steps||[];
  return `<div class="process">${steps.map((s,i)=>`<div class="process-row ${s.kind||'action'}"><div class="process-num">${String(i+1).padStart(2,'0')}</div><div class="process-card"><b>${esc(s.label)}</b><span>${esc(s.detail||'')}</span></div><div class="process-mark">${s.kind==='check'?'✓':s.kind==='decision'?'◇':s.kind==='result'?'◎':'→'}</div></div>${i<steps.length-1?'<div class="process-line"></div>':''}`).join('')}</div>`;
}
function dataComparison(data) {
  const metrics=data.visual_data?.metrics||[];
  const max=Math.max(...metrics.map(m=>Math.abs(Number(m.value)||0)),1);
  const primary=metrics.find(m=>m.role==='primary')||metrics[0];
  return `<div class="data-viz">
    ${primary?`<div class="big-number"><span>${esc(primary.label)}</span><strong>${esc(primary.display||primary.value)}</strong><em>${esc(primary.unit||'')}</em></div>`:''}
    <div class="bars">${metrics.map(m=>`<div class="bar-row"><div class="bar-label">${esc(m.label)}</div><div class="bar-track"><div class="bar-fill ${m.role||''}" style="width:${Math.max(5,Math.abs(Number(m.value)||0)/max*100)}%"></div></div><div class="bar-value">${esc(m.display||m.value)} ${esc(m.unit||'')}</div></div>`).join('')}</div>
  </div>`;
}
function knowledge(data, grammar) {
  const stages=data.visual_data?.stages||[];
  if (grammar==='cycle') return `<div class="cycle">${stages.map((s,i)=>`<div class="cycle-item"><i>${i+1}</i><b>${esc(s.label)}</b><span>${esc(s.detail||'')}</span></div>`).join('')}<div class="cycle-loop">↻</div></div>`;
  if (grammar==='layer-stack') return `<div class="layers">${stages.map((s,i)=>`<div class="layer" style="width:${70+i*6}%"><b>${esc(s.label)}</b><span>${esc(s.detail||'')}</span></div>`).join('')}</div>`;
  if (grammar==='before-after'||grammar==='paired-comparison') return `<div class="paired">${stages.slice(0,2).map((s,i)=>`<div class="pair"><small>${i===0?'BEFORE / A':'AFTER / B'}</small><b>${esc(s.label)}</b><span>${esc(s.detail||'')}</span></div>`).join('<div class="pair-arrow">→</div>')}</div>`;
  return `<div class="knowledge-path">${stages.map((s,i)=>`<div class="knowledge-item"><i>${i+1}</i><b>${esc(s.label)}</b><span>${esc(s.detail||'')}</span></div>`).join('<div class="k-arrow">→</div>')}</div>`;
}
function editorial(data) { return `<div class="notes-grid">${sectionNotes(data)}</div>`; }
function mainVisual(data, grammar) {
  if (grammar==='onboarding-path') return onboarding(data);
  if (grammar==='node-edge-boundary') return architecture(data);
  if (grammar==='connected-step-path') return processGuide(data);
  if (grammar==='quantitative-comparison') return dataComparison(data);
  if (data.profile==='knowledge-explainer') return knowledge(data,grammar);
  return editorial(data);
}
function renderHTML(data) {
  const {width,height}=parseRatio(data.aspect_ratio);
  const {grammar,fallback}=inferGrammar(data);
  const source=(data.source_notes||[]).join(' · ')||data.qa?.fact_check||'';
  const hasExact=(data.exact_strings||[]).length>0;
  return `<!doctype html><html lang="zh-CN"><head><meta charset="utf-8"><style>
*{box-sizing:border-box}html,body{margin:0;background:#ece8dc;font-family:ui-sans-serif,-apple-system,BlinkMacSystemFont,"Segoe UI","PingFang SC","Microsoft YaHei",sans-serif;color:#1d241f}body{padding:24px;display:flex;justify-content:center}.poster{width:${width}px;height:${height}px;background:#f5f0e4;position:relative;overflow:hidden;padding:58px 68px 50px;display:grid;grid-template-areas:"header" "exact" "stage" "footer";grid-template-rows:auto auto minmax(0,1fr) auto;gap:22px;border:1px solid #d7d0be}.poster.no-exact{grid-template-areas:"header" "stage" "footer";grid-template-rows:auto minmax(0,1fr) auto}.paper{position:absolute;inset:0;opacity:.22;background-image:radial-gradient(#6f7f70 .6px,transparent .6px),linear-gradient(120deg,rgba(111,133,112,.06),transparent 38%,rgba(180,156,98,.05));background-size:8px 8px,100% 100%;pointer-events:none}.header{grid-area:header;position:relative;display:grid;grid-template-columns:1fr 290px;gap:28px;padding-bottom:22px;border-bottom:1px solid #bbb5a4}.eyebrow{font-size:18px;letter-spacing:.12em;color:#6c796e;text-transform:uppercase;margin-bottom:10px}h1{font-family:ui-serif,Georgia,"Songti SC",serif;line-height:1.03;margin:0 0 12px;letter-spacing:-.025em}.title-short{font-size:56px;white-space:nowrap}.title-medium{font-size:51px}.title-long{font-size:45px}.goal{font-size:23px;line-height:1.42;color:#465249}.hero-chip{background:#dfe7d9;border:1px solid #aab7a8;border-radius:24px;padding:22px;display:flex;flex-direction:column;justify-content:center;gap:9px}.hero-chip small{letter-spacing:.13em;color:#6d7b6f}.hero-chip b{font-size:23px;line-height:1.3}.hero-chip span{font-size:16px;line-height:1.4;color:#59665b}.exact{grid-area:exact;position:relative;border:1px solid #d1bd78;background:#efe2b9;border-radius:16px;padding:16px 20px;display:flex;gap:18px;align-items:center;flex-wrap:wrap}.cap{font-size:15px;font-weight:800;letter-spacing:.13em;color:#766329}code{font:18px/1.35 ui-monospace,SFMono-Regular,Menlo,Consolas,monospace;overflow-wrap:anywhere}.visual-stage{grid-area:stage;position:relative;min-height:0;display:grid;grid-template-columns:minmax(0,1fr) 270px;gap:28px}.visual-main{min-height:0;display:flex;align-items:stretch}.support{border-left:1px solid #cbc5b4;padding-left:22px;display:flex;flex-direction:column;gap:14px;overflow:hidden}.note{display:grid;grid-template-columns:28px 1fr;gap:10px;padding-top:11px;border-top:1px solid #b9b6a8}.note>span{font:13px ui-monospace;color:#829083}.note b{font:700 18px ui-serif,Georgia,"Songti SC",serif}.note p{margin:5px 0 0;font-size:14px;line-height:1.38;color:#59645b}.footer{grid-area:footer;position:relative;border-top:1px solid #bbb5a4;padding-top:14px;display:flex;align-items:flex-start;justify-content:space-between;gap:20px;font-size:14px;color:#6b736c}.badge{font:13px ui-monospace;background:#e5eadf;border:1px solid #c2ccb9;border-radius:999px;padding:7px 11px;white-space:nowrap}
.onboard{width:100%;height:100%;display:grid;grid-template-rows:190px auto 1fr;gap:18px}.product-object{border:2px solid #758777;border-radius:24px;background:#e3eadf;padding:24px;position:relative}.terminal-bar{height:12px;width:72px;border-radius:99px;background:repeating-linear-gradient(90deg,#7f917f 0 12px,transparent 12px 20px);margin-bottom:24px}.product-title{font:700 29px ui-serif,Georgia,"Songti SC",serif}.product-sub{font-size:17px;color:#5a665c;margin-top:9px}.setup-strip{display:flex;gap:12px}.setup-item{flex:1;border-top:3px solid #8da08c;padding:12px;background:#f0ede3}.setup-item i{font-style:normal;font:13px ui-monospace;color:#7d8a7e}.setup-item b,.setup-item span{display:block}.setup-item b{font-size:17px;margin:4px 0}.setup-item span{font-size:13px;color:#687169}.path{display:flex;flex-direction:column;justify-content:center}.path-step{border:1px solid #aab5a7;border-radius:18px;padding:14px 18px;display:grid;grid-template-columns:42px 1fr;gap:2px 12px;background:#faf6ec}.path-step .num{grid-row:1/3;width:34px;height:34px;border-radius:50%;background:#dfe8da;display:grid;place-items:center;font-weight:800}.path-step b{font-size:19px}.path-step span{font-size:14px;color:#687269}.path-step.result{background:#e6eadb}.arrow{text-align:center;font-size:24px;color:#809080;height:30px}
.arch{width:100%;height:100%;display:flex;flex-direction:column;justify-content:space-evenly;gap:24px}.external-row{display:flex;justify-content:center;align-items:center;gap:16px}.boundary{border:2px solid #819184;border-radius:30px;padding:44px 24px 34px;min-height:360px;position:relative;background:rgba(225,233,222,.46);display:flex;align-items:center}.boundary-label{position:absolute;top:-12px;left:24px;background:#f5f0e4;padding:3px 10px;font:13px ui-monospace;color:#69786b}.node-row{display:flex;align-items:center;justify-content:space-between;gap:12px;width:100%}.node{min-width:112px;max-width:150px;border:1.5px solid #7c8f7e;border-radius:18px;background:#faf7ed;padding:18px 12px;text-align:center;font-weight:750;font-size:18px}.node small{display:block;font:11px ui-monospace;color:#7b887c;margin-bottom:7px}.node.external{border-style:dashed;background:#eee9dc}.edge{display:flex;flex-direction:column;align-items:center;min-width:48px;color:#7e8e80}.edge span{font-size:30px}.edge em{font:11px ui-monospace;text-align:center}.edge-list{display:flex;gap:8px;flex-wrap:wrap;justify-content:center}.edge-list span{font:12px ui-monospace;background:#e9ede4;padding:6px 9px;border-radius:999px}
.process{width:100%;height:100%;display:flex;flex-direction:column;justify-content:space-evenly}.process-row{display:grid;grid-template-columns:58px 1fr 46px;align-items:center;gap:14px}.process-num{font:700 20px ui-monospace;color:#738173}.process-card{border:1px solid #aab5a7;border-radius:18px;padding:14px 18px;background:#fbf7ed}.process-card b,.process-card span{display:block}.process-card b{font-size:19px}.process-card span{font-size:14px;color:#667067;margin-top:4px}.process-mark{width:38px;height:38px;border-radius:50%;display:grid;place-items:center;background:#dfe7d9;font-size:22px}.process-row.check .process-mark{background:#efe2b9}.process-row.decision .process-mark{border:2px solid #9b8775;background:transparent}.process-line{height:24px;border-left:2px solid #9aaa9a;margin-left:28px}
.data-viz{width:100%;height:100%;display:grid;grid-template-rows:230px 1fr;gap:34px}.big-number{background:#e1e8dc;border-radius:26px;padding:32px 34px;display:grid;grid-template-columns:1fr auto;align-items:end}.big-number span{font-size:17px;color:#5d695f}.big-number strong{font:800 64px ui-serif,Georgia,"Songti SC",serif}.big-number em{grid-column:2;font-style:normal;font-size:14px;color:#6b756c}.bars{display:flex;flex-direction:column;justify-content:space-evenly;gap:18px}.bar-row{display:grid;grid-template-columns:150px 1fr 150px;gap:14px;align-items:center}.bar-label{font-weight:700;font-size:16px}.bar-track{height:32px;background:#e6e2d6;border-radius:999px;overflow:hidden}.bar-fill{height:100%;background:#90a28e;border-radius:999px}.bar-fill.primary{background:#c5a95b}.bar-value{text-align:right;font:15px ui-monospace;color:#4f5b52}
.knowledge-path,.paired,.cycle,.layers{width:100%;height:100%;display:flex;align-items:center;justify-content:center;gap:20px}.knowledge-item,.pair,.cycle-item{flex:1;border:1px solid #9eac9e;border-radius:22px;padding:20px;background:#f8f4ea;text-align:center}.knowledge-item i,.cycle-item i{font:13px ui-monospace;color:#7a877c}.knowledge-item b,.knowledge-item span,.pair b,.pair span,.cycle-item b,.cycle-item span{display:block}.knowledge-item b,.pair b,.cycle-item b{font:700 20px ui-serif,Georgia,"Songti SC",serif;margin:7px 0}.knowledge-item span,.pair span,.cycle-item span{font-size:14px;color:#657067}.k-arrow,.pair-arrow{font-size:28px;color:#839183}.pair small{font:12px ui-monospace;color:#7b887c}.cycle{position:relative;flex-wrap:wrap}.cycle-item{max-width:42%}.cycle-loop{position:absolute;font-size:84px;color:rgba(121,143,123,.2)}.layers{flex-direction:column-reverse;justify-content:space-evenly}.layer{border:1px solid #8fa08f;background:#e4eadd;padding:22px 24px;text-align:center;border-radius:14px}.layer b,.layer span{display:block}.layer b{font-size:19px}.layer span{font-size:14px;color:#657067;margin-top:5px}.notes-grid{display:grid;grid-template-columns:1fr 1fr;gap:18px;width:100%}
</style></head><body><main class="poster ${hasExact?'has-exact':'no-exact'}" id="poster"><div class="paper"></div><header class="header"><div><div class="eyebrow">Fei Infographic Director · ${esc(grammar)}</div><h1 class="${titleMode(data.title)}">${esc(data.title)}</h1><div class="goal">${esc(data.goal)}</div></div><div class="hero-chip"><small>${esc(data.explanatory_verb||'EXPLAIN')}</small><b>${esc(data.hero.message)}</b><span>${esc(data.hero.visual_subject)}</span></div></header>${exactBlock(data)}<div class="visual-stage"><div class="visual-main">${mainVisual(data,grammar)}</div><aside class="support">${sectionNotes(data)}</aside></div><footer class="footer"><div>${esc(source)}</div><div class="badge">${esc(data.profile)} · ${fallback?'fallback':'semantic'} · ${esc(data.aspect_ratio)}</div></footer></main></body></html>`;
}

export async function renderBrief(inputPath,outPath) {
  const data=JSON.parse(fs.readFileSync(inputPath,'utf8'));
  const {width,height}=parseRatio(data.aspect_ratio);
  const inferred=inferGrammar(data);
  const tmp=path.join(__dirname,'.render.html');
  fs.writeFileSync(tmp,renderHTML(data),'utf8');
  fs.mkdirSync(path.dirname(outPath),{recursive:true});
  const browser=await chromium.launch({headless:true});
  const page=await browser.newPage({viewport:{width:width+48,height:height+48},deviceScaleFactor:1});
  await page.goto(`file://${tmp}`);
  await page.locator('#poster').screenshot({path:outPath});
  await browser.close(); fs.unlinkSync(tmp);
  return {outPath,width,height,grammar:inferred.grammar,fallback_used:inferred.fallback};
}

if (process.argv[1]===fileURLToPath(import.meta.url)) {
  const input=process.argv[2],out=process.argv[3]||path.resolve('out/infographic.png');
  if(!input){console.error('usage: node render.mjs <render-brief.json> [out.png]');process.exit(2)}
  renderBrief(path.resolve(input),path.resolve(out)).then(r=>console.log(JSON.stringify(r))).catch(e=>{console.error(e);process.exit(1)});
}
