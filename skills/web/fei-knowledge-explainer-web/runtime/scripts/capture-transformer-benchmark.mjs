import { chromium } from 'playwright';
import { mkdir } from 'node:fs/promises';

await mkdir('out', {recursive:true});
const browser = await chromium.launch({headless:true});
const page = await browser.newPage({viewport:{width:1440,height:1000},deviceScaleFactor:1});
await page.goto('http://127.0.0.1:4173/?benchmark=transformer', {waitUntil:'networkidle'});
await page.screenshot({path:'out/transformer-web-first.png',fullPage:true});
for (let i=0;i<3;i++) await page.getByRole('button',{name:/Next/}).click();
await page.screenshot({path:'out/transformer-web-middle.png',fullPage:true});
for (let i=0;i<3;i++) await page.getByRole('button',{name:/Next/}).click();
await page.screenshot({path:'out/transformer-web-final.png',fullPage:true});
await browser.close();
