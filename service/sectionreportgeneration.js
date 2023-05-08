const ejs = require('ejs');
const fs = require('fs');
const path = require('path');
const sections = require("../model/sections")
const {replaceImagesInTemplate} = require("./imagesreportgeneration.js");
const { parentPort } = require('worker_threads');

const filePath = path.join(__dirname, 'section.ejs');
const template = fs.readFileSync(filePath, 'utf8');

const replaceSectionInTemplate = async function name(sectionId) {
    try {
        const section =  await sections.getSectionById( sectionId);
        //console.log(section);
        const html_section = ejs.render(template, section);
        const images_html = await replaceImagesInTemplate(section.images);
        //console.log(images.html);
        return html_section + images_html;
      } catch (err) {
        console.error(err);
      }
}

module.exports = { replaceSectionInTemplate };