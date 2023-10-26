const { generatePdfFile } = require("./generatePdfFile");
const {  generateDocFile } = require("./generateDocFile");
const ReportGeneration = require("./reportstrategy/reportGeneration.js")
const SingleProjectReportGeneration = require("./reportstrategy/singleProjectReportGeneration.js")
const GenerateReport = require("./ReportGeneration/GenerateReport.js")
const projects = require("../model/project");
const DocxMerger = require("docx-merger");
const ReportGenerationUtil = require("./ReportGeneration/ReportGenerationUtil");
const ReportDocGeneration = require("./ReportGeneration/ReportDocGeneration");


const generateProjectReport = async function generate(projectId,sectionImageProperties,companyName,reportType,
                                                      reportFormat, fileName)
{
    try{
        const project  = await projects.getProjectById(projectId);

        // const fileName = project.data.item.name.split(' ').join('_') + "_"+ reportType;
        if (reportFormat==='pdf') {
            const projectHtml =  await getProjectHtml(project, sectionImageProperties, reportType);
            const path = await generatePdfFile(fileName,projectHtml,companyName);
            // callback( path);
        }else{
            const projectHeader = await getProjectDoc(projectId,project, sectionImageProperties, companyName, reportType);
            const projectPath = await GenerateReport.generateReport(projectId,reportType);
            await ReportGenerationUtil.mergeDocxArray([projectHeader,projectPath], fileName);
        }

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

module.exports = { generateProjectReport,getProjectHtml};