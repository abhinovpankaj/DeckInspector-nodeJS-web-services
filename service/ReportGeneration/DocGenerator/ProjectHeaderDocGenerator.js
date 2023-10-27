const SingleProjectReportGeneration = require("../../reportstrategy/singleProjectReportGeneration");
const ReportDocGeneration = require("../ReportDocGeneration");
const ReportGenerationUtil = require("../ReportGenerationUtil");
const {Doc} = require("../Models/ProjectDocs");
const ProjectReportUploader = require("../projectReportUploader");
const fs = require("fs");

class ProjectHeaderDocGenerator{

    async createProjectHeaderDoc(projectId,project,companyName, reportType) {
        const projectHeaderHashCode = ReportGenerationUtil.calculateHash(project);
        const projectHeaderDoc = await this.getProjectHeaderDoc(projectId, project, companyName, null, reportType);

        let fileS3url = null;
        if (projectHeaderDoc != null) {
            fileS3url = await ProjectReportUploader.uploadToBlobStorage(projectHeaderDoc, projectId + "header", reportType);
            await fs.promises.unlink(projectHeaderDoc);
        }
        return new Doc(projectHeaderHashCode, fileS3url);
    }

    async updateProjectHeaderDoc(projectId,project,companyName, reportType,projectHeaderDoc) {
        const newProjectHeaderHashCode = ReportGenerationUtil.calculateHash(project);
        if (newProjectHeaderHashCode !== projectHeaderDoc.hashCode) {
            const projectHeaderDoc = await this.getProjectHeaderDoc(projectId, project, companyName, null, reportType);
            let fileS3url = null;
            if (projectHeaderDoc != null) {
                fileS3url = await ProjectReportUploader.uploadToBlobStorage(projectHeaderDoc, projectId + "-Header", reportType);
                await fs.promises.unlink(projectHeaderDoc);
            }
            return new Doc(newProjectHeaderHashCode, fileS3url);
        }
        return null;
    }



    async getProjectHeaderDoc(projectId,project, sectionImageProperties,companyName, reportType) {
        if (project.data.item.projecttype === "singlelevel") {
            return await SingleProjectReportGeneration.generateReportDoc(project,companyName, sectionImageProperties, reportType);
        }
        else if (project.data.item.projecttype  === "multilevel") {
            return await ReportDocGeneration.generateReportDoc(projectId,project,companyName, sectionImageProperties, reportType);
        }
    }

}
module.exports = new ProjectHeaderDocGenerator();