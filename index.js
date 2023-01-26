"use strict";
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
app.use(function (req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

// ERROR Handler 505
if (app.get('env') === 'development') {
    app.use(function (req, res, next) {
        var err = new Error('Not Found' + ' - Development Mode');
        err.status = 505;
        next(err);
    });
}

app.use(function (err, req, res) {
    res.status(err.status || 500);
    res.send(err.status + ': Internal Server Error\n\r' + err.message);
});


// Initialize SERVER & DB connection once
mongo.Connect();
app.set('port', process.env.PORT || 1337);
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

