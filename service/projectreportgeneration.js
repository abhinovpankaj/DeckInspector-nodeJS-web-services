const projects = require("../model/project");
const {generateReportForSubProject} = require("./subprojectreportgeneration.js");
const {generateReportForLocation} = require("./locationreportgeneration.js")
const { generatePdfFile } = require("./generatePdfFile");
const ejs = require('ejs');
const path = require('path');
const fs = require('fs');

//const projectId = "6455fe4a84fe43439af11094";
const filePath = path.join(__dirname, 'projectfile.ejs');
const template = fs.readFileSync(filePath, 'utf8');

const generateProjectReport = async function generate(projectId)
{
    try{
        const project  = await projects.getProjectById(projectId);
        const promises = [];
        const locsHtmls = []; 
        let projectHtml = ejs.render(template, project.data.item);
        for (let key in project.data.item.children) {
            const promise = getReport(project.data.item.children[key])
            .then((loc_html) => {
             locsHtmls[key] = loc_html;
            });
          promises.push(promise);
        }
        await Promise.all(promises);
        
        for (let key in locsHtmls) {
            projectHtml += locsHtmls[key];
        }
        const path = await generatePdfFile(project.data.item.name,projectId,projectHtml);
        console.log("Path : " ,path);
        return path;
        }
    catch(err){
        console.log(err);
    }
}


const getReport = async function(child){
    try{
        if(child.type === "location")
        {
            const loc_html =  await generateReportForLocation(child.id);
            return loc_html;
        }else if(child.type === "subproject"){
            const subProjectHtml = await generateReportForSubProject(child.id);
            return subProjectHtml;
        }
    }catch(error){
        console.log(error);
    }
    //console.log("Project Child : " ,child )
}


module.exports = { generateProjectReport};