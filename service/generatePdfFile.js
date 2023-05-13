const puppeteer = require('puppeteer');

const generatePdfFile = async function (prefixName, id, htmlString) {
    try {
        const pdfFilePath = prefixName + " - " + id + ".pdf";
        console.log("PDF File Path : " + pdfFilePath);
        //const puppeteerSingleton = new PuppeteerSingleton();
        //const browserInstance = await puppeteerSingleton.getBrowserInstance();
        const browserInstance = await puppeteer.launch();
        const page = await browserInstance.newPage();
        await page.setContent(htmlString);
        await page.pdf({ path: pdfFilePath, format: 'A4' });
        await browserInstance.close();
        console.log("PDF File Path : " + pdfFilePath);
        return pdfFilePath;
    } catch (error) {
        console.log("Error is " + error);
    }
};
exports.generatePdfFile = generatePdfFile;
