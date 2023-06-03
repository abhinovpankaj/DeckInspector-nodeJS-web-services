const puppeteer = require('puppeteer');
const puppeteerConfig = require('../puppeteer.config.cjs');

const ReportHeaderAndFooterFactoryImpl = require('./reportheaderandfooterstrategy/reportHeaderAndFooterFactoryImpl');

//TODO Add code to monitor performance
const generatePdfFile = async function (prefixName, id, htmlString,companyName) {
    try {
        const pdfFilePath = prefixName + " - " + id + ".pdf";
        const browserInstance = await puppeteer.launch({
            headless: true,
            args: ['--allow-file-access-from-files'],// Use the 'cacheDirectory' value from the imported configuration
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
        
        return pdfFilePath;
            
    } catch (error) {
        console.log("Error is " + error);
    }
};
exports.generatePdfFile = generatePdfFile;



