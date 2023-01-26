"use strict";
const { MongoClient } = require('mongodb');

const uri = "mongodb+srv://deckDbAdmin:deckadmin91@cluster0.60uuo.mongodb.net/?retryWrites=true&w=majority";
const dbName = "DeckInspectors";
function getDBConnectionString(){
    return uri;
}
var Connect = async function () {   

    const client = new MongoClient(uri);
    try {
        // Connect to the MongoDB cluster
        await client.connect();
        // // module.exports.Software = db.collection('software');
        // module.exports.Projects = client.db(dbName).collection('projects');
        // module.exports.Users = client.db(dbName).collection('users');
        // //module.exports.ClientInfo = db.collection('clientInfo');       
        console.log('Connected to MongoDB');
    } catch (e) {
        console.error(e);
    }     
    
};

module.exports = {
    Connect,
    GetConnectionString: getDBConnectionString
};