const { generatePdfFile } = require("./generatePdfFile");
const ReportGeneration = require("./reportstrategy/reportGeneration.js")
const SingleProjectReportGeneration = require("./reportstrategy/singleProjectReportGeneration.js")
const projects = require("../model/project");


const generateProjectReport = async function generate(projectId,sectionImageProperties,companyName,reportType)
{
    try{
        const project  = await projects.getProjectById(projectId);
        const projectHtml =  await getProjectHtml(project, sectionImageProperties, reportType);
        const fileName = project.data.item.name + "_"+ reportType;
        const path = await generatePdfFile(fileName,projectHtml,companyName);
        return path;
        }
    catch(err){
        console.log(err);
    }
}


async function getProjectHtml(project, sectionImageProperties, reportType) {
    if (project.data.item.projecttype === "singlelevel") {
       return await SingleProjectReportGeneration.generateReportHtml(project, sectionImageProperties, reportType);
    }
    else if (project.data.item.projecttype  === "multilevel") {
       return await ReportGeneration.generateReportHtml(project, sectionImageProperties, reportType);
    }
}

module.exports = { generateProjectReport};


