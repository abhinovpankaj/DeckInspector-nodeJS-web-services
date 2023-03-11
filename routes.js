const express = require("express");
var userRouter = require("./routes/user-endpoint");
var imageRouter = require("./routes/images-endpoint");
var projectRouter = require("./routes/project-endpoint");

module.exports = function(app) {
  app.use(express.json());
  app.use("/api/user", userRouter);  
  app.use("/api/image", imageRouter);  
  app.use("/api/project", projectRouter);
};