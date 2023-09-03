"use strict";
const ProjectDAO = require('../model/projectDAO');
const LocationDAO = require('../model/locationDAO');
const SubprojectService = require('../service/subProjectService')
/**
 * 
 * @param {*} project 
 * @returns 
 * 
 * Umesh TODO : 
 * 1. Add validation
 * 2. Add error handling
 * 4. Add methods for assign,unassign,getProjectsByNameCreatedOnIsCompletedAndDeleted,getAllFilesOfProject etc.
 */

var addProject = async function (project) {
    try {
        const result = await ProjectDAO.addProject(project);
        //Umesh TODO : think about whether we want service layer to know about underlying DB technology
        if (result.insertedId) {
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

var getProjectById = async function (projectId) {
    try {
        const result = await ProjectDAO.getProjectById(projectId); 
        if (result) {
            return {
                success: true,
                project: result,
            };
        }
        return {
            code:401,
            success: false,
            reason: 'No project found with the given ID'
        };
    } catch (error) {
        return handleError(error);
    }
};
//UMESH TODO -- ADD transaction in this
var deleteProjectPermanently = async function (projectId) {
    try {
        const projectData = await ProjectDAO.getProjectById(projectId);

        if (projectData) {
            const locations = await LocationDAO.getLocationByParentId(id);
            if(locations){
                for (const location of locations) {
                    await LocationDAO.deleteLocation(location._id);
                }
                console.log("Project Locations deleted successfully for project Id  : ",projectId);
            }

            const result = await SubprojectService.getSubProjectByParentId(projectId);
            if(result)
            {
                subProjects = result.subProjects;
                if(subProjects){
                    await SubprojectService.deleteSubProjectPermanently(subProjects._id);
                }
            }           
        }
        const result = await ProjectDAO.deleteProjectPermanently(projectId);
        if (result.deletedCount === 1) {
            return {
                success: true,
            };
        }
        return {
            code:401,
            success: false,
            reason: 'No project found with the given ID'
        };
    } catch (error) {
        return handleError(error);
    }
}

var getProjectsByUser = async function (username) {
    try {
        const result = await ProjectDAO.getProjectByAssignedToUserId(username);
        if (result) {
            return {
                success: true,
                projects: result,
            };
        }
        return {
            code:401,
            success: false,
            reason: 'No project found with the given username'
        };
    } catch (error) {
        return handleError(error);
    }
}

var getAllProjects = async function () {
    try {
        const result = await ProjectDAO.getAllProjects();
        if (result) {
            return {
                success: true,
                projects: result,
            };
        }
        return {
            code:401,
            success: false,
            reason: 'No project found'
        };
    } catch (error) {
        return handleError(error);
    }
}

var editProject = async function (projectId, newData) {
    try {
        const result = await ProjectDAO.editProject(projectId, newData);
        if (result.modifiedCount === 1) {
            return {
                success: true,
            };
        }
        return {
            code:401,
            success: false,
            reason: 'No project found with the given ID'
        };
    } catch (error) {
        return handleError(error);
    }
}

var assignProjectToUser = async function (projectId, username) {
    try {
        const result = await ProjectDAO.assignProjectToUser(projectId, username);
        if (result.modifiedCount === 1) {
            return {
                success: true,
            };
        }
        return {
            code:401,
            success: false,
            reason: 'No project found with the given ID'
        };  
    } catch (error) {
        return handleError(error);
    }
}

var unassignUserFromProject = async function (projectId, username) {
    try {
        const result = await ProjectDAO.unassignUserFromProject(projectId, username);
        if (result.modifiedCount === 1) {
            return {
                success: true,
            };
        }
        return {
            code:401,
            success: false,
            reason: 'No project found with the given ID'
        };
    } catch (error) {
        return handleError(error);
    }
}

var getProjectByAssignedToUserId = async function (userId) {
    try {
        const result = await ProjectDAO.getProjectByAssignedToUserId(userId);
        if (result) {
            return {
                success: true,
                projects: result,
            };
        }
        return {
            code:401,
            success: false,
            reason: 'No project found with the given username'
        };
    } catch (error) {
        return handleError(error);
    }
}

var getProjectsByNameCreatedOnIsCompletedAndDeleted = async function ({name = null,createdon = null,iscomplete = false,isdeleted = false} = {}) {
    try {
        const result = await ProjectDAO.getProjectsByNameCreatedOnIsCompletedAndDeleted({name,createdon,iscomplete,isdeleted});
        if (result) {
            return {
                success: true,
                projects: result,
            };
        }
        return {
            code:401,
            success: false,
            reason: 'No project found for given criteria'
        };
    } catch (error) {
        return handleError(error);
    }
}



const handleError = (error) => {
    console.error('An error occurred:', error);
    return {
        code:500,
        success: false,
        reason: `An error occurred: ${error.message}`
    };
};

module.exports = {
    addProject,
    getProjectById,
    deleteProjectPermanently,
    getProjectsByUser,
    getAllProjects,
    editProject,
    assignProjectToUser,
    unassignUserFromProject,
    getProjectByAssignedToUserId,
    getProjectsByNameCreatedOnIsCompletedAndDeleted
};

