# awesome-seo-scripts

I write a lot of random code around SEO and want to make more of it public in 2020.

**If you have an idea, but not sure how to code it, hit me up [@johnmurch](https://www.twitter.com/johnmurch) on twitter**

## [Archive.org - WayBack Machine](https://github.com/johnmurch/awesome-seo-scripts/tree/master/archive.org)
This script allows you to download all the URLs from a given domain.

``` cd archive.org && npm install ```

``` node fetch.js https://www.domain.com```

## [Puppeteer Redirect](https://github.com/johnmurch/awesome-seo-scripts/tree/master/puppeteer-redirect)
This script reads URLs from urls.txt (One URL Per Line) and checks for redirects using Puppeteer

``` cd puppeteer-redirect && npm install ```

``` node puppeteer-redirect.js```

## [Sourcs vs Dom](https://github.com/johnmurch/awesome-seo-scripts/tree/master/domVsSource)
This script fetches a webpage with Puppeteer and saves both the source and DOM of a webpage. Great for identifying some SEO issues. **Be sure to change the URL in fetch.js (line 7)**

``` cd domVsSource && npm install ```

``` node fetch.js```


## [Backlink Checker](https://github.com/johnmurch/awesome-seo-scripts/tree/master/backlink-checker)
This script fetches a webpage with Puppeteer and loops through all links checking for a specific backlink. This script also pulls out the anchor text and rel attributes (e.g. nofollow)

``` cd backlink-checker && npm install ```

``` Update urls.txt```

``` node checker.js```


## [Meta Extract](https://github.com/johnmurch/awesome-seo-scripts/tree/master/meta-extract)
This script fetches a URL and parses the meta data using [Web Auto Extractor](https://github.com/indix/web-auto-extractor#readme) which parses meta tags as well as Microdata, RDFa-lite and JSON-LD

``` cd meta-extract && npm install ```

``` node fetch.js https://www.domain.com/product```

``` cat meta.json```


## Upcoming
@TODO
- content extract (phone, email, url)
- BigSitemap - Postgres + Puppeteer
- SEOCI - Automated SEO Testing
- ngram
- entities // Google NLP
