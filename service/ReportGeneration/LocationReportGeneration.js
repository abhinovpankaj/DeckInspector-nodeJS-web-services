const locations = require("../../model/location");
const projectReportType = require("../../model/projectReportType");
const sections = require("../../model/sections");
const invasiveSections = require("../../model/invasiveSections");
const ProjectReportType = require("../../model/projectReportType");
const conclusiveSections = require("../../model/conclusiveSections");
const fs = require("fs");
require("docx-templates");
const path = require("path");
const jo = require("jpeg-autorotate");
const ReportGenerationUtil = require("./ReportGenerationUtil");

class LocationReportGeneration {

    async getLocationDoc (sectionId,template,sectionDocValues){
        try {
            let data = {
                section: sectionDocValues
            }
            let additionalJsContext = {

                getChunks : async (imageArray,chunk_size=4) => {
                    let index = 0;
                    const tempArray = [];
                    if (imageArray===undefined) {
                    return tempArray;
                }
                    const arrayLength = imageArray.length;
                    for (index = 0; index < arrayLength; index += chunk_size) {
                    let myChunk = imageArray.slice(index, index+chunk_size);

                    tempArray.push(myChunk);
                }

                return tempArray;
            },
            tile: async (imageUrl) => {

                if (imageUrl===undefined) {

                    return;
                }
                if (!imageUrl.startsWith('http')) {
                    //imageurl = 'https://www.deckinspectors.com/wp-content/uploads/2020/07/logo_new_new-1.png';
                    return;
                }
                console.log(imageUrl);
                try {
                    const resp = await fetch(
                        imageUrl
                    );
                    if (resp.ok) {
                        const imagebuffer = resp.arrayBuffer
                            ? await resp.arrayBuffer()
                            : await resp.buffer();
                        const extension  = path.extname(imageUrl);
                        //fix image rotation
                        try {
                            const {buffer} = await jo.rotate(Buffer.from(imagebuffer), {quality: 50});

                            return { height: 6.2,width: 4.85,  data: buffer, extension: extension };
                        } catch (error) {
                            console.log('An error occurred when rotating the file: ' + error);
                            return { height: 6.2,width: 4.85,  data: imagebuffer, extension: extension };
                        }
                    }else{

                    }
                } catch (error) {
                    console.log(error);

                }
            },
        }
            const buffer = await ReportGenerationUtil.createDocReportWithParams(template,data,additionalJsContext);
            const filename = sectionId + '.docx';
            fs.writeFileSync(filename, buffer);
            return filename;
        } catch (error) {
            console.log(error);
            return "";
        }

    }
    getLocationType(location) {
        let locationType = '';
        if (location.data.item.type === 'buildinglocation') {
            locationType = "Building Common"
        }
        if (location.data.item.type === 'apartment') {
            locationType = "Apartment"
        }
        if (location.data.item.type === 'projectlocation') {
            locationType = "Project Common"
        }
        return locationType;
    }

    getTemplate(companyName, subprojectName) {
        if (companyName === 'Wicr') {
            if (subprojectName === '') {
                return fs.readFileSync('Wicr2AllData.docx');
            } else {
                return fs.readFileSync('WicrAllData.docx');
            }
        } else {
            if (subprojectName === '') {
                return fs.readFileSync('Deck2AllData.docx');
            } else {
                return fs.readFileSync('DeckAllData.docx');
            }
        }
    }

    isSectionIncluded (reportType, section) {
        if (reportType === projectReportType.INVASIVEONLY || reportType === projectReportType.INVASIVEVISUAL) {
            return section.furtherinvasivereviewrequired === true;
        } else if (reportType === projectReportType.VISUALREPORT) {
            return true;
        }
    }

    async createSectionDoc(sectionId,sectionData, reportType, subprojectName, location, companyName) {
        if (this.isSectionIncluded(reportType, sectionData)) {
        const locationType = this.getLocationType(location);
        const invasiveSectionData = await invasiveSections.getInvasiveSectionByParentId(sectionId);
        const template = this.getTemplate(companyName, subprojectName);
        const baseSectionDocValues = {
            isUnitUnavailable: sectionData.data.item.unitUnavailable ? 'true' : 'false',
            reportType: reportType,
            buildingName: subprojectName,
            parentType: locationType,
            parentName: location.data.item.name,
            name: sectionData.data.item.name,
        };

        let sectionDocValues = { ...baseSectionDocValues };
        if (reportType === projectReportType.INVASIVEONLY || reportType === projectReportType.INVASIVEVISUAL) {
            if (location.data.item.isInvasive && location.data.item.isInvasive === true) {
                sectionDocValues = {
                    ...sectionDocValues,
                    exteriorelements: sectionData.data.item.exteriorelements?.toString().replaceAll(',', ', '),
                    waterproofing: sectionData.data.item.waterproofingelements?.toString().replaceAll(',', ', '),
                    visualreview: sectionData.data.item.visualreview,
                    signsofleak: sectionData.data.item.visualsignofleak === 'True' ? 'Yes' : 'No',
                    furtherinvasive: sectionData.data.item.furtherinvasivereviewrequired === 'True' ? 'Yes' : 'No',
                    conditionalassesment: sectionData.data.item.conditionalassessment === 'Futureinspection' ? 'Future Inspection' : sectionData.data.item.conditionalassessment,
                    additionalconsiderations: sectionData.data.item.additionalconsiderations,
                    eee: sectionData.data.item.eee,
                    lbc: sectionData.data.item.lbc,
                    awe: sectionData.data.item.awe,
                    images: sectionData.data.item.images,
                    furtherInvasiveRequired: false,
                    invasiveDesc: 'Invasive inspection not done',
                    invasiveImages: ['https://www.deckinspectors.com/wp-content/uploads/2020/07/logo_new_new-1.png'],
                    invasiverepairsinspectedandcompleted: false,
                };

                if (reportType === ProjectReportType.INVASIVEONLY && invasiveSectionData.data && invasiveSectionData.data.item) {
                    const conclusiveSectionData = await conclusiveSections.getConclusiveSectionByParentId(sectionId);

                    if (conclusiveSectionData.data && conclusiveSectionData.data.item) {
                        sectionDocValues.furtherInvasiveRequired = invasiveSectionData.data.item.postinvasiverepairsrequired ? 'true' : 'false';
                        sectionDocValues.invasiveDesc = invasiveSectionData.data.item.invasiveDescription;
                        sectionDocValues.invasiveImages = invasiveSectionData.data.item.invasiveimages;
                        sectionDocValues.conclusiveImages = conclusiveSectionData.data.item.conclusiveimages;
                        sectionDocValues.propowneragreed = conclusiveSectionData.data.item.propowneragreed ? 'true' : 'false';
                        sectionDocValues.invasiverepairsinspectedandcompleted = conclusiveSectionData.data.item.invasiverepairsinspectedandcompleted ? 'true' : 'false';
                    }
                }
            }
        } else if (reportType === projectReportType.VISUALREPORT) {
            if (!sectionData.data.item.unitUnavailable) {
                sectionDocValues = {
                    ...sectionDocValues,
                    exteriorelements: sectionData.data.item.exteriorelements?.toString().replaceAll(',', ', '),
                    waterproofing: sectionData.data.item.waterproofingelements?.toString().replaceAll(',', ', '),
                    visualreview: sectionData.data.item.visualreview,
                    signsofleak: sectionData.data.item.visualsignofleak === 'True' ? 'Yes' : 'No',
                    furtherinvasive: sectionData.data.item.furtherinvasivereviewrequired === 'True' ? 'Yes' : 'No',
                    conditionalassesment: sectionData.data.item.conditionalassessment === 'Futureinspection' ? 'Future Inspection' : sectionData.data.item.conditionalassessment,
                    additionalconsiderations: sectionData.data.item.additionalconsiderations,
                    eee: sectionData.data.item.eee,
                    lbc: sectionData.data.item.lbc,
                    awe: sectionData.data.item.awe,
                    images: sectionData.data.item.images,
                };
            }
        } else {
            return "";
        }
        return await this.getLocationDoc(sectionData.data.item._id, template, sectionDocValues);
        }
    }

    async generateDocReportForLocation(locationId, companyName, sectionImageProperties, reportType, subprojectName = '')
    {
        let mysections;
        try {
            const sectionDataDoc = [];
            const location = await locations.getLocationById(locationId);

            if (!location.data) {
                return "";
            } else {
                mysections = location.data.item.sections;
                if (!mysections) {
                    return "";
                }
                const newSections = mysections.filter(section => this.isSectionIncluded(reportType, section));
                await Promise.all(newSections.map((section) => this.createSectionDoc(section, reportType, subprojectName, location, companyName)));

                // if (reportType === projectReportType.INVASIVEONLY || reportType === projectReportType.INVASIVEVISUAL) {
                //     if (location.data.item.isInvasive && location.data.item.isInvasive === true) {
                //         await Promise.all(newSections.map(async (section, index) => {
                //             const sectionData = await sections.getSectionById(section._id);
                //             const invasiveSectionData = await invasiveSections.getInvasiveSectionByParentId(section._id);
                //             if (sectionData.data && sectionData.data.item) {
                //                 const sectionDocValues = {
                //                     exteriorelements: sectionData.data.item.exteriorelements?.toString().replaceAll(',', ', '),
                //                     waterproofing: sectionData.data.item.waterproofingelements?.toString().replaceAll(',', ', '),
                //                     visualreview: sectionData.data.item.visualreview,
                //                     signsofleak: sectionData.data.item.visualsignofleak === 'True' ? 'Yes' : 'No',
                //                     furtherinvasive: sectionData.data.item.furtherinvasivereviewrequired === 'True' ? 'Yes' : 'No',
                //                     conditionalassesment: sectionData.data.item.conditionalassessment === 'Futureinspection' ? 'Future Inspection' : sectionData.data.item.conditionalassessment,
                //                     additionalconsiderations: sectionData.data.item.additionalconsiderations,
                //                     eee: sectionData.data.item.eee,
                //                     lbc: sectionData.data.item.lbc,
                //                     awe: sectionData.data.item.awe,
                //                     images: sectionData.data.item.images,
                //                     furtherInvasiveRequired: false,
                //                     invasiveDesc: 'Invasive inspection not done',
                //                     invasiveImages: ['https://www.deckinspectors.com/wp-content/uploads/2020/07/logo_new_new-1.png'],
                //                     invasiverepairsinspectedandcompleted: false,
                //                 };
                //                 if (reportType === ProjectReportType.INVASIVEONLY && invasiveSectionData.data && invasiveSectionData.data.item) {
                //                     const conclusiveSectionData = await conclusiveSections.getConclusiveSectionByParentId(section._id);
                //
                //                     if (conclusiveSectionData.data && conclusiveSectionData.data.item) {
                //                         sectionDocValues.furtherInvasiveRequired = invasiveSectionData.data.item.postinvasiverepairsrequired ? 'true' : 'false';
                //                         sectionDocValues.invasiveDesc = invasiveSectionData.data.item.invasiveDescription;
                //                         sectionDocValues.invasiveImages = invasiveSectionData.data.item.invasiveimages;
                //                         sectionDocValues.conclusiveImages = conclusiveSectionData.data.item.conclusiveimages;
                //                         sectionDocValues.propowneragreed = conclusiveSectionData.data.item.propowneragreed ? 'true' : 'false';
                //                         sectionDocValues.invasiverepairsinspectedandcompleted = conclusiveSectionData.data.item.invasiverepairsinspectedandcompleted ? 'true' : 'false';
                //                     }
                //                 }
                //                 const filename = await this.getLocationDoc(sectionData.data.item._id, template, sectionDocValues);
                //                 sectionDataDoc.push(filename);
                //             }
                //         }
                //         ));
                //         return sectionDataDoc;
                //     }
                //     else {
                //         return "";
                //     }
                // }
                // else if (reportType === projectReportType.VISUALREPORT) {
                //      await Promise.all(newSections.map(async (section, index) => {
                //         const sectionData = await sections.getSectionById(section._id);
                //         if (sectionData.data && sectionData.data.item) {
                //             const baseSectionDocValues = {
                //                 isUnitUnavailable: sectionData.data.item.unitUnavailable ? 'true' : 'false',
                //                 reportType: reportType,
                //                 buildingName: subprojectName,
                //                 parentType: locationType,
                //                 parentName: location.data.item.name,
                //                 name: sectionData.data.item.name,
                //             };
                //
                //             let sectionDocValues = { ...baseSectionDocValues };
                //
                //             if (!sectionData.data.item.unitUnavailable) {
                //                 sectionDocValues = {
                //                     ...sectionDocValues,
                //                     exteriorelements: sectionData.data.item.exteriorelements?.toString().replaceAll(',', ', '),
                //                     waterproofing: sectionData.data.item.waterproofingelements?.toString().replaceAll(',', ', '),
                //                     visualreview: sectionData.data.item.visualreview,
                //                     signsofleak: sectionData.data.item.visualsignsofleak === 'True' ? 'Yes' : 'No',
                //                     furtherinvasive: sectionData.data.item.furtherinvasivereviewrequired === 'True' ? 'Yes' : 'No',
                //                     conditionalassesment: sectionData.data.item.conditionalassessment === 'Futureinspection' ? 'Future Inspection' : sectionData.data.item.conditionalassessment,
                //                     additionalconsiderations: sectionData.data.item.additionalconsiderations,
                //                     eee: sectionData.data.item.eee,
                //                     lbc: sectionData.data.item.lbc,
                //                     awe: sectionData.data.item.awe,
                //                     images: sectionData.data.item.images,
                //                 };
                //             }
                //
                //             const filename = await this.getLocationDoc(sectionData.data.item._id, template, sectionDocValues);
                //             sectionDataDoc.push(filename);
                //         }
                //
                //     }));
                //     return sectionDataDoc;
                // }
                return sectionDataDoc;
            }
        } catch (error) {
            console.log("Error is " + error);
            return "";
        }
    }

}

module.exports = new LocationReportGeneration();