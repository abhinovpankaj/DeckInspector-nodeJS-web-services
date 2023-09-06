const SectionDAO = require("../model/sectionDAO");
const LocationDAO = require("../model/locationDAO");
const SubProjectDAO = require("../model/subProjectDAO");
const ProjectDAO = require("../model/projectDAO");
const updateParentHelper = require("../service/updateParentHelper");

// Marks a section as invasive if the condition is met
const markSectionInvasive = async (sectionId) => {
  try {
    const section = await SectionDAO.getSectionById(sectionId);
    if (section) {
      if (section.furtherinvasivereviewrequired) {

        if(section.parenttype == "project")
        {
          await markProjectInvasive(section.parentid);
        }
        else{
          await markLocationInvasive(section.parentid);
        }
      }
    }
  } catch (err) {
    console.error("Error in markSectionInvasive:", err);
  }
};

// Marks a location as invasive if the condition is met
const markLocationInvasive = async (locationId) => {
  try {
    const location = await LocationDAO.getLocationById(locationId);
    if (location) {
      let isInvasiveFlag = location.isInvasive;
      if (isInvasiveFlag) return;
      location.isInvasive = true;
      await LocationDAO.editLocation(locationId, location);

      //UMESH TODO -- to remove this code
      await updateParentHelper.removeLocationFromParent(locationId, location);
      await updateParentHelper.addLocationMetadataInParent(locationId, location);

      if (location.parenttype === "subproject") {
        await markSubProjectInvasive(location.parentid); // Assume parentId is available in location
      } else if (location.parenttype === "project") {
        await markProjectInvasive(location.parentid); // Assume parentId is available in location
      }      
    }
  } catch (err) {
    console.error("Error in markLocationInvasive:", err);
  }
};

// Marks a subproject as invasive if the condition is met
const markSubProjectInvasive = async (subProjectId) => {
  try {
    const subProject = await SubProjectDAO.findSubProjectById(subProjectId);
    if (subProject) {
      let isInvasiveFlag = subProject.isInvasive;
      if (isInvasiveFlag) return;

      subProject.isInvasive = true;
      await SubProjectDAO.editSubProject(subProjectId, subProject);

      //UMESH TODO -- to remove this code
      await updateParentHelper.removeSubprojectMetaDataInProject(subProjectId, subProject);
      await updateParentHelper.addSubprojectMetaDataInProject(subProjectId, subProject);

      if (subProject.parenttype === "project") {
        await markProjectInvasive(subProject.parentid); // Assume parentId is available in subProject
      }

      
    }
  } catch (err) {
    console.error("Error in markSubProjectInvasive:", err);
  }
};

// Marks a project as invasive if the condition is met
const markProjectInvasive = async (projectId) => {
  try {
    const project = await ProjectDAO.getProjectById(projectId);
    if (project) {
      let isInvasiveFlag = project.isInvasive;
      if (isInvasiveFlag) return;

      project.isInvasive = true;
      await ProjectDAO.editProject(projectId, project);
    }
  } catch (err) {
    console.error("Error in markProjectInvasive:", err);
  }
};

const markSectionNonInvasive = async (sectionId) => {
  try {
    const section = await SectionDAO.getSectionById(sectionId);
    if (section) {
      if (section.furtherinvasivereviewrequired) return;
      const location = await LocationDAO.getLocationById(section.parentid);
      if (location) {
        await markLocationNonInvasive(section.parentid);
      }
    }
  } catch (err) {
    console.error("Error in markSectionNonInvasive:", err);
  }
};

const markLocationNonInvasive = async (locationid) => {
  try {
    const sections = await SectionDAO.getSectionByParentId(locationid);
    if (sections) {
      for (const section of sections) {
        if (section.furtherinvasivereviewrequired) {
          return;
        }
      }
      const location = await LocationDAO.getLocationById(locationid);
      


      if (location) {
        location.isInvasive = false;
        await LocationDAO.editLocation(locationid, location);
        

        await updateParentHelper.removeLocationFromParent(locationid, location);
        await updateParentHelper.addLocationMetadataInParent(locationid, location);

        if (location.parenttype == "subproject") {
          await markSubProjectNonInvasive(location.parentid);
        } else if (location.parenttype == "project") {
          await markProjectNonInvasive(location.parentid);
        }
      }
    }
  } catch (err) {
    console.error("Error in markSectionNonInvasive:", err);
  }
};

const markSubProjectNonInvasive = async (subProjectId) => {
  try {
    const locations = await LocationDAO.getLocationByParentId(subProjectId);
    if (locations) {
      for (const location of locations) {
        if (location.isInvasive) {
          return;
        }
      }
     
      const subProject = await SubProjectDAO.findSubProjectById(subProjectId);
      if (subProject) {
        subProject.isInvasive = false;
        await SubProjectDAO.editSubProject(subProjectId, subProject);

        await updateParentHelper.removeSubprojectMetaDataInProject(subProjectId, subProject);
        await updateParentHelper.addSubprojectMetaDataInProject(subProjectId, subProject);

        if (subProject.parenttype == "project") {
          await markProjectNonInvasive(subProject.parentid);
        }
      }
    }
  } catch (err) {
    console.error("Error in markSubProjectNonInvasive:", err);
  }
};

const markProjectNonInvasive = async (projectId) => {
  try {
    const project = await ProjectDAO.getProjectById(projectId);

    if (project) {
      if (project.projecttype == "singlelevel") {
        const sections = await SectionDAO.getSectionByParentId(projectId);
        if (sections) {
          for (const section of sections) {
            if (section.furtherinvasivereviewrequired) {
              return;
            }
          }
        }
      } else {
        const locations = await LocationDAO.getLocationByParentId(projectId);
        if (locations) {
          for (const location of locations) {
            if (location.isInvasive) {
              return;
            }
          }
        }

        const subProjects = await SubProjectDAO.findSubProjectsByParentId(
          projectId
        );

        if (subProjects) {
          for (const subProject of subProjects) {
            if (subProject.isInvasive) {
              return;
            }
          }
        }
      }

      project.isInvasive = false;
      await ProjectDAO.editProject(projectId, project);
    }
  } catch (err) {
    console.error("Error in markProjectNonInvasive:", err);
  }
};

module.exports = {
  markSectionInvasive,
  markLocationInvasive,
  markSubProjectInvasive,
  markProjectInvasive,
  markLocationNonInvasive,
  markProjectNonInvasive,
  markSubProjectNonInvasive,
  markSectionNonInvasive,
};
