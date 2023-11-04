const ProjectGenerator = require("./DocGenerator/ProjectGenerator");
const LocationGenerator = require("./DocGenerator/LocationGenerator");
const ProjectReportHashCodeService = require("../projectReportHashCodeService");
const LocationReportHashCodeService = require("../locationReportHashCodeService");
const serialize = require("serialize-javascript");

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

    async generateLocationReport(projectId,locationId,reportType) {
        // check if project exist in DB/List
        const existingDoc = await LocationReportHashCodeService.getLocationReportHashCodeByIdAndReportType(locationId,reportType);
        if  ( existingDoc == null ) {
            let locationDoc = await LocationGenerator.createLocation(locationId,reportType);
            const serialized = serialize(locationDoc);
            const now = new Date();
            const indianTime = now.toLocaleString("en-IN", { timeZone: "Asia/Kolkata" });
            let locationDocEntity = {
                locationId: locationId,
                data: serialized,
                reportType: reportType,
                createdAt: indianTime,
            }
            await LocationReportHashCodeService.addLocationReportHashCode(locationDocEntity);
            return locationDoc;
        }
    }
}

module.exports = new GenerateReport();