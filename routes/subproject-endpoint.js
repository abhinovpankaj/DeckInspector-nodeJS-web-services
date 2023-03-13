"use strict";
var express = require('express');
var router = express.Router();
const projects = require("../model/subproject");

require("dotenv").config();

router.route('/add')
.post(async function (req,res){
try{

// Get user input
const { name, description, address, createdby,url } = req.body;

// Validate user input
if (!(name)) {
  res.status(400).send("Name is required");
}
var creationtime= (new Date(Date.now())).toISOString();
var newProject = {
    "name":name,
    "description":description,
    "address":address,
    "createdby":createdby,
    "url":url,
    "isavailableoffline":false,
    "iscomplete":false,
    "isdeleted":false,
    "createdat":creationtime,
    "assignedto":[]
    
} 
var result = await projects.addProject(newProject);    
if(result.error){
    res.status(result.error.code).send(result.error);
  }
  if(result.data){
    console.debug(result);
    res.status(201).json(result.data);
  }
 
}catch (err) {
    console.log(err);
}
});

router.route('/allprojects')
.get(async function(req,res){  
try{
    var result = await projects.getAllProjects();
    if(result.error){
      res.status(result.error.code).send(result.error);
    }
    if(result.data){
      console.debug(result);
      res.status(201).json(result.data);
    }
    
}
catch(exception){
  res.status(500).send(`Intenal server error.${exception}"`);
}
});

router.route('/filterprojects')
.post(async function(req,res){  
try{
    const {name,isdeleted,iscomplete,createdon}=req.body;

    var result = await projects.getProjectsByNameCreatedOnIsCompletedAndDeleted({name,isdeleted,iscomplete,createdon});
    if(result.error){
      res.status(result.error.code).send(result.error);
    }
    if(result.data){
      //console.debug(result);
      res.status(result.data.code).json(result.data);
    }
    
}
catch(exception){
  res.status(500).send(`Intenal server error.${exception}"`);
}
});

router.route('/:id')
.get(async function(req,res){
  try{
    const projectId = req.params.id;
    var result = await projects.getProjectById( projectId);
    if(result.error){
        res.status(result.error.code).send(result.error);
    }
    if(result.data){
      console.debug(result);                                          
      res.status(201).json(result.data);
    }
  }
  catch{
    res.status(500).send("Internal server error.");
  }
})
.put(async function(req,res){
  try{
    const { name, description, address,url,lasteditedby} = req.body;
    const projectId = req.params.id;
    // Validate user input
    if (!(name&&description&&address&&url&&lasteditedby)) {
      res.status(400).send("all inputs are required");
    }
    var editedat=(new Date(Date.now())).toISOString();
    var editedProject = {
        "name":name,
        "id":projectId,
        "description":description,
        "address":address,    
        "url":url,  
        "lasteditedby":lasteditedby,
        "editedat":editedat
    }
  
    var result = await projects.updateProject(editedProject);
    if(result.error){
        res.status(result.error.code).send(result.error);
    }
    if(result.data){
      //console.debug(result);                                          
      res.status(201).json(result.data);
    }
  }

  catch(err){
    res.status(500).send("Internal server error.");
  }
})
.delete(async function(req,res){
  try{
    const projectId = req.params.id;
    var result = await projects.deleteProjectPermanently(projectId);
    if (result.error) { 
      res.status(result.error.code).send(result.error); 
    }
    if(result.data) {          
      res.status(201).json(result.data);
    }
      
  }
  catch(err){
    res.status(500).send("Internal server error.Failed to delete project.");
  }
});

router.route('/:id/assign')
.post(async function(req,res){
  try {
    const projectId = req.params.id;
    const {username} = req.body;
    var result = await projects.assignProjectToUser(projectId,username);
    if(result.error){
        res.status(result.error.code).send(result.error);
    }
    if(result.data){
      //console.debug(result);                                          
      res.status(201).json(result.data);
    }
  } catch (error) {
    res.status(500).send("Internal server error.");
  }
});
router.route('/:id/toggleOfflineState/:state')
.post(async function(req,res){
  try {
    const projectId = req.params.id;
    const state = req.params.state;
    const isavailableoffline = state==1?true:false;
    var result = await projects.updateProjectOfflineAvailabilityStatus(projectId,isavailableoffline);
    if(result.error){
        res.status(result.error.code).send(result.error);
    }
    if(result.data){
      //console.debug(result);                                          
      res.status(result.data.code).json(result.data);
    }
  } catch (error) {
    res.status(500).send("Internal server error.");
  }
});

router.route('/:id/unassign')
.post(async function(req,res){
  try {
    const projectId = req.params.id;
    const {username} = req.body;
    var result = await projects.unassignUserFromProject(projectId,username);
    if(result.error){
        res.status(result.error.code).send(result.error);
    }
    if(result.data){
      //console.debug(result);                                          
      res.status(result.data.code).json(result.data);
    }
  } catch (error) {
    res.status(500).send("Internal server error.");
  }
});

router.route('/:id/addchild')
.post(async function(req,res){
  try {
    const projectId = req.params.id;
    const {id,name,type} = req.body;
    var result = await projects.addRemoveChildren(projectId,true,{id,name,type});
    if(result.error){
        res.status(result.error.code).send(result.error);
    }
    if(result.data){
      //console.debug(result);                                          
      res.status(result.data.code).json(result.data);
    }
  } catch (error) {
    res.status(500).send("Internal server error.");
  }
});

router.route('/:id/removechild')
.post(async function(req,res){
  try {
    const projectId = req.params.id;
    const {id,name,type} = req.body;
    var result = await projects.addRemoveChildren(projectId,false,{id,name,type});
    if(result.error){
        res.status(result.error.code).send(result.error);
    }
    if(result.data){
      //console.debug(result);                                          
      res.status(result.data.code).json(result.data);
    }
  } catch (error) {
    res.status(500).send("Internal server error.");
  }
});

router.route('/:id/toggleVisibility/:state')
.post(async function(req,res){
  try {
    const projectId = req.params.id;
    const state = req.params.state;
    const isVisible = state==1?true:false;
    var result = await projects.updateProjectVisibilityStatus(projectId,isVisible);
    if(result.error){
        res.status(result.error.code).send(result.error);
    }
    if(result.data){
      //console.debug(result);                                          
      res.status(result.data.code).json(result.data);
    }
  } catch (error) {
    res.status(500).send("Internal server error.");
  }
});

router.route('/:id/toggleprojectstatus/:state')
.post(async function(req,res){
  try {
    const projectId = req.params.id;
    const state = req.params.state;
    const iscomplete = state==1?true:false;
    var result = await projects.updateProjectVisibilityStatus(projectId,iscomplete);
    if(result.error){
        res.status(result.error.code).send(result.error);
    }
    if(result.data){
      //console.debug(result);                                          
      res.status(result.data.code).json(result.data);
    }
  } catch (error) {
    res.status(500).send("Internal server error.");
  }
});

module.exports = router ;