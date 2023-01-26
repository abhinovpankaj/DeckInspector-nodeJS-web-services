const express = require("express");
var userRouter = require("./routes/user-endpoint");


module.exports = function(app) {
  app.use(express.json());
  app.use("/user", userRouter);  
};