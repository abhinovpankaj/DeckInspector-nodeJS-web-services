"use strict";
var express = require('express');
var router = express.Router();
var uploadBlob = require('../database/uploadimage')
const bcrypt=require('bcrypt');
var jwt = require('jsonwebtoken');

require("dotenv").config();

//#region upload image

//uploadOptions: {
//   metadata: { reviewer: 'john', reviewDate: '2022-04-01' }, 
//   tags: {project: 'xyz', owner: 'accounts-payable'}
// }
router.route('/upload')
.post(async function(req, res) {  
    try {
        const { containerName, blobName, filePath, uploadOptions } = req.body;
        if (!(containerName && blobName && filePath)) {
            res.status(400).send("containerName, blobName, filePath is required");
        }
        var result= await uploadBlob.uploadImage(containerName,blobName,filePath,uploadOptions);
        var response = JSON.parse(result);
        if(response.error){
            res.status(500).send(`Internal server error ${result.error}`);
        }
        if(response.message)
        {
            res.status(200).send(response);
        }
        else
            res.status(409).send(response);

    }catch (err) {
        console.log(err);
        res.status(500).send("Internal server error");
    }  
});
module.exports = router;