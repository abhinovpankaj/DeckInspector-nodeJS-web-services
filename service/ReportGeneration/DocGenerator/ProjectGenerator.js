const projects = require("../../../model/project");
const {ProjectDocs, Doc} = require("../Models/ProjectDocs");
const ReportGenerationUtil = require("../ReportGenerationUtil");
const ProjectChildType = require("../../../model/projectChildType");
const LocationGenerator = require("./LocationGenerator");
const SubProjectGenerator = require("./SubProjectGenerator");
class ProjectGenerator{
    async createProject(projectId) {
        const project  = await projects.getProjectById(projectId);
        const projectDoc = new ProjectDocs();
        const projectHashcodeArray = [];
        const docPath = [];
        const {subProjects, locations } = this.reOrderAndGroupProjects(project.data.item.children);
        for(const mySubProject of subProjects) {
            const subProjectDoc = await SubProjectGenerator.createSubProject(mySubProject._id);
            projectDoc.subprojectMap.set(mySubProject._id.toString(), subProjectDoc);
            projectHashcodeArray.push(subProjectDoc.doc.hashCode);
            docPath.push(subProjectDoc.doc.filePath);
        }

        for (const location of locations) {
            const locationDoc = await LocationGenerator.createLocation(location._id);
            projectDoc.locationMap.set(location._id.toString(), locationDoc);
            projectHashcodeArray.push(locationDoc.doc.hashCode);
            docPath.push(locationDoc.doc.filePath);
        }


        projectHashcodeArray.push(ReportGenerationUtil.calculateHash(project));
        const projectHashCode = ReportGenerationUtil.combineHashesInArray(projectHashcodeArray);
        const filePath = await ReportGenerationUtil.mergeDocxArray(docPath, projectId);
        projectDoc.doc = new Doc(projectHashCode, filePath);
        return projectDoc;
    }

    async updateProject(projectId,projectMap) {
        const project  = await projects.getProjectById(projectId);
        const projectDoc = projectMap.get(projectId.toString());
        const projectHashcodeArray = [];
        const docPath = [];
        const {subProjects, locations } = this.reOrderAndGroupProjects(project.data.item.children);
        let locationMap = new Map();
        let subprojectMap = new Map();
        for(const mySubProject of subProjects) {
            if (projectDoc.subprojectMap.has(mySubProject._id.toString())) {
                const subProjectDoc = await SubProjectGenerator.updateSubProject(mySubProject._id, projectDoc.subprojectMap.get(mySubProject._id.toString()));
                if (subProjectDoc !== null) {
                    projectDoc.subprojectMap.get(mySubProject._id.toString()).doc= subProjectDoc;
                }
            } else {
                console.log("New subproject is added");
                const subProjectDoc = await SubProjectGenerator.createSubProject(mySubProject._id);
                projectDoc.subprojectMap.set(mySubProject._id.toString(), subProjectDoc);
            }

            let newSubprojectDoc = projectDoc.subprojectMap.get(mySubProject._id.toString());
            subprojectMap.set(mySubProject._id.toString(), newSubprojectDoc);
            projectHashcodeArray.push(newSubprojectDoc.doc.hashCode);
            docPath.push(newSubprojectDoc.doc.filePath)
        }

        for (const location of locations) {
            if (projectDoc.locationMap.has(location._id.toString())) {
                const locationDoc = await LocationGenerator.updateLocation(location._id,
                    projectDoc.locationMap.get(location._id.toString()));
                if (locationDoc !== null) {
                    projectDoc.locationMap.get(location._id.toString()).doc= locationDoc;
                }
            } else {
                console.log("New location is added");
                const locationDoc = await LocationGenerator.createLocation(location._id);
                projectDoc.locationMap.set(location._id.toString(), locationDoc);
            }
            let newLocationDoc = projectDoc.locationMap.get(location._id.toString());
            locationMap.set(location._id.toString(), newLocationDoc);
            projectHashcodeArray.push(newLocationDoc.doc.hashCode);
            docPath.push(newLocationDoc.doc.filePath)

        }
        projectDoc.subprojectMap = subprojectMap;
        projectDoc.locationMap = locationMap;

        projectHashcodeArray.push(ReportGenerationUtil.calculateHash(project));
        const projectHashCode = ReportGenerationUtil.combineHashesInArray(projectHashcodeArray);
        if (projectHashCode !== projectDoc.doc.hashCode) {
            console.log("Project Hashcode changed.  Updating Project Doc");
            const filePath = await ReportGenerationUtil.mergeDocxArray(docPath, projectId);
            projectDoc.doc = new Doc(projectHashCode, filePath);
            return projectDoc;
        }
        return null;
    }

    reOrderAndGroupProjects (projects){
        const subProjects = [];
        const locations = [];
        for(let key in projects)
        {
            if(projects[key].type === ProjectChildType.SUBPROJECT)
            {
                subProjects.push(projects[key]);
            }else if(projects[key].type === ProjectChildType.PROJECTLOCATION){
                locations.push(projects[key]);
            }
        }
        subProjects.sort(function(subProj1,subProj2){
            return (subProj1.sequenceNumber-subProj2.sequenceNumber);
        });
        locations.sort(function(loc1,loc2){
            return (loc1.sequenceNumber-loc2.sequenceNumber);
        });
        return {subProjects,locations};
    }
}

module.exports = new ProjectGenerator();