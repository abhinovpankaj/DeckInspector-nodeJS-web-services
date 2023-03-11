"use strict";
var express = require('express');
var router = express.Router();
const projects = require("../model/project");

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

var newProject = {
    "name":name,
    "description":description,
    "address":address,
    "createdby":createdby,
    "url":url,
    "isavailableoffline":false,
    "iscomplete":false,
    "isdeleted":false
} 
var result = await projects.addProject(newProject);    
if(result.error){
    res.status(result.error.code).send(result.error.message);
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
      res.status(result.error.code).send(result.error.message);
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
//#endregion
router.route('/:id')
.get(async function(req,res){
  try{
    const projectId = req.params.id;
    var result = await projects.getProjectById( projectId);
    if(result.error){
        res.status(result.error.code).send(result.error.message);
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
.delete(async function(req,res){
  try{
    const username = req.params.username;
    users.removeUser( username ,async function(err,record){
      if (err) { res.status(err.status).send(err.message); 
      }
      else {
          if (record){
            
            res.status(201).send("user delete successfully"); 
          }                     
            else
              res.status(401).send("user not found.");
      }
  });    
  }
  catch{
    res.status(500).send("Internal server error.Failed to delete user.");
  }
});

module.exports = router ;