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

const generateProjectReport = async function generate(projectId,sectionImageProperties,companyName)
{
    
    try{
        console.log( Date.now());
        const project  = await projects.getProjectById(projectId);
        const promises = [];
        const locsHtmls = []; 
        let projectHtml = ejs.render(template, project.data.item);
        const orderedProjects = reOrderProjects(project.data.item.children);
        for (let key in orderedProjects) {
            const promise = getReport(orderedProjects[key],sectionImageProperties)
            .then((loc_html) => {
             locsHtmls[key] = loc_html;
            });
          promises.push(promise);
        }
        await Promise.all(promises);
        
        for (let key in locsHtmls) {
            projectHtml += locsHtmls[key];
        }
        
        console.log(Date.now());
        const path = await generatePdfFile(project.data.item.name,projectId,projectHtml,companyName);
        return path;
        }
    catch(err){
        console.log(err);
    }
}

const reOrderProjects = function(projects){

    const orderedProjects = [];
    const subProjects = [];
    const locations = [];
    for(let key in projects)
    {
        if(projects[key].type === "subproject")
        {
            subProjects.push(projects[key]);
        }else if(projects[key].type === "projectlocation"){
            locations.push(projects[key]);
        }
    }
    orderedProjects.push(...subProjects);
    orderedProjects.push(...locations);
    return orderedProjects;
}


const getReport = async function(child,sectionImageProperties){
    try{
        if(child.type === "projectlocation")
        {
            const loc_html =  await generateReportForLocation(child._id,sectionImageProperties);
            return loc_html;
        }else if(child.type === "subproject"){
            const subProjectHtml = await generateReportForSubProject(child._id,sectionImageProperties);
            return subProjectHtml;
        }
    }catch(error){
        console.log(error);
    }
}


module.exports = { generateProjectReport};