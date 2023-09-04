"use strict";
const ProjectDAO = require("../model/projectDAO");
const LocationDAO = require("../model/locationDAO");
const subProjectDAO = require("../model/subProjectDAO");
const SectionService = require("../service/sectionService");
const InvasiveUtil = require("../service/invasiveUtil");

const addLocation = async (location) => {
  try {
    const result = await LocationDAO.addLocation(location);
    if (result.insertedId) {
      await addLocationMetadataInParent(result.insertedId, location);
      return {
        success: true,
        id: result.insertedId,
      };
    }
    return {
      code: 500,
      success: false,
      reason: "Insertion failed",
    };
  } catch (error) {
    return handleError(error);
  }
};

var getLocationById = async function (locationId) {
  try {
    const result = await LocationDAO.getLocationById(locationId);
    if (result) {
      return {
        success: true,
        location: result,
      };
    }
    return {
      code: 401,
      success: false,
      reason: "No Location found with the given ID",
    };
  } catch (error) {
    return handleError(error);
  }
};

var deleteLocationPermanently = async function (locationId) {
  try {
    const location = await LocationDAO.getLocationById(locationId);
    if (location) {
      const sectionResult = await SectionService.getSectionsByParentId(
        locationId
      );
      if (sectionResult.sections) {
        for (const section of sectionResult.sections) {
          await SectionService.deleteSectionPermanently(section._id);
        }
      }

      const result = await LocationDAO.deleteLocation(locationId);
      await removeLocationFromParent(locationId, location);

      if (location.parenttype === "subproject") {
        await InvasiveUtil.markSubProjectNonInvasive(location.parentid);
      } else if (location.parenttype === "project") {
        await InvasiveUtil.markProjectNonInvasive(location.parentid);
      }

      if (result.deletedCount === 1) {
        return {
          success: true,
        };
      }
    }
    return {
      code: 401,
      success: false,
      reason: "No Location found with the given ID",
    };
  } catch (error) {
    return handleError(error);
  }
};

var getLocationsByParentId = async function (parentId) {
  try {
    const result = await LocationDAO.getLocationByParentId(parentId);
    if (result) {
      return {
        success: true,
        locations: result,
      };
    }
    return {
      code: 401,
      success: false,
      reason: "No Location found with the given parent ID",
    };
  } catch (error) {
    return handleError(error);
  }
};

const editLocation = async (locationId, location) => {
  try {
    const result = await LocationDAO.editLocation(locationId, location);
    if (result.modifiedCount === 1) {
      const locationFromDB = await LocationDAO.getLocationById(locationId);
      await removeLocationFromParent(locationId, locationFromDB);
      await addLocationMetadataInParent(locationId, locationFromDB);
      return {
        success: true,
      };
    }
    return {
      code: 401,
      success: false,
      reason: "No location found with the given ID",
    };
  } catch (error) {
    return handleError(error);
  }
};

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

const handleError = (error) => {
  console.error("An error occurred:", error);
  return {
    code: 500,
    success: false,
    reason: `An error occurred: ${error.message}`,
  };
};

module.exports = {
  addLocation,
  getLocationById,
  deleteLocationPermanently,
  getLocationsByParentId,
  editLocation,
};
