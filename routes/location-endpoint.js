"use strict";
var express = require('express');
var router = express.Router();
const locations = require("../model/location");
const ErrorResponse = require('../model/error');

require("dotenv").config();

router.route('/add')
.post(async function (req,res){
try{
var errResponse;
// Get user input
const { name, description, createdby,url,parentid,parenttype,type } = req.body;

// Validate user input
if (!(name&&parentid)) {
  errResponse = new ErrorResponse(400,"Name,parenttype and parentid is required","");
  res.status(400).json(errResponse);
  return;
}
var creationtime= (new Date(Date.now())).toISOString();
var newLocation = {
    "name":name,
    "description":description,    
    "createdby":createdby,
    "url":url,    
    "isdeleted":false,
    "createdat":creationtime,    
    "parentid":parentid,
    "parenttype": parenttype,
    "type":type
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
.put(async function(req,res){
  try{
    var errResponse;
    const { name, description,url,lasteditedby,parentid} = req.body;
    const locationId = req.params.id;
    // Validate user input
    if (!(name&&description&&url&&lasteditedby)) {
      errResponse = new ErrorResponse(500, "name,description,url and lasteditedby are required", "");
      res.status(500).json(errResponse);
      return;
    }
    var editedat=(new Date(Date.now())).toISOString();
    var editedLocation = {
        "name":name,        
        "description":description,            
        "url":url,
        "id"  :locationId,
        "lasteditedby":lasteditedby,
        "editedat":editedat        
    }
  
    var result = await locations.updateLocation(editedLocation);
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
    const {parentId,isVisible,name} = req.body;
    
    var result = await locations.updateLocationVisibilityStatus(locationId,name,parentId,isVisible);
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


module.exports = router ;