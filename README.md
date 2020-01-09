# awesome-seo-scripts

I write a lot of random code around SEO and want to make more of it public in 2020.

**If you have an idea, but not sure how to code it, hit me up [@johnmurch](https://www.twitter.com/johnmurch) on twitter**

## Archive.org
This script allows you to download all the URLs from a given domain.

``` cd archive.org && npm install ```

``` node fetch.js https://www.domain.com```

## Puppeteer Redirect
This script reads URLs from urls.txt (One URL Per Line) and checks for redirects using Puppeteer

``` cd puppeteer-redirect && npm install ```

``` node puppeteer-redirect.js```

## Sourcs vs Dom
This script fetches a webpage with Puppeteer and saves both the source and DOM of a webpage. Great for identifying some SEO issues. **Be sure to change the URL in fetch.js (line 7)**

``` cd domVsSource && npm install ```

``` node fetch.js```


## Upcoming
@TODO
- Backlink Checker
- MetaTags Parsing
- content extract (phone, email, url)
- BigSitemap - Postgres + Puppeteer
- SEOCI - Automated SEO Testing
- ngram
- entities // Google NLP
