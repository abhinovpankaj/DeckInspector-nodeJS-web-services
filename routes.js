const express = require("express");
var userRouter = require("./routes/user-endpoint");
var imageRouter = require("./routes/images-endpoint");
var projectRouter = require("./routes/project-endpoint");
var subprojectRouter = require("./routes/subproject-endpoint");
var locationRouter = require("./routes/location-endpoint");
var sectionRouter = require("./routes/section-endpoint");

module.exports = function(app) {
  app.use(express.json());
  app.use("/api/user", userRouter);  
  app.use("/api/image", imageRouter);  
  app.use("/api/project", projectRouter);
  app.use("/api/subproject", subprojectRouter);
  app.use("/api/location", locationRouter);
  app.use("/api/section", sectionRouter);
};