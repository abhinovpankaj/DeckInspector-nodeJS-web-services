"use strict";
var ObjectId = require('mongodb').ObjectId;
const { QueryCollectionFormat } = require('@azure/core-http');
const { JsonWebTokenError } = require('jsonwebtoken');
var mongo = require('../database/mongo');


var addSection = async function (section) {
    var response ={};
    try {
        var result = await mongo.Sections.insertOne(section);
    
        if(result.insertedId){            
            var projresult = await mongo.Locations.updateOne({_id:new ObjectId(section.parentId)},{ $push: { children: {"id":result.insertedId,"name":section.name}}});     
            
            if (projresult.modifiedCount>0)
            {
                var msg = "Section inserted successfully,parent updated successfully."
            }
            else
                var msg = "Section inserted successfully,parent failed to updated."
            
            response = {
                "data" :{
                    "id": result.insertedId,
                    "message":msg,
                    "code":201
                }   
            }
        }
        else{
            response = {
                "error": {
                    "code": 500,
                    "message": "No Section inserted."
                }
            } 
        }
        return response;
    } catch (error) {
        
    }
    
};


var getSectionById = async function (id) { 
    var response ={};   
    try{
        const result = await mongo.Sections.findOne({ _id:  new ObjectId(id)});
        
        if (result) {
            response = {
                "data" :{
                    "item": result,
                    "message": "Section found.",
                    "code":201
                }   
            };
            return response;
        } else {
            response = {
                "error": {
                    "code": 401,
                    "message": "No Section found."
                  }
            }
            return response;
        }    
    }
    catch(err){
        response = {
            "error": {
                "code": 500,
                "message": "Error fetching Section.",
                "errordata": err
              }
        }
        return response;
    }    
};
//details will be a flexible structure of the form.
//images: array of image urls
var updateSection = async function (section) {
    var response ={};
    try{
        var result = await mongo.Sections.updateOne({ _id: new ObjectId(section.id) }, { $set: {
            name:section.name,            
            details:section.details,
            images:section.images,
            lasteditedby:section.lasteditedby,
            editedat:section.editedat
        } });    
        
        if(result.matchedCount<1){
            response = {
                "error": {
                    "code": 401,
                    "message": "No Section found."
                  }
            }
            return response;
        } else{
            if(result.modifiedCount==1){
                
                var projresult=await mongo.Locations.updateOne(
                    {                        
                        "sections.id":new ObjectId(section.id)
                    },
                {$set:{"sections.$.name":section.name}},
                { upsert: false });                
                
                response = {
                    "data" :{                   
                        "message": "Section updated successfully.",
                        "code":201
                    }   
                };
                return response;
            }           
            else{
                response = {
                    "data" :{                    
                        "message": "Failed to update the Section details.",
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
                "message": "Error processing Section updates.",
                "errordata": err
              }
        }
        return response;
    }
    
};
//Soft Delete/undelete
var updateSectionVisibilityStatus = async function (id,name,parentId,isVisible) {
    var response ={};
    try {
        //update the Projects collection as well.        
        var result = await mongo.Sections.updateOne({_id:new ObjectId(id)},{$set:{isdeleted:!isVisible}});
        if(result.matchedCount==0){
            response = {
                "error": {
                    "code": 405,
                    "message": "No Section found, invalid id."                    
                }
            }
            return response;
        }
        if(result.modifiedCount==1){
            if(!isVisible)
            {
                
                var projresult = await mongo.Locations.updateOne({_id:new ObjectId(parentId)},{ $pull: { sections: {"id":new ObjectId(parentId)}}});     
            }                
            else{
                
                var projresult = await mongo.Projects.updateOne({_id:new ObjectId(parentId)},{ $push: { sections: {"id":new ObjectId(parentId),"name":name}}});
            }
                
            if (projresult.modifiedCount>0)
            {
                var message = `Section state updated successfully,is Visible:${isVisible}.parent  updated successfully.`;                
            }
            else
                var message = `Section state updated successfully,is Visible:${isVisible}.parent failed to update.`;
                
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
                    "message": "No Section modified, try with changed visibility state."                    
                }
            }
            return response;           
        }
    } catch (error) {
        response = {
            "error": {
                "code": 500,
                "message": "Error changing visibility of Section.",
                "errordata": err
              }
        }
        return response;
    }    
};

var deleteSectionPermanently = async function (id) {
    try{
        var result = await mongo.Sections.deleteOne({_id: new ObjectId(id)});

        if(result.deletedCount==1){
           
            var response = {
                "data" :{                    
                    "message": "Section deleted successfully.",
                    "code":201
                }   
            };
            return response;
        }
        else{
            response = {
                "error": {
                    "code": 401,
                    "message": "No Section found."
                  }
            }
            return response;  
        }            
    }
    catch(err){
        response = {
            "error": {
                "code": 500,
                "message": "Error deleting Section.",
                "errordata": err
              }
        }
        return response;
    }
    
};

var addRemoveSections = async function(sectionId,isAdd,{id,name}){
    var response = {};
    try {
        if(isAdd)
            var result = await mongo.Sections.updateOne({_id:new ObjectId(sectionId)},{ $push: { sections: {"id":id,"name":name}}});
        else
            var result = await mongo.Sections.updateOne({_id:new ObjectId(sectionId)},{ $pull: { sections: {"id":id,"name":name}}});
        
        if (result.matchedCount==0){
            response = {
                "error": {
                    "code": 409,
                    "message": "No Section found."
                }
            }
            return response;   
        }
        if(result.modifiedCount==1){
            response = {
                "data" :{                                   
                    "message": "Section added/removed to/from the Section successfully.",
                    "code":201
                }   
            };
            return response;        
        }
        else{
            response = {
                "error": {
                    "code": 409,
                    "message": "Error adding/removing common Section to/from the Section."
                }
            }
            return response;       
        }
    } catch (error) {
        response = {
            "error": {
                "code": 500,
                "message": "Error adding common Section to the Section.",
                "errordata": err
              }
        }
        return response;
    }
}

module.exports = {
    addSection,    
    updateSectionVisibilityStatus,
    deleteSectionPermanently,    
    updateSection,  
    getSectionById,        
    addRemoveSections
};