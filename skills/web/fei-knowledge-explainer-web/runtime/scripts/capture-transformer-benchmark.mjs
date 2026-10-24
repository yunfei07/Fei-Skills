import { chromium } from 'playwright';
import { mkdir } from 'node:fs/promises';

await mkdir('out', {recursive:true});
const browser = await chromium.launch({headless:true});
const page = await browser.newPage({viewport:{width:1440,height:1000},deviceScaleFactor:1});
await page.goto('http://127.0.0.1:4173/?benchmark=transformer', {waitUntil:'networkidle'});

async function capture(name) {
  await page.screenshot({path:`out/transformer-web-${name}.png`,fullPage:true});
}
async function next(count=1) {
  for (let i=0;i<count;i++) await page.getByRole('button',{name:/Next/}).click();
}

await capture('overview');
await next(1); await capture('qkv');
await next(1); await capture('attention-map');
await next(1); await capture('multi-head');
await next(1); await capture('layer-stack');
await next(2); await capture('mental-model');

await browser.close();
