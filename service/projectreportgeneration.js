const { generatePdfFile } = require("./generatePdfFile");
const {  generateDocFile } = require("./generateDocFile");
const ReportGeneration = require("./reportstrategy/reportGeneration.js")
const SingleProjectReportGeneration = require("./reportstrategy/singleProjectReportGeneration.js")
const GenerateReport = require("./ReportGeneration/GenerateReport.js")
const projects = require("../model/project");
require("docx-merger");
require("./ReportGeneration/ReportGenerationUtil");


const generateProjectReport = async function generate(projectId,sectionImageProperties,companyName,reportType,
                                                      reportFormat, fileName)
{
    try{
        const project  = await projects.getProjectById(projectId);

        // const fileName = project.data.item.name.split(' ').join('_') + "_"+ reportType;
        if (reportFormat==='pdf') {
            const projectHtml =  await getProjectHtml(project, sectionImageProperties, reportType);
            const path = await generatePdfFile(fileName,projectHtml,companyName);
        }else{
            return await GenerateReport.generateReport(projectId,reportType);
        }

    }
    catch(err){
        console.log(err);
        // callback("");
    }
}

const generateLocationReportDoc = async function generate(projectId,locationId,sectionImageProperties,companyName,reportType,
                                                          reportFormat, fileName)
{
    try{
        return await GenerateReport.generateLocationReport(projectId,locationId,reportType);
    }
    catch(err){
        console.log(err);
        // callback("");
    }
}

async function getProjectDoc(projectId,project, sectionImageProperties,companyName, reportType) {
    if (project.data.item.projecttype === "singlelevel") {
        return await SingleProjectReportGeneration.generateReportDoc(project,companyName, sectionImageProperties, reportType);
    }
    else if (project.data.item.projecttype  === "multilevel") {
        return await ReportDocGeneration.generateReportDoc(projectId,project,companyName, sectionImageProperties, reportType);
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

module.exports = { generateProjectReport,getProjectHtml,generateLocationReportDoc};