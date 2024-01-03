"use strict";
var ObjectId = require('mongodb').ObjectId;
var mongo = require('../database/mongo');
const Role = require('./role');

var addUser = function (user, callback) {
    mongo.Users.insertOne({username:user.username,last_name: user.last_name,first_name:user.first_name,email:user.email,
    password:user.password,role:Role.User,access_type:user.access_type}, {w: 1}, function (err, result) {
        if (err) {
            var error = new Error("addUser()." + err.message);
            error.status = err.status;
            callback (error);
            return;
        }
        callback(null, result);
    });
};
var addAdmin = function (user, callback) {
    mongo.Users.insertOne({last_name: user.last_name,first_name:user.first_name,email:user.email,
    password:user.password,username:user.username,role:Role.Admin,access_type:"both"}, {w: 1}, function (err, result) {
        if (err) {
            var error = new Error("addAdmin()." + err.message);
            error.status = err.status;
            callback (error);
            return;
        }
        callback(null, result);
    });
};
var getUser = async function (emailId, callback) {
    
    var result = await mongo.Users.findOne({ email: emailId });    
        
        if (result === null) {
            var error1 = new Error("getUser(). \nMessage: No User Found. One Requested.");
            error1.status = 404;
            callback (error1);
            return; 
        }
        callback(null, result);
    
};

var getUserbyUsername = async function (username, callback) {
    
    if (username===undefined) {

        var error1 = new Error("getUser(). \nMessage: No User Found. username undefined.");
            error1.status = 404;
            callback (error1);
            return; 
    }
    var result = await mongo.Users.findOne({ username: username });    
        
        if (result === null) {
            var error1 = new Error("getUser(). \nMessage: No User Found. One Requested.");
            error1.status = 404;
            callback (error1);
            return; 
        }
        callback(null, result);
    
};

var updateUser = async function (user, callback) {
    
    var result = await mongo.Users.updateOne({ username: user.username }, { $set: user });    
    
    if(result.matchedCount<1){
        var error = new Error("No User found, please register user.");
        error.status = 401;  
        callback(error);
        
    } else{
      if(result.modifiedCount==1){
        callback(null,{status:201,message:"User details updated successfully."});
        }           
      else
        callback(null,{status:409,message:"Failed to update the user details."});
        
    }   
};

var getAllUser = async function  (callback) {
    var result = await mongo.Users.find({}).limit(50).toArray();    
    if (result === null) {
        var error = new Error("getAllUser(). \nMessage: No Users Found. All Requested.");
        error.status = 401;
        callback (error);
        return; 
    }
    const users = result.map(item=>{
        delete item.password;
        delete item._id;
        return item;
      });
    
    callback(null, {status:200,users});
   
};
var removeUser = async  function (user, callback) {
    var result = await mongo.Users.deleteOne({username:user.username});
    if(result.deletedCount==1){
        callback(null,{status:201,message:"User deleted successfully."});
    }
    else{
        var error2 = new Error("Error occurred. Didn't remove user. " + err.message);
        error2.status = err.status;
        callback (error2);
        return;
    }
    
};

var registerAdmin =function (first_name, last_name,username, email, password, appSecret,companyIdentifier, callback) {
        
    if (!(email && password && first_name && last_name&&username,companyIdentifier)) {
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
                companyIdentifier,                
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
  return res.status(403).send("A token is required for accessing this resource");
}
try {
  const decoded = jwt.verify(token, process.env.TOKEN_KEY);
  req.user = decoded;
} catch (err) {
  return res.status(401).send("Invalid Token");
}
return next();
};


module.exports = {
    addUser: addUser,
    getUser: getUser,
    addAdmin:addAdmin,
    getAllUser: getAllUser,
    removeUser: removeUser,
    getUserbyUsername,
    updateUser,
    registerAdmin
};