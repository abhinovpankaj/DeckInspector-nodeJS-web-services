const subProject = require("../../model/subproject");
const LocationType = require("../../model/locationType");
const LocationReportGeneration = require("./LocationReportGeneration");
const ReportGenerationUtil = require("./ReportGenerationUtil");

class SubprojectReportGeneration {
    async generateDocReportForSubProject(subProjectId,companyName,
                                                  sectionImageProperties,
                                                  reportType)
    {
        const subProjectData = await subProject.getSubProjectById(subProjectId);
        const subprojectName = subProjectData.data.item.name;
        const promises = [];
        let subProjectdocSorted = [];
        const {subProjectApartments, subProjectLocations } = this.reordersubProjectLocations(subProjectData.data.item.children);

        // const orderdLocationsInSubProject = this.reordersubProjectLocations(subProjectData.data.item.children);
        for (let key in subProjectApartments) {
            const subProjectdoc = await LocationReportGeneration.generateDocReportForLocation(subProjectApartments[key]._id,companyName,sectionImageProperties,reportType,subprojectName);
            const mergedFileData = await ReportGenerationUtil.mergeDocxArray(subProjectdoc, subProjectApartments[key]._id);
            if (mergedFileData.fileName !== undefined) {
                subProjectdocSorted.push(mergedFileData.fileName);
            }
            console.log('Resulting SubprojectApartment merged file:', mergedFileData);
        }

        for (let key in subProjectLocations) {
            const subProjectdoc = await LocationReportGeneration.generateDocReportForLocation(subProjectLocations[key]._id,companyName,sectionImageProperties,reportType,subprojectName);
            // const {fileName, hashcode} = await ReportGenerationUtil.mergeDocxArray(subProjectdoc, subProjectLocations[key]._id);
            const mergedFileData = await ReportGenerationUtil.mergeDocxArray(subProjectdoc, subProjectLocations[key]._id);

            if (mergedFileData.fileName !== undefined) {
                subProjectdocSorted.push(mergedFileData.fileName);
            }
            console.log('Resulting subProjectLocations merged file:', mergedFileData);
        }

        return subProjectdocSorted;
    }
    reordersubProjectLocations (locations){
        const subProjectApartments = [];
        const subProjectLocations = [];
        for(let key in locations)
        {
            if(locations[key].type === LocationType.APARTMENT)
            {
                subProjectApartments.push(locations[key]);
            }
            else if(locations[key].type === LocationType.BUILDINGLOCATION){
                subProjectLocations.push(locations[key]);
            }
        }
        subProjectApartments.sort(function(apt1,apt2){
            return (apt1.sequenceNumber-apt2.sequenceNumber);
        });
        subProjectLocations.sort(function(loc1,loc2){
            return (loc1.sequenceNumber-loc2.sequenceNumber)});
        return {subProjectApartments,subProjectLocations};
    }
}

module.exports = new SubprojectReportGeneration();