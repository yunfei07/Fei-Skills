import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

function esc(value='') {
  return String(value).replace(/[&<>"']/g, (ch) => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));
}

function parseRatio(ratio='9:16') {
  const [w, h] = ratio.split(':').map(Number);
  if (!w || !h) return { width: 1080, height: 1920 };
  const width = 1080;
  return { width, height: Math.round(width * h / w) };
}

function sectionIcon(purpose) {
  return ({orient:'○', explain:'◎', act:'→', evidence:'▥', output:'□', boundary:'△', 'next-step':'↗'})[purpose] || '•';
}

function renderHTML(data) {
  const { width, height } = parseRatio(data.aspect_ratio);
  const sections = data.sections.map((s, i) => `
    <section class="section ${s.purpose}">
      <div class="section-kicker">${sectionIcon(s.purpose)} ${String(i+1).padStart(2,'0')}</div>
      <h2>${esc(s.heading)}</h2>
      <div class="section-body">
        ${s.content.map(item => `<div class="row"><span class="dot"></span><span>${esc(item)}</span></div>`).join('')}
      </div>
    </section>`).join('');

  const exact = (data.exact_strings || []).length ? `
    <div class="exact-wrap">
      <div class="exact-label">EXACT</div>
      ${(data.exact_strings || []).map(x => `<code>${esc(x)}</code>`).join('')}
    </div>` : '';

  const source = (data.source_notes || []).length ? `
    <div class="source-note">${data.source_notes.map(esc).join(' · ')}</div>` : '';

  return `<!doctype html>
<html lang="zh-CN"><head><meta charset="utf-8"/>
<style>
  *{box-sizing:border-box}html,body{margin:0;background:#ece8dc;font-family:ui-sans-serif,-apple-system,BlinkMacSystemFont,"Segoe UI","PingFang SC","Hiragino Sans GB","Microsoft YaHei",sans-serif;color:#1d241f}
  body{display:flex;justify-content:center;padding:24px}
  .poster{width:${width}px;height:${height}px;overflow:hidden;position:relative;background:#f5f0e4;padding:70px 72px 58px;display:grid;grid-template-rows:auto auto 1fr auto;gap:28px;border:1px solid #d7d0be}
  .paper{position:absolute;inset:0;opacity:.26;background-image:radial-gradient(#6f7f70 0.6px,transparent 0.6px),linear-gradient(110deg,rgba(123,139,119,.07),transparent 28%,rgba(177,161,118,.05) 65%,transparent);background-size:8px 8px,100% 100%;pointer-events:none}
  .mountain{position:absolute;right:-70px;top:4px;width:420px;height:170px;opacity:.23;background:linear-gradient(150deg,transparent 35%,#789080 36% 38%,transparent 39%),linear-gradient(210deg,transparent 42%,#98a894 43% 45%,transparent 46%);filter:blur(.3px)}
  .header{position:relative;display:grid;grid-template-columns:1fr 350px;gap:30px;align-items:end;border-bottom:1px solid #b8b39e;padding-bottom:26px}
  .eyebrow{font-size:23px;letter-spacing:.12em;text-transform:uppercase;color:#69766b;margin-bottom:14px}
  h1{font-family:ui-serif,Georgia,"Songti SC","STSong",serif;font-size:66px;line-height:1.03;margin:0 0 16px;font-weight:650;letter-spacing:-.02em}
  .goal{font-size:27px;line-height:1.45;color:#465249;max-width:700px}
  .hero{background:#dfe7d9;border:1px solid #aab7a8;border-radius:28px;padding:28px 30px;min-height:184px;display:flex;flex-direction:column;justify-content:space-between}
  .hero-label{font-size:18px;letter-spacing:.14em;color:#6c7a6d}.hero-message{font-size:28px;line-height:1.35;font-weight:700}.hero-sub{font-size:18px;line-height:1.45;color:#556157}
  .exact-wrap{position:relative;background:#efe2b9;border:1px solid #d1bd78;border-radius:18px;padding:20px 24px;display:grid;grid-template-columns:90px 1fr;gap:18px;align-items:start}
  .exact-label{font-size:18px;font-weight:800;color:#705f2c;letter-spacing:.12em;padding-top:5px}
  code{font-family:ui-monospace,SFMono-Regular,Menlo,Consolas,monospace;font-size:22px;line-height:1.4;word-break:break-word;color:#2f352f}
  .grid{position:relative;display:grid;grid-template-columns:1fr 1fr;gap:20px;align-content:start}
  .section{border-top:2px solid #879582;padding:22px 20px 18px 0;min-height:180px;position:relative}
  .section:nth-child(odd){padding-right:34px}.section:nth-child(even){padding-left:34px;border-left:1px solid #c9c4b2}
  .section-kicker{font-size:16px;color:#7a877c;letter-spacing:.12em;margin-bottom:8px}
  h2{font-family:ui-serif,Georgia,"Songti SC","STSong",serif;font-size:31px;margin:0 0 13px;line-height:1.2;font-weight:700}
  .section-body{display:grid;gap:9px}.row{display:grid;grid-template-columns:16px 1fr;gap:10px;align-items:start;font-size:21px;line-height:1.42;color:#334038}.dot{width:7px;height:7px;border-radius:50%;background:#7f927d;margin-top:11px}
  .act{border-top-color:#ba9e54}.boundary{border-top-color:#9b887f}.evidence{border-top-color:#77908d}.output{border-top-color:#7f9a7b}
  .footer{position:relative;display:grid;grid-template-columns:1fr auto;gap:20px;align-items:end;border-top:1px solid #b8b39e;padding-top:18px;font-size:16px;color:#697168}
  .profile{font-family:ui-monospace,monospace;background:#e5eadf;border:1px solid #c2ccb9;border-radius:999px;padding:8px 13px;color:#516053}
  .source-note{max-width:760px;line-height:1.45}
</style></head>
<body><main class="poster" id="poster"><div class="paper"></div><div class="mountain"></div>
  <header class="header">
    <div><div class="eyebrow">Fei Infographic Director · ${esc(data.profile)}</div><h1>${esc(data.title)}</h1><div class="goal">${esc(data.goal)}</div></div>
    <div class="hero"><div class="hero-label">HERO</div><div class="hero-message">${esc(data.hero.message)}</div><div class="hero-sub">${esc(data.hero.visual_subject)}</div></div>
  </header>
  ${exact}
  <div class="grid">${sections}</div>
  <footer class="footer"><div class="source-note">${source || esc(data.qa?.fact_check || '')}</div><div class="profile">${esc(data.aspect_ratio)} · ${esc(data.visual?.style_profile || '')}</div></footer>
</main></body></html>`;
}

export async function renderBrief(inputPath, outPath) {
  const data = JSON.parse(fs.readFileSync(inputPath, 'utf8'));
  const { width, height } = parseRatio(data.aspect_ratio);
  const html = renderHTML(data);
  const tmp = path.join(__dirname, '.render.html');
  fs.writeFileSync(tmp, html, 'utf8');
  fs.mkdirSync(path.dirname(outPath), {recursive:true});
  const browser = await chromium.launch({headless:true});
  const page = await browser.newPage({viewport:{width:width+48,height:height+48}, deviceScaleFactor:1});
  await page.goto(`file://${tmp}`);
  await page.locator('#poster').screenshot({path:outPath});
  await browser.close();
  fs.unlinkSync(tmp);
  return {outPath,width,height};
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const input = process.argv[2];
  const out = process.argv[3] || path.resolve('out/infographic.png');
  if (!input) {
    console.error('usage: node render.mjs <render-brief.json> [out.png]');
    process.exit(2);
  }
  renderBrief(path.resolve(input), path.resolve(out)).then(r => console.log(JSON.stringify(r))).catch(err => {console.error(err);process.exit(1)});
}
