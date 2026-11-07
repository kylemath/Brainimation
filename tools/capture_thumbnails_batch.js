#!/usr/bin/env node
/**
 * Headless Chrome screenshot batch worker for BrainImation animations.
 * Usage:
 *   node tools/capture_thumbnails_batch.js <batchIndex> <totalBatches> [--only-missing]
 *   node tools/capture_thumbnails_batch.js --ids id1,id2,id3
 */
const fs = require('fs');
const path = require('path');
const puppeteer = require('/Users/fulkanjou/.gemini/antigravity/brain/61f6dd26-df26-457f-9f5e-f398b9d749d9/scratch/node_modules/puppeteer-core');

const REPO_ROOT = '/Users/fulkanjou/Brainimation';
const MANIFEST_PATH = path.join(REPO_ROOT, 'examples', 'manifest.json');
const THUMB_DIR = path.join(REPO_ROOT, 'examples', 'thumbnails');

async function main() {
  fs.mkdirSync(THUMB_DIR, { recursive: true });
  const manifest = JSON.parse(fs.readFileSync(MANIFEST_PATH, 'utf8'));

  const args = process.argv.slice(2);
  let targetExamples = [];

  const idsArgIdx = args.indexOf('--ids');
  if (idsArgIdx !== -1 && args[idsArgIdx + 1]) {
    const idSet = new Set(args[idsArgIdx + 1].split(',').map((s) => s.trim()).filter(Boolean));
    targetExamples = manifest.examples.filter((ex) => idSet.has(ex.id));
  } else {
    const batchIdx = parseInt(args[0] || '0', 10);
    const totalBatches = parseInt(args[1] || '1', 10);
    const onlyMissing = args.includes('--only-missing');

    let pool = manifest.examples;
    if (onlyMissing) {
      pool = pool.filter((ex) => !fs.existsSync(path.join(THUMB_DIR, `${ex.id}.png`)));
    }
    const chunkSize = Math.ceil(pool.length / totalBatches);
    targetExamples = pool.slice(batchIdx * chunkSize, (batchIdx + 1) * chunkSize);
  }

  console.log(`Capturing ${targetExamples.length} thumbnails...`);
  if (targetExamples.length === 0) {
    console.log('No thumbnails to capture in this batch.');
    return;
  }

  const browser = await puppeteer.launch({
    executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
    headless: 'new',
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--use-fake-ui-for-media-stream',
      '--use-fake-device-for-media-stream',
      '--autoplay-policy=no-user-gesture-required',
      '--enable-webgl',
      '--ignore-gpu-blocklist',
    ],
    defaultViewport: { width: 1440, height: 900, deviceScaleFactor: 1 },
  });

  const page = await browser.newPage();

  page.on('console', (msg) => {
    if (msg.type() === 'error') {
      console.error('PAGE ERROR:', msg.text());
    }
  });
  page.on('pageerror', (err) => {
    console.error('UNCAUGHT PAGE ERROR:', err.message);
  });

  // Dismiss any alerts/prompts automatically
  page.on('dialog', async (dialog) => {
    try { await dialog.dismiss(); } catch (_) {}
  });

  await page.goto('http://localhost:8788', { waitUntil: 'networkidle2', timeout: 30000 });

  // Wait for examples registry and Monaco editor to initialize
  await page.waitForFunction(
    () => window.BrainimationExamples && window.BrainimationExamples.count() >= 100 && typeof codeEditor !== 'undefined' && codeEditor.editor,
    { timeout: 25000 }
  );

  // Configure simulator and set #canvas-container to 640x400 (16:10)
  await page.evaluate(() => {
    codeEditor.autoRun = false;
    const main = document.querySelector('.main-container');
    if (main) {
      main.classList.add('hide-catalogue', 'hide-reference');
    }
    const container = document.getElementById('canvas-container');
    if (container) {
      container.style.width = '640px';
      container.style.height = '400px';
      container.style.minWidth = '640px';
      container.style.minHeight = '400px';
      container.style.maxWidth = '640px';
      container.style.maxHeight = '400px';
    }
    if (typeof startSimulation === 'function') {
      startSimulation();
    }
    if (typeof eegSimulator !== 'undefined' && eegSimulator) {
      eegSimulator.setAttention(0.76);
      eegSimulator.setMeditation(0.68);
      if (typeof eegSimulator.setMotion === 'function') {
        eegSimulator.setMotion(0.75);
      }
      eegSimulator.generateSamples(256);
    }
  });

  await new Promise((r) => setTimeout(r, 600));

  for (let i = 0; i < targetExamples.length; i++) {
    const ex = targetExamples[i];
    const outPath = path.join(THUMB_DIR, `${ex.id}.png`);
    try {
      await page.evaluate((id) => {
        if (typeof eegSimulator !== 'undefined' && eegSimulator) {
          eegSimulator.generateSamples(128);
          if (typeof eegData !== 'undefined' && typeof eegData.triggerERP === 'function') {
            eegData.triggerERP('target');
          }
        }
        codeEditor.loadExample(id);
      }, ex.id);

      // Let the p5 sketch warm up and draw frames
      await new Promise((r) => setTimeout(r, 850));

      const containerEl = await page.$('#canvas-container');
      const box = containerEl ? await containerEl.boundingBox() : null;
      if (box && box.width > 20 && box.height > 20) {
        await page.mouse.move(box.x + box.width * 0.35, box.y + box.height * 0.42);
        await page.mouse.move(box.x + box.width * 0.62, box.y + box.height * 0.56, { steps: 5 });
        await new Promise((r) => setTimeout(r, 250));
        await page.screenshot({
          path: outPath,
          type: 'png',
          clip: {
            x: Math.round(box.x),
            y: Math.round(box.y),
            width: Math.round(box.width),
            height: Math.round(box.height),
          },
        });
        const stat = fs.statSync(outPath);
        console.log(`✅ [${i + 1}/${targetExamples.length}] Saved ${ex.id}.png (${Math.round(box.width)}x${Math.round(box.height)}, ${stat.size}B)`);
      } else {
        console.warn(`⚠️ [${i + 1}/${targetExamples.length}] Missing container box for ${ex.id}`);
      }
    } catch (err) {
      console.error(`❌ [${i + 1}/${targetExamples.length}] Error capturing ${ex.id}:`, err.message);
    }
  }

  await browser.close();
  console.log(`Finished capturing ${targetExamples.length} thumbnails!`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
