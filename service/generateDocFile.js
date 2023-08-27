
const ReportHeaderAndFooterFactoryImpl = require('./reportheaderandfooterstrategy/reportHeaderAndFooterFactoryImpl');
const docxTemplate = require('docx-templates');
const fs = require('fs');


const path = require("path");
//TODO Add code to monitor performance
const generateDocFile = async function (docFileName ,htmlString,companyName) {
    try {
        //console.time("generateDocFile");
        const wordFilePath = docFileName + ".docx";
        
         // Generate the PDF with the header and footer on each page
        const reportHeaderFooterStrategy = new ReportHeaderAndFooterFactoryImpl().getReportHeaderAndFooterStrategy(companyName);
        const headerTemplate = await reportHeaderFooterStrategy.getReportHeader();
        const footerTemplate = await reportHeaderFooterStrategy.getReportFooter();
       
        htmlString = `
        <meta charset="UTF-8">
        <body>         
        ${htmlString}
        </body>
        `;
        console.log(htmlString);
        const template = fs.readFileSync('test.docx');

        const buffer = await docxTemplate.createReport({
          template,
          data: {
              htmldata:htmlString                 
              }               
          },
        );
        fs.writeFileSync("test_report.docx", buffer);
        return wordFilePath;
            
    } catch (error) {
        console.log("Error is " + error);
    }
};
exports.generateDocFile = generateDocFile;



