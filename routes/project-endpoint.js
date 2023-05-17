"use strict";
var express = require('express');
var router = express.Router();
const projects = require("../model/project");
const ErrorResponse = require('../model/error');
const path = require('path');
const fs = require('fs'); 
const {generateProjectReport}= require('../service/projectreportgeneration.js');


require("dotenv").config();

router.route('/add')
  .post(async function (req, res) {
    try {
      var errResponse ;
      // Get user input
      const { name, description, address, createdby, url } = req.body;

      // Validate user input
      if (!(name)) {
        errResponse = new ErrorResponse(400, "Name is required", "");
        res.status(400).json(errResponse);
        return;
      }
      var creationtime = (new Date(Date.now())).toISOString();
      var newProject = {
        "name": name,
        "description": description,
        "address": address,
        "createdby": createdby,
        "url": url,
        "isavailableoffline": false,
        "iscomplete": false,
        "isdeleted": false,
        "createdat": creationtime,
        "assignedto": []
      }
      var result = await projects.addProject(newProject);
      if (result.error) {
        res.status(result.error.code).json(result.error);
      }
      if (result.data) {
        //console.debug(result);
        res.status(201).json(result.data);
      }

    } catch (err) {
      errResponse = new ErrorResponse(500, "Internal server error, Exception occured while adding project", err);
      res.status(500).json(errResponse);
    }
  });

  router.route('/allprojects')
  .get(async function (req, res) {
    try {
      var errResponse;
      var result = await projects.getAllProjects();
      if (result.error) {
        res.status(result.error.code).json(result.error);
      }
      if (result.data) {
        //console.debug(result);
        res.status(201).json(result.data);
      }

    }
    catch (exception) {
      //res.status(500).send(`Intenal server error.${exception}"`);
      errResponse = new ErrorResponse(500, "Internal server error", exception);
      res.status(500).json(errResponse);
    }
  });

router.route('/filterprojects')
  .post(async function (req, res) {
    try {
      var errResponse;
      const { name, isdeleted, iscomplete, createdon } = req.body;

      var result = await projects.getProjectsByNameCreatedOnIsCompletedAndDeleted({ name, isdeleted, iscomplete, createdon });
      if (result.error) {
        res.status(result.error.code).json(result.error);
        
      }
      if (result.data) {
        //console.debug(result);
        res.status(result.data.code).json(result.data);
      }

    }
    catch (exception) {
      errResponse = new ErrorResponse(500, "Internal server error", exception);
      res.status(500).json(errResponse);
    }
  });

  
router.route('/:id')
  .get(async function (req, res) {
    try {
      var errResponse;
      const projectId = req.params.id;
      var result = await projects.getProjectById(projectId);
      if (result.error) {
        res.status(result.error.code).json(result.error);
      }
      if (result.data) {
        console.debug(result);
        res.status(201).json(result.data);
      }
    }
    catch {
      errResponse = new ErrorResponse(500, "Internal server error", exception);
      res.status(500).json(errResponse);
    }
  })
  .put(async function (req, res) {
    try {
      var errResponse;
      const { name, description, address, url, lasteditedby } = req.body;
      const projectId = req.params.id;
      // Validate user input
      if (!(name && description && address && lasteditedby)) {
        errResponse = new ErrorResponse(400, "name,description,address and lasteditedby is required", "");
        res.status(400).json(errResponse);
        return;
      }
      var editedat = (new Date(Date.now())).toISOString();
      var editedProject = {
        "name": name,
        "id": projectId,
        "description": description,
        "address": address,
        "url": url,
        "lasteditedby": lasteditedby,
        "editedat": editedat
      }

      var result = await projects.updateProject(editedProject);
      if (result.error) {
        res.status(result.error.code).json(result.error);
        return;
      }
      if (result.data) {
        //console.debug(result);                                          
        res.status(201).json(result.data);
        return;
      }
    }

    catch (err) {
      errResponse = new ErrorResponse(500, "Internal server error", err);
      res.status(500).json(errResponse);
    }
  })
  .delete(async function (req, res) {
    try {
      var errResponse;
      const projectId = req.params.id;
      var result = await projects.deleteProjectPermanently(projectId);
      if (result.error) {
        res.status(result.error.code).json(result.error);
      }
      if (result.data) {
        res.status(201).json(result.data);
      }

    }
    catch (err) {
      errResponse = new ErrorResponse(500, "Internal server error", err);
      res.status(500).json(errResponse);
    }
  });

router.route('/:id/assign')
  .post(async function (req, res) {
    try {
      var errResponse;
      const projectId = req.params.id;
      const { username } = req.body;
      var result = await projects.assignProjectToUser(projectId, username);
      if (result.error) {
        res.status(result.error.code).json(result.error);
      }
      if (result.data) {
        //console.debug(result);                                          
        res.status(201).json(result.data);
      }
    } catch (error) {
      errResponse = new ErrorResponse(500, "Internal server error", error);
      res.status(500).json(errResponse);
    }
  });
router.route('/:id/toggleOfflineState/:state')
  .post(async function (req, res) {
    try {
      var errResponse;
      const projectId = req.params.id;
      const state = req.params.state;
      const isavailableoffline = state == 1 ? true : false;
      var result = await projects.updateProjectOfflineAvailabilityStatus(projectId, isavailableoffline);
      if (result.error) {
        res.status(result.error.code).json(result.error);
      }
      if (result.data) {
        //console.debug(result);                                          
        res.status(result.data.code).json(result.data);
      }
    } catch (error) {
      errResponse = new ErrorResponse(500, "Internal server error", error);
      res.status(500).json(errResponse);
    }
  });

router.route('/:id/unassign')
  .post(async function (req, res) {
    try {
      var errResponse;
      const projectId = req.params.id;
      const { username } = req.body;
      var result = await projects.unassignUserFromProject(projectId, username);
      if (result.error) {
        res.status(result.error.code).json(result.error);
      }
      if (result.data) {
        //console.debug(result);                                          
        res.status(result.data.code).json(result.data);
      }
    } catch (error) {
      errResponse = new ErrorResponse(500, "Internal server error", error);
      res.status(500).json(errResponse);
    }
  });

router.route('/:id/addchild')
  .post(async function (req, res) {
    try {
      var errResponse;
      const projectId = req.params.id;
      const { id, name, type } = req.body;
      var result = await projects.addRemoveChildren(projectId, true, { id, name, type });
      if (result.error) {
        res.status(result.error.code).json(result.error);
      }
      if (result.data) {
        //console.debug(result);                                          
        res.status(result.data.code).json(result.data);
      }
    } catch (error) {
      //res.status(500).send("Internal server error.");
      errResponse = new ErrorResponse(500, "Internal server error", error);
      res.status(500).json(errResponse);
    }
  });

router.route('/:id/removechild')
  .post(async function (req, res) {
    try {
      var errResponse;
      const projectId = req.params.id;
      const { id, name, type } = req.body;
      var result = await projects.addRemoveChildren(projectId, false, { id, name, type });
      if (result.error) {
        res.status(result.error.code).json(result.error);
      }
      if (result.data) {
        //console.debug(result);                                          
        res.status(result.data.code).json(result.data);
      }
    } catch (error) {
      errResponse = new ErrorResponse(500, "Internal server error", error);
      res.status(500).json(errResponse);
    }
  });

router.route('/:id/toggleVisibility/:state')
  .post(async function (req, res) {
    try {
      var errResponse;
      const projectId = req.params.id;
      const state = req.params.state;
      const isVisible = state == 1 ? true : false;
      var result = await projects.updateProjectVisibilityStatus(projectId, isVisible);
      if (result.error) {
        res.status(result.error.code).json(result.error);
      }
      if (result.data) {
        //console.debug(result);                                          
        res.status(result.data.code).json(result.data);
      }
    } catch (error) {
      errResponse = new ErrorResponse(500, "Internal server error", error);
      res.status(500).json(errResponse);
    }
  });

router.route('/:id/toggleprojectstatus/:state')
  .post(async function (req, res) {
    try {
      var errResponse;
      const projectId = req.params.id;
      const state = req.params.state;
      const iscomplete = state == 1 ? true : false;
      var result = await projects.updateProjectVisibilityStatus(projectId, iscomplete);
      if (result.error) {
        res.status(result.error.code).json(result.error);
      }
      if (result.data) {
        //console.debug(result);                                          
        res.status(result.data.code).json(result.data);
      }
    } catch (error) {
      errResponse = new ErrorResponse(500, "Internal server error", error);
      res.status(500).json(errResponse);
    }
  });


router.route('/:id/generatereport')
.get(async function (req, res) {
  try {
    const projectId = req.params.id;
    console.log(projectId);
    const pdfFilePath = await generateProjectReport(projectId);
    const absolutePath = path.resolve(pdfFilePath);
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${pdfFilePath}"`);
    res.sendFile(absolutePath, {}, (err) => {
      if (err) {
        console.error('Error sending file:', err);
      } else {
        console.log('PDF sent successfully');
        fs.unlinkSync(absolutePath);
      }
    });
  } catch (err) {
    console.error('Error generating PDF:', err);
    res.status(500).send('Error generating PDF');
  }
});

module.exports = router;