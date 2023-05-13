const subProject = require("../model/subproject");
const {generateReportForLocation} = require("./locationreportgeneration.js")

const generateReportForSubProject = async function generateReportForSubProject(subProjectId)
{
    const subProjectData = await subProject.getSubProjectById(subProjectId);
    console.log("Sub Project Data : " ,subProjectData );
    const promises = [];
    const locsHtmls = [];
    for (let key in subProjectData.data.item.children) {

        const promise = generateReportForLocation(subProjectData.data.item.children[key].id)
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

exports.generateReportForSubProject = generateReportForSubProject;