"use strict";
var ObjectId = require('mongodb').ObjectId;
const { QueryCollectionFormat } = require('@azure/core-http');
const { JsonWebTokenError } = require('jsonwebtoken');
var mongo = require('../database/mongo');


var getInvasiveSectionById = async function(id){
    var response = {};
    try {
        const result = await mongo.InvasiveSections.findOne({ _id: new ObjectId(id) });

        if (result) {
            response = {
                "data": {
                    "item": result,
                    "message": "Invasive Section found.",
                    "code": 201
                }
            };
            return response;
        } else {
            response = {
                "error": {
                    "code": 401,
                    "message": "No Invasive Section found."
                }
            }
            return response;
        }
    }
    catch (err) {
        response = {
            "error": {
                "code": 500,
                "message": "Error fetching Invasive Section.",
                "errordata": err
            }
        }
        return response;
    }
}

var addInvasiveSection = async function(invasiveSection){
    var response = {};
    try {
        var result = await mongo.InvasiveSections.insertOne(invasiveSection);
        var insertedId = result.insertedId;
        if(insertedId){
            response = {
                "data": {
                    "id": insertedId,
                    "message": "Invasive Section inserted Successfully",
                    "code": 201
                }
            }
        }
        else {
            response = {
                "error": {
                    "code": 500,
                    "message": "No Section inserted."
                }
            }
        }
        return response;
    } catch (error) {
        console.log(error);
    }
};

var getInvasiveSectionByParentId = async function(id){
    var response = {};
    try {
        const result = await mongo.InvasiveSections.findOne({ parentid: new ObjectId(id) });

        if (result) {
            response = {
                "data": {
                    "item": result,
                    "message": "Invasive Section found.",
                    "code": 201
                }
            };
            return response;
        } else {
            response = {
                "error": {
                    "code": 401,
                    "message": "No Invasive Section found."
                }
            }
            return response;
        }
    }
    catch (err) {
        response = {
            "error": {
                "code": 500,
                "message": "Error fetching Invasive Section.",
                "errordata": err
            }
        }
        return response;
    }
}

var editInvasiveSection = async function(invasiveSectionId,newInvasiveData)
{
    var response ={};
    try{
        const updateObject = { $set: newInvasiveData };
        var result = await mongo.InvasiveSections.updateOne({ _id: new ObjectId(invasiveSectionId) },updateObject,{upsert:false});    
        
        if(result.modifiedCount<1){
            response = {
                "error": {
                    "code": 401,
                    "message": "No Invasive Section found."
                  }
            }
            return response;
        } else{
            if(result.modifiedCount==1){
                response = {
                    "data" :{                   
                        "message": "Invasive Section updated successfully.",
                        "code":201
                    }   
                };
                return response;
            }           
            else{
                response = {
                    "data" :{                    
                        "message": "Failed to update the Invasive details.",
                        "code":409
                    }   
                };
                return response;
            }                   
        }   
    }
    catch(err){
        console.log(err);
        response = {
            "error": {
                "code": 500,
                "message": "Error fetching Invasive.",
                "errordata": err
              }
        }
        return response;
    }
    
};

module.exports = {
    getInvasiveSectionById,
    getInvasiveSectionByParentId,
    addInvasiveSection,
    editInvasiveSection
};