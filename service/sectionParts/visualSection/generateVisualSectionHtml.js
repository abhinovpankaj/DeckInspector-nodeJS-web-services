const GenerateSectionPartHTML = require('../generateSectionPartHtml.js');
const sections = require("../../../model/sections.js")
const {replaceImagesInTemplate} = require("../util/imagesGeneration/imagesreportgeneration.js");
const path = require('path');
const fs = require('fs');
const ejs = require('ejs');
const RatingMapping  = require("../../../model/ratingMapping.js");


class GenerateVisualSectionHTML extends GenerateSectionPartHTML{
    constructor(sectionId,sectionImageProperties){
        super();
        this.sectionId = sectionId;
        this.sectionImageProperties = sectionImageProperties;
        this.imagesHeader = "Visual Photos";
    }

    async getHtml(){
        const sectionHtml = await this.replaceSectionInTemplate(this.sectionId,this.sectionImageProperties);
        return sectionHtml;
    }

    async replaceSectionInTemplate(sectionId,sectionImageProperties) {
        const filePath = path.join(__dirname, './section.ejs');
        const template = fs.readFileSync(filePath, 'utf8');
        try {
            const sectionData =  await sections.getSectionById(sectionId);
            if(sectionData.data && sectionData.data.item)
            {              
                this.changeSectionFields(sectionData.data.item);
                const html_section = await ejs.render(template, sectionData.data.item);
                const images_html = await replaceImagesInTemplate(sectionData.data.item.images,
                    sectionImageProperties,this.imagesHeader);
                return html_section + images_html;
            }
            else{
                return "";
            }
          } catch (err) {
            console.error(err);
          }
    }

    async changeSectionFields(section)
    {
        // Abhinov updated for yes no
      section.visualreview = this.capitalizeWords(section.visualreview);
      section.visualsignsofleak = this.capitalizeWords(section.visualsignsofleak==true?'Yes':'No');
      section.furtherinvasivereviewrequired = this.capitalizeWords(section.furtherinvasivereviewrequired==true?'Yes':'No');
      section.conditionalassessment = this.capitalizeWords(section.conditionalassessment.toString());

    }

      
    capitalizeWords(word) {
        if(word)
        {
        var finalWord = word[0].toUpperCase() + word.slice(1);
        return finalWord;
        }
        return word;
    }
  
}
module.exports = GenerateVisualSectionHTML;