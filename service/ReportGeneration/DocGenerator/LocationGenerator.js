const locations = require("../../../model/location");
const {LocationDoc, Doc} = require("../Models/ProjectDocs");
const ReportGenerationUtil = require("../ReportGenerationUtil");
const SectionGenerator = require("./SectionGenerator");

class LocationGenerator{
    async createLocation(locationId, subprojectName='') {
        const location = await locations.getLocationById(locationId);
        let locationSections = location.data.item.sections;
        let locationDoc = new LocationDoc();
        if (locationSections) {
            let locationMetaDataHashCode = ReportGenerationUtil.calculateHash(location);
            let locationSectionHashCodes = [];
            let sectionPath = [];
            for (const section of locationSections) {
                const sectionDoc = await SectionGenerator.createSection(section._id,location,subprojectName);
                locationSectionHashCodes.push(sectionDoc.hashCode);
                locationDoc.sectionMap.set(section._id.toString(), sectionDoc);
                sectionPath.push(sectionDoc.filePath);

            }

            locationSectionHashCodes.push(locationMetaDataHashCode);
            const locationHashCode = ReportGenerationUtil.combineHashesInArray(locationSectionHashCodes);
            const filePath = await ReportGenerationUtil.mergeDocxArray(sectionPath, locationId);
            locationDoc.doc = new Doc(locationHashCode, filePath);
            return locationDoc;
        }
    }

    async updateLocation(locationId,locationDoc,subprojectName='') {
        const location = await locations.getLocationById(locationId);
        let locationSections = location.data.item.sections;
        let originalHashCode = locationDoc.doc.hashCode;
        let sectionMap = locationDoc.sectionMap;
        let newSectionMap = new Map();

        if (locationSections) {
            let locationMetaDataHashCode = ReportGenerationUtil.calculateHash(location);
            let locationSectionHashCodes = [];
            let sectionPath = [];
            for (const section of locationSections) {
                if (sectionMap.has(section._id.toString())){
                    const sectionDoc = await SectionGenerator.updateSection(section._id, sectionMap.get(section._id.toString()).hashCode,location,subprojectName);
                    if (sectionDoc !== null) {
                        // Section Doc is updated
                        sectionMap.set(section._id.toString(), sectionDoc);
                    }
                } else {
                    console.log("New Section is added");
                    const sectionDoc = await SectionGenerator.createSection(section._id,location,subprojectName);
                    sectionMap.set(section._id.toString(), sectionDoc);
                }

                let newSectionDoc = sectionMap.get(section._id.toString());
                newSectionMap.set(section._id.toString(), newSectionDoc);
                locationSectionHashCodes.push(newSectionDoc.hashCode);
                sectionPath.push(newSectionDoc.filePath);
            }
            locationDoc.sectionMap = newSectionMap;
            locationSectionHashCodes.push(locationMetaDataHashCode);
            const locationHashCode = ReportGenerationUtil.combineHashesInArray(locationSectionHashCodes);
            if (locationHashCode !== originalHashCode) {
                console.log('Location Doc is changed');
                const filePath = await ReportGenerationUtil.mergeDocxArray(sectionPath, locationId);
                return new Doc(locationHashCode, filePath);
            }
        }
        return null;  // No update needed.  Location doc is unchanged.
    }
}

module.exports = new LocationGenerator();