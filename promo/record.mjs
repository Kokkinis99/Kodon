// Records the Kōdon promo: serves promo-dist, plays the scenes, screenshots every frame.
// Needs playwright@1.49 and ffmpeg-static installed next to it. Usage:
//   npx ng build promo && node promo/record.mjs promo-dist/browser /tmp/frames
//   ffmpeg -f concat -safe 0 -i /tmp/frames/list.txt -vf "fps=60,format=yuv420p" -c:v libx264 -crf 16 promo.mp4
import { chromium } from 'playwright';
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';

const [root, out] = process.argv.slice(2);
fs.rmSync(out, { recursive: true, force: true });
fs.mkdirSync(out, { recursive: true });

const types = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css' };
const server = http.createServer((req, res) => {
  let file = path.join(root, decodeURIComponent(req.url.split('?')[0]));
  if (!fs.existsSync(file) || fs.statSync(file).isDirectory()) file = path.join(root, 'index.html');
  res.writeHead(200, { 'content-type': types[path.extname(file)] ?? 'application/octet-stream' });
  fs.createReadStream(file).pipe(res);
}).listen(4399);

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 960, height: 540 }, deviceScaleFactor: 2 });
await page.goto('http://localhost:4399/');
await page.waitForFunction(() => window.promo && document.fonts.status === 'loaded');
await page.evaluate(() => document.fonts.ready);
await page.mouse.move(900, 80);

// Screenshots at full device resolution take longer than a frame, so the whole page runs
// at 1/SLOW speed (animations through CDP, our timers through window.SLOW) and the
// recorded timestamps are divided by SLOW when encoding.
const SLOW = 4;
const cdp = await page.context().newCDPSession(page);
await page.evaluate(s => (window.SLOW = s), SLOW);
await cdp.send('Animation.enable');
await cdp.send('Animation.setPlaybackRate', { playbackRate: 1 / SLOW });

const frames = [];
let recording = true;
const capture = (async () => {
  while (recording) {
    const before = performance.now();
    const { data } = await cdp.send('Page.captureScreenshot', { format: 'jpeg', quality: 93, clip: { x: 0, y: 0, width: 960, height: 540, scale: 2 } });
    const i = frames.length;
    frames.push((before + performance.now()) / 2 / 1000);
    fs.writeFileSync(path.join(out, `f${String(i).padStart(5, '0')}.jpg`), Buffer.from(data, 'base64'));
  }
})();

const t0 = Date.now();
const at = async ms => {
  const wait = t0 + ms * SLOW - Date.now();
  if (wait > 0) await new Promise(r => setTimeout(r, wait));
};
const run = fn => page.evaluate(fn);
let mouse = { x: 900, y: 80 };
/** Moves the mouse over `ms` of video time, eased out. */
const glide = async (x, y, ms) => {
  const from = mouse;
  const steps = Math.max(2, Math.round((ms / 1000) * 60));
  for (let i = 1; i <= steps; i++) {
    const k = 1 - Math.pow(1 - i / steps, 3);
    await page.mouse.move(from.x + (x - from.x) * k, from.y + (y - from.y) * k);
    await new Promise(r => setTimeout(r, (ms * SLOW) / steps));
  }
  mouse = { x, y };
};
const jump = async (x, y) => {
  await page.mouse.move(x, y);
  mouse = { x, y };
};
/** Center of the front toast, or of its × button. */
const front = sel =>
  page.evaluate(sel => {
    const t = [...document.querySelectorAll('kodon-toast')].find(t => t.dataset.front === 'true');
    const r = (sel ? t.querySelector(sel) : t.querySelector('.kodon-toast-content')).getBoundingClientRect();
    return { x: r.x + r.width / 2, y: r.y + r.height / 2 };
  }, sel);

// 1. Intro
await at(150);
await run(() => promo.showIntro());

// 2. Toasts that feel right
await at(1650);
await run(() => { promo.hideIntro(); promo.mark.set(true); });
await at(1900);
await run(() => promo.caption('Toasts that feel right.', 'Sonner-style, for Angular'));
await at(2300);
await run(() => promo.toast.success('Changes saved'));

// 3. They stack
await at(3300);
await run(() => promo.caption('They stack.'));
await at(3450);
await run(() => promo.toast.error('Network error occurred'));
await at(3680);
await run(() => promo.toast.warning('Storage almost full'));
await at(3910);
await run(() => promo.toast.info('New version available'));

// 4. Any length
await at(4900);
await run(() => {
  promo.toast.dismiss();
  promo.caption('Any length. Still neat.');
  document.documentElement.style.setProperty('--stage-bottom', '16px');
  document.documentElement.style.setProperty('--stage-zoom', '1.15');
});
await at(5300);
await run(() => promo.toast.warning('You have unsaved changes in 2 documents. They will be lost if you close this tab'));
await at(5550);
await run(() => promo.toast.error('We couldn’t reach the server. Your changes are kept on this device until you’re back online'));
await at(5800);
await run(() => promo.toast.success('Saved'));
await at(6250);
await run(() => promo.cursor.set(true));
await jump(700, 300);
const stack = await front();
await glide(stack.x + 60, stack.y, 450);
await at(7700);
await glide(760, 260, 350);
await at(8050);
await run(() => promo.cursor.set(false));

// 5. Spam-proof: the same error five times is one toast that counts
await at(8250);
await run(() => {
  promo.toast.dismiss();
  promo.caption('Spam-proof.', 'Repeats collapse into one, with a count');
  document.documentElement.style.removeProperty('--stage-bottom');
  document.documentElement.style.removeProperty('--stage-zoom');
});
for (let i = 0; i < 5; i++) {
  await at(8700 + i * 320);
  await run(() => promo.toast.error('Could not reach the server'));
}

// 6. Async: a resource() followed by toast.resource()
await at(10900);
await run(() => {
  promo.toast.dismiss();
  promo.caption('Async, in place.', 'Promises, Observables and resource()');
});
await at(11250);
await run(() => promo.loadReport());

// 7. Live progress
await at(13300);
await run(() => {
  promo.toast.dismiss();
  promo.caption('Progress, live.', "toast.loading('Uploading…', { progress })");
});
await at(13600);
await run(() => promo.upload());

// 8. Anywhere: the four corners, a beat, then one lands right on the caption
await at(16100);
await run(() => { promo.toast.dismiss(); promo.mark.set(false); promo.caption('Anywhere you like.'); });
const corners = [
  ['top-start', 'success', 'Profile updated'],
  ['top-end', 'info', '3 new comments'],
  ['bottom-start', 'warning', 'Battery at 10%'],
  ['bottom-end', 'error', 'Payment declined']
];
for (const [i, [placement, variant, message]] of corners.entries()) {
  await at(16450 + i * 330);
  await page.evaluate(([placement, variant, message]) => promo.toast.show({ placement, variant, message }), [placement, variant, message]);
}
await at(18050);
await run(() => promo.toast.show({ placement: 'top-center', variant: 'info', message: 'Even here?' }));
await at(18200);
await run(() => promo.nudged.set(true));

// 9. Swipe it away
await at(19700);
await run(() => { promo.toast.dismiss(); promo.nudged.set(false); promo.mark.set(true); promo.caption('Swipe it away.'); });
await at(20100);
await run(() => promo.toast.info('Draft saved'));
await at(20450);
await run(() => promo.cursor.set(true));
await jump(650, 380);
const swipe = await front();
await glide(swipe.x - 40, swipe.y, 380);
await at(21100);
await page.mouse.down();
await glide(swipe.x + 220, swipe.y + 6, 200);
await page.mouse.up();

// 10. Or pop it
await at(21800);
await run(() => promo.caption('Or pop it.'));
await at(22000);
await run(() => promo.toast.success('Message sent'));
await at(22400);
const close = await front('.kodon-toast-close');
await glide(close.x, close.y, 400);
await at(22950);
await page.mouse.down();
await new Promise(r => setTimeout(r, 70 * SLOW));
await page.mouse.up();
await at(23250);
await run(() => promo.cursor.set(false));

// 11. Outro
await at(23450);
await run(() => { promo.clearCaption(); promo.mark.set(false); });
await at(23750);
await run(() => promo.showOutro());
await at(26750);

recording = false;
await capture;
await browser.close();
server.close();

// Each frame lasts until the next one; the concat list carries that timing to ffmpeg.
const lines = [];
frames.forEach((t, i) => {
  lines.push(`file 'f${String(i).padStart(5, '0')}.jpg'`);
  lines.push(`duration ${(((frames[i + 1] ?? t + SLOW / 60) - t) / SLOW).toFixed(5)}`);
});
lines.push(`file 'f${String(frames.length - 1).padStart(5, '0')}.jpg'`);
fs.writeFileSync(path.join(out, 'list.txt'), lines.join('\n'));
const span = (frames.at(-1) - frames[0]) / SLOW;
console.log(`${frames.length} frames over ${span.toFixed(2)}s (${(frames.length / span).toFixed(1)} fps avg)`);
