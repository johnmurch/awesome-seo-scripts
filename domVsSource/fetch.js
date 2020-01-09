const fs = require('fs');
const path = require('path');
const os = require('os');
const puppeteer = require('puppeteer');

// UPDATE THIS URL!!!!!
const url = 'https://codepen.io/'

const PUPPETEER_OPTIONS = {
	headless: false,
  ignoreHTTPSErrors: true,
  slowMo: 25,
  args: [
    '--no-sandbox',
    '--disable-setuid-sandbox',
    '--disable-gpu',
  ],
};


(async () => {
  const browser = await puppeteer.launch(PUPPETEER_OPTIONS)
  const page = await browser.newPage()
  await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/69.0.3497.100 Safari/537.36')

  let response = await page.goto(url)

  const dom = await page.content();
  const source = await response.text();

  // console.log('dom',dom)
  // console.log('------------------')
  // console.log('source',source)

  fs.writeFileSync('dom.txt', dom);
  fs.writeFileSync('source.txt', source);

  await browser.close()
})();
