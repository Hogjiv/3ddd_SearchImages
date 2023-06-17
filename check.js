const puppeteer = require("puppeteer");
const pathToModels = "./images";
const fs = require('fs');
const axios = require('axios');

(async () => {
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

  // Wait for the search bar to appear
  await page.waitForSelector("#query_search");

  // Enter the file names in the search bar
  const fileNames = ["3960328.61fc2a414f4a1", "962785.58cfc5aeae144", "2117819.5b7fa4894ce9f"];

  for (const fileName of fileNames) {
    await page.type("#query_search", fileName);

    await page.keyboard.press("Enter");

    // Get image from the web and save it to const
    await page.waitForSelector(".link");
    const imageUrl = await page.$eval(".link img", (img) => img.src);
    console.log(imageUrl, 'step1');

    // Make new correct name according to model name and save images to the directory
    const rxName = /[^/]+$/;
    const imageNames = imageUrl.split(",");
    for (const imageName of imageNames) {
      const newName = imageName.match(rxName);
      console.log(newName, 'step2, got names of images');

      // Create the image path
      const imagePath = pathToModels + '/' + newName[0];

      // Save the image to the directory
      try {
        const response = await axios.get(imageUrl, { responseType: 'arraybuffer' });
        fs.writeFileSync(imagePath, response.data);
        console.log('Image saved successfully.');
      } catch (error) {
        console.error('Error saving image:', error);
      }
    }
  }

  await browser.close();
})();
