const { generatePdfFile } = require("./generatePdfFile");
const {  generateDocFile } = require("./generateDocFile");
const ReportGeneration = require("./reportstrategy/reportGeneration.js")
const SingleProjectReportGeneration = require("./reportstrategy/singleProjectReportGeneration.js")
const projects = require("../model/project");
const DocxMerger = require("docx-merger");
const fs = require('fs');

const generateProjectReport = async function generate(projectId,sectionImageProperties,companyName,reportType,reportFormat)
{
    try{
        const project  = await projects.getProjectById(projectId);
        const projectHtml =  await getProjectHtml(project, sectionImageProperties, reportType);

        const fileName = project.data.item.name.split(' ').join('_') + "_"+ reportType;
        if (reportFormat==='pdf') {
            
            const path = await generatePdfFile(fileName,projectHtml,companyName);
            return path;
        }else{
            
            var projectDocxList=  await getProjectDoc(project, sectionImageProperties, reportType,reportFormat);
            var fileList=[];
            projectDocxList.forEach(reportChunk => {
                fileList.push(fs.readFileSync(reportChunk, 'binary'));
            });
            var docx = new DocxMerger({},fileList);
            const docFilePath = `${fileName}.docx`;
            docx.save('nodebuffer',function (data) {
                
                fs.writeFile(`${fileName}.docx`, data, function(err){
                    console.log(err);
                });
            });
            return docFilePath;
        }
        
    }
    catch(err){
        console.log(err);
    }
}

async function getProjectDoc(project, sectionImageProperties, reportType,reportFormat='pdf') {
    if (project.data.item.projecttype === "singlelevel") {
       return await SingleProjectReportGeneration.generateReportDoc(project, sectionImageProperties, reportType);
    }
    else if (project.data.item.projecttype  === "multilevel") {
       return await ReportGeneration.generateReportDoc(project, sectionImageProperties, reportType);
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


