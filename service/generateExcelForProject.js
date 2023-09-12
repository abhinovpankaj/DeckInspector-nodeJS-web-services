const ExcelJS = require('exceljs');
const Project = require('../model/project');
const Location = require('../model/location');
const Section = require('../model/sections');
const SubProject = require('../model/subproject');
const LocationType = require('../model/locationType');
const path = require('path');

async function generateExcelForProject(projectId) {

    const projectData = await Project.getProjectById(projectId);


    // Create a new instance of a Workbook
    const workbook = new ExcelJS.Workbook();

    // Add a Worksheet to the Workbook
    const worksheet = workbook.addWorksheet('Sheet 1');

    worksheet.getCell('A1').value = projectData.data.item.name;

    //headers
    const { headerMapping, headerRow } = await createHeaderRow(worksheet);
    styleHeaderRow(headerRow);

    //add project Locations
    await addCommonLocations(projectId,worksheet,headerMapping);    

    //add building locations
    await addBuildingLocations(projectId,worksheet,headerMapping);

    //add building apartments
    await addBuildingApartments(projectId,worksheet,headerMapping);

    //Save the file
    const excelFileName = path.join(__dirname, projectData.data.item.name + '.xlsx');
    await workbook.xlsx.writeFile(excelFileName);

    
    return excelFileName;
}


async function addCommonLocations(projectId,worksheet,headerMapping)
{
    locations = await Location.getLocationByParentId(projectId);

    if(!(locations && locations.data && locations.data.item))
        return;
    

    for(location of locations.data.item)
    {
        const commonLocationData = {
            'cLoc':location.name
        }   
        for(section of location.sections)
        {
            const sectionData = await Section.getSectionById(section._id);
            const sectionName = {'cLocName': sectionData.data.item.name};
            const sectionExcelData = generateSectionData(sectionData);

            const finalData = {...sectionName,...commonLocationData,...sectionExcelData};

            const rowData = Object.keys(headerMapping).map(key => finalData[key] || '');

            const flattenedRowData = rowData.map(item => Array.isArray(item) ? item.join(', ') : item);
            try{
                const addedRow = await worksheet.addRow(flattenedRowData);
            }
            catch(err){console.log(err);}
        }
    }
}

async function addDataByLocationType(projectId, worksheet, headerMapping, locationType, mapping) {
    const subProjects = await SubProject.getSubProjectsByParentId(projectId);

    if (!(subProjects && subProjects.data && subProjects.data.item)) {
        return;
    }

    try {
        for (const subProject of subProjects.data.item) {
            const buildingData = {
                [mapping.buildingKey]: subProject.name
            };

            const allLocations = await Location.getLocationByParentId(subProject._id);
            if (!(allLocations && allLocations.data && allLocations.data.item)) {
                continue;
            }

            const filteredLocations = allLocations.data.item.filter(location => location.type === locationType);

            for (const location of filteredLocations) {
                const buildingLocationData = {
                    [mapping.locationKey]: location.name
                };

                if(location.sections)
                {
                    for (const section of location.sections) {
                        const sectionData = await Section.getSectionById(section._id);
                        const sectionName = { [mapping.sectionNameKey]: sectionData.data.item.name };
                        const sectionExcelData = generateSectionData(sectionData);
    
                        const finalData = { ...buildingData, ...sectionExcelData, ...sectionName, ...buildingLocationData };
                        const rowData = Object.keys(headerMapping).map(key => finalData[key] || '');
                        const flattenedRowData = rowData.map(item => Array.isArray(item) ? item.join(', ') : item);
    
                        try {
                            await worksheet.addRow(flattenedRowData);
                        } catch (err) {
                            console.log(err);
                        }
                    }
                }
            }
        }
    } catch (err) {
        console.log(err);
    }
}

async function addBuildingLocations(projectId, worksheet, headerMapping) {
    const mapping = {
        buildingKey: 'bld',
        locationKey: 'bldLoc',
        sectionNameKey: 'bldLocName'
    };
    await addDataByLocationType(projectId, worksheet, headerMapping, LocationType.BUILDINGLOCATION, mapping);
}

async function addBuildingApartments(projectId, worksheet, headerMapping) {
    const mapping = {
        buildingKey: 'bld',
        locationKey: 'bldApt',
        sectionNameKey: 'bldAptName'
    };
    await addDataByLocationType(projectId, worksheet, headerMapping, LocationType.APARTMENT, mapping);
}


async function createHeaderRow(worksheet) {
    const headerMapping = {
        'cLoc': 'Common Location',
        'cLocName': 'Common Location Name',
        'bld': 'Building',
        'bldLoc': 'Building Location',
        'bldLocName': 'Building Location Name',
        'bldApt': 'Building Apartment',
        'bldAptName': 'Building Apartment Name',
        'extElem': 'Exterior Elements',
        'wpElem': 'Water Proofing Elements',
        'visRev': 'Visual Review',
        'visLeaks': 'Any Visual Signs of leaks',
        'furtherInvRev': 'Further Invasive Review Required',
        'condAssess': 'Condition Assessment',
        'addConcerns': 'Additional Considerations or Concerns',
        'lifeEEE': 'Life Expectancy (EEE)',
        'lifeLBC': 'Life Expectancy (LBC)',
        'lifeAWE': 'Life Expectancy (AWE)'
    };

    // Extract the full descriptive headers from the mapping
    const headers = Object.values(headerMapping);

    // Add headers to the worksheet and get the header row
    const headerRow = await worksheet.addRow(headers);
    return { headerMapping, headerRow };
}

function styleHeaderRow(headerRow) {
    headerRow.eachCell((cell) => {
        cell.fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: 'FF90EE90' } // Light Green color
        };
        cell.font = {
            color: { argb: 'FF000000' },
            bold: true
        };
        cell.border = {
            top: { style: 'thin', color: { argb: 'FF000000' } },
            left: { style: 'thin', color: { argb: 'FF000000' } },
            bottom: { style: 'thin', color: { argb: 'FF000000' } },
            right: { style: 'thin', color: { argb: 'FF000000' } }
        };
    });
}


function generateSectionData(sectionData)
{
    return {
        'extElem': sectionData.data.item.exteriorelements,
        'wpElem': sectionData.data.item.waterproofingelements,
        'visRev': sectionData.data.item.visualreview,
        'visLeaks': sectionData.data.item.visualsignsofleak,
        'furtherInvRev': sectionData.data.item.furtherinvasivereviewrequired,
        'condAssess': sectionData.data.item.conditionalassessment,
        'addConcerns': sectionData.data.item.additionalconsiderations,
        'lifeEEE': sectionData.data.item.eee,
        'lifeLBC': sectionData.data.item.lbc,
        'lifeAWE': sectionData.data.item.awe
    }
}


module.exports = { generateExcelForProject };


