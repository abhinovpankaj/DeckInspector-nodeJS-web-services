const puppeteer = require('puppeteer');
const path = require('path');
const fs = require('fs');

const generatePdfFile = async function (prefixName, id, htmlString) {
    try {
        const pdfFilePath = prefixName + " - " + id + ".pdf";
        console.log("PDF File Path : " + pdfFilePath);
        const browserInstance = await puppeteer.launch({ args: ['--allow-file-access-from-files'] });
        const page = await browserInstance.newPage();
        await page.setContent(htmlString);

        //TODO UMESH create stragey to get Header and footer based on company Name,currently hardcoded for Deck Inspectors
        const headerTemplate = getPDFHeader();
        // Read the footer template from an external HTML file
        const footerTemplate = getPDFFooter();
    
        // Generate the PDF with the header and footer on each page
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
        console.log("PDF File Path : " + pdfFilePath);
        return pdfFilePath;
    } catch (error) {
        console.log("Error is " + error);
    }

    function getPDFFooter() {
        const footerTemplatePath = path.join(__dirname, 'deckInspectorsFooter.html'); // Path to the footer HTML file
        const footerTemplate = fs.readFileSync(footerTemplatePath, 'utf8');
        return footerTemplate;
    }

    function getPDFHeader() {
        const headerTemplatePath = path.join(__dirname, 'deckInspectorsHeader.html'); // Path to the header HTML file
        const headerTemplate = fs.readFileSync(headerTemplatePath, 'utf8');
    
        const imagePath = path.join(__dirname, 'deckLogo.jpg');; // Replace with the path to your image file
        const imageBuffer = fs.readFileSync(imagePath);
        const base64Image = imageBuffer.toString('base64');
    
        const modifiedHeaderTemplate = headerTemplate.replace('src="deckLogo.jpg"', `src="data:image/jpeg;base64,${base64Image}"`);
        return modifiedHeaderTemplate;
    }
};
exports.generatePdfFile = generatePdfFile;



