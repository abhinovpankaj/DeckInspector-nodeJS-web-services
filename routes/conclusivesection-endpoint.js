"use strict";
var express = require('express');
var router = express.Router();
const conclusiveSection = require("../model/conclusiveSections");
const ErrorResponse = require('../model/error');
const { ConclusiveSections } = require('../database/mongo');
var ObjectId = require('mongodb').ObjectId;

require("dotenv").config();


router.route('/getConclusiveSectionById')
.post(async function(req, res) {
    try {
      const conclusiveSectionid = req.body.conclusiveSectionid; // Use req.body instead of req.params
      const userName = req.body.username; // Use req.body instead of req.params

      const result = await conclusiveSection.getConclusiveSectionById(conclusiveSectionid);

      if (result.error) {
        res.status(result.error.code).json(result.error);
      } else if (result.data) {
        res.status(201).json(result.data);
      } else {
        res.status(404).json({ message: 'Conclusive Section not found' }); // Add a response for the case when no data is returned
      }
    } catch (error) {
      console.log(error);
      const errResponse = { code: 500, message: 'Internal server error', error }; // Create a custom error response object
      res.status(500).json(errResponse);
    }
  });


router.route('/getConclusiveSectionsByParentId')
.post(async function(req, res) {
    try {
        const parentSectionId = req.body.parentSectionId; // Use req.body instead of req.params
        const userName = req.body.username; // Use req.body instead of req.params
  
        const result = await conclusiveSection.getConclusiveSectionByParentId(parentSectionId);
  
        if (result.error) {
          res.status(result.error.code).json(result.error);
        } else if (result.data) {
          res.status(201).json(result.data);
        } else {
          res.status(404).json({ message: 'Conclusive Section not found' }); // Add a response for the case when no data is returned
        }
      } catch (error) {
        console.log(error);
        const errResponse = { code: 500, message: 'Internal server error', error }; // Create a custom error response object
        res.status(500).json(errResponse);
      }
});

router.route('/add')
.post(async function (req,res){
    try{
        var errResponse; 
        // Get user input
        const { aweconclusive,conclusiveconsiderations,eeeconclusive,
            invasiverepairsinspectedandcompleted,lbcconclusive,
            parentid,propowneragreed,conclusiveimages } = req.body;
        
        // Validate user input
        if (!(parentid)) {
          errResponse = new ErrorResponse(400,"parentid is required","");
          res.status(400).json(errResponse);
          return;
        }
        var newConclusiveSection = {
            "aweconclusive":aweconclusive,
            "conclusiveconsiderations" :conclusiveconsiderations,
            "eeeconclusive":eeeconclusive,
            "invasiverepairsinspectedandcompleted": invasiverepairsinspectedandcompleted.toLowerCase()==='true',
            "parentid": new ObjectId(parentid), 
            "propowneragreed": propowneragreed.toLowerCase()==='true',
            "conclusiveimages":conclusiveimages,
            "lbcconclusive":lbcconclusive
        } 
        var result = await conclusiveSection.addConclusiveSection(newConclusiveSection);    
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
.put(async function(req,res){
    try{
      var errResponse;
      const conclusiveSectionId = req.params.id;
      const newData = req.body;

      if(newData.parentid){
        newData.parentid = new ObjectId(newData.parentid);
      }
  
      var result = await conclusiveSection.editConclusiveSection(conclusiveSectionId,newData);
  
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

module.exports = router;