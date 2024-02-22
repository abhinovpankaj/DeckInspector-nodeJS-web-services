"use strict";
var express = require('express');
var router = express.Router();

var path = require('path');
const users = require("../model/user");
const bcrypt=require('bcrypt');
var jwt = require('jsonwebtoken');
const Role=require('../model/role');
const Tenants  = require('../service/tenantService');

require("dotenv").config();

//#region Register user

router.route('/register')
.post( function(req, res)  {  
try {
    // Get user input
    const { first_name, last_name, email, password,username,access_type } = req.body;

    // Validate user input
    if (!(email && password && first_name && last_name&&username)) {
      res.status(400).send("All input is required");
      return;
    }
    var companyIdentifier = req.user.company;
    // check if user already exist
    // Validate if user exist in our database
    
    users.getUser(email, async function (err, record) {
  
      if (record) {
            res.status(409).send("User with this email already exist.");
            return;
      }else{
        
        users.getUserbyUsername(username, async function (err, record){
          if (record){
            res.status(409).send("Username already exist.");
            return;
          }
          else{
            //Encrypt user password
            var encryptedPassword =  await bcrypt.hash(password, 10);

            // Create user in our database
            users.addUser({
              first_name,
              last_name,
              username,
              access_type,
              companyIdentifier,      
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
                      user_id: user._id, email, company: companyIdentifier
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
        })
     }
  });
    
  }catch (err) {
    console.log(err);
  }
  
});
//#endregion

//#region Login
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

                //TODO check if that company is active and not marked for deletion.
                var loginAllowed = await Tenants.isTenantActive(user.companyIdentifier);
                if (loginAllowed.success) {
                  if (!loginAllowed.allowLogin) {
                    res.status(401).send("Invalid Credentials");
                    return;
                  }
                }else{
                  res.status(401).send("Invalid Credentials");
                  return;
                }
                
                const token = jwt.sign(
                  { user_id: record._id, username,company:record.companyIdentifier},
                  process.env.TOKEN_KEY,
                  {
                    expiresIn: "1d",
                  }
                );
          
                // save user token
                user.token = token;
          
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
//#endregion

//#region registerAdmin
router.route('/registeradmin')
.post( function(req, res)  {

try {
    // Get user input
    const { first_name,username, last_name, email, password, appSecret,companyIdentifier} = req.body;
    users.registerAdmin(first_name, last_name,username, email, password, appSecret,companyIdentifier, function (err, result){
        if (err) { res.status(err.status).send(err.message); }
        else {
            const user = result;
                // Create token
                const token = jwt.sign(
                { user_id: user._id, email,company:companyIdentifier},
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

//#endregion

//#region Update user
router.route('/update')
.post(async function(req,res){
  try {
      // Get user input
      const user = req.body; 
      if("password" in user)
        user.password = await bcrypt.hash(user.password, 10);
      users.updateUser(user,function(err,result){
        if(err){
          res.status(err.status).send(err.message);
        }
        else{
          res.status(result.status).send(result.message);      
        }
      })          
      
     }     
  catch (err) {    
    console.log(err);
    res.status(500).send(`Internal server error ${err}`)
  }
});
//#endregion

//#region delete user
router.route('/delete')
.post(async function(req,res){
  try {
      // Get user input
      const user = req.body; 
      users.removeUser(user,function(err,result){
        if(err){
          res.status(err.status).send(err.message);
        }
        else{
          res.status(result.status).send(result.message);      
        }
      })          
      
     }     
  catch (err) {    
    console.log(err);
    res.status(500).send(`Internal server error ${err}`)
  }
});
//#endregion

//#region getAllUsers
router.route('/allusers')
.get(async function(req,res){
  
try{
  var companyIdentifier = req.user.company;
  users.getAllUser(function(err,result){
    if(err){
      res.status(err.status).send(err.message);
    }
    else{
      console.debug(result);
      result.users = result.users.filter(user => user.companyIdentifier === companyIdentifier);
      res.status(result.status).json(result.users);
    }
  });
}
catch(exception){
  res.status(500).send(`Intenal server error.${exception}"`);
}
});
//#endregion
router.route('/:username')
.get(async function(req,res){
  try{
    const username = req.params.username;
    users.getUserbyUsername( username ,async function(err,record){
      if (err) { res.status(err.status).send(err.message); 
      }
      else {
          if (record){
            const {password,...user} = record;
            res.status(201).json(user); 
          }                     
            else
              res.status(401).send("user not found.");
      }
  });    
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

router.route('/superlogin')
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
    users.getSuperUserbyUsername( username ,async function(err,record){
        if (err) { res.status(err.status).send(err.message); 
        }
        else {
            if (record && ( await bcrypt.compare(password, record.password))) {
                // Create token
                const {password,...user} = record;
                const token = jwt.sign(
                  { user_id: record._id, username},
                  process.env.TOKEN_KEY,
                  {
                    expiresIn: "1d",
                  }
                );
          
                // save user token
                user.token = token;
          
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
router.route('/registersuperuser')
.post( function(req, res)  {  
try {
    // Get user input
    const { first_name, last_name, email, password,username } = req.body;

    // Validate user input
    if (!(email && password && first_name && last_name&&username )) {
      res.status(400).send("All input is required");
      return;
    }

    // check if user already exist
    // Validate if user exist in our database
    
    users.getSuperUser(email, async function (err, record) {
  
      if (record) {
            res.status(409).send("User with this email already exist.");
            return;
      }else{
        
        users.getSuperUserbyUsername(username, async function (err, record){
          if (record){
            res.status(409).send("Username already exist.");
            return;
          }
          else{
            //Encrypt user password
            var encryptedPassword =  await bcrypt.hash(password, 10);

            // Create user in our database
            users.addSuperUser({
              first_name,
              last_name,
              username,  
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
                      expiresIn: "2d",
                    });
                    // save user token
                    user.token = token          
                    // return new user
                    res.status(201).json(user);
                }
            });
          }
        })
     }
  });
    
  }catch (err) {
    console.log(err);
  }
  
});

router.route('/loginSuperUser')
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
    users.getSuperUserbyUsername( username ,async function(err,record){
        if (err) { res.status(err.status).send(err.message); 
        }
        else {
            if (record && ( await bcrypt.compare(password, record.password))) {
                // Create token
                const {password,...user} = record;
                const token = jwt.sign(
                  { user_id: record._id, username},
                  process.env.TOKEN_KEY,
                  {
                    expiresIn: "1d",
                  }
                );
          
                // save user token
                user.token = token;
          
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