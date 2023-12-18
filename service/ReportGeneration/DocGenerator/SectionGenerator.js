const sections = require("../../../model/sections");
const invasiveSections = require("../../../model/invasiveSections");
const conclusiveSections = require("../../../model/conclusiveSections");
const ReportGenerationUtil = require("../ReportGenerationUtil");
const {Doc} = require("../Models/ProjectDocs");
const SectionWordGenerator = require("../WordGenerator/SectionWordGenerator");
const fs = require("fs");

const ProjectReportUploader = require("../../ReportGeneration/projectReportUploader");

class SectionGenerator{
    async createSection(sectionId,location,subprojectName,reportType) {
        // Fetch sectionData from DB
        let sectionHashCodes = [];
        const sectionData = await sections.getSectionById(sectionId);
        const hashCode = ReportGenerationUtil.calculateHash(sectionData);
        sectionHashCodes.push(hashCode);
        if (reportType!=='Visual') {
            const conclusiveData = await conclusiveSections.getConclusiveSectionByParentId(sectionId);
            const invasiveData = await invasiveSections.getInvasiveSectionByParentId(sectionId);
            const invasiveHashCode = ReportGenerationUtil.calculateHash(invasiveData);
            const conclusiveHashCode = ReportGenerationUtil.calculateHash(conclusiveData);
            sectionHashCodes.push(invasiveHashCode);
            sectionHashCodes.push(conclusiveHashCode);
        }
        
        // Calculate Hashcode
        const combinedHashes = ReportGenerationUtil.combineHashesInArray(sectionHashCodes);
        // Create a Document
        return await this.createSectionDoc(sectionId, sectionData, reportType, subprojectName, location, combinedHashes);
    }

    async updateSection(sectionId, originalHashCode,location,subprojectName,reportType) {
        // Fetch sectionData from DB
        const sectionData = await sections.getSectionById(sectionId);
        // Calculate Hashcode
        const hashCode = ReportGenerationUtil.calculateHash(sectionData);
        let sectionHashCodes = [];
       
        sectionHashCodes.push(hashCode);
        if (reportType!=='Visual') {
            const conclusiveData = await conclusiveSections.getConclusiveSectionByParentId(sectionId);
            const invasiveData = await invasiveSections.getInvasiveSectionByParentId(sectionId);
            const invasiveHashCode = ReportGenerationUtil.calculateHash(invasiveData);
            const conclusiveHashCode = ReportGenerationUtil.calculateHash(conclusiveData);
            sectionHashCodes.push(invasiveHashCode);
            sectionHashCodes.push(conclusiveHashCode);
        }
        const combinedHashes = ReportGenerationUtil.combineHashesInArray(sectionHashCodes);
        if (combinedHashes !== originalHashCode) {
            // Create a Document
            console.log("Section Hashcode changed for SectionID :"+sectionId);
            return await this.createSectionDoc(sectionId, sectionData, reportType, subprojectName, location, combinedHashes);
        }
        return null;

    }

    async createSectionDoc(sectionId, sectionData, reportType, subprojectName, location, hashCode) {
        try {
            console.log("Creation of Section Doc started :", sectionId);
            const filePath = await SectionWordGenerator.createSectionDoc(sectionId, sectionData, reportType, subprojectName, location, 'DeckInspectors');
            let fileS3url = null;
            if (filePath != null) {
                fileS3url = await ProjectReportUploader.uploadToBlobStorage(filePath, sectionId, reportType);
                await fs.promises.unlink(filePath);
            }
            console.log("Section doc completed :", sectionId);
            return new Doc(hashCode, fileS3url);
        } catch (e) {
            console.error(e);
            console.error("Failed for section :", sectionId);
            throw e;
        }
    }
}

module.exports = new SectionGenerator();