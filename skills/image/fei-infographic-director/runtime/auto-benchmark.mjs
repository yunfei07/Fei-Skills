import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { autoRender } from './auto-render.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const outDir = path.join(__dirname,'out','auto');
fs.mkdirSync(outDir,{recursive:true});

const cases = [
  {
    id:'auto-onboarding-e2e',
    input:{title:'第一次使用工具',goal:'从安装到第一次运行',sections:[
      {heading:'开始前准备',purpose:'act',content:['安装 Node.js']},
      {heading:'安装',purpose:'act',content:['运行官方安装命令']},
      {heading:'第一次使用',purpose:'act',content:['创建项目并运行']},
      {heading:'结果',purpose:'output',content:['得到可运行项目']}
    ]},
    expect:{profile:'beginner-onboarding',grammar:'onboarding-path'}
  },
  {
    id:'auto-architecture-e2e',
    input:{title:'Agent 系统架构',goal:'解释 Router、Worker 与 Thread 的连接关系',sections:[
      {heading:'入口',purpose:'orient',content:['Client request']},
      {heading:'调度',purpose:'explain',content:['Router 分配任务']},
      {heading:'执行',purpose:'explain',content:['Worker 执行']},
      {heading:'状态',purpose:'explain',content:['Thread 保存上下文']},
      {heading:'边界',purpose:'boundary',content:['示意拓扑']}
    ]},
    expect:{profile:'technical-architecture',grammar:'node-edge-boundary'}
  },
  {
    id:'auto-data-e2e',
    input:{title:'三种方案对比',goal:'比较三种方案在同一测试环境下的完成时间',sections:[
      {heading:'主要指标',purpose:'evidence',content:['方案 A：12 分钟','方案 B：18 分钟','方案 C：25 分钟']},
      {heading:'测试范围',purpose:'boundary',content:['同一输入集','同一环境']},
      {heading:'结论',purpose:'explain',content:['只说明当前测试条件下的差异']}
    ]},
    expect:{profile:'data-comparison',grammar:'quantitative-comparison'}
  },
  {
    id:'auto-knowledge-branch-e2e',
    input:{profile:'knowledge-explainer',title:'如何选择路径',goal:'如果条件 A 成立走左侧，否则走右侧',sections:[
      {heading:'条件',purpose:'orient',content:['如果满足阈值']},
      {heading:'路径 A',purpose:'explain',content:['满足条件']},
      {heading:'路径 B',purpose:'explain',content:['否则选择']}
    ]},
    expect:{profile:'knowledge-explainer',grammar:'decision-tree'}
  },
  {
    id:'auto-knowledge-layer-e2e',
    input:{profile:'knowledge-explainer',title:'价值逐层累积',goal:'解释能力如何逐层叠加并累积价值',sections:[
      {heading:'基础层',purpose:'orient',content:['第一层']},
      {heading:'能力层',purpose:'explain',content:['第二层叠加']},
      {heading:'复利层',purpose:'explain',content:['长期累积']}
    ]},
    expect:{profile:'knowledge-explainer',grammar:'layer-stack'}
  }
];

const results=[];
let failed=0;
for (const tc of cases) {
  const out=path.join(outDir,`${tc.id}.png`);
  const r=await autoRender(tc.input,out);
  const bytes=fs.statSync(out).size;
  const ok=r.profile===tc.expect.profile && r.visual_grammar===tc.expect.grammar && bytes>10000;
  if(!ok) failed++;
  results.push({id:tc.id,ok,profile:r.profile,verb:r.explanatory_verb,grammar:r.visual_grammar,confidence:r.plan?.confidence,bytes,image:out});
}
const report={status:failed?'failed':'passed',total:cases.length,passed:cases.length-failed,failed,results};
fs.writeFileSync(path.join(__dirname,'out','auto-benchmark-report.json'),JSON.stringify(report,null,2));
console.log(JSON.stringify(report,null,2));
if(failed) process.exit(1);
