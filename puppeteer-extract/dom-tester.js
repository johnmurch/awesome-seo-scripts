/**
 * PASTE INTO DEVCONSOLE
 * Test URLS: http://eakramen.com/locations/ and https://locations.chipotle.com/ny/new-york/200-varick-st
 */

var sourcePerLine = document.documentElement.innerText.split('\n')
var links = document.querySelectorAll('a');
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
  if (l.href.includes('@')) {
    let email = l.href.toLowerCase();
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

let results = {
  phone: extractedPhone,
  email: extractedEmail
}
console.log(JSON.stringify({
  results
}, null, 4));