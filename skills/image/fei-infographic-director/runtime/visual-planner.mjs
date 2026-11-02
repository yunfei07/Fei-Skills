const PROFILE_GRAMMAR = {
  'beginner-onboarding': 'onboarding-path',
  'technical-architecture': 'node-edge-boundary',
  'process-guide': 'connected-step-path',
  'data-comparison': 'quantitative-comparison'
};

const VERB_GRAMMAR = {
  compare: 'paired-comparison',
  transform: 'before-after',
  branch: 'decision-tree',
  repeat: 'cycle',
  accumulate: 'layer-stack',
  focus: 'focus-reveal',
  relate: 'spatial-relations'
};

const rx = {
  onboarding: /(安装|开始前|准备|第一次|快速开始|入门|setup|install|getting started|first use|prerequisite)/i,
  architecture: /(架构|系统|组件|节点|接口|客户端|服务端|router|worker|client|server|host|protocol|architecture|component)/i,
  process: /(步骤|流程|先|然后|最后|检查|提交|运行|打开|创建|process|workflow|step|then|finally|check|run|create)/i,
  compare: /(对比|比较|同比|较|versus|\bvs\b|compare|difference|delta|增长|下降)/i,
  transform: /(从.+到|之前|之后|before|after|变成|转化|transform|convert)/i,
  branch: /(如果|否则|选择|分支|条件|if|else|decision|option|choose)/i,
  repeat: /(循环|周期|重复|反复|loop|cycle|repeat|iterate)/i,
  accumulate: /(累积|叠加|层级|逐层|增长|stack|layer|accumulate|compound)/i,
  focus: /(核心|重点|关键|聚焦|focus|zoom|key point|highlight)/i,
  relate: /(关系|连接|依赖|交互|连接到|relate|connect|dependency|interaction)/i
};

function textOf(data) {
  return [data.title, data.goal, data.audience, data.hero?.message, data.hero?.visual_subject,
    ...(data.sections || []).flatMap(s => [s.heading, ...(s.content || [])])]
    .filter(Boolean).join('\n');
}

function numericTokens(data) {
  const text = textOf(data);
  return [...text.matchAll(/(?<![A-Za-z])[-+]?\d[\d,]*(?:\.\d+)?%?/g)].map(m => m[0]);
}

function scoreProfile(data) {
  const text = textOf(data);
  const nums = numericTokens(data);
  const scores = {
    'beginner-onboarding': rx.onboarding.test(text) ? 5 : 0,
    'technical-architecture': rx.architecture.test(text) ? 5 : 0,
    'process-guide': rx.process.test(text) ? 4 : 0,
    'data-comparison': (rx.compare.test(text) ? 5 : 0) + (nums.length >= 2 ? 4 : 0),
    'knowledge-explainer': 1
  };
  const purposes = (data.sections || []).map(s => s.purpose);
  if (purposes.filter(x => x === 'act').length >= 2) scores['process-guide'] += 2;
  if (purposes.filter(x => x === 'evidence').length >= 2) scores['data-comparison'] += 2;
  if (purposes.includes('boundary') && rx.architecture.test(text)) scores['technical-architecture'] += 1;
  if (rx.onboarding.test(data.title || '') || rx.onboarding.test(data.goal || '')) scores['beginner-onboarding'] += 3;
  return scores;
}

function inferProfile(data) {
  if (data.profile) return { value: data.profile, explicit: true, scores: null };
  const scores = scoreProfile(data);
  const ranked = Object.entries(scores).sort((a,b) => b[1]-a[1]);
  return { value: ranked[0][0], explicit: false, scores, margin: ranked[0][1]-ranked[1][1] };
}

function inferVerb(data, profile) {
  if (data.explanatory_verb) return { value: data.explanatory_verb, explicit: true };
  if (profile === 'data-comparison') return { value: 'compare', explicit: false };
  if (profile === 'technical-architecture') return { value: 'relate', explicit: false };
  if (profile === 'process-guide' || profile === 'beginner-onboarding') return { value: 'transform', explicit: false };
  const text = textOf(data);
  const order = ['branch','repeat','accumulate','compare','transform','focus','relate'];
  const hit = order.find(v => rx[v].test(text));
  return { value: hit || 'focus', explicit: false };
}

function extractMetrics(data) {
  const out = [];
  for (const section of data.sections || []) {
    for (const line of section.content || []) {
      const m = String(line).match(/^(.{1,40}?)[：:]\s*([-+]?\d[\d,]*(?:\.\d+)?%?)(?:\s*([^，。;；]+))?$/);
      if (!m) continue;
      const raw = m[2];
      const value = Number(raw.replace(/,/g,'').replace('%',''));
      if (!Number.isFinite(value)) continue;
      out.push({ label: m[1].trim(), value, display: raw, unit: m[3]?.trim() || (raw.includes('%') ? '%' : '') });
    }
  }
  if (out.length) out[0].role = 'primary';
  return out.slice(0, 8);
}

function extractSteps(data, onboarding=false) {
  return (data.sections || []).filter(s => ['act','explain','output','orient'].includes(s.purpose)).slice(0,7).map((s,i) => ({
    id: `s${i+1}`,
    label: s.heading,
    detail: (s.content || []).slice(0,2).join(' · '),
    kind: onboarding && /(准备|开始前|require|prereq|setup)/i.test(s.heading) ? 'setup' : s.purpose === 'output' ? 'result' : 'action'
  }));
}

function extractArchitecture(data) {
  const text = textOf(data);
  const candidates = [...new Set((text.match(/\b[A-Z][A-Za-z0-9_-]{2,}\b/g) || []).filter(x => !['EXACT','HERO'].includes(x)))].slice(0,6);
  const fallback = (data.sections || []).filter(s => ['orient','explain'].includes(s.purpose)).slice(0,5).map(s => s.heading);
  const labels = candidates.length >= 3 ? candidates : fallback;
  const nodes = labels.map((label,i) => ({ id:`n${i+1}`, label, lane:i===0?'ENTRY':i===labels.length-1?'OUTPUT':'CORE', external:i===0 }));
  const edges = nodes.slice(0,-1).map((n,i) => ({ from:n.id, to:nodes[i+1].id, label:'flow' }));
  return { nodes, edges };
}

function extractStages(data) {
  return (data.sections || []).filter(s => s.purpose !== 'boundary').slice(0,6).map((s,i) => ({ id:`stage${i+1}`, label:s.heading, detail:(s.content||[]).slice(0,2).join(' · ') }));
}

function buildVisualData(data, profile) {
  if (data.visual_data) return { value:data.visual_data, explicit:true };
  if (profile === 'data-comparison') return { value:{ metrics:extractMetrics(data) }, explicit:false };
  if (profile === 'technical-architecture') return { value:extractArchitecture(data), explicit:false };
  if (profile === 'beginner-onboarding') return { value:{ steps:extractSteps(data,true) }, explicit:false };
  if (profile === 'process-guide') return { value:{ steps:extractSteps(data,false) }, explicit:false };
  return { value:{ stages:extractStages(data) }, explicit:false };
}

function confidenceFor(profileInfo, verbInfo, visualData, data) {
  let score = 0.62;
  if (profileInfo.explicit) score += 0.12;
  else if ((profileInfo.margin || 0) >= 3) score += 0.10;
  if (verbInfo.explicit) score += 0.08;
  const vd = visualData.value || {};
  const count = (vd.metrics||vd.steps||vd.nodes||vd.stages||[]).length;
  if (count >= 3) score += 0.10;
  if (data.sections?.length >= 4) score += 0.05;
  return Math.min(0.97, Math.round(score*100)/100);
}

export function planVisual(input) {
  const data = structuredClone(input);
  const profileInfo = inferProfile(data);
  const verbInfo = inferVerb(data, profileInfo.value);
  const visualData = buildVisualData(data, profileInfo.value);
  const grammar = data.visual_grammar || PROFILE_GRAMMAR[profileInfo.value] || VERB_GRAMMAR[verbInfo.value] || 'editorial-fallback';
  const confidence = confidenceFor(profileInfo, verbInfo, visualData, data);
  const warnings = [];
  if (grammar === 'quantitative-comparison' && !(visualData.value.metrics || []).length) warnings.push('No parseable quantitative metrics; add structured metrics before final render.');
  if (grammar === 'node-edge-boundary' && (visualData.value.nodes || []).length < 3) warnings.push('Architecture inference found fewer than 3 nodes; verify topology manually.');
  if (confidence < 0.72) warnings.push('Low-confidence visual plan; review before rendering.');

  return {
    ...data,
    profile: profileInfo.value,
    explanatory_verb: verbInfo.value,
    visual_grammar: grammar,
    visual_data: visualData.value,
    visual_plan: {
      mode: 'auto',
      confidence,
      rationale: `profile=${profileInfo.value}; verb=${verbInfo.value}; grammar=${grammar}`,
      warnings
    }
  };
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const fs = await import('node:fs');
  const input = process.argv[2];
  const output = process.argv[3];
  if (!input) { console.error('usage: node visual-planner.mjs <input.json> [output.json]'); process.exit(2); }
  const data = JSON.parse(fs.readFileSync(input,'utf8'));
  const planned = planVisual(data);
  const text = JSON.stringify(planned,null,2);
  if (output) fs.writeFileSync(output,text); else console.log(text);
}
