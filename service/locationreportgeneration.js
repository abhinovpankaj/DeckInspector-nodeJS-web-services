const locations = require("../model/location");
const {replaceSectionInTemplate} = require("./sectionreportgeneration.js");
const fs = require('fs');
const { Worker } = require('worker_threads');
const path = require('path');

const generateReportForLocation = async function(locationId) {
    try {
        var location = await locations.getLocationById(locationId);
        console.log("Location Data : " ,location );

        const sectionHtmls = await getSectionhtmls(location.data.item.sections);
        let locationhtml = '';
        for (let key in sectionHtmls) {
          locationhtml += sectionHtmls[key];
        }
        return locationhtml;
      } catch (error) {
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
module.exports = {generateReportForLocation};