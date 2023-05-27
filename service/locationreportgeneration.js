const locations = require("../model/location");
const {replaceSectionInTemplate} = require("./sectionreportgeneration.js");
const fs = require('fs');
const { Worker } = require('worker_threads');
const path = require('path');
const { getSectionHeader } = require("./getSectionHeader");

const generateReportForLocation = async function(locationId,sectionImageProperties) {
    try {
        var location = await locations.getLocationById(locationId);
        if(!(location.data))
        {
          return  "";
        }
        else{
          const sectionHtmls = await getSectionhtmls(location,location.data.item.sections,sectionImageProperties);
          let locationhtml = '';
          for (let key in sectionHtmls) {
            locationhtml += sectionHtmls[key];
          }
          return locationhtml;
        }
      } catch (error) {
        console.log("Error is " + error);
      }
  }

  const getSectionhtmls = async function(location,sections,sectionImageProperties)
  {
    try{
        const promises = [];
        const sectionhtmls = [];
        for (let key in sections) {
            sectionhtmls[key] = await getSectionHeader(location,sections[key].name);
            const promise = replaceSectionInTemplate(sections[key]._id,sectionImageProperties)
              .then((section_html) => {
               sectionhtmls[key] += section_html;
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