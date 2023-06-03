const {Builder, By, Key, until} = require('selenium-webdriver');
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
    let driver = await new Builder().forBrowser('chrome').build();
    await driver.get('https://translate.google.com/');

    // Počkajte 10 sekúnd (alebo akýkoľvek čas, ktorý potrebujete) predtým, než pokračujete
await new Promise(resolve => setTimeout(resolve, 10000));


    // Otvoriť výstupný súbor
    const stream = fs.createWriteStream(outputFile);

    for (const chunk of chunks) {
        // Vložiť text do políčka pre preklad
        const inputBox = await driver.findElement(By.id('source'));
        await inputBox.clear();
        await inputBox.sendKeys(chunk.join(' '), Key.RETURN);

        // Počkať, kým sa výsledok prekladu nezobrazí
        await driver.wait(until.elementLocated(By.css('.result-shield-container .tlid-translation.translation')), 10000);

        // Získať a uložiť výsledok prekladu
        const outputText = await driver.findElement(By.css('.result-shield-container .tlid-translation.translation')).getText();
        stream.write(outputText + '\n');
    }

    // Zatvoriť prehliadač
    await driver.quit();

    // Zatvoriť výstupný súbor
    stream.end();
}

translateText('original.txt', 'output.txt');
