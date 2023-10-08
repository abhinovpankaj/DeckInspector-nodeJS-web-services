const ProjectGenerator = require("./DocGenerator/ProjectGenerator");

class GenerateReport {
    constructor() {
        this.projects = new Map();
    }

    async generateReport(projectId) {
        // check if project exist in DB/List
        if  (!this.projects.has(projectId)) {
            console.log("Project not found");
            let projectDoc = await ProjectGenerator.createProject(projectId);
            this.projects.set(projectId.toString(), projectDoc);
        } else {
            await ProjectGenerator.updateProject(projectId,this.projects);
        }
        return this.projects.get(projectId.toString()).doc.filePath;

    }
}

module.exports = new GenerateReport();