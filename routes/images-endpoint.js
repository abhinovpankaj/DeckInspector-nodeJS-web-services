"use strict";
var express = require('express');
var router = express.Router();
var uploadBlob = require('../database/uploadimage')
const bcrypt = require('bcrypt');
var jwt = require('jsonwebtoken');
const ErrorResponse = require('../model/error');
var multer = require('multer');
var upload = multer({ dest: 'uploads/' });
const bodyParser = require('body-parser');
var image = require('../model/image');

require("dotenv").config();

//#region upload image

//uploadOptions: {
//   metadata: { reviewer: 'john', reviewDate: '2022-04-01' }, 
//   tags: {project: 'xyz', owner: 'accounts-payable'}
// }
router.use(bodyParser.urlencoded({ extended: true }));
router.route('/upload')
    .post(upload.single("picture"), async function (req, res) {
        var errResponse;
        try {
            var editedat = (new Date(Date.now())).toISOString();
            const { containerName, uploader, entityName,id,
                  lasteditedby, 
                 type, parentType} = req.body;
            const filetoUpload = req.file;
            const uploadOptions = {
                metadata: {
                    'uploader': uploader,
                },
                tags: {
                    'project': containerName,
                    'owner': entityName
                }
            };
            var newContainerName=containerName;
            if (containerName.length < 3) {
                newContainerName = `${containerName}__${uploader}`;
              }
            if (!(newContainerName && filetoUpload)) {
                errResponse = new ErrorResponse(400, "containerName, blobName, filePath is required", "");
                res.status(400).json(errResponse);
                return;
            }
            var result = await uploadBlob.uploadFile(newContainerName, filetoUpload.originalname, filetoUpload.path, uploadOptions);
            var response = JSON.parse(result);
            if (response.error) {
                responseError = new ErrorResponse(500, 'Internal server error', result.error);
                console.log(response);
                res.status(500).json(responseError);
                return;
            }
            if (response.message) {
                res.status(201).json(response);
                //Update images Url
                image.updateImageURL(id,
                    response.url, lasteditedby, editedat, 
                    type, parentType);
            }
            else
                res.status(409).json(response);
            return;

        } catch (err) {
            console.log(err);
            errResponse = new ErrorResponse(500, "Internal server error", err);
            res.status(500).json(errResponse);
        }
    });
module.exports = router;