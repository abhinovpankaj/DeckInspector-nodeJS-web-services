"use strict";
var ObjectId = require('mongodb').ObjectId;
const { QueryCollectionFormat } = require('@azure/core-http');
const { JsonWebTokenError } = require('jsonwebtoken');
var mongo = require('../database/mongo');

var getConclusiveSectionById = async function(id){
    var response = {};
    try {
        const result = await mongo.ConclusiveSections.findOne({ _id: new ObjectId(id) });

        if (result) {
            response = {
                "data": {
                    "item": result,
                    "message": "Conclusive Section found.",
                    "code": 201
                }
            };
            return response;
        } else {
            response = {
                "error": {
                    "code": 401,
                    "message": "No Conclusive Section found."
                }
            }
            return response;
        }
    }
    catch (err) {
        response = {
            "error": {
                "code": 500,
                "message": "Error fetching Conclusive Section.",
                "errordata": err
            }
        }
        return response;
    }

}


var getConclusiveSectionByParentId = async function(id){
    var response = {};
    try {
        const result = await mongo.ConclusiveSections.findOne({ parentid: new ObjectId(id) });

        if (result) {
            response = {
                "data": {
                    "item": result,
                    "message": "Conclusive Section found.",
                    "code": 201
                }
            };
            return response;
        } else {
            response = {
                "error": {
                    "code": 401,
                    "message": "No Conclusive Section found."
                }
            }
            return response;
        }
    }
    catch (err) {
        response = {
            "error": {
                "code": 500,
                "message": "Error fetching Conclusive Section.",
                "errordata": err
            }
        }
        return response;
    }

}


module.exports = {
    getConclusiveSectionById,
    getConclusiveSectionByParentId
};