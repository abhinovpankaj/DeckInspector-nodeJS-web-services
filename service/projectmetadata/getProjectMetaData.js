const project = require("../../model/project.js");
const subProject = require("../../model/subproject.js");
const location = require("../../model/location.js");

const getProjectHierarchyMetadata = async function(username)
{
    try{
        var response = {}
        var projects = [];

        const allProjects = await project.getProjectByAssignedToUserId(username);
        
        if(allProjects.data && allProjects.data.projects)
        {
            for(const project of allProjects.data.projects)
            {
                const projectId = project._id;
                const projectResponse = await getProjectData(projectId);
                projects.push(projectResponse);
            }
        }

        response = {
            "data" :{
                "item": projects,
                "message": "Projects found.",
                "code":201
            }     
        }
        return response;
    }catch(error){
        console.log(error);
    }

   
}

async function getSingleProjectMetadata(projectId)
{
    try{
        var response = {}
        var projects = [];

        const projectResponse = await getProjectData(projectId);
        projects.push(projectResponse);

        response = {
            "data" :{
                "item": projects,
                "message": "Projects found.",
                "code":201
            }     
        }
        return response;
    }catch(error){
        console.log(error);
        return {
            "error": error,
            "code": 500
        }
    }
}


async function getProjectData(projectId) {
    var projectResponse = {};
    const projectData = await project.getProjectById(projectId);
    projectResponse.id = projectData.data.item._id;
    projectResponse.name = projectData.data.item.name;
    projectResponse.isInvasive = projectData.data.item.isInvasive?projectData.data.item.isInvasive:false;
    projectResponse.projectType = projectData.data.item.projecttype;

    projectResponse.subProjects = await getSubProjectsData(projectId);
    projectResponse.locations = await getProjectWiseLocationsMetaData(projectId);
    return projectResponse;
}

async function getProjectWiseLocationsMetaData(projectId) {
    const locationData = await location.getLocationByParentId(projectId);

    const locations = [];
    if(locationData.data && locationData.data.item)
    {
        for (const loc of locationData.data.item) {
            locations.push({ locationId: loc._id, locationName: loc.name, locationType: loc.type ,isInvasive:loc.isInvasive?loc.isInvasive:false});
        }
    }
    return locations;
}


async function getSubProjectsData(projectId) {
    const subProjectsData = await subProject.getSubProjectsByParentId(projectId);
    const subProjects = [];
    if(subProjectsData.data && subProjectsData.data.item)
    {
        for (const subProject of subProjectsData.data.item) {
            const subProjectData = {};
            subProjectData._id = subProject._id;
            subProjectData.name = subProject.name;
            subProjectData.isInvasive = subProject.isInvasive?subProject.isInvasive:false;
            subProjectData.sequenceNo = subProject.sequenceNo;
            const subProjectLocations = [];
            const subProjectChildren = await location.getLocationByParentId(subProject._id);
            
            if (subProjectChildren.data) {
                for (const loc of subProjectChildren.data.item) {
                    const locId = loc._id;
                    const locName = loc.name;
                    const locType = loc.type;
                    const sequenceNo = loc.sequenceNo;
                    const isInvasive = loc.isInvasive?loc.isInvasive:false;
                    subProjectLocations.push({ locationId: locId, sequenceNo:sequenceNo, locationName: locName,
                         locationType: locType,isInvasive:isInvasive });
                }
            }
            subProjectData.subProjectLocations = subProjectLocations
            .sort(function(subProj1,subProj2){
                return (subProj1.sequenceNo-subProj2.sequenceNo)
            });
            subProjects.push(subProjectData);
            
        }
    }
    subProjects.sort(function(subProj1,subProj2){
        return (subProj1.sequenceNo-subProj2.sequenceNo)
    });
    return subProjects;
}




module.exports = {getProjectHierarchyMetadata, getSingleProjectMetadata};

