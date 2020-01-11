const fs = require('fs');
const path = require('path');
const os = require('os');
const puppeteer = require('puppeteer');

const PUPPETEER_OPTIONS = {
	headless: true,
  ignoreHTTPSErrors: true,
  slowMo: 25,
  args: [
    '--no-sandbox',
    '--disable-setuid-sandbox',
    "--proxy-server='direct://",
    '--proxy-bypass-list=*',
    '--disable-dev-shm-usage',
    '--disable-accelerated-2d-canvas',
    '--disable-gpu',
  ],
};

function fetch(que) {
	try {
		(async () => {
			const browser = await puppeteer.launch(PUPPETEER_OPTIONS);
			browser.on('disconnected', () => {console.log("disconnected !")});
			// block resources that are not needed as just looking up redirects!
			const blockedResources = ['image', 'stylesheet', 'media', 'font', 'texttrack', 'object', 'beacon', 'csp_report', 'imageset'];
			const page = await browser.newPage()
			// await page.authenticate({username:proxy.username, password:proxy.password});
			await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/69.0.3497.100 Safari/537.36')
	    await page.setViewport({
	      width: 1200,
	      height: 720
	    })

			await page.setRequestInterception(true);
			page.on('request', (req) => {
	      if (blockedResources.includes(req.resourceType())) {
	        req.abort()
	      } else {
	        req.continue()
	      }
	    })

			process.on('unhandledRejection', (reason, p) => {
				 console.error('Unhandled Rejection at: Promise', p, 'reason:', reason);
				 browser.close();
			});

			// Write to CSV
			const filename = path.join(__dirname, 'output.csv');
			const output = []; // holds all rows of data
			const csvHeaders = ['Status Code','URL','Backlink', 'Anchor','Rel','Exists']
			output.push(csvHeaders.join())

			// get request from que
			for(var i=0;i<que.length;i++){
				let backlinks = []
				try {
					let response = await page.goto(que[i].url, {waitUntil: 'networkidle0', timeout: 60000});

					// init response
					let payload = {
							statusCode: response.status(),
							url: que[i].url,
							backlink: que[i].backlink,
							anchor: "",
							rel: "",
							exists:false
					}

					// gather all links and attributes
					const hrefs = await page.$$eval('a', as => as.map(a => { return {href:a.href, text:a.text, rel:a.rel}}));

					// loop all links
					hrefs.forEach((h) => {
						if(h.href == que[i].backlink){
							// Link FOUND!
							console.log(`FOUND: ${que[i].url }`)
							console.log(JSON.stringify(h))

							payload.anchor = h.text
							payload.rel = h.rel
							payload.exists = true
						}
					})

					// generate CSV
					const row = []; // a new array for each row of data
					row.push(payload.statusCode);
					row.push(payload.url);
					row.push(payload.backlink);
					row.push(payload.anchor);
					row.push(payload.rel);
					row.push(payload.exists);
					output.push(row.join());

				}catch (err) {
					console.log(`Error going to URL: ${err}`);
				}
			}
			fs.appendFileSync(filename, output.join(os.EOL));
			process.exit(0);
		})();
	} catch (err) {
		console.error(err);
	}
}


const getQue = async () => {
	let urls = fs.readFileSync('urls.txt', 'utf8').toString().split("\n");
	// filter out empty elements
	return urls.filter(function(e){ return e.replace(/(\r\n|\n|\r)/gm,"")})
}

// RUN
getQue()
.then((fetchedQue) => {
	return fetchedQue.map((u) => {
		return {
			url: u.split('\\')[0],
			backlink: u.split('\\')[1]
		}
	})
}).then((que) => {
	console.log('que',que);
	if(que.length ==0){
		process.exit(0);
	}
	fetch(que);
});
