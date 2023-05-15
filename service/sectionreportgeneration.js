const ejs = require('ejs');
const fs = require('fs');
const path = require('path');
const sections = require("../model/sections")
const {replaceImagesInTemplate} = require("./imagesreportgeneration.js");

const filePath = path.join(__dirname, 'section.ejs');
const template = fs.readFileSync(filePath, 'utf8');

const replaceSectionInTemplate = async function name(sectionId) {
    try {
        const sectionData =  await sections.getSectionById( sectionId);
        const html_section = ejs.render(template, sectionData.data.item);
        const images_html = await replaceImagesInTemplate(sectionData.data.item.images);
        return html_section + images_html;
      } catch (err) {
        console.error(err);
      }
}

module.exports = { replaceSectionInTemplate };