const ProjectDAO = require('../model/projectDAO');
const subProjectDAO = require('../model/subProjectDAO');
const LocationDAO = require('../model/locationDAO');

const addLocationMetadataInParent = async (locationId, location) => {
    try {
      const locationDataInParent = {
        "name": location.name,
        "type": location.type,
        "url": location.url,
        "description": location.description,
        "isInvasive": location.isInvasive ? location.isInvasive : false,
      };
  
      if (location.parenttype == "subproject") {
        await subProjectDAO.addSubProjectChild(
          location.parentid,
          locationId,
          locationDataInParent
        );
        console.log(
          `Added Location with id ${locationId} in subProject id ${location.parentid} successfully`
        );
      } else if (location.parenttype == "project") {
        await ProjectDAO.addProjectChild(
          location.parentid,
          locationId,
          locationDataInParent
        );
        console.log(
          `Added Location with id ${locationId} in Project id ${location.parentid} successfully`
        );
      }
    } catch (error) {
      return handleError(error);
    }
  };
  
  const removeLocationFromParent = async (locationId, location) => {
    try {
      if (location.parenttype == "subproject") {
        const result = await subProjectDAO.removeSubProjectChild(location.parentid, locationId);
        if(result.modifiedCount === 1)
        {
          console.log(
            `Removed Location with id ${locationId} in subProject id ${location.parentid} successfully`
          );
        }
      } else if (location.parenttype == "project") {
        const result = await ProjectDAO.removeProjectChild(location.parentid, locationId);
        if(result.modifiedCount === 1)
        {
          console.log(
            `Removed Location with id ${locationId} in Project id ${location.parentid} successfully`
          );
        }
      }
    } catch (error) {
      return handleError(error);
    }
  };

  const addSectionMetadataInParent = async (sectionId, section) => {
    try {
      const sectionDataInParent = {
        "name": section.name,
        "conditionalassessment": section.conditionalassessment,
        "visualreview": section.visualreview,
        "coverUrl": section.images ? section.images[0] : "",
        "furtherinvasivereviewrequired": section.furtherinvasivereviewrequired,
        "isInvasive": section.furtherinvasivereviewrequired,
        "visualsignsofleak": section.visualsignsofleak,
        "isuploading":false,
        "count": section.images.length,
      };
  
      await LocationDAO.addLocationChild(
        section.parentid,
        sectionId,
        sectionDataInParent
      );
      console.log(
        `Added section with id ${sectionId} in location id ${section.parentid} successfully`
      );
    } catch (error) {
      return handleError(error);
    }
  };
  
  const removeSectionMetadataFromParent = async (sectionId, section) => {
    try {
      await LocationDAO.removeLocationChild(section.parentid, sectionId);
      console.log(
        `Removed section with id ${sectionId} from location id ${section.parentid} successfully`
      );
    } catch (error) {
      return handleError(error);
    }
  };

  const addSubprojectMetaDataInProject = async (subProjectId,subProject) => {
    try {
       const subProjectDataInParent = {
            "name": subProject.name,
            "type": 'subproject',
            "url": subProject.url,
            "description": subProject.description,
            "isInvasive": subProject.isInvasive,
        }
        await ProjectDAO.addProjectChild(subProject.parentid, subProjectId,subProjectDataInParent);
        console.log(`Added subproject with id ${subProjectId} in project id ${subProject.parentid} successfully`);
    }
    catch (error) {
        return handleError(error);
    }
};
        
const removeSubprojectMetaDataInProject = async (subProjectId,subProject) => {
    try {
        await ProjectDAO.removeProjectChild(subProject.parentid,subProjectId);
        console.log(`Removed subproject with id ${subProjectId} in project successfully`);
    }
    catch (error) {
        return handleError(error);
    }
};

const handleError = (error) => {
    console.error('An error occurred:', error);
    return {
        code:500,
        success: false,
        reason: `An error occurred: ${error.message}`
    };
};

module.exports = {
    addLocationMetadataInParent,
    removeLocationFromParent,
    addSectionMetadataInParent,
    removeSectionMetadataFromParent,
    addSubprojectMetaDataInProject,
    removeSubprojectMetaDataInProject
}
