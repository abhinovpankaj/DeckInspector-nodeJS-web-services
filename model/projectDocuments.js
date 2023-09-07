"use strict";
// var ObjectId = require('mongodb').ObjectId;
var mongo = require('../database/mongo');
const Role = require('./role');

var addProjectDocument = function (projectDocument, callback) {
    mongo.ProjectDocuments.insertOne({project_id:projectDocument.project_id,url: projectDocument.url,name:projectDocument.name,timestamp:projectDocument.timestamp}, {w: 1}, function (err, result) {
        if (err) {
            var error = new Error("addProjectDocument()." + err.message);
            error.status = err.status;
            callback (error);
            return;
        }
        callback(null, result);
    });
};

var getProjectDocumentsbyProjectId = async function (project_id, callback) {
    
    var result = mongo.ProjectDocuments.find({project_id: project_id});  
        
        const res = [];
        for await (const doc of result){
            res.push(doc);
        }

        if(res.length===0){
            var error1 = new Error("getProjectDocumentsbyProjectId(). \nMessage: No Document Found.");
            error1.status = 404;
            callback (error1);
            return; 
        }
        callback(null, res);
    
};

module.exports = {
    addProjectDocument: addProjectDocument,
    getProjectDocumentsbyProjectId: getProjectDocumentsbyProjectId
};