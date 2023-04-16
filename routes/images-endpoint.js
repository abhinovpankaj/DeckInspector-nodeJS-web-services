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
            const { containerName, uploader, entityName } = req.body;
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
            if (!(containerName && filetoUpload)) {
                errResponse = new ErrorResponse(400, "containerName, blobName, filePath is required", "");
                res.status(400).json(errResponse);
                return;
            }
            var result = await uploadBlob.uploadFile(containerName, filetoUpload.originalname, filetoUpload.path, uploadOptions);
            var response = JSON.parse(result);
            if (response.error) {
                responseError = new ErrorResponse(500, 'Internal server error', result.error);

                res.status(500).json(responseError);
                return;
            }
            if (response.message) {
                res.status(201).json(response);
            }
            else
                res.status(409).json(response);
            return;

        } catch (err) {
            errResponse = new ErrorResponse(500, "Internal server error", err);
            res.status(500).json(errResponse);
        }
    });
module.exports = router;