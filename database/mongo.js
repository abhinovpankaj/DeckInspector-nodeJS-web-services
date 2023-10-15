"use strict";
const { MongoClient } = require('mongodb');

//const uri = "mongodb+srv://deckDbAdmin:deckadmin91@cluster0.60uuo.mongodb.net/?retryWrites=true&w=majority";

const uri = "mongodb+srv://webappuser:EFQGiY42QWSvt8mB@deckinspectorcluster.g1uf6.mongodb.net/?retryWrites=true&w=majority";
const dbName = "DeckInspectors";
function getDBConnectionString(){
    return uri;
}
var Connect = async function () {   

    const client = new MongoClient(uri);
    try {
        // Connect to the MongoDB cluster
        await client.connect();
       
        module.exports.Projects = client.db(dbName).collection('Project');
        module.exports.SubProjects = client.db(dbName).collection('SubProject');
        module.exports.Locations = client.db(dbName).collection('Location');
        module.exports.Sections = client.db(dbName).collection('VisualSection');
        module.exports.Users = client.db(dbName).collection('Users');
        module.exports.ProjectDocuments = client.db(dbName).collection('ProjectDocuments');

        module.exports.ProjectReports = client.db(dbName).collection('ProjectReports');
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
