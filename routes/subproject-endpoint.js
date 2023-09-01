"use strict";
var express = require('express');
var router = express.Router();
const subprojects = require("../model/subproject");
const locations = require("../model/location");
const ErrorResponse = require('../model/error');
const Project = require('../model/project');
var ObjectId = require('mongodb').ObjectId;

require("dotenv").config();


/**
 * name
 * description
 * parentid
 * parenttype
 * isInvasive
 * type:subproject
 * url:
 * createdat
 * createdby
 * editedat
 * lasteditedby
 * assignedto:
 * children:[]
 */
router.route('/add')
.post(async function (req,res){
try{
var errResponse;
// Get user input
const { name, description, parentid,parenttype,isInvasive,url,assignedTo,createdBy } = req.body;

// Validate user input
if (!(name&&parentid)) {
  errResponse = new ErrorResponse(400,"Name and parentid is required","");
  res.status(400).json(errResponse);
  return;
}

const parentProject = await Project.getProjectById(parentid);
if(!parentProject.data){
  errResponse = new ErrorResponse(400,"Invalid Parent Id","");
  res.status(400).json(errResponse);
  return;
}

var creationtime= new Date(Date.now()).toISOString();
//console.log(creationtime);
try{
  var newSubProject = {
      "name":name,
      "description":description,
      "parentid": new ObjectId(parentid), 
      "parenttype": parenttype,
      "type": "subproject",
      "url":url,    
      "createdat":creationtime,
      "createdby":createdBy,
      "assignedto":assignedTo,
      "editedat":creationtime ,
      "lasteditedby":createdBy,
      "children":[],
      "isInvasive": isInvasive
    } 
}catch(ex){
  console.log(ex);
  errResponse = new ErrorResponse(500, "Internal server error", ex);
  res.status(500).json(errResponse);
  return;
}
console.log(newSubProject);
var result = await subprojects.addSubProject(newSubProject); 
console.log(result);
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


router.route('/getSubProjectById')
.post(async function(req,res){
  try{
    var errResponse;
    const subprojectId = req.body.subprojectid;
    const userName = req.body.username;
    var result = await subprojects.getSubProjectById(subprojectId);
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
    const subprojectId = req.params.id;
    // Validate user input
    if(newData.parentid){
      newData.parentid = new ObjectId(newData.parentid);
    }
    var result = await subprojects.editSubProject(subprojectId,newData);
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

router.route('/getSubprojectsDataByProjectId')
.post(async function(req,res){
  try {
    var errResponse;
    const projectId = req.body.projectid;
    var result = await subprojects.getSubProjectsByParentId(projectId);
    
    const subprojectsData = result.data.item;
    for(const subProject of subprojectsData){
      const subProjectId = subProject._id;
      const subProjectChildren = await locations.getLocationByParentId(subProjectId);
      console.log("SubProjectDhildren " ,subProjectChildren);
      if(subProjectChildren.data)
      {
        subProject.children = subProjectChildren.data.item;
      }
    }
    if(result.error){
        res.status(result.error.code).json(result.error);
    }
    if(result.data){
      //console.debug(result);                                          
      res.status(201).json(result.data);
    }
  } catch (error) {
    console.log(error);
    errResponse = new ErrorResponse(500, "Internal server error", error);
      res.status(500).json(errResponse);
  }
});





module.exports = router ;