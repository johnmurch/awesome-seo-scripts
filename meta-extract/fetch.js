const fs = require('fs');
const path = require('path');
const os = require('os');
const puppeteer = require('puppeteer');
var WAE = require('web-auto-extractor').default

// UPDATE THIS URL!!!!!
var cmdArgs = process.argv.slice(2);
if(cmdArgs.length==0){
  console.log('Usage: node fetch.js http://www.domain.com/product')
  process.exit(1);
}
var url = cmdArgs[0];

const PUPPETEER_OPTIONS = {
	headless: true,
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
  const html = await page.content();
  let parsed = WAE().parse(html)

  // console.log('dom',dom)
  // console.log('------------------')
  // console.log('source',source)

  fs.writeFileSync('meta.json', JSON.stringify(parsed, null, 4));

  await browser.close()
})();
