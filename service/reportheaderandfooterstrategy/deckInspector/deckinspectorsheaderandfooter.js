const ReportHeaderAndFooterStrategy = require("../reportHeaderAndFooterStrategy");
const path = require('path');
const fs = require('fs');

class DeckInspectorHeaderAndFooter extends ReportHeaderAndFooterStrategy{

    async getReportHeader(){
        const headerTemplatePath = path.join(__dirname, 'deckInspectorsHeader.html'); // Path to the header HTML file
        const headerTemplate = fs.readFileSync(headerTemplatePath, 'utf8');
    
        const imagePath = path.join(__dirname, 'deckLogo.jpg');; // Replace with the path to your image file
        const imageBuffer = fs.readFileSync(imagePath);
        const base64Image = imageBuffer.toString('base64');
    
        const modifiedHeaderTemplate = headerTemplate.replace('src="deckLogo.jpg"', `src="data:image/jpeg;base64,${base64Image}"`);
        return modifiedHeaderTemplate;
    }

    async getReportFooter(){
        const footerTemplatePath = path.join(__dirname, 'deckInspectorsFooter.html'); // Path to the footer HTML file
        const footerTemplate = fs.readFileSync(footerTemplatePath, 'utf8');
        return footerTemplate;
    }
}

module.exports = DeckInspectorHeaderAndFooter;