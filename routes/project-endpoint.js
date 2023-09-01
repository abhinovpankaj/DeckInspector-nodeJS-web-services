"use strict";
var express = require('express');
var router = express.Router();
const projects = require("../model/project");
const ErrorResponse = require('../model/error');
const path = require('path');
const fs = require('fs'); 
const {generateProjectReport,getProjectHtml}= require('../service/projectreportgeneration.js');
const {getProjectHierarchyMetadata,getSingleProjectMetadata} = require('../service/projectmetadata/getProjectMetaData.js');
const {generateExcelForProject} = require('../service/generateExcelForProject.js');
const projectService = require('../service/projectService');
require("dotenv").config();

router.route('/add')
.post(async function (req, res) {
  try {
    // Get user input
    const { name, description, address, createdBy, url, assignedTo, projecttype } = req.body;

    // Validate user input
    if (!name) {
      const errResponse = new ErrorResponse(400, "Name is required", "");
      res.status(400).json(errResponse);
      return;
    }

    // Create a new project object
    var newProject = {
      "name": name,
      "description": description,
      "address": address,
      "createdby": createdBy,
      "url": url,
      "lasteditedby": createdBy,
      "assignedto": assignedTo,
      "editedat": new Date().toISOString(),
      "children": [],
      "projecttype": projecttype,
      "createdat": new Date().toISOString(),
    }

    // Save the new project to the database
    var result = await projectService.addProject(newProject);
    
    if (result.success) {
      res.status(201).json({ success: true, id: result.id });
    } else {
      const errResponse = new ErrorResponse(400, result.reason, "");
      res.status(400).json(errResponse);
    }

  } catch (err) {
    const errResponse = new ErrorResponse(500, "Internal server error, Exception occurred while adding project", err);
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

  
router.route('/getProjectById')
  .post(async function (req, res) {
    try {
      var errResponse;
      const projectId = req.body.projectid;
      var result = await getSingleProjectMetadata(projectId);
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


router.route('/generateexcel')
  .post(async function (req, res) {
    try {
      const projectId = req.body.projectid;
      const fullexcelPath = await generateExcelForProject(projectId);

      // Set headers and status
      console.log(fullexcelPath);
      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      res.setHeader('Content-Disposition', 'attachment; filename=' + path.basename(fullexcelPath)); 
      res.sendFile(fullexcelPath, {}, (err) => {
        if (err) {
          console.error('Error sending file:', err);
        } else {
          console.log('excel sent successfully');
          fs.unlinkSync(fullexcelPath);
        }
      });
    } catch (err) {
      console.error('Error generating Excel:', err);
      res.status(500).send('Error generating Excel');
    }
  });

  router.route('/:id')
  .put(async function (req, res) {
    try {
      var errResponse;
      const newData = req.body;
      const projectId = req.params.id;
      // Validate user input
      var result = await projects.editProject(projectId,newData);
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

router.route('/getProjectsByUser/:username')
.get(async function(req,res){
  try{
    var errResponse;
    const username = req.params.username;
    var result = await projects.getProjectByAssignedToUserId(username);
    if (result.error) {
      res.status(result.error.code).json(result.error);
    }
    if (result.data) {
      //console.debug(result);
      res.status(201).json(result.data);
    }
  }catch(error)
  {
    console.log(error);
    errResponse = new ErrorResponse(500, "Internal server error", error);
    res.status(500).json(errResponse);
  }
})


router.route('/getProjectsMetaDataByUserName/:username')
.get(async function(req,res){
  try{
    var errResponse;
    const username = req.params.username;
    var result = await getProjectHierarchyMetadata(username);
    if (result.error) {
      res.status(result.error.code).json(result.error);
    }
    if (result.data) {
      res.status(201).json(result.data);
    }
  }catch(error)
  {
    console.log(error);
    errResponse = new ErrorResponse(500, "Internal server error", error);
    res.status(500).json(errResponse);
  }
});

router.route('/getProjectMetadata/:id')
.get(async function(req,res){
  try{
    var errResponse;
    const projectId = req.params.id;
    var result = await getSingleProjectMetadata(projectId);
    if (result.error) {
      res.status(result.error.code).json(result.error);
    }
    if (result.data) {
      res.status(201).json(result.data);
    }
  }catch(error)
  {
    console.log(error);
    errResponse = new ErrorResponse(500, "Internal server error", error);
    res.status(500).json(errResponse);
  }
});


/** UMESH TODO  -- REFACTOR this code 
 *  Add request Validation
 * */
router.route('/generatereport')
.post(async function (req, res) {
  try{
  const projectId = req.body.id;
  const sectionImageProperties = req.body.sectionImageProperties;
  const companyName = req.body.companyName;
  const reportType = req.body.reportType;
  const pdfFilePath = await generateProjectReport(projectId,sectionImageProperties,companyName,reportType);

  console.log(pdfFilePath);
  const absolutePath = path.resolve(pdfFilePath);
  console.log(absolutePath);
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

router.route('/generatereporthtml').post(async function (req, res) {
  try {
    const projectId = req.body.id;
    const sectionImageProperties = req.body.sectionImageProperties;
    const reportType = req.body.reportType;
    const project  = await projects.getProjectById(projectId);
    const htmlContent = await getProjectHtml(project, sectionImageProperties, reportType);
    res.setHeader('Content-Type', 'text/html');
    res.send(htmlContent);
  } catch (err) {
    console.error('Error generating HTML:', err);
    res.status(500).send('Error generating HTML');
  }
});

module.exports = router;