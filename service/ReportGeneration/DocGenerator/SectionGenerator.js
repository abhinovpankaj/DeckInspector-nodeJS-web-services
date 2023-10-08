const sections = require("../../../model/sections");
const ReportGenerationUtil = require("../ReportGenerationUtil");
const LocationReportGeneration = require("../LocationReportGeneration");
const projectReportType = require("../../../model/projectReportType");
const {Doc} = require("../Models/ProjectDocs");

class SectionGenerator{
    async createSection(sectionId,location,subprojectName) {
        // Fetch sectionData from DB
        const sectionData = await sections.getSectionById(sectionId);
        // Calculate Hashcode
        const hashCode = ReportGenerationUtil.calculateHash(sectionData);
        // Create a Document
        const filePath = await LocationReportGeneration.createSectionDoc(sectionId,sectionData, projectReportType.VISUALREPORT,subprojectName, location,'DeckInspectors');
        return new Doc(hashCode, filePath);
    }

    async updateSection(sectionId, originalHashCode,location,subprojectName) {
        // Fetch sectionData from DB
        const sectionData = await sections.getSectionById(sectionId);
        // Calculate Hashcode
        const hashCode = ReportGenerationUtil.calculateHash(sectionData);
        if (hashCode !== originalHashCode) {
            // Create a Document
            console.log("Section Hashcode changed");
            const filePath = await LocationReportGeneration.createSectionDoc(sectionId,sectionData, projectReportType.VISUALREPORT,subprojectName, location,'DeckInspectors');
            return new Doc(hashCode, filePath);
        }
        return null;

    }
}

module.exports = new SectionGenerator();