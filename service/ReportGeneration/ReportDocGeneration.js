const fs = require("fs");
require("docx-templates");
const ReportGenerationUtil = require("./ReportGenerationUtil.js");
const SubprojectReportGeneration = require("./SubprojectReportGeneration.js");
const LocationReportGeneration = require("./LocationReportGeneration.js");
const ProjectChildType = require("../../model/projectChildType");
const ProjectReportType = require("../../model/projectReportType");
const ProjectReportUploader = require("./projectReportUploader");


class ReportDocGeneration {
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
    async generateReportDoc(projectId, project,companyName,sectionImageProperties,reportType){
        try{
            console.time("generateReportDocs");
            project.data.item.projectHeader = this.getProjectHeader(reportType);
            const template = this.getTemplate(companyName);

            const createdAtString = project.data.item.createdat;
            const date = new Date(createdAtString);
            const data = {
                project:{
                    reportType: reportType,
                    name: project.data.item.name,
                    address: project.data.item.address,
                    description:project.data.item.description,
                    createdBy:project.data.item.createdby,
                    createdAt : date.toLocaleString(),

                }
            };
            const filePath = projectId + '-projectheader.docx'
            const additionalJsContext = {
                tile: async () => {
                    const projurl = project.data.item.url === '' ? 'https://www.deckinspectors.com/wp-content/uploads/2020/07/logo_new_new-1.png' :
                        project.data.item.url;
                    const resp = await fetch(
                        projurl
                    );
                    const buffer = resp.arrayBuffer
                        ? await resp.arrayBuffer()
                        : await resp.buffer();
                    return { height: 15,width: 19.8,  data: buffer, extension: '.png' };
                },
            };
            const buffer = await ReportGenerationUtil.createDocReportWithParams(template,data,additionalJsContext)
            fs.writeFileSync(filePath, buffer);
            const filepath = await ProjectReportUploader.uploadToBlobStorage(filePath, projectId+"Header", reportType);
            return filepath;
        }
        catch(err){
            console.log(err);
        }
    }


    getTemplate(companyName) {
        if (companyName === 'Wicr') {
            return fs.readFileSync('WicrProjectHeader.docx');
        } else {
            return fs.readFileSync('DeckProjectHeader.docx');
        }
    }

    reOrderAndGroupProjects (projects){
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
        return {subProjects,locations};
    }

    async getReportDoc(child,companyName,sectionImageProperties,reportType){
        try{
            if(child.type === ProjectChildType.PROJECTLOCATION)
            {
                return await LocationReportGeneration.generateDocReportForLocation(child._id, companyName, sectionImageProperties, reportType);
            }else if(child.type ===  ProjectChildType.SUBPROJECT){
                return await SubprojectReportGeneration.generateDocReportForSubProject(child._id, companyName, sectionImageProperties, reportType);
            }
        }catch(error){
            console.log(error);
        }
    }
}

module.exports = new ReportDocGeneration();