"use strict";
const InvasiveSectionDAO = require('../model/invasiveSectionDAO');


const deleteInvasiveSectionPermanently = async (invasiveSectionId) => {
    try {
        const result = await InvasiveSectionDAO.deleteInvasiveSection(invasiveSectionId);
        if (result.deletedCount === 1) {
            return {
                success: true,
                id: invasiveSectionId,
            };
        }
        return {
            code:401,
            success: false,
            reason: 'No Invasive Section found with the given ID'
        };
    } catch (error) {
        return handleError(error);
    }
};

const getInvasiveSectionByParentId = async (parentId)=>{
    try{
        const result = await InvasiveSectionDAO.getInvasiveSectionByParentId(parentId);
        if (result) {
            return {
                success: true,
                invasiveSections: result,
            };
        }
        return {
            code:401,
            success: false,
            reason: 'No Invasive Section found with the given parent ID'
        };
    }
    catch(error){
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
    addLocation,
    getLocationById,
    deleteSectionPermanently,
    getInvasiveSectionByParentId,
    deleteInvasiveSectionPermanently
};
