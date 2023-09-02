"use strict";
const ProjectDAO = require('../model/projectDAO'); 

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
            success: false,
            reason: 'No project found with the given ID'
        };
    } catch (error) {
        return handleError(error);
    }
};

var deleteProjectPermanently = async function (projectId) {
    try {
        const result = await ProjectDAO.deleteProjectPermanently(projectId);
        if (result.deletedCount === 1) {
            return {
                success: true,
            };
        }
        return {
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
            success: false,
            reason: 'No project found with the given ID'
        };
    } catch (error) {
        return {
            success: false,
            reason: 'An error occurred'
        };
    }
}

const handleError = (error) => {
    console.error('An error occurred:', error);
    return {
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
    editProject
};

