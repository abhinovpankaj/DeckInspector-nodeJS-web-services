const { generatePdfFile } = require("./generatePdfFile");
const ReportGeneration = require("./reportstrategy/reportGeneration.js")
const projects = require("../model/project");


const generateProjectReport = async function generate(projectId,sectionImageProperties,companyName,reportType)
{
    try{
        const project  = await projects.getProjectById(projectId);
        const projectHtml = await ReportGeneration.generateReportHtml(project,sectionImageProperties,reportType);
        const path = await generatePdfFile(project.data.item.name,projectId,projectHtml,companyName);
        return path;
        }
    catch(err){
        console.log(err);
    }
}


module.exports = { generateProjectReport};