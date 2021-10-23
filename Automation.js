// node AutomationScript.js --url="https://www.hackerrank.com" --config=config.json
// npm init -y
// npm install minimist
// npm install fs 
// npm install puppeteer
let minimist=require('minimist');
let puppeteer=require('puppeteer');
let fs=require('fs');
let args=minimist(process.argv);
let configJSON=fs.readFileSync(args.config, "utf-8");
let configJSO=JSON.parse(configJSON);

run();  // I will be calling async function run so I need await
async function run(){ // I will use await in run function so I make it async

    let browser=await puppeteer.launch({headless: false, args : ['--start-maximized'], defaultViewport: null});
    let pages=await browser.pages();
    let page=pages[0];
    await page.goto(args.url)
    await page.waitForSelector("a[data-event-action='Login']");// click on login. Why wait? because page takes time to load from top to down. Now we click on login only when it gets generated
    await page.click("a[data-event-action='Login']");// now click
    //click on 2nd login
    await page.waitForSelector("a[href='https://www.hackerrank.com/login']");
    await page.click("a[href='https://www.hackerrank.com/login']");// now click
    //type user id
    await page.waitForSelector("input[name='username']");
    await page.type("input[name='username']", configJSO.userid);// now click
    //type user password
    await page.waitForSelector("input[name='password']");
    await page.type("input[name='password']", configJSO.password, {delay : 300});// now type with delay of 3000 ms so that aftert last letter in password 3000ms is waited and then login is clicked
    // next login button
    await page.waitForSelector("button[data-analytics='LoginPassword']");
    await page.click("button[data-analytics='LoginPassword']");// now click
    // now click on competete
    await page.waitForSelector("a[data-analytics='NavBarContests']");
    await page.click("a[data-analytics='NavBarContests']");// now click
        // now click on manage Contests
    await page.waitForSelector("a[href='/administration/contests/']");
    await page.click("a[href='/administration/contests/']");// now click
    //now fetch all url for contests in the page
    await page.waitForSelector("a.backbone.block-center");
    let contestUrls = await page.$$eval("a.backbone.block-center", function(atags){
    let urls = [];
    for(let i = 0; i < atags.length; i++){
        let url = atags[i].getAttribute('href');
        urls.push(url);
    }
    return urls;
    });

    for (let i = 0; i < contestUrls.length; i++) {
        let npage = await browser.newPage();// creating a new page
        await npage.goto(args.url + contestUrls[i]);// going to each contest url
        await npage.waitFor(2000);
        await npage.waitForSelector("li[data-tab='moderators']");// wait for moderator
        await npage.click("li[data-tab='moderators']");// click on moderator
        for(let i=0;i<configJSO.moderators.length;i++){// loop through moderators
            let moderator=configJSO.moderators[i];// store each moderator here
            await npage.waitForSelector("input#moderator");
            await npage.type("input#moderator", moderator, {delay : 300});
        // now press enter 
            await npage.keyboard.press("Enter");
            await page.waitFor(2000);
        }
        await npage.close();
        await page.waitFor(2000);
    }
}
