"use strict";
var express = require('express');
var router = express.Router();

const ErrorResponse = require('../model/error');
var ObjectId = require('mongodb').ObjectId;
const newErrorResponse = require('../model/newError');
const TenantService = require('../service/tenantService');


require("dotenv").config();

router.route('/add')
.post(async function (req,res){
try{
  var errResponse;
  // Get user input
  var { name,companyDescription, website,validity,allowedDiskSpace,allowedUsersCount,expenses} = req.body;

  // Validate user input
  if (!(name)) {
    errResponse = new ErrorResponse(400,"Name is required","");
    res.status(400).json(errResponse);
    return;
  }
  var registrationDate= (new Date(Date.now())).toISOString();

  var newTenant = {
      "name":name,
      "registrationDate":registrationDate,
      "companyDescription":companyDescription,    
      "website":website,
      "validity":validity===undefined?10:validity,
      "allowedDiskSpace":allowedDiskSpace===undefined?10:allowedDiskSpace,    
      "allowedUsersCount": allowedUsersCount===undefined?5:allowedUsersCount,
      "expenses": expenses===undefined?1000:expenses,
      "companyIdentifier":`${name}.ondeckinspectors.com`
  }


  var result = await TenantService.addTenant(newTenant);    
  if (result.reason) {
    return res.status(result.code).json(result);
  }
  if (result) {
    //console.debug(result);
    return res.status(201).json(result);
  }
}
catch (exception) {
  errResponse = new newErrorResponse(500, false, exception);
  return res.status(500).json(errResponse);
}
});


router.route('/:id')
.get(async function(req,res){
  try{
    var errResponse;
    const tenantId = req.params.id;
    var result = await TenantService.getTenantById( tenantId);
    if (result.reason) {
      return res.status(result.code).json(result);
    }
    if (result) {
      //console.debug(result);
      return res.status(201).json(result);
    }
  }
  catch (exception) {
    errResponse = new newErrorResponse(500, false, exception);
    return res.status(500).json(errResponse);
  }
})

router.route('/:id')
.put(async function(req,res){
  try{
    var errResponse;
    const newData = req.body;
    const tenantId = req.params.id;
    
    var result = await TenantService.editTenant(tenantId,newData);
    if (result.reason) {
      return res.status(result.code).json(result);
    }
    if (result) {
      //console.debug(result);
      return res.status(201).json(result);
    }
  }
  catch (exception) {
    errResponse = new newErrorResponse(500, false, exception);
    return res.status(500).json(errResponse);
  }
})
.delete(async function(req,res){
  try{
    var errResponse;
    const tenantId = req.params.id;
    var result = await TenantService.deleteTenantPermanently(tenantId);
    if (result.reason) {
      return res.status(result.code).json(result);
    }
    if (result) {
      //console.debug(result);
      return res.status(201).json(result);
    }
  }
  catch (exception) {
    errResponse = new newErrorResponse(500, false, exception);
    return res.status(500).json(errResponse);
  }
})

router.route('/:id/toggletenantstatus/:state')
    .post(async function (req, res) {
      try {
        var errResponse;
        const tenantId = req.params.id;
        const state = req.params.state;
        const isActive = state == 1 ? true : false;
        var result = await TenantService.toggleAccessForTenant(tenantId, isActive);
        if (result.reason) {
          return res.status(result.code).json(result);
        }
        if (result) {
          return res.status(201).json(result);
        }
      }
      catch (exception) {
        errResponse = new newErrorResponse(500, false, exception);
        return res.status(500).json(errResponse);
      }
    });



module.exports = router ;