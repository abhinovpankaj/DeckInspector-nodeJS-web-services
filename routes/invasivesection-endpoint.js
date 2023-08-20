"use strict";
var express = require('express');
var router = express.Router();
const invasiveSections = require("../model/invasiveSections");
const ErrorResponse = require('../model/error');
const { InvasiveSections } = require('../database/mongo');
var ObjectId = require('mongodb').ObjectId;

require("dotenv").config();

router.route('/getInvasiveSectionById')
.post(async function(req, res) {
    try {
      const sectionId = req.body.invaisveSectionid; // Use req.body instead of req.params
      const userName = req.body.username; // Use req.body instead of req.params

      const result = await invasiveSections.getInvasiveSectionById(sectionId);

      if (result.error) {
        res.status(result.error.code).json(result.error);
      } else if (result.data) {
        res.status(201).json(result.data);
      } else {
        res.status(404).json({ message: 'Invasive Section not found' }); // Add a response for the case when no data is returned
      }
    } catch (error) {
      console.log(error);
      const errResponse = { code: 500, message: 'Internal server error', error }; // Create a custom error response object
      res.status(500).json(errResponse);
    }
  });


router.route('/:id')
.put(async function(req,res){
        try{
          var errResponse;
          const invasivesectionId = req.params.id;
          const newData = req.body;

          if(newData.parentid){
            newData.parentid = new ObjectId(newData.parentid);
          }
      
          var result = await invasiveSections.editInvasiveSection(invasivesectionId,newData);
      
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
});
    


router.route('/add')
  .post(async function (req,res){
  try{
  var errResponse; 
  // Get user input
  const { invasiveDescription,parentid,postinvasiverepairsrequired,invasiveimages } = req.body;
  
  // Validate user input
  if (!(parentid)) {
    errResponse = new ErrorResponse(400,"parentid is required","");
    res.status(400).json(errResponse);
    return;
  }
  var newInvasiveSection = {
      "invasiveDescription":invasiveDescription,
      "parentid": new ObjectId(parentid), 
      "postinvasiverepairsrequired":(postinvasiverepairsrequired.toLowerCase() === "true"),
      "invasiveimages":invasiveimages,
  } 
  var result = await invasiveSections.addInvasiveSection(newInvasiveSection);    
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


router.route('/getInvasiveSectionByParentId')
.post(async function(req, res) {
    try {
        const parentSectionId = req.body.parentSectionId; // Use req.body instead of req.params
        const userName = req.body.username; // Use req.body instead of req.params
  
        const result = await invasiveSections.getInvasiveSectionByParentId(parentSectionId);
  
        if (result.error) {
          res.status(result.error.code).json(result.error);
        } else if (result.data) {
          res.status(201).json(result.data);
        } else {
          res.status(404).json({ message: 'Invasive Section not found' }); // Add a response for the case when no data is returned
        }
      } catch (error) {
        console.log(error);
        const errResponse = { code: 500, message: 'Internal server error', error }; // Create a custom error response object
        res.status(500).json(errResponse);
      }
});

module.exports = router ;
    