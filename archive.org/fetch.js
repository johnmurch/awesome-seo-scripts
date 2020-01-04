const fs = require('fs'),
  readline = require('readline'),
  request = require('request'),
  stream = require('stream'),
  archiveHelper = require('./helper.js');

var args = process.argv.slice(2);

if (args.length == 0) {
  console.log("No URL Found");
  console.log("node fetch.js http://www.url.com");
  process.exit();
}

var start = new Date();
var hrstart = process.hrtime();

var report = { domain: args[0]};

// normalize input
var domainFilter = report.domain.replace('http://', '').replace('https://', '').replace('www.', '');
var domain = report.domain.replace('http://', '').replace('https://', '').replace('www.', '').split('/')[0];

// file output
// TODO - put in /data folder and add epoch datetime stamp
var reportFile = domain + '.csv';
var dest = domain + ".json";

// secret sauce URL from archive.org
var url = "http://web.archive.org/cdx/search?url=http%3A%2F%2Fwww." + domainFilter + "%2F&matchType=prefix&collapse=urlkey&output=json&fl=original%2Cmimetype%2Ctimestamp%2Cendtimestamp%2Cgroupcount%2Cuniqcount&filter=!statuscode%3A%5B45%5D..&_=1494942501629";

archiveHelper.download(url, dest, function(err) {
  if (err) {
    console.log(err);
  }

  var writeStream = fs.createWriteStream(domain + '.csv', {
    flags: 'w'
  });
  var instream = fs.createReadStream(domain + '.json');
  var outstream = new stream;
  outstream.readable = true;
  outstream.writable = true;

  var lineCount = 0;

  var rl = readline.createInterface({
    input: instream,
    output: outstream,
    terminal: false
  });

  rl.on('line', function(line) {
    // check if domain is blocked by robots.txt
    if (line.indexOf('Blocked By Robots') == -1) {
      if (lineCount == 0) {
        var url = "URL";
        var mimetype = "MIME Type";
        lineCount++;
        writeStream.write(url + ',' + mimetype + '\n');
      } else {
        // sanatize links - remove 80 port number
        var url = line.split(",")[0].slice(2, -1).split('"').join('')
        var sanatizeLink = url.replace(domain.split('/')[0] + ':80/', domain + '/');

        // sanatize MimeType
        var mimetype = line.split(",")[1].split('"').join('');
        var sanatizeMime = (archiveHelper.listType.indexOf(mimetype.trim()) >= 0) ? mimetype : '';
        lineCount++;
        writeStream.write(sanatizeLink + ',' + sanatizeMime + '\n');
      }
    }
  });

  rl.on('close', function() {
    writeStream.end();
  });

  writeStream.on('close', function() {
      var links = (lineCount == 0) ? 0 : (lineCount - 1);
      var results = {
        links: links,
      }
      console.log(results);
  });
});
