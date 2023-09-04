"use strict";
const ConclusiveSectionDAO = require('../model/conclusiveSectionDAO');

const addConclusiveSection = async (conclusiveSection) => {
    try {
        const result = await ConclusiveSectionDAO.addConclusiveSection(conclusiveSection);
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

const getConclusiveSectionById = async (conclusiveSectionId) => {
    try {
        const result = await ConclusiveSectionDAO.getConclusiveSectionById(conclusiveSectionId);
        if (result) {
            return {
                success: true,
                conclusiveSection: result,
            };
        }
        return {
            code:401,
            success: false,
            reason: 'No Conclusive Section found with the given ID'
        };
    } catch (error) {
        return handleError(error);
    }
};

const editConclusiveSection = async (conclusiveSectionId, conclusiveSection) => {
    try {
        const result = await ConclusiveSectionDAO.editConclusiveSection(conclusiveSectionId, conclusiveSection);
        if (result.modifiedCount === 1) {
            return {
                success: true,
                id: conclusiveSectionId,
            };
        }
        return {
            code:401,
            success: false,
            reason: 'No Conclusive Section found with the given ID'
        };
    } catch (error) {
        return handleError(error);
    }
};


const deleteConclusiveSectionPermanently = async (conclusiveSectionId) => {
    try {
        const result = await ConclusiveSectionDAO.deleteConclusiveSection(conclusiveSectionId);
        if (result.deletedCount === 1) {
            return {
                success: true,
                id: conclusiveSectionId,
            };
        }
        return {
            code:401,
            success: false,
            reason: 'No Conclusibve Section found with the given ID'
        };
    } catch (error) {
        return handleError(error);
    }
};

const getConclusiveSectionByParentId = async (parentId)=>{
    try{
        const result = await ConclusiveSectionDAO.getConclusiveSectionById(parentId);
        if (result) {
            return {
                success: true,
                conclusiveSections: result,
            };
        }
        return {
            code:401,
            success: false,
            reason: 'No Conclusive Section found with the given parent ID'
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
    getConclusiveSectionById,
    addConclusiveSection,
    editConclusiveSection,
    getConclusiveSectionByParentId,
    deleteConclusiveSectionPermanently
};
