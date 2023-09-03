"use strict";
const ConclusiveSectionDAO = require('../model/conclusiveSectionDAO');


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
    getConclusiveSectionByParentId,
    deleteConclusiveSectionPermanently
};
