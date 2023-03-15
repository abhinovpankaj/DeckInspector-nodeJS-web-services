"use strict";
var express = require('express');
var router = express.Router();
const subprojects = require("../model/subproject");

require("dotenv").config();

router.route('/add')
.post(async function (req,res){
try{

// Get user input
const { name, description, createdby,url,parentId } = req.body;

// Validate user input
if (!(name&&parentId)) {
  res.status(400).send("Name and parentid is required");
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
    "parentId":parentId   
} 
var result = await subprojects.addSubProject(newSubProject);    
if(result.error){
    res.status(result.error.code).send(result.error);
  }
  if(result.data){
    console.debug(result);
    res.status(201).json(result.data);
  }
 
}catch (err) {
    console.log(err);
    res.status(500).send(`Intenal server error.${err}"`);
}
});


router.route('/:id')
.get(async function(req,res){
  try{
    const subprojectId = req.params.id;
    var result = await subprojects.getSubProjectById( subprojectId);
    if(result.error){
        res.status(result.error.code).send(result.error);
    }
    if(result.data){
      //console.debug(result);                                          
      res.status(201).json(result.data);
    }
  }
  catch(ex){
    res.status(500).send(`Internal server error.${ex}`);
  }
})
.put(async function(req,res){
  try{
    const { name, description,url,lasteditedby,parentId} = req.body;
    const subprojectId = req.params.id;
    // Validate user input
    if (!(name&&description&&url&&lasteditedby)) {
      res.status(400).send("all inputs are required");
    }
    var editedat=(new Date(Date.now())).toISOString();
    var editedProject = {
        "name":name,
        "id": subprojectId,
        "description":description,            
        "url":url,  
        "lasteditedby":lasteditedby,
        "editedat":editedat,
        "parentId":parentId
    }
  
    var result = await subprojects.updateSubProject(editedProject);
    if(result.error){
        res.status(result.error.code).send(result.error);
    }
    if(result.data){
      //console.debug(result);                                          
      res.status(201).json(result.data);
    }
  }

  catch(err){
    res.status(500).send(`Intenal server error.${err}"`);
  }
})
.delete(async function(req,res){
  try{
    const subprojectId = req.params.id;
    var result = await subprojects.deleteSubProjectPermanently(subprojectId);
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
    const subprojectId = req.params.id;
    const {username} = req.body;
    var result = await subprojects.assignSubProjectToUser(subprojectId,username);
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

router.route('/:id/unassign')
.post(async function(req,res){
  try {
    const subprojectId = req.params.id;
    const {username} = req.body;
    var result = await subprojects.unassignUserFromSubProject(subprojectId,username);
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
    const subprojectId = req.params.id;
    const {id,name} = req.body;//type=location always
    var result = await subprojects.addRemoveChildren(subprojectId,true,{id,name,type:"location"});
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
    const subprojectId = req.params.id;
    const {id,name,type} = req.body;
    var result = await subprojects.addRemoveChildren(subprojectId,false,{id,name,type:"location"});
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

router.route('/:id/toggleVisibility/')
.post(async function(req,res){
  try {
    const subprojectId = req.params.id;
    const {parentId,isVisible,name} = req.body;
    
    var result = await subprojects.updateSubProjectVisibilityStatus(subprojectId,name,parentId,isVisible);
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