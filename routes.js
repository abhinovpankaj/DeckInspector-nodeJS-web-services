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
var tenantRouter = require("./routes/tenants-endpoint");
const { authenticate } = require("passport");
const jwt = require('jsonwebtoken');


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
  app.use("/api/tenants", authenticateToken,tenantRouter);

};

function authenticateToken(req, res, next) {
  const token = req.headers.authorization;

  if (!token) {
    return res.status(401).json({ error: 'Unauthorized: Token not provided' });
  }

  jwt.verify(token, process.env.TOKEN_KEY, (err, user) => {
    if (err) {
      return res.status(403).json({ error: 'Unauthorized: Invalid token' });
    }

    req.user = user;  // Attach user information to the request object
    next();
  });
}