const fs = require("fs");
const path = require("path");
const os = require("os");
const puppeteer = require("puppeteer");

const PUPPETEER_OPTIONS = {
	headless: true,
	ignoreHTTPSErrors: true,
	args: ["--no-sandbox", "--disable-setuid-sandbox"],
};

function fetch(que) {
	try {
		(async () => {
			const browser = await puppeteer.launch(PUPPETEER_OPTIONS);
			const page = await browser.newPage();
			await page.setUserAgent(
				"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/69.0.3497.100 Safari/537.36"
			);
			await page.setViewport({
				width: 1200,
				height: 720,
			});

			// Gotta Catch Them All!
			process.on("unhandledRejection", (reason, p) => {
				console.error("Unhandled Rejection at: Promise", p, "reason:", reason);
				browser.close();
			});

			// Write to CSV
			const filename = path.join(__dirname, "output.csv");
			let output = []; // holds all rows of data
			const csvHeaders = ["Status Code", "URL", "Phone", "Email"];
			output.push(csvHeaders.join());

			// get request from que
			for (var i = 0; i < que.length; i++) {
				let response;
				try {
					response = await page.goto(que[i].url, {
						waitUntil: "networkidle0",
						timeout: 60000,
					});
				} catch (err) {
					console.log(`Error going to URL: ${err}`);
				}

				try {
					let html = await page.content();
					// let type = "phone" || "email";
					// let data = "2125551212" || "tel@test.com";

					const links = await page.$$eval('a', as => as.map(a => a.href));
					var sourcePerLine = html.toString().split('\n')
					// const links = await Promise.all((await page.$$('a')))
					// var links = document.querySelectorAll('a');
					var phoneRegex = /(\d[\s-]?)?[\(\[\s-]{0,2}?\d{3}[\)\]\s-]{0,2}?\d{3}[\s-]?\d{4}/;
					var emailRegex = /([a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+\.[a-zA-Z0-9._-]+)/gi;
					let getPhoneNumbers = [];
					let getEmails = [];
					sourcePerLine.forEach((l) => {
						let findPhoneNumbers = match = phoneRegex.exec(l);
						let findEmail = match = emailRegex.exec(l);
						if (findPhoneNumbers) {
							findPhoneNumbers.forEach((p) => getPhoneNumbers.push(p))
						}
						if (findEmail) {
							findEmail.forEach((p) => getEmails.push(p))
						}
					});

					// remove non digits
					getPhoneNumbers = getPhoneNumbers.map((phone) => {
						if (phone && phone.length >= 10) {
							return phone.replace(/[^0-9]/g, '')
						}
					});

					// clean and remove undefined/nulls
					getPhoneNumbers = getPhoneNumbers.filter(function (e) {
						return e
					});

					getEmails = getEmails.filter(function (e) {
						return e
					});

					links.forEach((l) => {
						if (l.includes('@')) {
							let email = l.toLowerCase();
							// remove mailto:
							if (email.includes('mailto:')) {
								email = email.replace('mailto:', '');
							}
							if (email.includes('?')) {
								email = email.split('?')[0]
							}

							//check if includes mailto?
							getEmails.push(email);
						}
					})

					// make unique
					var extractedPhone = [...new Set(getPhoneNumbers)];
					var extractedEmail = [...new Set(getEmails)];

					const payload = {
						// type: type,
						phone: extractedPhone,
						email: extractedEmail,
						statusCode: response.status(),
						url: page.url(),
					};
					console.log("payload", JSON.stringify(payload, null, 4));

					// generate CSV
					let row = [];
					row.push(`"${payload.statusCode}"`);
					row.push(`"${payload.url}"`);
					row.push(`"${payload.phone.toString()}"`);
					row.push(`"${payload.email.toString()}"`);
					output.push(row.join()); // by default, join() uses a ','
					fs.appendFileSync(filename, output.join(os.EOL));
					fs.appendFileSync(filename, '\n');
					output = [];

					// TODO - Do Something Cool!
				} catch (e) {
					console.log(`Error going to URL: ${e}`);
					return `Error going to URL: ${e}`;
				}
			}
			process.exit(0);
		})();
	} catch (err) {
		console.error(err);
	}
}

// read in urls.txt and parse each URL
const getMockQue = async () => {
	let urls = fs.readFileSync("urls.txt", "utf8").toString().split("\n");
	// filter out empty elements
	return urls.filter(function (e) {
		return e.replace(/(\r\n|\n|\r)/gm, "");
	});
};

// RUN
getMockQue()
	.then((fetchedQue) => {
		return fetchedQue.map((u) => {
			return {
				url: u,
			};
		});
	})
	.then((que) => {
		console.log("que", que);
		if (que.length == 0) {
			process.exit(0);
		}
		fetch(que);
	});