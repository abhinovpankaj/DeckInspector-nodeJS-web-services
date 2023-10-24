const ProjectGenerator = require("./DocGenerator/ProjectGenerator");
const ProjectReportHashCodeService = require("../projectReportHashCodeService");

class GenerateReport {
    constructor() {
        this.projects = new Map();
    }

    async generateReport(projectId,reportType) {
        // check if project exist in DB/List
        const existingDoc = await ProjectReportHashCodeService.getProjctReportHashCodeByIdAndReportType(projectId,reportType);
        if  ( existingDoc == null ) {
            console.log("Project not found");
            return await ProjectGenerator.createProject(projectId,reportType);
        } else {
            return await ProjectGenerator.updateProject(projectId,existingDoc,reportType);
        }
    }
}

module.exports = new GenerateReport();