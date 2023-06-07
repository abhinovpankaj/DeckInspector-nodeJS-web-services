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

module.exports = {
    getInvasiveSectionById,
    getInvasiveSectionByParentId
};