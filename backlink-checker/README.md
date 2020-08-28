## Overview
This script reads URLs from urls.txt (Note: 2 URLs seperated by `\`) the fetch url first and the "backlink" or expected link second. This script uses Puppeteer for checking links


## Install

```npm install```

### Update urls.txt
```
Use \ to seperated them as it's a non-safe URL character
Fetch URL First, then Backlink URL to be checked

e.g.
```

```
https://moz.com/blog/using-social-media-to-get-ahead-of-search-demand\http://www.johnmurch.com/
```
## RUN

``` node checker.js```

## Sample
* `output.csv` - sample output of backlink (anchor, link, rel)
* `urls.txt` - sample input of Fetch URL and expected backlink
