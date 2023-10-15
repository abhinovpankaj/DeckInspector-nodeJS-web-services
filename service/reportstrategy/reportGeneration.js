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
const blobManager = require("../../database/uploadimage");
const jo = require('jpeg-autorotate');


class ReportGeneration{
    async generateReportDoc(project,companyName,sectionImageProperties,reportType){
        try{
         //   console.time("generateReportDocs");
            const promises = [];
            const reportDocList = []; 
            project.data.item.projectHeader = this.getProjectHeader(reportType);
            let projectHtml = ['projectheader.docx'];//ejs.render(template, project.data.item);
            //create project header docx
            var template;
            if (companyName=='Wicr') {
                template = fs.readFileSync('WicrProjectHeader.docx');
            }else{
                template = fs.readFileSync('DeckProjectHeader.docx');
            }
            
            var createdAtString = project.data.item.createdat;
            var date = new Date(createdAtString);
            const buffer = await docxTemplate.createReport({
            template,
            data: {
                project:{
                    reportType: reportType,
                    name: project.data.item.name,
                    address: project.data.item.address,
                    description:project.data.item.description,
                    createdBy:project.data.item.createdby,
                    createdAt : date.toLocaleString(),
                    
                }               
            },
            additionalJsContext: {
                tile: async () => {
                    var projurl = project.data.item.url===''?'https://deckinspectors.blob.core.windows.net/testproject/deck_logo.jpg':
                    project.data.item.url;

                    var urlArray = projurl.toString().split('/');
                    var imageBuffer ;
                    if (projurl.includes('deckinspectorsappdata')) {
                        imageBuffer = await blobManager.getBlobBuffer(urlArray[urlArray.length-1],urlArray[urlArray.length-2]);
                    }else{
                        imageBuffer = await blobManager.getBlobBufferFromOld(urlArray[urlArray.length-1],urlArray[urlArray.length-2]);
                    }
                    
                    if (imageBuffer===undefined) {
                      console.log('Failed to load image .');
                      return;
                    }
                  
                  const extension  = path.extname(projurl);
                  try {
                    var {buffer} = await jo.rotate(Buffer.from(imageBuffer), {quality:50});
                    return { height: 15,width: 19.8,  data: buffer, extension: extension };
                  } catch (error) {
                    //console.log('An error occurred when rotating the file: ' + error);
                    return { height: 15,width: 19.8,  data: imageBuffer, extension: extension };
                  }                                                  
                },
               
              },
            });

            fs.writeFileSync('projectheader.docx', buffer);

            const orderedProjects = this.reOrderProjects(project.data.item.children);
            for (let key in orderedProjects) {
                const promise = this.getReportDoc(orderedProjects[key],companyName,sectionImageProperties,reportType)
                .then((loc_doc) => {
                 
                 reportDocList[key]=loc_doc;
                });
              promises.push(promise);
            }
            await Promise.all(promises);
            
            for (let key in reportDocList) {
                projectHtml.push(...reportDocList[key]);
            }
            //console.timeEnd("generateReportDoc");
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
        subProjects.sort(function(subProj1,subProj2){
            return (subProj1.sequenceNumber-subProj2.sequenceNumber);
        });
        locations.sort(function(loc1,loc2){
            return (loc1.sequenceNumber-loc2.sequenceNumber);
        });
        orderedProjects.push(...subProjects);
        orderedProjects.push(...locations);
        return orderedProjects;
    }
    
    async getReportDoc(child,companyName,sectionImageProperties,reportType){
        try{
            if(child.type === ProjectChildType.PROJECTLOCATION)
            {
                const loc_html =  await generateDocReportForLocation(child._id,companyName,sectionImageProperties,reportType);
                return loc_html;
            }else if(child.type ===  ProjectChildType.SUBPROJECT){
                const subProjectHtml = await generateDocReportForSubProject(child._id,companyName,sectionImageProperties,reportType);
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