const express = require("express");
var userRouter = require("./routes/user-endpoint");
var projectDocumentsRouter = require("./routes/projectdocuments-endpoint");
var projectReportsRouter = require("./routes/projectreports-endpoint");
var imageRouter = require("./routes/images-endpoint");
var projectRouter = require("./routes/project-endpoint");
var subprojectRouter = require("./routes/subproject-endpoint");
var locationRouter = require("./routes/location-endpoint");
var sectionRouter = require("./routes/section-endpoint");
var invasivesectionRouter = require("./routes/invasivesection-endpoint");
var conclusiveSectionRouter = require("./routes/conclusivesection-endpoint");

module.exports = function(app) {
  app.use(express.json());
  app.use("/api/user", userRouter);
  app.use("/api/projectdocuments", projectDocumentsRouter);  
  app.use("/api/projectreports", projectReportsRouter);  
  app.use("/api/image", imageRouter);  
  app.use("/api/project", projectRouter);
  app.use("/api/subproject", subprojectRouter);
  app.use("/api/location", locationRouter);
  app.use("/api/section", sectionRouter);
  app.use("/api/invasivesection", invasivesectionRouter);
  app.use("/api/conclusivesection", conclusiveSectionRouter);
};