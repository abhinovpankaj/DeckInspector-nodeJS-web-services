const ProjectReportHashCodeDAO = require("../model/projectReportHashCodeDAO");

let addProjectReportHashCode =  async function (projectDoc) {
    return await ProjectReportHashCodeDAO.addProjectReportHashCode(projectDoc);
}

let getProjctReportHashCodeById = async function (projectId) {
    return await ProjectReportHashCodeDAO.getProjectReportHashCodeById(projectId);
}

let  deleteProjectReportHashCodeById = async function (projectId) {
    return await ProjectReportHashCodeDAO.deleteProjectReportHashCodeById(projectId);
}
let getProjctReportHashCodeByIdAndReportType = async function (projectId,reportType) {
    return await ProjectReportHashCodeDAO.getProjectReportHashCodeByIdAndReportType(projectId,reportType);
}

let deleteProjectReportHashCodeByIdAndReportType = async function (projectId,reportType) {
    return await ProjectReportHashCodeDAO.deleteProjectReportHashCodeByIdAndReportType(projectId,reportType);
}

module.exports = {
    addProjectReportHashCode: addProjectReportHashCode,
    getProjctReportHashCodeById: getProjctReportHashCodeById,
    deleteProjectReportHashCodeById: deleteProjectReportHashCodeById,
    getProjctReportHashCodeByIdAndReportType:getProjctReportHashCodeByIdAndReportType,
    deleteProjectReportHashCodeByIdAndReportType:deleteProjectReportHashCodeByIdAndReportType
}