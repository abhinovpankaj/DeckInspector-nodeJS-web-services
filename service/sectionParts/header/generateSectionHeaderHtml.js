const GenerateSectionPartHTML = require('../generateSectionPartHtml.js');
const { getSectionHeader } = require("./getSectionHeader.js");

class GenerateSectionHeaderHTML extends GenerateSectionPartHTML{

    constructor(location, sectionName,projectReportType){
        super();
        this.location = location;
        this.sectionName = sectionName;
        this.projectReportType = projectReportType;
    }

    async getHtml(){
        const headerHtml = await getSectionHeader(this.location,this.sectionName,this.projectReportType);
        return headerHtml;
    }
}

module.exports = GenerateSectionHeaderHTML;