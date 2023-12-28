
const ObjectId = require('mongodb').ObjectId;
const mongo = require('../database/mongo');

module.exports = {
    addTenant: async (tenant) => {
        return await mongo.Tenants.insertOne(tenant);
    },
    diskLimitreaching: async(id)=>{
        var tenant = await mongo.Tenants.findOne({_id:new ObjectId(id)});
        if (tenant.allowedDiskSpace-tenant.usedDiskSpace<=5) {
            return {isLimitreaching:true};
        }
        else{
            return {isLimitreaching:false};
        }
    },
    getAllTenants: async () => {
        return await mongo.Tenants.find({}).limit(50).sort({"_id": -1}).toArray();
    },
    getTenantById: async (id) => {
        return await mongo.Tenants.findOne({ _id: new ObjectId(id) }, {files: 0});
    },
    addTenantDiskSpace: async (id, space) => {
        return await mongo.Tenants.updateOne({ _id: new ObjectId(id) }, { $inc: { "allowedDiskSpace": +space }});
    },
    increaseTenantValidity: async (id, days) => {
        return await mongo.Tenants.updateOne({ _id: new ObjectId(id) }, { $inc: { validity: +days }});
    },
    increaseTenantUsers: async (id, count) => {
        return await mongo.Tenants.updateOne({ _id: new ObjectId(id) }, { $inc: { allowedUsersCount: +count }});
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
    updateAddIconsForTenant:async (id,iconsData)=>{
        try {
            await mongo.Tenants.updateOne({ _id: new ObjectId(id)},{$set:{icons:{iconsData}}});
        } catch (error) {
            console.log(error);
        }
        
    },
    updateTenantLogo:async (id,logoURL)=>{
        await mongo.Tenants.updateOne({ _id: new ObjectId(id)},{$set:{logoURL:logoURL}});
    },

    updateTenantWebsite:async (id,website)=>{
        await mongo.Tenants.updateOne({ _id: new ObjectId(id)},{$set:{website:website}});
    },
    updateTenantsAzureStorageData:async(id,azureStorageData)=>{
        await mongo.Tenants.updateOne({ _id: new ObjectId(id)},{$set:{azureDetails:{azureStorageData}}});
    },
    updateTenantExpenses: async (id, expense) => {
        return await mongo.Tenants.updateOne({ _id: new ObjectId(id) }, { $set: { expenses: expense }});
    },
};
