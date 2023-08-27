const {generateReportForSubProject,generateDocReportForSubProject} = require("../subprojectreportgeneration.js");
const {generateReportForLocation,generateDocReportForLocation} = require("../sectionParts/util/locationGeneration/locationreportgeneration.js")
const ejs = require('ejs');
const path = require('path');
const fs = require('fs');
const ProjectChildType = require("../../model/projectChildType.js");
const ProjectReportType = require("../../model/projectReportType.js");
const filePath = path.join(__dirname, 'projectfile.ejs');
const template = fs.readFileSync(filePath, 'utf8');
const docxTemplate = require('docx-templates');


class ReportGeneration{
    async generateReportDoc(project,sectionImageProperties,reportType){
        try{
            console.time("generateReportDocs");
            const promises = [];
            const locsHtmls = []; 
            project.data.item.projectHeader = this.getProjectHeader(reportType);
            let projectHtml = '';//ejs.render(template, project.data.item);
            //create project header docx

            const template = fs.readFileSync('DeckProjectHeader.docx');

            const buffer = await docxTemplate.createReport({
            template,
            data: {
                project:{
                    name: project.data.item.name,
                    address: project.data.item.address,
                    description:project.data.item.description,
                    createdBy:project.data.item.createdby,
                    createdAt : project.data.item.createdat,
                    
                }               
            },
            additionalJsContext: {
                tile: async () => {
                  const resp = await fetch(
                    project.data.item.url
                  );
                  const buffer = resp.arrayBuffer
                    ? await resp.arrayBuffer()
                    : await resp.buffer();
                  return { height: 17,width: 19.8,  data: buffer, extension: '.png' };
                },
               
              },
            });

            fs.writeFileSync('projectheader.docx', buffer);

            const orderedProjects = this.reOrderProjects(project.data.item.children);
            for (let key in orderedProjects) {
                const promise = this.getReportDoc(orderedProjects[key],sectionImageProperties,reportType)
                .then((loc_html) => {
                 locsHtmls[key] = loc_html;
                });
              promises.push(promise);
            }
            await Promise.all(promises);
            
            for (let key in locsHtmls) {
                projectHtml += locsHtmls[key];
            }
            console.timeEnd("generateReportDoc");
            return projectHtml;
        }
        catch(err){
            console.log(err);
        }
    }

    
    

    async generateReportHtml(project,sectionImageProperties,reportType){
        try{
            console.time("generateReportHtml");
            const promises = [];
            const locsHtmls = []; 
            project.data.item.projectHeader = this.getProjectHeader(reportType);
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
    
    async getReportDoc(child,sectionImageProperties,reportType){
        try{
            if(child.type === ProjectChildType.PROJECTLOCATION)
            {
                const loc_html =  await generateDocReportForLocation(child._id,sectionImageProperties,reportType);
                return loc_html;
            }else if(child.type ===  ProjectChildType.SUBPROJECT){
                const subProjectHtml = await generateReportForSubProject(child._id,sectionImageProperties,reportType);
                return subProjectHtml;
            }
        }catch(error){
            console.log(error);
        }
    }
    
    async getReport(child,sectionImageProperties,reportType){
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


     getProjectHeader(reportType){
        if(ProjectReportType.VISUALREPORT === reportType)
        {
            return "Visual Inspection Report";
        }
        else if(ProjectReportType.INVASIVEONLY === reportType)
        {
            return "Invasive only Project Report";
        }
        else if(ProjectReportType.INVASIVEVISUAL === reportType)
        {   
            return "Invasive Project Report";
        }
     }
}

module.exports = new ReportGeneration();