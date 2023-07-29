const GenerateSectionPartHTML = require('../generateSectionPartHtml.js');
const path = require('path');
const fs = require('fs');
const ejs = require('ejs');
const conclusiveSection = require("../../../model/conclusiveSections.js");
const {replaceImagesInTemplate} = require("../util/imagesGeneration/imagesreportgeneration.js");
const RatingMapping  = require("../../../model/ratingMapping.js");

const filePath = path.join(__dirname, 'conclusiveDetails.ejs');
const template = fs.readFileSync(filePath, 'utf8');
class GenerateSectionConclusiveHTML extends GenerateSectionPartHTML{

    constructor(sectionId,sectionImageProperties){
        super();
        this.sectionId = sectionId;
        this.sectionImageProperties = sectionImageProperties;
        this.imagesHeader = "Conclusive Inspection Photos";
    }

    async getHtml(){
        const tempConclusiveSection = await conclusiveSection.getConclusiveSectionByParentId(this.sectionId);
        if(tempConclusiveSection && tempConclusiveSection.data && tempConclusiveSection.data.item)
        {
            this.changeSectionFields(tempConclusiveSection.data.item);
            const html_section = ejs.render(template, tempConclusiveSection.data.item);
            const images_html = await replaceImagesInTemplate(tempConclusiveSection.data.item.conclusiveimages,this.sectionImageProperties,this.imagesHeader);
            return html_section + images_html;
        }
        else{
            return "";
        }
    }

    async changeSectionFields(conclusiveSection)
    {
      conclusiveSection.invasiverepairsinspectedandcompleted = this.capitalizeWords(conclusiveSection.invasiverepairsinspectedandcompleted.toString());
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

module.exports = GenerateSectionConclusiveHTML;