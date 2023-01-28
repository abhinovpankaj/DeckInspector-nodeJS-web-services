"use strict";
var express = require('express');
var router = express.Router();

var path = require('path');
const users = require("../model/user");
const bcrypt=require('bcrypt');
var jwt = require('jsonwebtoken');
const Role=require('../model/role');
// const { nextTick } = require('process');
// const { RSA_NO_PADDING } = require('constants');


require("dotenv").config();

//User registration + Login

// Register user

router.route('/register')
.get(function(req,res){
  res.send("in get user endpoint");
})
.post( function(req, res)  {

try {
    // Get user input
    const { first_name, last_name, email, password,username,access_type } = req.body;

    // Validate user input
    if (!(email && password && first_name && last_name&&username)) {
      res.status(400).send("All input is required");
    }

    // check if user already exist
    // Validate if user exist in our database
    
    users.getUser(email, async function (err, record) {
  
      if (record) {
            res.status(409).send("User Already Exist. Please Login");
      }else{        
        //Encrypt user password
        var encryptedPassword =  await bcrypt.hash(password, 10);

        // Create user in our database
        users.addUser({
          first_name,
          last_name,
          username,
          access_type,      
          email: email.toLowerCase(), // sanitize: convert email to lowercase
          password: encryptedPassword,
        },function(err,result){
            if (err) { 
              res.status(err.status).send(err.message); 
            }
            else {
                const user = result;
                // Create token
                const token = jwt.sign(
                { 
                  user_id: user._id, email 
                },
                process.env.TOKEN_KEY,
                {
                  expiresIn: "30d",
                });
                // save user token
                user.token = token          
                // return new user
                res.status(201).json(user);
            }
        });
     }
  });
    
  }catch (err) {
    console.log(err);
  }
  
});

//register admin
router.route('/registerAdmin')
.post( function(req, res)  {

try {
    // Get user input
    const { first_name,username, last_name, email, password, appSecret } = req.body;
    registerAdmin(first_name, last_name,username, email, password, appSecret, function (err, result){
        if (err) { res.status(err.status).send(err.message); }
        else {
            const user = result;
                // Create token
                const token = jwt.sign(
                { user_id: user._id, email },
                process.env.TOKEN_KEY,
                {
                expiresIn: "30d",
                });
                // save user token
                user.token = token;
            
                // return new user
                res.status(201).json(user);
        }

    });
   
  } catch (err) {
    console.log(err);
    res.status(400).json(err);

  }
  
});



function registerAdmin  (first_name, last_name,username, email, password, appSecret, callback) {
        
        if (!(email && password && first_name && last_name&&username)) {
            var error1 = new Error("All input is required");
            error1.status = 400;
            callback (error1);
            return;
           
            
          }
          if(appSecret!==process.env.APP_SECRET){
            var error1 = new Error("Please contact administrator to register as an Admin");
            error1.status = 403;
            callback (error1);
            return;
            
          }
          // check if user already exist
          // Validate if user exist in our database
          
          users.getUser(email, async function (err, record) {       
              if (record) {
                var error1 = new Error("User Already Exist. Please Login");
                error1.status = 409;
                callback (error1,null);
                return;
                
              } else {
                  var encryptedPassword = await bcrypt.hash(password, 10);
                  
                  // Create user in our database
                  users.addAdmin({
                    first_name,
                    last_name, 
                    username,                   
                    email: email.toLowerCase(), // sanitize: convert email to lowercase
                    password: encryptedPassword,
                  }, function(err,result){
                      if (err) { 
                        callback(err,null) ;
                        }
                          else {
                              const user = result;
                              // Create token
                              const token = jwt.sign(
                              { user_id: user._id, email },
                              process.env.TOKEN_KEY,
                              {
                              expiresIn: "30d",
                              });
                              // save user token
                              user.token = token;
                          
                              // return new user
                              callback(null,user);
                            
                           }
                  });              
              }
          });         
    };

function verifyToken (req, res, next)  {
    //console.log('inside verifyToken');
    const token =
    req.body.token || req.query.token || req.headers["x-access-token"];
  
    if (!token) {
      return res.status(403).send("A token is required for authentication");
    }
    try {
      const decoded = jwt.verify(token, "secret");
      req.user = decoded;
    } catch (err) {
      return res.status(401).send("Invalid Token");
    }
    return next();
  };

  
// Login
router.route('/login')
.post(async function (req, res)  {
// our login logic goes here
try {
    // Get user input
    const { username, password } = req.body;

    // Validate user input
    if (!(username && password)) {
      res.status(400).send("All input is required");
    }
    // Validate if user exist in our database
    users.getUserbyUsername( username ,async function(err,record){
        if (err) { res.status(err.status).send(err.message); 
        }
        else {
            if (record && ( await bcrypt.compare(password, record.password))) {
                // Create token
                const {password,...user} = record;
                const token = jwt.sign(
                  { user_id: record._id, username },
                  process.env.TOKEN_KEY,
                  {
                    expiresIn: "30d",
                  }
                );
          
                // save user token
                record.token = token;
          
                // user
                res.status(201).json(user);
              }
              else
                res.status(401).send("Invalid Credentials");
        }
    });    
    
  } catch (err) {
    console.log(err);
  }

});

module.exports = router ;