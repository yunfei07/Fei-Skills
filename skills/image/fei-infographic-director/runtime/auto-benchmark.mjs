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
    id:'auto-knowledge-focus-e2e',
    input:{profile:'knowledge-explainer',title:'核心机制',goal:'聚焦最关键的一步并解释它为什么重要',sections:[
      {heading:'背景',purpose:'orient',content:['提供上下文']},
      {heading:'核心步骤',purpose:'explain',content:['这是重点机制']},
      {heading:'结果',purpose:'output',content:['由此产生效果']}
    ]},
    expect:{profile:'knowledge-explainer',grammar:'focus-reveal'}
  },
  {
    id:'auto-knowledge-relate-e2e',
    input:{profile:'knowledge-explainer',title:'三个要素的关系',goal:'解释 A、B、C 如何连接并相互依赖',sections:[
      {heading:'要素 A',purpose:'orient',content:['连接 B']},
      {heading:'要素 B',purpose:'explain',content:['依赖 C']},
      {heading:'要素 C',purpose:'explain',content:['与 A 交互']}
    ]},
    expect:{profile:'knowledge-explainer',grammar:'spatial-relations'}
  },
  {
    id:'auto-knowledge-layer-e2e',
    input:{profile:'knowledge-explainer',title:'价值逐层累积',goal:'解释能力如何逐层叠加并累积价值',sections:[
      {heading:'基础层',purpose:'orient',content:['第一层']},
      {heading:'能力层',purpose:'explain',content:['第二层叠加']},
      {heading:'复利层',purpose:'explain',content:['长期累积']}
    ]},
    expect:{profile:'knowledge-explainer',grammar:'layer-stack'}
  },
  {
    id:'url-elayadesign-ai-design-skills',
    input:{
      title:'AI Design Skills 入门指南',
      goal:'让第一次看到 elayadesign/ai-design-skills 的读者理解它是什么、包含哪些设计能力、如何安装，以及安装后如何开始使用。',
      audience:'第一次接触这个仓库的 AI coding tool 用户',
      aspect_ratio:'9:16',
      sections:[
        {heading:'它是什么？',purpose:'orient',content:['面向 AI coding tools 的设计 Skill 集合','每项 Skill 都是独立文件夹，可按需安装','适用于 Claude Code、Cursor、Codex、Windsurf 以及可读取 Markdown 规则的工具']},
        {heading:'目前包含两项核心能力',purpose:'explain',content:['landing-page-design：从需求采集、页面结构、转化文案到完整视觉系统','figma-designer：在 Figma 中使用变量、文本样式、Auto Layout、组件与状态建立真实设计系统']},
        {heading:'开始前准备',purpose:'act',content:['需要 Node.js','使用 skills CLI 安装']},
        {heading:'安装',purpose:'act',content:['运行官方安装命令','CLI 会列出仓库中的 Skills 并询问要安装哪一项、安装到哪些 Agent']},
        {heading:'第一次使用',purpose:'act',content:['安装后直接用自然语言提出 landing page 或 Figma 设计任务','也可以只安装 landing-page-design 或 figma-designer']},
        {heading:'它强调的设计方法',purpose:'explain',content:['Landing Page：one offer → one audience → one primary action','Figma：先检查已有变量与样式，再建立 Foundations；尽量绑定变量而不是硬编码','两项 Skill 都强调结构化规则、分阶段构建和完成前自检']},
        {heading:'边界',purpose:'boundary',content:['这些是供 AI coding/design agent 遵循的规则与工作流，不是一个独立可视化设计应用','具体设计结果仍取决于 Agent、工具能力、项目上下文和用户输入']}
      ],
      exact_strings:['npx skills add elayadesign/ai-design-skills','npx skills add elayadesign/ai-design-skills --skill landing-page-design','npx skills add elayadesign/ai-design-skills --skill figma-designer'],
      source_notes:['Source: elayadesign/ai-design-skills README.md, skills/landing-page-design/SKILL.md, skills/figma-designer/SKILL.md'],
      prohibited_strings:['小白','菜鸟']
    },
    expect:{profile:'beginner-onboarding',grammar:'onboarding-path'}
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
  results.push({id:tc.id,ok,profile:r.profile,verb:r.explanatory_verb,grammar:r.visual_grammar,confidence:r.plan?.confidence,warnings:r.plan?.warnings||[],bytes,image:out});
}
const report={status:failed?'failed':'passed',total:cases.length,passed:cases.length-failed,failed,results};
fs.writeFileSync(path.join(__dirname,'out','auto-benchmark-report.json'),JSON.stringify(report,null,2));
console.log(JSON.stringify(report,null,2));
if(failed) process.exit(1);
