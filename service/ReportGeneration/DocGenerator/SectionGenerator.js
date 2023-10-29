const sections = require("../../../model/sections");
const ReportGenerationUtil = require("../ReportGenerationUtil");
const {Doc} = require("../Models/ProjectDocs");
const SectionWordGenerator = require("../WordGenerator/SectionWordGenerator");
const fs = require("fs");

const ProjectReportUploader = require("../../ReportGeneration/projectReportUploader");

class SectionGenerator{
    async createSection(sectionId,location,subprojectName,reportType) {
        // Fetch sectionData from DB
        const sectionData = await sections.getSectionById(sectionId);
        // Calculate Hashcode
        const hashCode = ReportGenerationUtil.calculateHash(sectionData);
        // Create a Document

        const filePath = await SectionWordGenerator.createSectionDoc(sectionId,sectionData, reportType,subprojectName, location,'DeckInspectors');
        let fileS3url = null;
        if(filePath!= null) {
            fileS3url = await ProjectReportUploader.uploadToBlobStorage(filePath, sectionId, reportType);
            await fs.promises.unlink(filePath);
        }
        return new Doc(hashCode, fileS3url);
    }

    async updateSection(sectionId, originalHashCode,location,subprojectName,reportType) {
        // Fetch sectionData from DB
        const sectionData = await sections.getSectionById(sectionId);
        // Calculate Hashcode
        const hashCode = ReportGenerationUtil.calculateHash(sectionData);
        if (hashCode !== originalHashCode) {
            // Create a Document
            console.log("Section Hashcode changed");
            const filePath = await SectionWordGenerator.createSectionDoc(sectionId,sectionData, reportType,subprojectName, location,'DeckInspectors');
            let fileS3url = null;
            if(filePath!= null) {
                fileS3url = await ProjectReportUploader.uploadToBlobStorage(filePath, sectionId, reportType);
                await fs.promises.unlink(filePath);
            }
            return new Doc(hashCode, fileS3url);
        }
        return null;

    }
}

module.exports = new SectionGenerator();