const puppeteer = require("puppeteer");
const pathToModels = "./images";
const fs = require('fs');
const axios = require('axios');

const path = './models';
fs.readdir(path, async (err, files) => {
  if (err) throw err;
  for (const fileName of files) {
    console.log(fileName, '111');

    const browser = await puppeteer.launch({
      headless: false,
      defaultViewport: null,
      userDataDir: "./tmp",
    });
    const page = await browser.newPage();

    await page.goto(
      "https://3ddd.ru/",
      { waitUntil: "load", timeout: 0 }
    );

    await page.waitForSelector("#query_search");

    await page.type("#query_search", fileName);
    await page.keyboard.press("Enter");

    await page.waitForSelector(".link", { timeout: 60000 });
    const imageUrl = await page.$eval(".link img", (img) => img.src);
    console.log(imageUrl, 'step1');

    const rxName = /[^/]+$/;
    const imageNames = imageUrl.split(",");
    for (const imageName of imageNames) {
      const newName = imageName.match(rxName);
      console.log(newName, 'step2, got names of images');

      const imagePath = pathToModels + '/' + newName[0];

      try {
        const response = await axios.get(imageName, { responseType: 'arraybuffer' });
        fs.writeFileSync(imagePath, response.data);
        console.log('Image saved successfully.');
      } catch (error) {
        console.error('Error saving image:', error);
      }
    }

    await browser.close();
  }
});
