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
        module.exports.Projects = client.db(dbName).collection('LocalProject');
        module.exports.SubProjects = client.db(dbName).collection('LocalSubProject');
        module.exports.Locations = client.db(dbName).collection('LocalLocation');
        module.exports.Sections = client.db(dbName).collection('LocalVisualSection');
        module.exports.Users = client.db(dbName).collection('users');
        module.exports.ProjectDocuments = client.db(dbName).collection('ProjectDocuments');
        module.exports.InvasiveSections = client.db(dbName).collection('LocalInvasiveSection');
        module.exports.ConclusiveSections = client.db(dbName).collection('LocalConclusiveSection');
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