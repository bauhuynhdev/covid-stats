const puppeteer = require('puppeteer');
const moment = require('moment');
const cron = require('node-cron');
const low = require('lowdb');
const FileSync = require('lowdb/adapters/FileSync');
const adapter = new FileSync('covid.json');
const db = low(adapter);

const script = async () => {
    const launchOptions = {
        headless: true,
        args: [
            "--no-sandbox",
        ]
    };
    const browser = await puppeteer.launch(launchOptions);
    const page = await browser.newPage();
    const userAgent = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/89.0.4389.90 Safari/537.36";
    await page.setUserAgent(userAgent);
    const viewPortOptions = {
        width: 1920,
        height: 1080
    };
    await page.setViewport(viewPortOptions);
    const url = "https://www.worldometers.info/coronavirus/";
    const gotoOptions = {
        waitUntil: "load"
    };
    await page.goto(url, gotoOptions);

    await page.waitForSelector('#page-top');

    const globals = await (async () => {
        let getResult = async xpath => {
            let element = await page.$x(xpath);
            return await page.evaluate(text => text.textContent.replace(/[, ]/gm, ''), element[0]);
        };

        const cases = await getResult('/html/body/div[3]/div[2]/div[1]/div/div[4]/div/span');
        const deaths = await getResult('/html/body/div[3]/div[2]/div[1]/div/div[6]/div/span');
        const recovered = await getResult('/html/body/div[3]/div[2]/div[1]/div/div[7]/div/span');

        return {cases, deaths, recovered};
    })();

    const countries = await page.evaluate(() => {
        const elements = document
            .querySelectorAll('#main_table_countries_today')[0]
            .querySelector('tbody')
            .querySelectorAll('tr:not(.total_row_world)');

        let getResult = function (element, index, clear = true) {
            element = element.querySelectorAll('td')[index].textContent;
            if (clear) {
                return element.replace(/[, ]/gm, '');
            }
            return element;
        };

        return Array.from(elements).map(element => {
            let href = element.querySelectorAll('td')[1].querySelector('a');
            let key = '';
            let type = 'ship';
            if (href !== null) {
                href = href.getAttribute('href');
                let items = href.split('/');
                key = items[items.length - 2];
                type = 'country';
            }
            const name = getResult(element, 1, false);
            const cases = getResult(element, 2);
            const deaths = getResult(element, 4);
            const recovered = getResult(element, 6);
            return {key, type, name, cases, deaths, recovered};
        });
    });

    await browser.close();

    const TABLE = 'data';
    const MAXIMUM = 48;
    const createTableIfNotExist = function () {
        if (db.get(TABLE).value() === undefined) {
            db.set(TABLE, []).write();
        }
    };
    const removeFirstDataIfExceed = function () {
        const size = db.get(TABLE).size().value();
        if (size >= MAXIMUM) {
            const count = (size - MAXIMUM) + 1;
            for (let i = 0; i < count; i++) {
                db.get(TABLE).shift().write();
            }
        }
    };
    createTableIfNotExist();
    removeFirstDataIfExceed();
    const time = moment().unix();
    db.get(TABLE).push({globals, countries, time}).write();
};

cron.schedule('* * * * *', async () => {
    await script();
}, {});
