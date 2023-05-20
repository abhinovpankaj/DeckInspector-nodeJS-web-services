const ejs = require('ejs');
const fs = require('fs');
const path = require('path');
const sections = require("../model/sections")
const {replaceImagesInTemplate} = require("./imagesreportgeneration.js");

const filePath = path.join(__dirname, 'section.ejs');
const template = fs.readFileSync(filePath, 'utf8');

const replaceSectionInTemplate = async function name(sectionId) {
    try {
        const sectionData =  await sections.getSectionById(sectionId);
        changeSectionFields(sectionData.data.item);
        const html_section = ejs.render(template, sectionData.data.item);
        const images_html = await replaceImagesInTemplate(sectionData.data.item.images);
        return html_section + images_html;
      } catch (err) {
        console.error(err);
      }
}

function changeSectionFields(section)
{
  section.visualreview = capitalizeWords(section.visualreview);
  section.visualsignsofleak = capitalizeWords(section.visualsignsofleak.toString());
  section.furtherinvasivereviewrequired = capitalizeWords(section.furtherinvasivereviewrequired.toString());
  section.conditionalassessment = capitalizeWords(section.conditionalassessment.toString());
}

function capitalizeWords(word) {
  if(word)
  {
    var finalWorld = word[0].toUpperCase() + word.slice(1);
    return finalWorld;
  }
  return word;
}


module.exports = { replaceSectionInTemplate };