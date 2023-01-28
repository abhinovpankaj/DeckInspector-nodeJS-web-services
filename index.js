"use strict";
const swaggerUi = require('swagger-ui-express');
const swaggerJsdoc = require('swagger-jsdoc');

const express = require('express');
const app =  express();
var path = require('path');
var bodyParser = require('body-parser');
//var router   = require('routes');
var mongo = require('./database/mongo');


require('./routes')(app);

app.use(bodyParser.json());
//app.use('/api', router);

// ERROR Handler 400
//Swagger details
const options = {
    definition: {
      openapi: "3.0.0",
      info: {
        title: "Library API",
        version: "1.0.0",
        description: "DeckInspectors Library API",
        termsOfService: "http://example.com/terms/",
        contact: {
          name: "API Support",
          url: "http://www.exmaple.com/support",
          email: "support@example.com",
        },
      },
  
      servers: [
        {
          url: "http://localhost:3000",
          description: "Deck Inspectors Documentation",
        },
      ],
    },
    apis: ['./api-docs/*.yaml'],
  };
  
  
  const specs = swaggerJsdoc(options);
  app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(specs));

  // Initialize SERVER & DB connection once
mongo.Connect();
app.set('port', process.env.PORT || 3000);
var server = app.listen(app.get('port'), async function () {
        
    console.log('Express server listening on port ' + server.address().port);
//    try{
//         registerAdmin("Super", "Admin", "jabez@zeptoint.com", "Zeptoint@2022", process.env.APP_SECRET,function(err,result){
//             if (err) { console.log(err.status +":"+ err.message); }
//     else {
//         const user = result;
//             // Create token
//             const token = jwt.sign(
//             { user_id: user._id, email },
//             process.env.TOKEN_KEY,
//             {
//             expiresIn: "30d",
//             });
//             // save user token
//             user.token = token;
        
//             // return new user
//             console.log(json(user));
//     }
//         });
        
//    }catch(err){
//        console.log(err);
//    }

    });

