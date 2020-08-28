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
			browser.on('disconnected', () => {
				console.log("disconnected !")
			});
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
			let output = []; // holds all rows of data
			const csvHeaders = ['Status Code', 'Request URL', '# Redirects', 'Status Code', 'URL']
			output.push(csvHeaders.join())

			// get request from que
			for (var i = 0; i < que.length; i++) {
				let redirectChain = [];
				let headers = {}
				try {
					let response = await page.goto(que[i].url, {
						waitUntil: 'networkidle2',
						timeout: 60000
					});
					headers = {
						url: que[i].url,
						statusCode: response.status(),
						status: response.statusText(),
						contentType: response.headers()['content-type'],
						lastModified: response.headers()['last-modified']
					}
					// ***REDIRECTS*****
					let redirect = false;
					const chain = response.request().redirectChain();
					if (chain.length > 0) {
						redirect = true
						chain.forEach((c) => {
							redirectChain.push({
								status: c._response._status,
								url: c.url(),
								headers: c._response._headers
							})
						})
					}
				} catch (err) {
					console.log(`Error going to URL: ${err}`);
				}

				try {
					let html = await page.content();
					const pageTitle = await page.title();

					let metaDescription
					try {
						metaDescription = await page.evaluate(() => document.querySelector("head > meta[name='description']").content);
					} catch (e1) {
						metaDescription = null;
					}

					const payload = {
						statusCode: headers.statusCode,
						url: page.url(),
						pageTitle: pageTitle,
						metaDescription: metaDescription,
						redirectChain: redirectChain,
						redirectChainLength: redirectChain.length
					}
					console.log('payload', JSON.stringify(payload, null, 4))

					// generate CSV
					let firstRun = true;
					if (payload.redirectChain.length > 0) {
						payload.redirectChain.forEach((d) => {
							const row = []; // a new array for each row of data
							if (firstRun) {
								row.push(payload.statusCode)
								row.push(payload.url)
								row.push(payload.redirectChainLength)
								firstRun = false;
							} else {
								row.push('')
								row.push('')
								row.push('')
							}
							row.push(d.status);
							row.push(d.url);
							output.push(row.join() + '\n'); // by default, join() uses a ','
							fs.appendFileSync(filename, output.join(os.EOL));
							output = [];

						});
					} else {
						const row = [];
						row.push(payload.statusCode)
						row.push(payload.url)
						row.push(payload.redirectChainLength)
						row.push('')
						row.push('')
						output.push(row.join() + '\n'); // by default, join() uses a ','
						fs.appendFileSync(filename, output.join(os.EOL));
						output = [];
					}


					// TODO - Do Something Cool!
					// Save to S3?
					// Database?
					// API?
				} catch (e) {
					console.log(`Error going to URL: ${e}`);
					return (`Error going to URL: ${e}`);
				}
			}
			process.exit(0);
		})();
	} catch (err) {
		console.error(err);
	}
}


const getMockQue = async () => {
	let urls = fs.readFileSync('urls.txt', 'utf8').toString().split("\n");
	// filter out empty elements
	return urls.filter(function (e) {
		return e.replace(/(\r\n|\n|\r)/gm, "")
	})
}

// RUN
getMockQue()
	.then((fetchedQue) => {
		return fetchedQue.map((u) => {
			return {
				url: u
			}
		})
	}).then((que) => {
		console.log('que', que);
		if (que.length == 0) {
			process.exit(0);
		}
		fetch(que);
	});