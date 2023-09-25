const { generatePdfFile } = require("./generatePdfFile");
const {  generateDocFile } = require("./generateDocFile");
const ReportGeneration = require("./reportstrategy/reportGeneration.js")
const SingleProjectReportGeneration = require("./reportstrategy/singleProjectReportGeneration.js")
const projects = require("../model/project");
const DocxMerger = require("docx-merger");
const fs = require('fs');


const generateProjectReport = async function generate(projectId,sectionImageProperties,companyName,reportType,
    reportFormat,callback)
{
    try{
        const project  = await projects.getProjectById(projectId);
        
        const fileName = project.data.item.name.split(' ').join('_') + "_"+ reportType;
        if (reportFormat==='pdf') {
            const projectHtml =  await getProjectHtml(project, sectionImageProperties, reportType);
            const path = await generatePdfFile(fileName,projectHtml,companyName);
            callback( path);
        }else{
            
            var projectDocxList=  await getProjectDoc(project, sectionImageProperties,companyName, reportType,reportFormat);
            var fileList=[];
            projectDocxList.forEach(reportChunk => {
                fileList.push(fs.readFileSync(reportChunk, 'binary'));
            });
            //unlink all
            projectDocxList.forEach(filechunk=>{
                fs.unlinkSync(filechunk);
            });
            var docx = new DocxMerger({},fileList);
            const docFilePath = `${fileName}.docx`;
            docx.save('nodebuffer', function (data) {
            
                console.log('inside document save');
                 fs.writeFileSync(`${fileName}.docx`, data);
                 callback(docFilePath);
            });         
        }
        
    }
    catch(err){
        console.log(err);
        callback("");
    }
}

async function getProjectDoc(project, sectionImageProperties,companyName, reportType,reportFormat='pdf') {
    if (project.data.item.projecttype === "singlelevel") {
       return await SingleProjectReportGeneration.generateReportDoc(project,companyName, sectionImageProperties, reportType);
    }
    else if (project.data.item.projecttype  === "multilevel") {
       return await ReportGeneration.generateReportDoc(project,companyName, sectionImageProperties, reportType);
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


