import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { renderBrief } from './render.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(__dirname, '../../../..');
const benchmarkDir = path.join(repoRoot, 'benchmarks/infographic-director');
const outDir = path.join(__dirname, 'out');

function collectJson(dir) {
  return fs.readdirSync(dir).filter(x => x.endsWith('.json')).map(x => path.join(dir, x));
}

function readPngDimensions(file) {
  const buf = fs.readFileSync(file);
  const signature = '89504e470d0a1a0a';
  if (buf.subarray(0, 8).toString('hex') !== signature) throw new Error(`${file}: not a PNG`);
  return {width: buf.readUInt32BE(16), height: buf.readUInt32BE(20)};
}

function visibleText(data) {
  return [
    data.title,
    data.goal,
    data.audience,
    data.hero?.message,
    data.hero?.visual_subject,
    ...(data.sections || []).flatMap(s => [s.heading, ...(s.content || [])]),
    ...(data.exact_strings || []),
    ...(data.source_notes || []),
    data.qa?.three_second_read,
    data.qa?.ten_second_path,
    data.qa?.mobile_legibility,
    data.qa?.fact_check,
    data.qa?.tone_check
  ].filter(Boolean).join('\n');
}

async function inspectBrief(briefPath) {
  const data = JSON.parse(fs.readFileSync(briefPath, 'utf8'));
  const outPath = path.join(outDir, path.basename(briefPath, '.json') + '.png');
  await renderBrief(briefPath, outPath);

  const dims = readPngDimensions(outPath);
  const expectedRatio = data.aspect_ratio.split(':').map(Number);
  const actualRatio = dims.width / dims.height;
  const targetRatio = expectedRatio[0] / expectedRatio[1];
  if (Math.abs(actualRatio - targetRatio) > 0.01) throw new Error(`${briefPath}: ratio mismatch`);
  if (fs.statSync(outPath).size < 10_000) throw new Error(`${briefPath}: rendered PNG unexpectedly small`);

  const visible = visibleText(data);
  for (const exact of data.exact_strings || []) {
    if (!visible.includes(exact)) throw new Error(`${briefPath}: exact string missing from visible content: ${exact}`);
  }
  for (const banned of data.prohibited_strings || []) {
    if (visible.includes(banned)) throw new Error(`${briefPath}: prohibited string used in visible content: ${banned}`);
  }
  if ((data.sections || []).length < 3 || (data.sections || []).length > 10) throw new Error(`${briefPath}: invalid section count`);

  return {brief:path.basename(briefPath), image:path.relative(repoRoot,outPath), width:dims.width, height:dims.height, bytes:fs.statSync(outPath).size};
}

fs.mkdirSync(outDir, {recursive:true});
const results = [];
for (const file of collectJson(benchmarkDir)) {
  results.push(await inspectBrief(file));
}
fs.writeFileSync(path.join(outDir, 'benchmark-report.json'), JSON.stringify({status:'passed',results}, null, 2));
console.log(JSON.stringify({status:'passed',results}, null, 2));
