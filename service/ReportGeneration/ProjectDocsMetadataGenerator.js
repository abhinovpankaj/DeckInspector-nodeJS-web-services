const ReportDocGeneration = require("./ReportDocGeneration");
const ReportGenerationUtil = require("./ReportGenerationUtil");
const SingleProjectReportGeneration = require("../reportstrategy/singleProjectReportGeneration")
const {ProjectDoc} = require("./Models/MetadataModels");
const projects = require("../../model/project");
const {getProjectData} = require('../../service/projectmetadata/getProjectMetaData.js');
const sections = require("../../model/sections");
const invasiveSections = require("../../model/invasiveSections");
const conclusiveSections = require("../../model/conclusiveSections");
const subProject = require("../../model/subproject");
const GenerateReport = require("./GenerateReport");



class ProjectDocsMetadataGenerator {
    // Create a potototype object for the hashmap




    async getProjectDocsMetadata(projectId, sectionImageProperties,companyName, reportType,reportFormat) {
        if (this.projectDocsMetadata.has(projectId) === false)
            this.projectDocsMetadata.set(projectId, new ProjectDoc());
        let projectDoc = this.projectDocsMetadata.get(projectId);
        if (projectDoc.getMap(companyName).has(reportType) === false) {
            // const projectDocument = await this.getProjectDoc(projectId, sectionImageProperties, companyName, reportType, reportFormat);
            projectDoc.getMap(companyName).set(reportType, "projectDocument");
        }

        return await GenerateReport.generateReport(projectId);
    }

    async getProjectHeader(projectId, sectionImageProperties,companyName, reportType) {
        const project  = await projects.getProjectById(projectId);
        if (project.data.item.projecttype === "singlelevel") {
            return await SingleProjectReportGeneration.generateReportDoc(projectId,project,companyName, sectionImageProperties, reportType);
        }
        else if (project.data.item.projecttype  === "multilevel") {
            return await ReportDocGeneration.generateReportDoc(projectId, project,companyName, sectionImageProperties, reportType);
        }
    }

    getProjectDocPath(projectMetadata,companyName,reportType) {
        return projectMetadata.getMap(companyName).get(reportType).fileName + ".docx";
    }

}

module.exports = new ProjectDocsMetadataGenerator();