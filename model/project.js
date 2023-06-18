"use strict";
var ObjectId = require('mongodb').ObjectId;
const { QueryCollectionFormat } = require('@azure/core-http');
const { JsonWebTokenError } = require('jsonwebtoken');
var mongo = require('../database/mongo');


var addProject = async function (project) {
    var result = await mongo.Projects.insertOne(project);
    var response ={};
    if(result.insertedId){        
        response = {
            "data" :{
                "id": result.insertedId,
                "message":"Project inserted successfully.",
                "code":201
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
    return response;
};

var getAllProjects = async function () {   
    var response ={};
    try{
        var result = await mongo.Projects.find({}).limit(50).sort({"_id":-1}).toArray();
        if(result.length==0){
            response = {
                "data": {
                    "projects": [],
                    "message": "No Projects found.",
                    "code":401
                  }
            } 
        }
        else{
            response = {
                "data" :{
                    "projects": [],
                    "message": "Projects found.",
                    "code":201
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
    var response ={};   
    try{
        const result = await mongo.Projects.findOne({ _id:  new ObjectId(id) },{files:0});
        
        if (result) {
            response = {
                "data" :{
                    "item": result,
                    "message": "Project found.",
                    "code":201
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


var assignProjectToUser = async function (id,username) {
    var response ={};      
    try {
        var result = await mongo.Projects.updateOne({_id:new ObjectId(id)},{ $addToSet: { assignedto: username  }});
        
        if (result.matchedCount==0){
            response = {
                "error": {
                    "code": 409,
                    "message": "No project found."
                }
            }
            return response;   
        }
        if(result.modifiedCount==1){
            response = {
                "data" :{                
                    "message": "Project assigned successfully.",
                    "code":201
                }   
            };
            return response;        
        }
        else{
            response = {
                "error": {
                    "code": 409,
                    "message": "Error updating the project assignment,user already added"
                }
            }
            return response;       
        }
    } catch (error) {
        response = {
            "error": {
                "code": 500,
                "message": "Error assigning project.",
                "errordata": error
              }
        }
        return response;
    }
    
};
var unassignUserFromProject = async function (id,username) {      
    var response ={};
    try {
        var result = await mongo.Projects.updateOne({_id:new ObjectId(id)},{ $pull: { assignedto: username  }});
        
        if (result.matchedCount==0){
            response = {
                "error": {
                    "code": 409,
                    "message": "No project found."
                }
            }
            return response;   
        }
        
        if(result.modifiedCount==1){
            response = {
                "data" :{                
                    "message": "User removed from project assignment successfully.",
                    "code":201
                }   
            };
            return response;        
        }
        else{
            response = {
                "error": {
                    "code": 405,
                    "message": "Error updating the project assignment/or user not assigned."
                }
            }
            return response;       
        }
    } catch (error) {
        response = {
            "error": {
                "code": 500,
                "message": "Error assigning project.",
                "errordata": err
              }
        }
        return response;
    }
    
};
var getProjectsByNameCreatedOnIsCompletedAndDeleted= async function({
    name = "",
    createdon = "",
    iscomplete = false,
    isdeleted =false
} = {}){
    var response ={};
    try {
        
        var query = { $and: [] };
        if (name !== "") { query.$and.push({name: name}); }
        if (createdon !== "") { query.$and.push({createdon: createdon}); }                
    
        query.$and.push({iscomplete: iscomplete});
        query.$and.push({isdeleted: isdeleted});

        const cursor = mongo.Projects.find(query)
        .sort({ editedat: -1 })
        .limit(25);

        const result = await cursor.toArray();
        if(result.length==0){
            response = {
                "data": {
                    "projects": [],
                    "message": "No Projects matching the filter found.",
                    "code":401
                  }
            } 
        }
        else{
            response = {
                "data" :{
                    "projects": [],
                    "message": "Projects found matching the criteria.",
                    "code":201
                }   
            };
            const projects = result.map(item=>{
                delete item.isdeleted;        
                delete item.files;                
                response.data.projects.push(item);
                return item;
              });             
                        
            return response;
        }    
    } catch (error) {
        response = {
            "error": {
                "code": 500,
                "message": "Error fetching project.",
                "errordata": error
              }
        }
        return response;
    }
   
}



var updateProject = async function (project) {
    var response ={};
    try{
        var result = await mongo.Projects.updateOne({ _id: new ObjectId(project.id) }, { $set: {
            name:project.name,
            address:project.address,
            description:project.description,
            url:project.url,
            lasteditedby:project.lasteditedby,
            editedat:project.editedat
        } });    
        
        if(result.matchedCount<1){
            response = {
                "error": {
                    "code": 401,
                    "message": "No Project found."
                  }
            }
            return response;
        } else{
            if(result.modifiedCount==1){
                response = {
                    "data" :{                   
                        "message": "Project updated successfully.",
                        "code":201
                    }   
                };
                return response;
            }           
            else{
                response = {
                    "data" :{                    
                        "message": "Failed to update the project details.",
                        "code":409
                    }   
                };
                return response;
            }                   
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

var updateProjectVisibilityStatus = async function (id,isVisible) {
    var response ={};
    try {
        var result = await mongo.Projects.updateOne({_id:new ObjectId(id)},{$set:{isdeleted:isVisible}});
        if(result.matchedCount==0){
            response = {
                "error": {
                    "code": 405,
                    "message": "No project found, invalid id."                    
                }
            }
            return response;
        }
        if(result.modifiedCount==1){
            var message = `Project state updated successfully,is Visible:${isVisible}.`;
            response = {
                "data" :{                
                    "message": message,
                    "code":201
                }   
            };
            return response; 
            
        }
        else{
            response = {
                "error": {
                    "code": 405,
                    "message": "No project modified, try with changed visibility state."                    
                }
            }
            return response;           
        }
    } catch (error) {
        response = {
            "error": {
                "code": 500,
                "message": "Error changing visibility of project.",
                "errordata": err
              }
        }
        return response;
    }    
};
var updateProjectOfflineAvailabilityStatus = async function (id,isavailableoffline) {
    var response ={};
    try {
        
        var result = await mongo.Projects.updateOne({_id:new ObjectId(id)},{$set:{isavailableoffline:isavailableoffline}});
        if(result.matchedCount==0){
            response = {
                "error": {
                    "code": 405,
                    "message": "No project found, invalid id."                    
                }
            }
            return response;
        }
        if(result.modifiedCount==1){
            var message = `Project state updated successfully,can download offline:${isavailableoffline}.`;
            response = {
                "data" :{                
                    "message": message,
                    "code":201
                }   
            };
            return response; 
            
        }
        else{
            response = {
                "error": {
                    "code": 405,
                    "message": "No project modified, try with changed state."                    
                }
            }
            return response;           
        }
    } catch (error) {
        response = {
            "error": {
                "code": 500,
                "message": "Error assigning project.",
                "errordata": err
              }
        }
        return response;
    }   
    
};

var updateProjectStatus = async function (id,iscomplete) {
    var response ={};
    try {
        
        var result = await mongo.Projects.updateOne({_id:new ObjectId(id)},{$set:{iscomplete:iscomplete}});
        if(result.matchedCount==0){
            response = {
                "error": {
                    "code": 405,
                    "message": "No project found, invalid id."                    
                }
            }
            return response;
        }
        if(result.modifiedCount==1){
            var message = `Project state updated successfully,is project complete:${isavailableoffline}.`;
            response = {
                "data" :{                
                    "message": message,
                    "code":201
                }   
            };
            return response; 
            
        }
        else{
            response = {
                "error": {
                    "code": 405,
                    "message": "No project modified, try with changed state."                    
                }
            }
            return response;           
        }
    } catch (error) {
        response = {
            "error": {
                "code": 500,
                "message": "Error updating completion state of the project.",
                "errordata": err
              }
        }
        return response;
    }   
    
};

var deleteProjectPermanently = async function (id) {
    try{
        var result = await mongo.Projects.deleteOne({_id: new ObjectId(id)});

        if(result.deletedCount==1){
           
            var response = {
                "data" :{                    
                    "message": "Project deleted successfully.",
                    "code":201
                }   
            };
            return response;
        }
        else{
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
                "message": "Error deleting project.",
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

var addRemoveChildren = async function(projectId,isAdd,{id,name,type}){
    var response = {};
    try {
        if(isAdd)
            var result = await mongo.Projects.updateOne({_id:new ObjectId(projectId)},{ $push: { children: {"id":id,"name":name,"type":type}}});
        else
            var result = await mongo.Projects.updateOne({_id:new ObjectId(projectId)},{ $pull: { children: {"id":id,"name":name,"type":type}}});
        
        if (result.matchedCount==0){
            response = {
                "error": {
                    "code": 409,
                    "message": "No project found."
                }
            }
            return response;   
        }
        if(result.modifiedCount==1){
            response = {
                "data" :{                                   
                    "message": "Common location added/removed to/from the project successfully.",
                    "code":201
                }   
            };
            return response;        
        }
        else{
            response = {
                "error": {
                    "code": 409,
                    "message": "Error adding/removing common location to/from the project."
                }
            }
            return response;       
        }
    } catch (error) {
        response = {
            "error": {
                "code": 500,
                "message": "Error adding common location to the project.",
                "errordata": err
              }
        }
        return response;
    }
}

var getProjectByAssignedToUserId = async function(userId)
{
    try {
        var result = await mongo.Projects.find({ assignedto: { $in: [userId] } }).toArray();
        //console.log(result);
        var response ={};
        if(result.length==0){
            response = {
                "data": {
                    "projects": [],
                    "message": "No Projects found.",
                    "code":401
                  }
            } 
        }
        else{
            response = {
                "data" :{
                    "projects": [],
                    "message": "Projects found.",
                    "code":201
                }   
            };
            const projects = result.map(item=>{
                delete item.isdeleted;        
                delete item.files;                
                response.data.projects.push(item);
                return item;
              });               
            }
        //console.log("Response from getProjectByAssignedToUserId: ",response);
        return response;
    }  catch(err){
        console.log("Error is : ",err);
        response = {
            "error": {
                "code": 500,
                "message": "Error fetching projects.",
                "errordata": err
              }
        }
        return response;
    }   
}



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
    getAllFilesOfProject,unassignUserFromProject,
    addRemoveChildren,
    getProjectByAssignedToUserId
    
};