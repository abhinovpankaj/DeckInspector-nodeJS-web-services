"use strict";
var ObjectId = require('mongodb').ObjectId;
const { QueryCollectionFormat } = require('@azure/core-http');
const { JsonWebTokenError } = require('jsonwebtoken');
var mongo = require('../database/mongo');
const user = require('./user');

var addProject = async function (project) {
    var result = await mongo.Projects.insertOne(project);
    var response ={};
    if(result.insertedId){        
        response = {
            "data" :{
                "id": result.insertedId,
                "message":"Project inserted successfully."
            }   
        }
    }
    else{
        response = {
            "error": {
                "code": 500,
                "message": "No Project inserted."
              }
        } 
    }
    return JSON.parse(response);
};

var getAllProjects = async function () {   
    var response ={};
    try{
        var result = await mongo.Projects.find({}).limit(50).toArray();
        if(result.length==0){
            response = {
                "data": {
                    "projects": [],
                    "message": "No Projects found."
                  }
            } 
        }
        else{
            response = {
                "data" :{
                    "projects": [],
                    "message": "Projects found."
                }   
            };
            const projects = result.map(item=>{
                delete item.isdeleted;        
                delete item.files;                
                response.data.projects.push(item);
                return item;
              });               
            }
            
        return response;
    }
    catch(err){
        response = {
            "error": {
                "code": 500,
                "message": "Error fetching projects.",
                "errordata": err
              }
        }
        return response;
    }   
      
};

var getProjectById = async function (id) {    
    try{
        const result = await mongo.Projects.findOne({ _id:  new ObjectId(id) },{files:0});
        if (result) {
            var response = {
                "data" :{
                    "item": result,
                    "message": "Project found."
                }   
            };
            return response;
        } else {
            response = {
                "error": {
                    "code": 401,
                    "message": "No Project found."
                  }
            }
            return response;
        }    
    }
    catch(err){
        response = {
            "error": {
                "code": 500,
                "message": "Error fetching project.",
                "errordata": err
              }
        }
        return response;
    }    
};

var getAllFilesOfProject = async function (id) {    
    const result = await mongo.Projects.findOne({ _id:  new ObjectId(id) },{files:1});

    if (result) {
        return JSON.stringify(result);
    } else {
        var error = new Error("No project found.");
        error.status = 401;    
        return JSON.stringify(error);
    }    
};
var assignProjectToUser = async function (id,username) {  
    var newAssingee = {"username":username}
    
    var result = await mongo.Projects.updateOne({_id:id},[{ $addFields: { assignedto: newAssingee }}]);
    if(result.modifiedCount==1){
        return JSON.stringify({status:201,message:"Project assigned successfully."});
    }
    else{
        var error2 = new Error("Error occurred.Project assignment failed. " + err.message);
        error2.status = err.status;
        
        return JSON.stringify(error2);
    }
};

var getProjectsByNameCreatedOnIsCompletedAndDeleted= async function({
    name = "",
    createdon = "",
    iscomplete = false,
    isdeleted =false
} = {}){
    var query ="";
    if(name!="")
        query=query+ `name:${name}`;
    if(createdon!="")
        query=query + `createdon:${createdon}`;          
    
    query = query + `,iscomplete:${iscomplete},isdeleted=${isdeleted}`  ;  
    const cursor = mongo.Projects.find({query})
    .sort({createdon})
    .limit(25);

    const result = await cursor.toArray();
    const projects = result.map(item=>{
        delete item.isdeleted;        
        delete item.files;
        return item;
      });    
      return JSON.stringify(projects);
}

var updateProject = async function (project) {
    
    var result = await mongo.Projects.updateOne({ _id: project._id }, { $set: project });    
    
    if(result.matchedCount<1){
        var error = new Error("No project found.");
        error.status = 401;    
        return JSON.stringify(error);
    } else{
      if(result.modifiedCount==1){
        return JSON.stringify({status:201,message:"project details updated successfully."});
        }           
      else
        return JSON.stringify({status:409,message:"Failed to update the project details."});       
    }   
};

var updateProjectVisibilityStatus = async function (id,isdeleted) {
    var result = await mongo.Projects.updateOne({_id:id},{$set:{isdeleted:isdeleted}});
    if(result.modifiedCount==1){
        return JSON.stringify({status:201,message:"Project deleted successfully."});
    }
    else{
        var error2 = new Error("Error occurred.No project was deleted. " + err.message);
        error2.status = err.status;
        
        return JSON.stringify(error2);
    }
    
};
var updateProjectOfflineAvailabilityStatus = async function (id,isavailableoffline) {
    var result = await mongo.Projects.updateOne({_id:id},{$set:{isavailableoffline:isavailableoffline}});
    if(result.modifiedCount==1){
        return JSON.stringify({status:201,message:"Project state updated successfully."});
    }
    else{
        var error2 = new Error("Error occurred.project state was not updated. " + err.message);
        error2.status = err.status;
        
        return JSON.stringify(error2);
    }
    
};
var updateProjectStatus = async function (id,iscomplete) {
    var result = await mongo.Projects.updateOne({_id:id},{$set:{iscomplete:iscomplete}});
    if(result.modifiedCount==1){
        return JSON.stringify({status:201,message:"Project status updated successfully."});
    }
    else{
        var error2 = new Error("Error occurred.Project was status not updated. " + err.message);
        error2.status = err.status;
        
        return JSON.stringify(error2);
    }
    
};
var deleteProjectPermanently = async  function (id) {
    var result = await mongo.Projects.deleteOne({_id:id});
    if(result.deletedCount==1){
        return JSON.stringify({status:201,message:"Project deleted permanently."});
    }
    else{
        var error2 = new Error("Error occurred. Didn't remove project. " + err.message);
        error2.status = err.status;
        return JSON.stringify(error2);        
    }    
};

module.exports = {
    addProject,
    updateProjectOfflineAvailabilityStatus,
    updateProjectVisibilityStatus,
    deleteProjectPermanently,
    updateProjectStatus,
    updateProject,  
    getProjectById,
    getProjectsByNameCreatedOnIsCompletedAndDeleted,
    getAllProjects,assignProjectToUser,
    getAllFilesOfProject

};