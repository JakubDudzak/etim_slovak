const puppeteer = require('puppeteer');
const fs = require('fs');

async function translateText(inputFile, outputFile, linesPerChunk=100) {
    // Načítať riadky zo vstupného súboru
    const lines = fs.readFileSync(inputFile, 'utf-8').split('\n');

    // Rozdeliť riadky na bloky po 100
    const chunks = [];
    for (let i = 0; i < lines.length; i += linesPerChunk) {
        chunks.push(lines.slice(i, i + linesPerChunk));
    }

    // Otvoriť prehliadač a pristupiť na Google Translate
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    await page.goto('https://translate.google.com/', {waitUntil: 'networkidle0'});

    // Otvoriť výstupný súbor
    const stream = fs.createWriteStream(outputFile);

    for (const chunk of chunks) {
        // Vložiť text do políčka pre preklad
        await page.waitForSelector('textarea');
        await page.evaluate((text) => {
            document.querySelector('textarea').value = text;
        }, chunk.join(' '));

        // Počkať, kým sa výsledok prekladu nezobrazí
        await page.waitForSelector('.result-shield-container span', {timeout: 10000});

        // Získať a uložiť výsledok prekladu
        const outputText = await page.evaluate(() => {
            return document.querySelector('.result-shield-container span').textContent;
        });
        stream.write(outputText + '\n');
    }

    // Zatvoriť prehliadač
    await browser.close();

    // Zatvoriť výstupný súbor
    stream.end();
}

translateText('original.txt', 'output.txt');
