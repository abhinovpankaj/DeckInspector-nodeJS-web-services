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


var getAllUser = function  (callback) {
    mongo.Users.find({}).toArray(function (err, result) {
        if (err) {
            callback (err);
            return;
        }
        if (result === null) {
            var error = new Error("getAllUser(). \nMessage: No User Found. All Requested.");
            error.status = 404;
            callback (error);
            return; }
        callback(null, result);
    });
};
var removeUser = function (id, callback) {
    if (ObjectId.isValid(id) === false) {
        var error1 = new Error("Argument passed in must be a single String of 12 bytes or a string of 24 hex characters");
        error1.status = 500;
        callback (error1);
        return;
    }
    mongo.Users.deleteOne({_id: new ObjectId(id)}, function (err, res) {
        if (err) {
            var error2 = new Error("Error occurred. Didn't remove user. " + err.message);
            error2.status = err.status;
            callback (error2);
            return;
        }
        if (res.deletedCount !== 1) {
            var error3 = new Error("Didn't remove user. " + err.message);
            error3.status = err.status;
            callback (error3);
            return;
        }
        
        callback(null, result);
        });
    };


module.exports = {
    addUser: addUser,
    getUser: getUser,
    addAdmin:addAdmin,
    getAllUser: getAllUser,
    removeUser: removeUser,
    getUserbyUsername,
    updateUser
};