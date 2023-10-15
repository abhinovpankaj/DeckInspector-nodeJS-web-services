"use strict";
const { ObjectId } = require('mongodb');
// var ObjectId = require('mongodb').ObjectId;
var mongo = require('../database/mongo');
const Role = require('./role');

var addProjectReport = function (projectReport, callback) {
    mongo.ProjectReports.insertOne({project_id:projectReport.project_id,url: projectReport.url,name:projectReport.name,timestamp:projectReport.timestamp, uploader: projectReport.uploader}, {w: 1}, function (err, result) {
        if (err) {
            var error = new Error("addProjectReport()." + err.message);
            error.status = err.status;
            callback (error);
            return;
        }
        callback(null, result);
    });
};

var getProjectReportsbyProjectId = async function (project_id, callback) {
    
    var result = mongo.ProjectReports.find({project_id: project_id});  
        
        const res = [];
        for await (const doc of result){
            res.push(doc);
        }

        if(res.length===0){
            var error1 = new Error("getProjectReportsbyProjectId(). \nMessage: No Document Found.");
            error1.status = 404;
            callback (error1);
            return; 
        }
        callback(null, res);
    
};

var removeReport = async  function (id, callback) {
    var result = await mongo.projectReports.deleteOne({_id: ObjectId(id)});
    if(result.deletedCount==1){
        callback(null,{status:201,message:"Document deleted successfully."});
    }
    else{
        var error2 = new Error("Error occurred. Didn't remove document. " + err.message);
        error2.status = err.status;
        callback (error2);
        return;
    }
    
};

module.exports = {
    addProjectReport: addProjectReport,
    getProjectReportsbyProjectId: getProjectReportsbyProjectId,
    removeReport: removeReport
};