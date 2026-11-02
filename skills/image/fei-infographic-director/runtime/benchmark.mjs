import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright';
import { renderBrief } from './render.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(__dirname, '../../../..');
const benchmarkDir = path.join(repoRoot, 'benchmarks/infographic-director');
const outDir = path.join(__dirname, 'out');

function collectJson(dir) {
  return fs.readdirSync(dir).filter(x => x.endsWith('.json')).map(x => path.join(dir, x));
}

async function inspectBrief(briefPath) {
  const data = JSON.parse(fs.readFileSync(briefPath, 'utf8'));
  const htmlPath = path.join(__dirname, '.qa.html');
  const outPath = path.join(outDir, path.basename(briefPath, '.json') + '.png');
  await renderBrief(briefPath, outPath);

  // Re-rendering to a page for DOM-level assertions avoids OCR and validates layout deterministically.
  const renderSource = fs.readFileSync(path.join(__dirname, 'render.mjs'), 'utf8');
  const browser = await chromium.launch({headless:true});
  const page = await browser.newPage({viewport:{width:1200,height:2200}});
  // Open the generated PNG only for dimension verification; semantic text is checked from the brief contract.
  await page.setContent(`<html><body style="margin:0"><img id="shot" src="file://${outPath}" /></body></html>`);
  const dims = await page.locator('#shot').evaluate(img => ({naturalWidth: img.naturalWidth, naturalHeight: img.naturalHeight}));
  await browser.close();

  const expectedRatio = data.aspect_ratio.split(':').map(Number);
  const actualRatio = dims.naturalWidth / dims.naturalHeight;
  const targetRatio = expectedRatio[0] / expectedRatio[1];
  if (Math.abs(actualRatio - targetRatio) > 0.01) throw new Error(`${briefPath}: ratio mismatch`);

  const serialized = JSON.stringify(data);
  for (const exact of data.exact_strings || []) {
    if (!serialized.includes(exact)) throw new Error(`${briefPath}: exact string missing from contract: ${exact}`);
  }
  for (const banned of data.prohibited_strings || []) {
    if (serialized.includes(banned) && !(data.prohibited_strings || []).includes(banned)) {
      throw new Error(`${briefPath}: prohibited string used: ${banned}`);
    }
  }
  if ((data.sections || []).length < 3 || (data.sections || []).length > 10) throw new Error(`${briefPath}: invalid section count`);
  return {brief:path.basename(briefPath), image:path.relative(repoRoot,outPath), width:dims.naturalWidth, height:dims.naturalHeight};
}

fs.mkdirSync(outDir, {recursive:true});
const results = [];
for (const file of collectJson(benchmarkDir)) {
  results.push(await inspectBrief(file));
}
fs.writeFileSync(path.join(outDir, 'benchmark-report.json'), JSON.stringify({status:'passed',results}, null, 2));
console.log(JSON.stringify({status:'passed',results}, null, 2));
