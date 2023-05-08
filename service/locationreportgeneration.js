const locations = require("../model/location");
const {replaceSectionInTemplate} = require("./sectionreportgeneration.js");
const fs = require('fs');
const { Worker } = require('worker_threads');
const path = require('path');
const puppeteer = require('puppeteer');

 /**
     * Performance Numbers
     generateReportForLocation_section_0: 0.603ms
     generateReportForLocation_section_1: 0.47ms
     generateReportForLocation_section_2: 0.202ms
     generateReportForLocation_section_3: 0.16ms
     generateReportForLocation_section_4: 0.188ms
     generateReportForLocation_section_5: 0.711ms
     generateReportForLocation_total: 82.929ms
*/    
const generateReportForLocation = async function(locationId) {
    try {
        var location = await locations.getLocationById(locationId);  
        const sectionHtmls = await getSectionhtmls(location.data.item.sections);
        let locationhtml = '';
        for (let key in sectionHtmls) {
          locationhtml += sectionHtmls[key];
        }
        /**const fileName = "location - "+locationId + ".html";
        fs.writeFileSync(fileName, locationhtml);**/
        await generatePdfFile(locationId,locationhtml);
      } catch (error) {
        console.log("Error is " + error);
      }
  }

  const generatePdfFile = async function(locationId,htmlString){
    try{
        const pdfFilePath = "location - "+locationId + ".pdf";
        const browser = await puppeteer.launch();
        const page = await browser.newPage();
        await page.setContent(htmlString);
        await page.pdf({ path: pdfFilePath, format: 'A4' });
        await browser.close();
        console.log(`PDF saved to ${pdfFilePath}`);
    }catch(error){
        console.log("Error is " + error);
    }
  }

  const getSectionhtmls = async function(sections)
  {
    try{
        const promises = [];
        const sectionhtmls = [];
        for (let key in sections) {
            const promise = replaceSectionInTemplate(sections[key].id)
              .then((section_html) => {
               sectionhtmls[key] = section_html;
              });
            promises.push(promise);
          }
          await Promise.all(promises);
          return sectionhtmls;
    }catch(error){
        console.log(error);
    }
  }
  
   /**
       * generateReportForLocation_section_0: 9.051s
        generateReportForLocation_section_1: 30.572s
        generateReportForLocation_section_2: 2.451s
        generateReportForLocation_section_3: 51.803ms
        generateReportForLocation_section_4: 5.513s
        generateReportForLocation_section_5: 4.150s
        Total Time : 50 Sec 
       */
  const generateReportForLocationSync = async function(locationId) {
    console.time('generateReportForLocation_total_Sync');
    var location = await locations.getLocationById(locationId);
    for (let key in location.data.item.sections) {
      const label = `generateReportForLocation_section_${key}`;
      console.time(label);
  
      const section_html = await replaceSectionInTemplate(location.data.item.sections[key].id);
      const fileName = "Section - " + location.data.item.sections[key].id + ".html";
      fs.writeFileSync(fileName, section_html);
      console.timeEnd(label);
    }
  }

module.exports = {generateReportForLocation};