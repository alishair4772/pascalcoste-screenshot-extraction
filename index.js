const puppeteer = require('puppeteer-extra') 
const StealthPlugin = require('puppeteer-extra-plugin-stealth') 
const fs = require('fs');
const crypto = require('crypto');
const path = require('path');


puppeteer.use(StealthPlugin()) 


async function run() {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();

    
    const url = 'https://www.pascalcoste-shopping.com/esthetique/fond-de-teint.html';

    // Navigate to the URL
    console.log(`Navigating to ${url}`);
    await page.goto(url);
    

    //cookie button
    const cookiebutton = 'div.uk-grid.uk-grid-collapse.uk-child-width-1-3.uk-grid-button-cookie > div:nth-child(3) > button';
    await page.waitForSelector(cookiebutton);
    await page.click(cookiebutton);
    await new Promise(r => setTimeout(r, 3000))

    // Selector for the target div
    const bannerSelector = '#side-sticky-bar > div.uk-margin.uk-promo-sidebar > div > div > div > div > img';

    // Wait for the element to be loaded
    await page.waitForSelector(bannerSelector);

    //take screenshot
    const element = await page.$(bannerSelector);
    await element.screenshot({path: 'banner.png'})
    
    //image url
    const imageSrc = await page.$$eval(bannerSelector, (images) => {
        return images[0].src;
      });
    
      
    const imagePath = 'banner.png';

    // Function to read image and create MD5 hash
    function getMD5Hash(imagePath) {
    return new Promise((resolve, reject) => {
        fs.readFile(imagePath, (error, data) => {
        if (error) {
            reject(error);
            return;
        }
    
        const hash = crypto.createHash('md5').update(data).digest('hex');
        resolve(hash);
        });
    });
    }
    
    const storedHash = await getMD5Hash(imagePath)
    

    const redirectSelector = '#side-sticky-bar > div.uk-margin.uk-promo-sidebar > div > div > div > div > a';
    await page.waitForSelector(redirectSelector);

    // Extract the href attribute
    const redirectHref = await page.$$eval(redirectSelector, (anchors) => {
        return anchors[0].href;
    });

    // Construct the path
    const image = path.join(__dirname, 'banner.png'); 

    data = {'id': storedHash,'redirection_url':redirectHref,'img_link':imageSrc,'image_url':image,'format':'Left Side Banner'};
    console.log(data);

    // Convert extracted data to JSON string
    const jsonData = JSON.stringify(data, null, 2); // Indent for readability

    // Define the filename for the JSON file
    const filename = 'data.json';

    // Write the JSON data to a file
    await fs.promises.writeFile(filename, jsonData, 'utf-8');

    await browser.close();
}

run();