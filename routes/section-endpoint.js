"use strict";
var express = require('express');
var router = express.Router();
const locations = require("../model/sections");
const ErrorResponse = require('../model/error');

require("dotenv").config();

router.route('/add')
.post(async function (req,res){
try{
var errResponse;
// Get user input

const { name, exteriorelements, waterproofingelements,additionalconsiderations,
  thumbnail,visualreview,visualsignsofleak,furtherinvasivereviewrequired,conditionalassessment,
awe,eee,lbc,images,createdby,parentid } = req.body;

// Validate user input
if (!(name&&parentid)) {
  errResponse = new ErrorResponse(400,"Name and parentid is required","");
  res.status(400).json(errResponse);
  return;
}
var creationtime= (new Date(Date.now())).toISOString();
var newSection = {
    "name":name,
    "exteriorelements":exteriorelements,    
    "waterproofingelements":waterproofingelements,
    "additionalconsiderations":additionalconsiderations,    
    "thumbnail":thumbnail,
    "visualreview":visualreview,   
    "isdeleted":false, 
    "parentid":parentid,
    "visualsignsofleak": visualsignsofleak,
    "furtherinvasivereviewrequired":furtherinvasivereviewrequired,
    "conditionalassessment":conditionalassessment,   
    "awe":awe, 
    "eee":eee,
    "lbc": lbc,
    "images":images,
    "createdby":createdby
} 
var result = await sections.addSection(newSection);    
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
    const sectionId = req.params.id;
    var result = await sections.getSectionById( sectionId);
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
    const { name, exteriorelements, waterproofingelements,additionalconsiderations,
      thumbnail,visualreview,visualsignsofleak,furtherinvasivereviewrequired,conditionalassessment,
    awe,eee,lbc,lasteditedby,parentid } = req.body;
    const locationId = req.params.id;
    // Validate user input
    if (!(name&&lasteditedby&&parentid)) {
      errResponse = new ErrorResponse(500, "name,parentid,lasteditedby are required", "");
      res.status(500).json(errResponse);
      return;
    }
    var editedat=(new Date(Date.now())).toISOString();
    
    var editedSection = {
      "name":name,
      "exteriorelements":exteriorelements,    
      "waterproofingelements":waterproofingelements,
      "additionalconsiderations":additionalconsiderations,    
      "thumbnail":thumbnail,
      "visualreview":visualreview,   
      "isdeleted":false, 
      "parentid":parentid,
      "visualsignsofleak": visualsignsofleak,
      "furtherinvasivereviewrequired":furtherinvasivereviewrequired,
      "conditionalassessment":conditionalassessment,   
      "awe":awe, 
      "eee":eee,
      "lbc": lbc,
      "images":images,
      "lasteditedby":lasteditedby,
      "editedat":editedat,
  } 
  
    var result = await sections.updateSection(editedSection);
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
    const sectionId = req.params.id;
    var result = await sections.deleteLocationPermanently(sectionId);
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

router.route('/:id/addimage')
.post(async function(req,res){
  try {
    var errResponse;
    const sectionId = req.params.id;
    const {url} = req.body;
    var result = await locations.addRemoveImages(sectionId,true,url);
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

router.route('/:id/removeimage')
.post(async function(req,res){
  try {
    var errResponse;
    const sectionId = req.params.id;
    const {url} = req.body
    var result = await sections.addRemoveImages(sectionId,false,url);
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
    
    var result = await sections.updateSectionVisibilityStatus(locationId,name,parentId,isVisible);
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