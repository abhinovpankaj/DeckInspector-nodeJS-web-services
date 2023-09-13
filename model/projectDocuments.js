"use strict";
const { ObjectId } = require('mongodb');
// var ObjectId = require('mongodb').ObjectId;
var mongo = require('../database/mongo');
const Role = require('./role');

var addProjectDocument = function (projectDocument, callback) {
    mongo.ProjectDocuments.insertOne({project_id:projectDocument.project_id,url: projectDocument.url,name:projectDocument.name,timestamp:projectDocument.timestamp, uploader: projectDocument.uploader}, {w: 1}, function (err, result) {
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

var removeDocument = async  function (id, callback) {
    var result = await mongo.ProjectDocuments.deleteOne({_id: ObjectId(id)});
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
    addProjectDocument: addProjectDocument,
    getProjectDocumentsbyProjectId: getProjectDocumentsbyProjectId,
    removeDocument: removeDocument
};