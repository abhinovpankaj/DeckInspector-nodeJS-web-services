const locations = require("../../../model/location");
const {LocationDoc, Doc} = require("../Models/ProjectDocs");
const ReportGenerationUtil = require("../ReportGenerationUtil");
const SectionGenerator = require("./SectionGenerator");
const ProjectReportUploader = require("../projectReportUploader");
const fs = require("fs");
const LocationReportHashCodeService = require("../../locationReportHashCodeService");
const serialize = require("serialize-javascript");

class LocationGenerator {
    async createLocation(locationId, reportType, subprojectName = '') {
        console.log("Location creation started:", locationId);
        let existingDoc = await LocationReportHashCodeService.getLocationReportHashCodeByIdAndReportType(locationId,reportType);
        existingDoc = eval('(' + existingDoc + ')')
        const existingHashCode = existingDoc ? existingDoc.doc.hashCode : null;
        const location = await locations.getLocationById(locationId);
        let locationSections = location.data.item.sections;
        let locationDoc = new LocationDoc();
        if (locationSections) {
            let locationMetaDataHashCode = ReportGenerationUtil.calculateHash(location);
            if (existingHashCode != null) {
                  return existingDoc;
            }
            let locationSectionHashCodes = [];
            let sectionPath = [];
            try {
                for (const section of locationSections) {
                    const sectionDoc = await SectionGenerator.createSection(section._id, location, subprojectName, reportType);
                    if (sectionDoc != null) {
                        locationDoc.sectionMap.set(section._id.toString(), sectionDoc);
                        locationSectionHashCodes.push(sectionDoc.hashCode);
                        sectionPath.push(sectionDoc.filePath);
                    }
                }
                locationSectionHashCodes.push(locationMetaDataHashCode);
                const locationHashCode = ReportGenerationUtil.combineHashesInArray(locationSectionHashCodes);
                const filePath = await ReportGenerationUtil.mergeDocxArray(sectionPath, locationId);
                let fileS3url = null;
                if (filePath != null) {
                    fileS3url = await ProjectReportUploader.uploadToBlobStorage(filePath, locationId, reportType);
                    await fs.promises.unlink(filePath);
                }
                locationDoc.doc = new Doc(locationHashCode, fileS3url);
                await this.saveLocationDoc(locationId, locationDoc, reportType);
            } catch (e) {
                console.error(e);
                console.error("Location creation failed:", locationId)
                throw e;
            }
        }
        console.log("Location creation completed:", locationId);
        return locationDoc;
    }

    async updateLocation(locationId, locationDoc, reportType, subprojectName = '') {
        const location = await locations.getLocationById(locationId);
        let locationSections = location.data.item.sections;
        let originalHashCode = locationDoc.doc.hashCode;
        let sectionMap = locationDoc.sectionMap;
        let newSectionMap = new Map();

        if (locationSections) {
            try {
                let locationMetaDataHashCode = ReportGenerationUtil.calculateHash(location);
                let locationSectionHashCodes = [];
                let sectionPath = [];
                for (const section of locationSections) {
                    if (sectionMap.has(section._id.toString())) {
                        const sectionDoc = await SectionGenerator.updateSection(section._id, sectionMap.get(section._id.toString()).hashCode, location, subprojectName, reportType);
                        if (sectionDoc !== null) {
                            // Section Doc is updated
                            sectionMap.set(section._id.toString(), sectionDoc);
                        }
                    } else {
                        const sectionDoc = await SectionGenerator.createSection(section._id, location, subprojectName, reportType);
                        sectionMap.set(section._id.toString(), sectionDoc);
                    }
                    let newSectionDoc = sectionMap.get(section._id.toString());
                    if (newSectionDoc != null) {
                        newSectionMap.set(section._id.toString(), newSectionDoc);
                        locationSectionHashCodes.push(newSectionDoc.hashCode);
                        sectionPath.push(newSectionDoc.filePath);
                    }
                }
                locationDoc.sectionMap = newSectionMap;
                locationSectionHashCodes.push(locationMetaDataHashCode);
                const locationHashCode = ReportGenerationUtil.combineHashesInArray(locationSectionHashCodes);
                if (locationHashCode !== originalHashCode) {
                    console.log('Location Doc is changed', locationId);
                    const filePath = await ReportGenerationUtil.mergeDocxArray(sectionPath, locationId);
                    let fileS3url = null;
                    if (filePath != null) {
                        fileS3url = await ProjectReportUploader.uploadToBlobStorage(filePath, locationId, reportType);
                        await fs.promises.unlink(filePath);
                    }
                    console.log('Location update completed', locationId);
                    locationDoc.doc = new Doc(locationHashCode, fileS3url);
                    await this.saveLocationDoc(locationId, locationDoc, reportType)
                    return new Doc(locationHashCode, fileS3url);
                }
            } catch (e) {
                console.error(e);
                console.error("Failed for location :", locationId);
                return null;
            }

        }
        return null;  // No update needed.  Location doc is unchanged.
    }

     async saveLocationDoc(locationId,locationDoc, reportType) {
        const serialized = serialize(locationDoc);
        const now = new Date();
        const indianTime = now.toLocaleString("en-IN", { timeZone: "Asia/Kolkata" });
        let locationDocEntity = {
            locationId: locationId,
            data: serialized,
            reportType: reportType,
            createdAt: indianTime,
        }
        await LocationReportHashCodeService.deleteLocationReportHashCodeByIdAndReportType(locationId,reportType);
        await LocationReportHashCodeService.addLocationReportHashCode(locationDocEntity);
    }
}

module.exports = new LocationGenerator();