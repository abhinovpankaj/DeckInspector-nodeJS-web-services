"use strict";
var express = require('express');
var router = express.Router();
const subprojects = require("../model/subproject");
const ErrorResponse = require('../model/error');

require("dotenv").config();

router.route('/add')
.post(async function (req,res){
try{
var errResponse;
// Get user input
const { name, description, createdby,url,parentid } = req.body;

// Validate user input
if (!(name&&parentId)) {
  errResponse = new ErrorResponse(400,"Name and parentid is required","");
  res.status(400).json(errResponse);
  return;
}
var creationtime= (new Date(Date.now())).toISOString();
var newSubProject = {
    "name":name,
    "description":description,    
    "createdby":createdby,
    "url":url,    
    "isdeleted":false,
    "createdat":creationtime,
    "assignedto":[] ,
    "parentid": parentid   
} 
var result = await subprojects.addSubProject(newSubProject);    
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
    const subprojectId = req.params.id;
    var result = await subprojects.getSubProjectById( subprojectId);
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
    const subprojectId = req.params.id;
    // Validate user input
    if (!(name&&description&&url&&lasteditedby)) {
      errResponse = new ErrorResponse(500, "name,description,url,lasteditedby are required", "");
      res.status(500).json(errResponse);
      return;
    }
    var editedat=(new Date(Date.now())).toISOString();
    var editedProject = {
        "name":name,
        "id": subprojectId,
        "description":description,            
        "url":url,  
        "lasteditedby":lasteditedby,
        "editedat":editedat,
        "parentid":parentid
    }
  
    var result = await subprojects.updateSubProject(editedProject);
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
    const subprojectId = req.params.id;
    var result = await subprojects.deleteSubProjectPermanently(subprojectId);
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

router.route('/:id/assign')
.post(async function(req,res){
  try {
    var errResponse;
    const subprojectId = req.params.id;
    const {username} = req.body;
    var result = await subprojects.assignSubProjectToUser(subprojectId,username);
    if(result.error){
        res.status(result.error.code).json(result.error);
    }
    if(result.data){
      //console.debug(result);                                          
      res.status(201).json(result.data);
    }
  } catch (error) {
    errResponse = new ErrorResponse(500, "Internal server error", error);
    res.status(500).json(errResponse);
  }
});

router.route('/:id/unassign')
.post(async function(req,res){
  try {
    var errResponse;
    const subprojectId = req.params.id;
    const {username} = req.body;
    var result = await subprojects.unassignUserFromSubProject(subprojectId,username);
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

router.route('/:id/addchild')
.post(async function(req,res){
  try {
    var errResponse;
    const subprojectId = req.params.id;
    const {id,name} = req.body;//type=location always
    var result = await subprojects.addRemoveChildren(subprojectId,true,{id,name,type:"location"});
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
    const subprojectId = req.params.id;
    const {id,name,type} = req.body;
    var result = await subprojects.addRemoveChildren(subprojectId,false,{id,name,type:"location"});
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
    const subprojectId = req.params.id;
    const {parentId,isVisible,name} = req.body;
    
    var result = await subprojects.updateSubProjectVisibilityStatus(subprojectId,name,parentId,isVisible);
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