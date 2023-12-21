
const ObjectId = require('mongodb').ObjectId;
const mongo = require('../database/mongo');

module.exports = {
    addTenant: async (tenant) => {
        return await mongo.Tenants.insertOne(tenant);
    },
    getAllTenants: async () => {
        return await mongo.Tenants.find({}).limit(50).sort({"_id": -1}).toArray();
    },
    getTenantById: async (id) => {
        return await mongo.Tenants.findOne({ _id: new ObjectId(id) }, {files: 0});
    },
    addTenantDiskSpace: async (id, space) => {
        return await mongo.Tenants.updateOne({ _id: new ObjectId(id) }, { $inc: { allowedDiskSpace: space }});
    },
    increaseTenantValidity: async (id, days) => {
        return await mongo.Tenants.updateOne({ _id: new ObjectId(id) }, { $inc: { validity: days }});
    },
    increaseTenantUsers: async (id, count) => {
        return await mongo.Tenants.updateOne({ _id: new ObjectId(id) }, { $inc: { allowedUsersCount: count }});
    },
    editTenant: async (id, newData) => {
        return await mongo.Tenants.updateOne({ _id: new ObjectId(id) }, { $set: newData },{upsert:false});
    },

    toggleTenantAccess: async (id, isActive) => {
        return await mongo.Tenants.updateOne({ _id: new ObjectId(id) }, { $set: { isActive: isActive } });
    },

    deleteTenantPermanently: async (id) => {
        return await mongo.Tenants.deleteOne({ _id: new ObjectId(id) });
    },    
    addUpdateTenantIcons:async (id,iconsData)=>{
        await mongo.Tenants.updateOne({ _id: new ObjectId(id)},{$set:{icons:{iconsData}}});
    },
    updateTenantLogo:async (id,logoURL)=>{
        await mongo.Tenants.updateOne({ _id: new ObjectId(id)},{$set:{logoURL:logoURL}});
    },

    updateTenanWebsite:async (id,website)=>{
        await mongo.Tenants.updateOne({ _id: new ObjectId(id)},{$set:{website:website}});
    },
    updateTenantAzureStorageLink:async(id,azureStorageData)=>{
        await mongo.Tenants.updateOne({ _id: new ObjectId(id)},{$set:{azureDetails:{azureStorageData}}});
    },
    AddTenantExpenses: async (id, expense) => {
        return await mongo.Tenants.updateOne({ _id: new ObjectId(id) }, { $inc: { expenses: expense }});
    },
};
