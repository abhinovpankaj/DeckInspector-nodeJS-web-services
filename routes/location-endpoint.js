"use strict";
var express = require('express');
var router = express.Router();
const locations = require("../model/location");
const sections = require("../model/sections");
const ErrorResponse = require('../model/error');
var ObjectId = require('mongodb').ObjectId;

require("dotenv").config();

router.route('/add')
.post(async function (req,res){
try{
var errResponse;
// Get user input
const { name, description, createdBy,url,parentid,parenttype,type,isInvasive} = req.body;

// Validate user input
if (!(name&&parentid)) {
  errResponse = new ErrorResponse(400,"Name,parenttype and parentid is required","");
  res.status(400).json(errResponse);
  return;
}
var creationtime= (new Date(Date.now())).toISOString();
try{
  var newLocation = {
      "name":name,
      "description":description,    
      "createdby":createdBy,
      "url":url,
      "createdat":creationtime,    
      "parentid": new ObjectId(parentid),
      "parenttype": parenttype,
      "type":type,
      "sections":[],
      "lasteditedBy":createdBy,
      "editedat":creationtime,
      "isInvasive":isInvasive
  }
}catch(ex){
  console.log(ex);
  errResponse = new ErrorResponse(500, "Internal server error", ex);
  res.status(500).json(errResponse);
  return;
} 
var result = await locations.addLocation(newLocation);    
if(result.error){
    res.status(result.error.code).json(result.error);
  }
  if(result.data){
    console.debug(result);
    res.status(201).json(result.data);
  }
 
}catch (err) {
  errResponse = new ErrorResponse(500, "Internal server error", err);
  res.status(500).json(errResponse);
}
});


router.route('/:id')
.get(async function(req,res){
  try{
    var errResponse;
    const locationId = req.params.id;
    var result = await locations.getLocationById( locationId);
    if(result.error){
        res.status(result.error.code).json(result.error);
    }
    if(result.data){
      //console.debug(result);                                          
      res.status(201).json(result.data);
    }
  }
  catch(ex){
    errResponse = new ErrorResponse(500, "Internal server error", ex);
      res.status(500).json(errResponse);
  }
})

router.route('/:id')
.put(async function(req,res){
  try{
    var errResponse;
    const newData = req.body;
    const locationId = req.params.id;
    var result = await locations.editLocation(locationId,newData);
    if(result.error){
        res.status(result.error.code).json(result.error);
    }
    if(result.data){
      //console.debug(result);                                          
      res.status(201).json(result.data);
    }
  }

  catch(err){
    errResponse = new ErrorResponse(500, "Internal server error", err);
      res.status(500).json(errResponse);
  }
})
.delete(async function(req,res){
  try{
    var errResponse;
    const locationId = req.params.id;
    var result = await locations.deleteLocationPermanently(locationId);
    if (result.error) { 
      res.status(result.error.code).json(result.error); 
    }
    if(result.data) {          
      res.status(201).json(result.data);
    }
      
  }
  catch(err){
    errResponse = new ErrorResponse(500, "Internal server error", err);
      res.status(500).json(errResponse);
  }
});

router.route('/:id/addchild')
.post(async function(req,res){
  try {
    var errResponse;
    const locationId = req.params.id;
    const {id,name} = req.body;//type=location always
    var result = await locations.addRemoveSections(locationId,true,{id,name,type:"location"});
    if(result.error){
        res.status(result.error.code).json(result.error);
    }
    if(result.data){
      //console.debug(result);                                          
      res.status(result.data.code).json(result.data);
    }
  } catch (error) {
    errResponse = new ErrorResponse(500, "Internal server error", error);
      res.status(500).json(errResponse);
  }
});

router.route('/:id/removechild')
.post(async function(req,res){
  try {
    var errResponse;
    const locationId = req.params.id;
    const {id,name,type} = req.body;
    var result = await locations.addRemoveSections(locationId,false,{id,name,type:"location"});
    if(result.error){
        res.status(result.error.code).json(result.error);
    }
    if(result.data){
      //console.debug(result);                                          
      res.status(result.data.code).json(result.data);
    }
  } catch (error) {
    errResponse = new ErrorResponse(500, "Internal server error", error);
      res.status(500).json(errResponse);
  }
});

router.route('/:id/toggleVisibility/')
.post(async function(req,res){
  try {
    var errResponse;
    const locationId = req.params.id;
    const {type,parentId,parentType,isVisible,name} = req.body;
    
    var result = await locations.updateLocationVisibilityStatus(locationId,type,name,parentId,parentType,isVisible);
    if(result.error){
        res.status(result.error.code).json(result.error);
    }
    if(result.data){
      //console.debug(result);                                          
      res.status(result.data.code).json(result.data);
    }
  } catch (error) {
    errResponse = new ErrorResponse(500, "Internal server error", error);
      res.status(500).json(errResponse);
  }
});

router.route('/getLocationById').
post(async function(req,res){
  try{
    var errResponse;
    const locationId = req.body.locationid;
    const userName = req.body.username;
    var result = await locations.getLocationById( locationId);
    if(result.error){
        res.status(result.error.code).json(result.error);
    }
    if(result.data){
      //console.debug(result);                                          
      res.status(201).json(result.data);
    }
  }
  catch(ex){
    errResponse = new ErrorResponse(500, "Internal server error", ex);
      res.status(500).json(errResponse);
  }
});

router.route('/getLocationSectionsMetaData')
.post(async function(req,res){
  try{
    var errResponse;
    const locationId = req.body.locationid;
    const userId = req.body.username;
    const result = await sections.getSectionMetaDataForLocationId(locationId);
    if (result.error) {
      res.status(result.error.code).json(result.error);
    } else if (result.data) {
      res.status(201).json(result.data);
    } else {
      res.status(404).json({ message: 'Sections not found' }); // Add a response for the case when no data is returned
    }
  } catch (error) {
    console.log(error);
    errResponse = { code: 500, message: 'Internal server error', error }; // Create a custom error response object
    res.status(500).json(errResponse);
  }
});

router.route('/getLocationsByProjectId')
.post(async function(req,res){
try{
  var errorResponse;
  const projectId = req.body.projectid;
  const username = req.body.username;
  var result = await locations.getLocationByParentId(projectId);
  if (result.error) {
    res.status(result.error.code).json(result.error);
  } else if (result.data) {
    res.status(201).json(result.data);
  } else {
    res.status(404).json({ message: 'Sections not found' }); // Add a response for the case when no data is returned
  }
}catch(error){
  console.log(error);
  errorResponse = { code: 500, message: 'Internal server error', error }; // Create a custom error response object
  res.status(500).json(errorResponse);
}
});

module.exports = router ;