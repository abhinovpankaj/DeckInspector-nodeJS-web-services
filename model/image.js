"use strict";
var ObjectId = require('mongodb').ObjectId;
const { QueryCollectionFormat } = require('@azure/core-http');
const { JsonWebTokenError } = require('jsonwebtoken');
var mongo = require('../database/mongo');

var updateImageURL = async function (id, imageUrl, lasteditedby, editedat, type, parenttype) {
    var response = {};
    try {
        switch (type) {
            case 'project':
                var result = await mongo.Projects.updateOne({ _id: new ObjectId(id) },
                    {
                        $set:
                        {
                            url: imageUrl,
                            lasteditedby: lasteditedby,
                            editedat: editedat
                        }
                    });
                break;
            case 'subproject':
                var result = await mongo.SubProjects.updateOne({ _id: new ObjectId(id) },
                    {
                        $set:
                        {

                            url: imageUrl,
                            lasteditedby: lasteditedby,
                            editedat: editedat
                        }
                    });
                    var projresult = await mongo.Projects.updateOne(
                        {
                            "children.id": new ObjectId(id)
                        },
                        {
                            $set:
                            {                                
                                "children.$.url": imageUrl,                               
                            }
                        },
                        { upsert: false });
                break;
            case 'location':
                
                var result = await mongo.Locations.updateOne({ _id: new ObjectId(id) },
                    {
                        $set:
                        {

                            url: imageUrl,
                            lasteditedby: lasteditedby,
                            editedat: editedat
                        }
                    });
                    if(parenttype=='project'){
                        var projresult = await mongo.Projects.updateOne(
                            {
                                "children.id": new ObjectId(id)
                            },
                            {
                                $set:
                                {                                
                                    "children.$.url": imageUrl,                               
                                }
                            },
                            { upsert: false });
                    }
                    else{
                        projresult = await mongo.SubProjects.updateOne(
                            {
                                "children.id": new ObjectId(id)
                            },
                            {
                                $set:
                                {                                
                                    "children.$.url": imageUrl,                               
                                }
                            },
                            { upsert: false });
                    }                        
                break;
                case 'section':
                var result = await mongo.Sections.updateOne({ _id: new ObjectId(id) },
                    {
                        $addToSet: { images: imageUrl },

                        $set:
                        {
                            lasteditedby: lasteditedby,
                            editedat: editedat
                        }
                    });
                    var projresult = await mongo.Locations.updateOne(
                        {
                            "sections.id": new ObjectId(id)
                        },
                        
                        { $set:{ "sections.$.url": imageUrl}, $inc: { "sections.$.count": 1 }}
                        , 
                        { upsert: false });
                break;
            default:
                break;
        }
        

        if (result.matchedCount < 1) {
            response = {
                "error": {
                    "code": 401,
                    "message": "No matching entity found"
                }
            }
            return response;
        } else {
            if (result.modifiedCount == 1) {
                response = {
                    "data": {
                        "message": "Image url updated successfully.",
                        "code": 201
                    }
                };
                return response;
            }
            else {
                response = {
                    "data": {
                        "message": "Failed to update the entity image.",
                        "code": 409
                    }
                };
                return response;
            }
        }
    }
    catch (err) {
        response = {
            "error": {
                "code": 500,
                "message": "Error fetching entity or applying changes.",
                "errordata": err
            }
        }
        return response;
    }
};
module.exports = {
    updateImageURL
};