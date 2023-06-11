const puppeteer = require('puppeteer');
const puppeteerConfig = require('../puppeteer.config.cjs');

const ReportHeaderAndFooterFactoryImpl = require('./reportheaderandfooterstrategy/reportHeaderAndFooterFactoryImpl');

//TODO Add code to monitor performance
const generatePdfFile = async function (pdfFileName ,htmlString,companyName) {
    try {
        console.time("generatePdfFile");
        const pdfFilePath = pdfFileName + ".pdf";
        const browserInstance = await puppeteer.launch({
            headless: true,
            args: ['--no-sandbox', '--disable-setuid-sandbox','--allow-file-access-from-files'],
            userDataDir: puppeteerConfig.cacheDirectory,
          });
        const page = await browserInstance.newPage();
        await page.setContent(htmlString);

         // Generate the PDF with the header and footer on each page
        const reportHeaderFooterStrategy = new ReportHeaderAndFooterFactoryImpl().getReportHeaderAndFooterStrategy(companyName);
        const headerTemplate = await reportHeaderFooterStrategy.getReportHeader();
        const footerTemplate = await reportHeaderFooterStrategy.getReportFooter();
       
        await page.pdf({
          path: pdfFilePath,
          format: 'A4',
          printBackground: true,
          preferCSSPageSize: true,
          displayHeaderFooter: true,
          headerTemplate: headerTemplate,
          footerTemplate: footerTemplate,
          margin: { top: '80px', bottom: '40px' }, // Adjust the margin values as needed
          colorProfile: 'sRGB',
        });
        await browserInstance.close();
        console.timeEnd("generatePdfFile");
        return pdfFilePath;
            
    } catch (error) {
        console.log("Error is " + error);
    }
};
exports.generatePdfFile = generatePdfFile;



