"use strict";
const ProjectDAO = require('../model/projectDAO'); 
const LocationDAO = require('../model/locationDAO'); 
const subProjectDAO = require('../model/subProjectDAO'); 
const SectionDAO = require('../model/sectionDAO');

const addLocation = async (location) => {
    try {
        const result = await LocationDAO.addLocation(location);
        if (result.insertedId) {
            await addLocationMetadataInParent(result.insertedId,location);
            return {
                success: true,
                id: result.insertedId,
            };
        }
        return {
            code:500,
            success: false,
            reason: 'Insertion failed'
        };
    } catch (error) {
        return handleError(error);
    }
};


var getSubProjectById = async function (subProjectId) {
    try {
        const result = await subProjectDAO.getSubProjectById(subProjectId); 
        if (result) {
            return {
                success: true,
                project: result,
            };
        }
        return {
            code:401,
            success: false,
            reason: 'No Subproject found with the given ID'
        };
    } catch (error) {
        return handleError(error);
    }
};

var deleteSubProjectPermanently = async function (subProjectId) {
    try {
        const subProjectData = await subProjectDAO.findSubProjectById(subProjectId);
        //Delete Locations using location DAOI
        if(subProjectData)
        {
            const locations = await LocationDAO.getLocationByParentId(subProjectId);
            if(locations){
                for (const location of locations) {
                    if(location)
                    {
                        sections = SectionDAO.getSectionByParentId(location._id);
                        for(const section of sections)
                        {
                            await SectionDAO.deleteSection(section._id);
                        }
                    }
                    await LocationDAO.deleteLocation(location._id);
                }
                console.log("SubProject Locations deleted successfully for subProject Id  : ",subProjectId);
            }
        }
        const result = await subProjectDAO.deleteSubProject(subProjectId);
        if (result.deletedCount === 1) {
            return {
                success: true,
            };
        }
        return {
            code:401,
            success: false,
            reason: 'No SubProject found with the given ID'
        };
    } catch (error) {
        return handleError(error);
    }
}

var getSubProjectByParentId = async function (parentId) {
    try {
        const result = await subProjectDAO.getSubProjectByParentId(parentId);
        if (result) {
            return {
                success: true,
                subprojects: result,
            };
        }
        return {
            code:401,
            success: false,
            reason: 'No Subproject found with the given ID'
        };
    } catch (error) {
        return handleError(error);
    }
};


var assignSubProjectToUser = async function (id, username) {
    try {
        const result = await subProjectDAO.assignSubprojectToUser(id, username);
        if (result) {
            return {
                success: true,
            };
        }
        return {
            code:401,
            success: false,
            reason: 'No Subproject found with the given ID'
        };
    }
    catch (error) {
        return handleError(error);
    }
};

var unAssignSubProjectFromUser = async function (id, username) {
    try {
        const result = await subProjectDAO.unassignSubprojectFromUser(id, username);
        if (result) {
            return {
                success: true,
            };
        }
        return {
            code:401,
            success: false,
            reason: 'No Subproject found with the given ID'
        };
    }
    catch (error) {
        return handleError(error);
    }
};

const editSubProject = async (subProjectId,subproject) => {
    try {
        const result = await subProjectDAO.editSubProject(subProjectId, subproject);
        if (result.modifiedCount === 1) {
            await ProjectDAO.removeProjectChild(subProjectId);
            await addSubprojectMetaDataInProject(subProjectId,subproject);
            return {
                success: true,
            };
        }
        return {
            code:401,
            success: false,
            reason: 'No Subproject found with the given ID'
        };
    } catch (error) {
        return handleError(error);
    }
};

    
const addLocationMetadataInParent = async (locationId,location) => {
    try {
       locationDataInParent = {
            name: location.name,
            type: location.type,
            url: location.url,
            description: location.description,
            isInvasive: location.isInvasive?location.isInvasive:false,
        }

        if(location.parenttype == 'subproject' )
        {
            await subProjectDAO.addSubProjectChild(location.parentid, locationId,locationDataInParent);
            console.log(`Added Location with id ${locationId} in subProject id ${location.parentid} successfully`);
        }
        else if(location.parenttype == 'project')
        {
            await ProjectDAO.addProjectChild(location.parentid, locationId,locationDataInParent);
            console.log(`Added Location with id ${locationId} in Project id ${location.parentid} successfully`);
        }
    }
    catch (error) {
        return handleError(error);
    }
};
        

    

const handleError = (error) => {
    console.error('An error occurred:', error);
    return {
        code:500,
        success: false,
        reason: `An error occurred: ${error.message}`
    };
};



// ... More service functions

module.exports = {
    addSubProject,
    getSubProjectById,
    deleteSubProjectPermanently,
    getSubProjectByParentId,
    assignSubProjectToUser,
    unAssignSubProjectFromUser,
    editSubProject
    // ... More exported functions
};
