"use strict";
var ObjectId = require('mongodb').ObjectId;
const { QueryCollectionFormat } = require('@azure/core-http');
const { JsonWebTokenError } = require('jsonwebtoken');
var mongo = require('../database/mongo');


var addSection = async function (section) {
    var response = {};
    try {
        var result = await mongo.Sections.insertOne(section);

        if (result.insertedId) {
            var projresult = await mongo.Locations.updateOne({ _id: new ObjectId(section.parentid) }, {
                $push:
                {
                    sections:
                    {
                        "id": result.insertedId,
                        "name": section.name,
                        "visualsignsofleak": section.visualsignsofleak,
                        "furtherinvasivereviewrequired": section.furtherinvasivereviewrequired,
                        "conditionalassessment": section.conditionalassessment,
                        "visualreview": section.visualreview,
                        "count":0
                    }
                }
            }
            );

            if (projresult.modifiedCount > 0) {
                var msg = "Section inserted successfully,parent updated successfully."
            }
            else
                var msg = "Section inserted successfully,parent failed to updated."

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
                    "message": "No Section inserted."
                }
            }
        }
        return response;
    } catch (error) {

    }

};


var getSectionById = async function (id) {
    var response = {};
    try {
        const result = await mongo.Sections.findOne({ _id: new ObjectId(id) });

        if (result) {
            response = {
                "data": {
                    "item": result,
                    "message": "Section found.",
                    "code": 201
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
    catch (err) {
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
var updateSection = async function (section,count) {
    var response = {};
    try {
        var result = await mongo.Sections.updateOne({ _id: new ObjectId(section.id) }, {
            $set: {
                name: section.name,
                exteriorelements: section.exteriorelements,
                waterproofingelements: section.waterproofingelements,
                lasteditedby: section.lasteditedby,
                editedat: section.editedat,
                additionalconsiderations: section.additionalconsiderations,
                visualreview: section.visualreview,
                visualsignsofleak: section.visualsignsofleak,
                furtherinvasivereviewrequired: section.furtherinvasivereviewrequired,
                conditionalassessment: section.conditionalassessment,
                eee: section.eee,
                lbc: section.lbc,
                awe: section.awe,
                parentid: section.parentid

            }
        });

        if (result.matchedCount < 1) {
            response = {
                "error": {
                    "code": 401,
                    "message": "No Section found."
                }
            }
            return response;
        } else {
            if (result.modifiedCount == 1) {

                var projresult = await mongo.Locations.updateOne(
                    {
                        "sections.id": new ObjectId(section.id)
                    },
                    {
                        $set: {
                            "sections.$.name": section.name,
                            "sections.$.visualsignsofleak": section.visualsignsofleak,
                            "sections.$.furtherinvasivereviewrequired": section.furtherinvasivereviewrequired,
                            "sections.$.conditionalassessment": section.conditionalassessment,
                            "sections.$.visualreview": section.visualreview,
                            "sections.$.count":count
                        }
                    },
                    { upsert: false });
                if (projresult.modifiedCount > 0) {
                    var msg = "Section updated successfully,parent updated successfully."
                }
                else
                    var msg = "Section udated successfully,parent failed to updated."
                response = {
                    "data": {
                        "message": msg,
                        "code": 201
                    }
                };
                return response;
            }
            else {
                response = {
                    "data": {
                        "message": "Failed to update the Section details.",
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
                "message": "Error processing Section updates.",
                "errordata": err
            }
        }
        return response;
    }

};
//Soft Delete/undelete
var updateSectionVisibilityStatus = async function (id, name, parentId, isVisible) {
    var response = {};
    try {
        //update the Projects collection as well.        
        var result = await mongo.Sections.updateOne({ _id: new ObjectId(id) },
            { $set: { isdeleted: !isVisible } });
        if (result.matchedCount == 0) {
            response = {
                "error": {
                    "code": 405,
                    "message": "No Section found, invalid id."
                }
            }
            return response;
        }
        if (result.modifiedCount == 1) {
            const sectionDetails = await mongo.Sections.findOne({ _id: new ObjectId(id) });
            if (!isVisible) {

                var projresult = await mongo.Locations.updateOne({ _id: new ObjectId(parentId) },
                    { $pull: { sections: { "id": new ObjectId(id) } } });
            }
            else {

                var projresult = await mongo.Locations.updateOne({ _id: new ObjectId(parentId) },
                    {
                        $push:
                        {
                            sections:
                            {
                                "id": new ObjectId(id),
                                "name": name,
                                "visualsignsofleak": sectionDetails.visualsignsofleak,
                                "furtherinvasivereviewrequired": sectionDetails.furtherinvasivereviewrequired,
                                "conditionalassessment": sectionDetails.conditionalassessment,
                                "visualreview": sectionDetails.visualreview,
                            }
                        }
                    });
            }

            if (projresult.modifiedCount > 0) {
                var message = `Section state updated successfully,is Visible:${isVisible}.parent  updated successfully.`;
            }
            else
                var message = `Section state updated successfully,is Visible:${isVisible}.parent failed to update.`;

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
    try {
        var result = await mongo.Sections.deleteOne({ _id: new ObjectId(id) });

        if (result.deletedCount == 1) {
            var projresult = await mongo.Locations.updateOne({ _id: new ObjectId(parentId) },
            { $pull: { sections: { "id": new ObjectId(id) } } });
            var response = {
                "data": {
                    "message": "Section deleted successfully.",
                    "code": 201
                }
            };
            return response;
        }
        else {
            response = {
                "error": {
                    "code": 401,
                    "message": "No Section found."
                }
            }
            return response;
        }
    }
    catch (err) {
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

var addRemoveImages = async function (sectionId,count, isAdd, url) {
    var response = {};
    try {
        if (isAdd){
            var result = await mongo.Sections.updateOne({ _id: new ObjectId(sectionId) }, 
            { $push: { images: url } });

            var projresult = await mongo.Locations.updateOne(
                {
                    "sections.id": new ObjectId(sectionId)
                },
                {
                    $set: {
                        "sections.$.count":++count
                    }
                });
        
        }
        else{
            var result = await mongo.Sections.updateOne({ _id: new ObjectId(sectionId) }, 
            { $pull: { images: url } });
            var projresult = await mongo.Locations.updateOne(
                {
                    "sections.id": new ObjectId(sectionId)
                },
                {
                    $set: {
                        "sections.$.count":--count
                    }
                });
        }
            

        if (result.matchedCount == 0) {
            response = {
                "error": {
                    "code": 409,
                    "message": "No Section found."
                }
            }
            return response;
        }
        if (result.modifiedCount == 1) {
            response = {
                "data": {
                    "message": "image added/removed to/from the Section successfully.",
                    "code": 201
                }
            };
            return response;
        }
        else {
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
    addRemoveImages
};