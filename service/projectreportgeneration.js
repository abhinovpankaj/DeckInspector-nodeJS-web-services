const { generatePdfFile } = require("./generatePdfFile");
const ReportGenerationStartegyFactoryImpl = require("./reportstrategy/reportGenerationStrategyFactory.js");
const ProjectReportType = require("../model/projectReportType.js");
const projects = require("../model/project");


const generateProjectReport = async function generate(projectId,sectionImageProperties,companyName)
{
    try{
        const project  = await projects.getProjectById(projectId);
        const reportGenerationStrategy  = ReportGenerationStartegyFactoryImpl.getReportGenerationStartegy(ProjectReportType.VISUALREPORT,sectionImageProperties);
        const projectHtml = await reportGenerationStrategy.generateReportHtml(project,sectionImageProperties);
        const path = await generatePdfFile(project.data.item.name,projectId,projectHtml,companyName);
        return path;
        }
    catch(err){
        console.log(err);
    }
}


module.exports = { generateProjectReport};