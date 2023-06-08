const HtmlReportGenerationStrategy = require("./reportGenerationStrategy");
const projects = require("../../model/project");
const {generateReportForSubProject} = require("../subprojectreportgeneration.js");
const {generateReportForLocation} = require("../sectionParts/util/locationGeneration/locationreportgeneration.js")
const ejs = require('ejs');
const path = require('path');
const fs = require('fs');
const ProjectChildType = require("../../model/projectChildType.js");
const ProjectReportType = require("../../model/projectReportType.js");
const filePath = path.join(__dirname, 'projectfile.ejs');
const template = fs.readFileSync(filePath, 'utf8');

const reportType = ProjectReportType.VISUALREPORT;

class VisualReportGenerationStrategy extends HtmlReportGenerationStrategy{

    async generateReportHtml(project,sectionImageProperties){
        try{
            console.time("generateReportHtml");
            const promises = [];
            const locsHtmls = []; 
            let projectHtml = ejs.render(template, project.data.item);
            const orderedProjects = this.reOrderProjects(project.data.item.children);
            for (let key in orderedProjects) {
                const promise = this.getReport(orderedProjects[key],sectionImageProperties,reportType)
                .then((loc_html) => {
                 locsHtmls[key] = loc_html;
                });
              promises.push(promise);
            }
            await Promise.all(promises);
            
            for (let key in locsHtmls) {
                projectHtml += locsHtmls[key];
            }
            console.timeEnd("generateReportHtml");
            return projectHtml;
        }
        catch(err){
            console.log(err);
        }
    }

    reOrderProjects (projects){
        const orderedProjects = [];
        const subProjects = [];
        const locations = [];
        for(let key in projects)
        {
            if(projects[key].type === ProjectChildType.SUBPROJECT)
            {
                subProjects.push(projects[key]);
            }else if(projects[key].type === ProjectChildType.PROJECTLOCATION){
                locations.push(projects[key]);
            }
        }
        orderedProjects.push(...subProjects);
        orderedProjects.push(...locations);
        return orderedProjects;
    }
    
    
    async getReport(child,sectionImageProperties){
        try{
            if(child.type === ProjectChildType.PROJECTLOCATION)
            {
                const loc_html =  await generateReportForLocation(child._id,sectionImageProperties,reportType);
                return loc_html;
            }else if(child.type ===  ProjectChildType.SUBPROJECT){
                const subProjectHtml = await generateReportForSubProject(child._id,sectionImageProperties,reportType);
                return subProjectHtml;
            }
        }catch(error){
            console.log(error);
        }
    }
    
}

module.exports = VisualReportGenerationStrategy;

