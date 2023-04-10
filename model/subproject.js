"use strict";
var ObjectId = require('mongodb').ObjectId;
const { QueryCollectionFormat } = require('@azure/core-http');
const { JsonWebTokenError } = require('jsonwebtoken');
var mongo = require('../database/mongo');
const user = require('./user');

var addSubProject = async function (subproject) {
    var response = {};
    try {
        var result = await mongo.SubProjects.insertOne(subproject);

        if (result.insertedId) {
            var projresult = await mongo.Projects.updateOne({ _id: new ObjectId(subproject.parentid) }, {
                $push:
                {
                    children:
                    {
                        "id": result.insertedId,
                        "description": subproject.description,
                        "name": subproject.name,
                        "type": "subproject",
                        "url": subproject.url
                    }
                }
            });
            if (projresult.modifiedCount > 0) {
                var msg = "SubProject inserted successfully,parent project updated successfully."
            }
            else
                var msg = "SubProject inserted successfully,parent project failed to updated."

            response = {
                "data": {
                    "id": result.insertedId,
                    "message": msg,
                    "code": 201
                }
            }
        }
        else {
            response = {
                "error": {
                    "code": 500,
                    "message": "No SubProject inserted."
                }
            }
        }
        return response;
    } catch (error) {

    }

};


var getSubProjectById = async function (id) {
    var response = {};
    try {
        const result = await mongo.SubProjects.findOne({ _id: new ObjectId(id) });

        if (result) {
            response = {
                "data": {
                    "item": result,
                    "message": "SubProject found.",
                    "code": 201
                }
            };
            return response;
        } else {
            response = {
                "error": {
                    "code": 401,
                    "message": "No SubProject found."
                }
            }
            return response;
        }
    }
    catch (err) {
        response = {
            "error": {
                "code": 500,
                "message": "Error fetching subproject.",
                "errordata": err
            }
        }
        return response;
    }
};


var assignSubProjectToUser = async function (id, username) {
    var response = {};
    try {
        var result = await mongo.SubProjects.updateOne({ _id: new ObjectId(id) }, { $addToSet: { assignedto: username } });

        if (result.matchedCount == 0) {
            response = {
                "error": {
                    "code": 409,
                    "message": "No subproject found."
                }
            }
            return response;
        }
        if (result.modifiedCount == 1) {
            response = {
                "data": {
                    "message": "SubProject assigned successfully.",
                    "code": 201
                }
            };
            return response;
        }
        else {
            response = {
                "error": {
                    "code": 409,
                    "message": "Error updating the subproject assignment,user already added"
                }
            }
            return response;
        }
    } catch (error) {
        response = {
            "error": {
                "code": 500,
                "message": "Error assigning subproject.",
                "errordata": err
            }
        }
        return response;
    }

};
var unassignUserFromSubProject = async function (id, username) {
    var response = {};
    try {
        var result = await mongo.SubProjects.updateOne({ _id: new ObjectId(id) }, { $pull: { assignedto: username } });

        if (result.matchedCount == 0) {
            response = {
                "error": {
                    "code": 409,
                    "message": "No subproject found."
                }
            }
            return response;
        }

        if (result.modifiedCount == 1) {
            response = {
                "data": {
                    "message": "User removed from subproject assignment successfully.",
                    "code": 201
                }
            };
            return response;
        }
        else {
            response = {
                "error": {
                    "code": 405,
                    "message": "Error updating the subproject assignment/or user not assigned."
                }
            }
            return response;
        }
    } catch (error) {
        response = {
            "error": {
                "code": 500,
                "message": "Error assigning subproject.",
                "errordata": err
            }
        }
        return response;
    }

};


var updateSubProject = async function (subproject) {
    var response = {};
    try {
        var result = await mongo.SubProjects.updateOne({ _id: new ObjectId(subproject.id) }, {
            $set: {
                name: subproject.name,
                description: subproject.description,
                url: subproject.url,
                lasteditedby: subproject.lasteditedby,
                editedat: subproject.editedat
            }
        });

        if (result.matchedCount < 1) {
            response = {
                "error": {
                    "code": 401,
                    "message": "No SubProject found."
                }
            }
            return response;
        } else {
            if (result.modifiedCount == 1) {

                var projresult = await mongo.Projects.updateOne(
                    {
                        "children.id": new ObjectId(subproject.id)
                    },
                    {
                        $set:
                        {
                            "children.$.name": subproject.name,
                            "children.$.description": subproject.description,
                            "children.$.url": subproject.url,
                        }
                    },
                    { upsert: false });
                response = {
                    "data": {
                        "message": "SubProject updated successfully.",
                        "code": 201
                    }
                };
                return response;
            }
            else {
                response = {
                    "data": {
                        "message": "Failed to update the subproject details.",
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
                "message": "Error processing subproject updates.",
                "errordata": err
            }
        }
        return response;
    }

};
//Soft Delete/undelete
var updateSubProjectVisibilityStatus = async function (id, name, parentId, isVisible) {
    var response = {};
    try {
        //update the Projects collection as well.        
        var result = await mongo.SubProjects.updateOne({ _id: new ObjectId(id) }, { $set: { isdeleted: !isVisible } });
        if (result.matchedCount == 0) {
            response = {
                "error": {
                    "code": 405,
                    "message": "No subproject found, invalid id."
                }
            }
            return response;
        }
        if (result.modifiedCount == 1) {
            if (!isVisible)
                var projresult = await mongo.Projects.updateOne({ _id: new ObjectId(parentId) }, { $pull: { children: { "id": new ObjectId(parentId) } } });
            else{
                const result = await mongo.SubProjects.findOne({ _id: new ObjectId(id) });
                var projresult = await mongo.Projects.updateOne({ _id: new ObjectId(parentId) }, {
                    $push:
                    {
                        children:
                        {
                            "id": new ObjectId(id),
                            "name": name,
                            "type": "subproject",
                            "description": result.description,
                            "url": result.url
                        }
                    }
                });
            }
                

            if (projresult.modifiedCount > 0) {
                var message = `SubProject state updated successfully,is Visible:${isVisible}.parent project updated successfully.`;
            }
            else
                var message = `SubProject state updated successfully,is Visible:${isVisible}.project failed to update.`;

            response = {
                "data": {
                    "message": message,
                    "code": 201
                }
            };
            return response;

        }
        else {
            response = {
                "error": {
                    "code": 405,
                    "message": "No subproject modified, try with changed visibility state."
                }
            }
            return response;
        }
    } catch (error) {
        response = {
            "error": {
                "code": 500,
                "message": "Error changing visibility of subproject.",
                "errordata": err
            }
        }
        return response;
    }
};

var deleteSubProjectPermanently = async function (id) {
    try {
        var result = await mongo.SubProjects.deleteOne({ _id: new ObjectId(id) });

        if (result.deletedCount == 1) {

            var response = {
                "data": {
                    "message": "SubProject deleted successfully.",
                    "code": 201
                }
            };
            return response;
        }
        else {
            response = {
                "error": {
                    "code": 401,
                    "message": "No SubProject found."
                }
            }
            return response;
        }
    }
    catch (err) {
        response = {
            "error": {
                "code": 500,
                "message": "Error deleting subproject.",
                "errordata": err
            }
        }
        return response;
    }

};

var addRemoveChildren = async function (subprojectId, isAdd, { id, name, type }) {
    var response = {};
    try {
        if (isAdd)
            var result = await mongo.SubProjects.updateOne({ _id: new ObjectId(subprojectId) }, { $push: { children: { "id": id, "name": name, "type": type } } });
        else
            var result = await mongo.SubProjects.updateOne({ _id: new ObjectId(subprojectId) }, { $pull: { children: { "id": id, "name": name, "type": type } } });

        if (result.matchedCount == 0) {
            response = {
                "error": {
                    "code": 409,
                    "message": "No subproject found."
                }
            }
            return response;
        }
        if (result.modifiedCount == 1) {
            response = {
                "data": {
                    "message": "Common location added/removed to/from the subproject successfully.",
                    "code": 201
                }
            };
            return response;
        }
        else {
            response = {
                "error": {
                    "code": 409,
                    "message": "Error adding/removing common location to/from the subproject."
                }
            }
            return response;
        }
    } catch (error) {
        response = {
            "error": {
                "code": 500,
                "message": "Error adding common location to the subproject.",
                "errordata": err
            }
        }
        return response;
    }
}

module.exports = {
    addSubProject,
    updateSubProjectVisibilityStatus,
    deleteSubProjectPermanently,
    updateSubProject,
    getSubProjectById,
    assignSubProjectToUser,
    unassignUserFromSubProject,
    addRemoveChildren
};