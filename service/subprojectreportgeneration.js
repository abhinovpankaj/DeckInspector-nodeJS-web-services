const subProject = require("../model/subproject");
const {generateReportForLocation} = require("./sectionParts/util/locationGeneration/locationreportgeneration.js")
const LocationType = require("../model/locationType.js");
const generateReportForSubProject = async function generateReportForSubProject(subProjectId,sectionImageProperties,reportType)
{
    const subProjectData = await subProject.getSubProjectById(subProjectId);
    const promises = [];
    const locsHtmls = [];
    const orderdLocationsInSubProject = reordersubProjectLocations(subProjectData.data.item.children);
    for (let key in orderdLocationsInSubProject) {
        const promise = generateReportForLocation(orderdLocationsInSubProject[key]._id,sectionImageProperties,reportType)
            .then((loc_html) => {
             locsHtmls[key] = loc_html;
            });
        promises.push(promise);
        
    }
    await Promise.all(promises);
    let subProjectHtml = '';
    for (let key in locsHtmls) {
        subProjectHtml += locsHtmls[key];
    }
    return subProjectHtml;
}

const reordersubProjectLocations = function(locations){
    const orderedlocationsInSubProjects = [];
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
    orderedlocationsInSubProjects.push(...subProjectApartments);
    orderedlocationsInSubProjects.push(...subProjectLocations);
    return orderedlocationsInSubProjects;
}

exports.generateReportForSubProject = generateReportForSubProject;