const ejs = require('ejs');
const fs = require('fs');
const path = require('path');
const sections = require("../model/sections")
const {replaceImagesInTemplate} = require("./imagesreportgeneration.js");

const filePath = path.join(__dirname, 'section.ejs');
const template = fs.readFileSync(filePath, 'utf8');


const mapping = {
  one: '0-1 Years',
  four: '1-4 Years',
  seven: '4-7 Years',
  sevenplus: '7+ Years'
};

const replaceSectionInTemplate = async function name(sectionId,sectionImageProperties) {
    try {
        const sectionData =  await sections.getSectionById(sectionId);
        changeSectionFields(sectionData.data.item);
        const html_section = ejs.render(template, sectionData.data.item);
        const images_html = await replaceImagesInTemplate(sectionData.data.item.images,sectionImageProperties);
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
  section.eee = mapping[section.eee];
  section.lbc = mapping[section.lbc];
  section.awe = mapping[section.awe];
}

function capitalizeWords(word) {
  if(word)
  {
    var finalWord = word[0].toUpperCase() + word.slice(1);
    return finalWord;
  }
  return word;
}


module.exports = { replaceSectionInTemplate };