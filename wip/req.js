const puppeteer = require("puppeteer");

let waitTime = 5 * 1000;
async function testAjax() {
  const url = "https://www.notion.so/Test-page-all-c969c9455d7c4dd79c7f860f3ace6429"
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  await page.setRequestInterception(true);

  // those we don't want to log because they are not important
  function isSilenced(url) {
    const silenced = ["/api/v3/ping", "/appcache.html", "/loading-spinner.svg", "/api/v3/getUserAnalyticsSettings"];
    for (let s of silenced) {
      if (url.includes(s)) {
        return true;
      }
    }
    return false;
  }

  function isBlacklisted(url) {
    const blacklisted = ["amplitude.com/", "fullstory.com/", "intercom.io"];
    for (let s of blacklisted) {
      if (url.includes(s)) {
        return true;
      }
    }
    return false;
  }

  page.on("request", request => {
    const url = request.url();
    if (isBlacklisted(url)) {
      request.abort();
      return;
    }
    request.continue();
  });

  page.on("requestfailed", request => {
    const url = request.url();
    if (isBlacklisted(url)) {
      // it was us who failed this request
      return;
    }
    console.log("request failed url:", url);
  });

  page.on("response", response => {
    const request = response.request();
    const url = request.url();
    if (isSilenced(url)) {
      return;
    }
    const method = request.method();
    const postData = request.postData();

    const status = response.status();
    response.text().then(d => {
      const dataLen = d.length;
      console.log(`${method} ${url} ${status} size: ${dataLen}`)
      if (postData) {
        console.log(postData);
      }
    })
  });

  await page.goto(url, { waitUntil: "networkidle2" });
  await page.waitFor(waitTime);

  await browser.close();
}

testAjax();
