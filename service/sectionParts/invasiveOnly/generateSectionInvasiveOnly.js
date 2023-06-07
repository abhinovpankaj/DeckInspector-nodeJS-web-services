const generateSectionPartHtml = require('../generateSectionPartHtml.js');
const invasiveSection = require("../../../model/invasiveSections.js");
const {replaceImagesInTemplate} = require("../util/imagesGeneration/imagesreportgeneration.js");
const path = require('path');
const fs = require('fs');
const ejs = require('ejs');


const filePath = path.join(__dirname, 'invasive.ejs');
const template = fs.readFileSync(filePath, 'utf8');


class GenerateSectionInvasiveHTML extends generateSectionPartHtml {

    constructor(sectionId,sectionImageProperties){
        super();
        this.sectionId = sectionId;
        this.sectionImageProperties = sectionImageProperties;
        this.imagesHeader = "Invasive Inspection Photos";
    }

    async getHtml(){
        const invasiveSectionData = await invasiveSection.getInvasiveSectionByParentId(this.sectionId);
        if(invasiveSectionData && invasiveSectionData.data && invasiveSectionData.data.item)
        {   
            const invasiveHtml = ejs.render(template,invasiveSectionData.data.item);
            const images_html = await replaceImagesInTemplate(invasiveSectionData.data.item.invasiveimages,this.sectionImageProperties,this.imagesHeader);
            return invasiveHtml + images_html;
        }
        else{
            return "";
        }
        
        
    }
}

module.exports = GenerateSectionInvasiveHTML