"use strict";
var ObjectId = require('mongodb').ObjectId;
var mongo = require('../database/mongo');

module.exports= {
    addProjectReportHashCode: async (project) => {
       const result =  await mongo.ProjectReportHashCode.insertOne(project);
       console.log(result);
       return result;
    },
    getProjectReportHashCodeById: async(projectId) => {
        const result = await mongo.ProjectReportHashCode.findOne({projectId: projectId});
        if(result && result.data)
        {
            return result.data;
        }
    },
    deleteProjectReportHashCodeById: async(projectId) => {
        return await mongo.ProjectReportHashCode.deleteOne({ projectId: projectId });
    },
    getProjectReportHashCodeByIdAndReportType: async(projectId,reportType) => {
        const result = await mongo.ProjectReportHashCode.findOne({projectId: projectId,reportType:reportType});
        if(result && result.data)
        {
            return result.data;
        }
    },

    deleteProjectReportHashCodeByIdAndReportType: async(projectId,reportType) => {
        return await mongo.ProjectReportHashCode.deleteOne({ projectId: projectId,reportType:reportType });
    }
}