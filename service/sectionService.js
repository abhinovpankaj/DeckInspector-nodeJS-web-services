"use strict";
const LocationDAO = require("../model/locationDAO");
const SectionDAO = require("../model/sectionDAO");
const InvasiveSectionService = require("../service/invasiveSectionService");
const ConclusiveSectionService = require("../service/conclusiveSectionService");
const InvasiveUtil = require("../service/invasiveUtil");

const addSection = async (section) => {
  try {
    const result = await SectionDAO.addSection(section);
    if (result.insertedId) {
      await addSectionMetadataInParent(result.insertedId, section);

      //if section is invasive ,it will mark entire parent hierarchy as invasive
      await InvasiveUtil.markSectionInvasive(section.parentid);
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

var getSectionById = async function (sectionId) {
  try {
    const result = await SectionDAO.getSectionById(sectionId);
    if (result) {
      return {
        success: true,
        section: result,
      };
    }
    return {
      code: 401,
      success: false,
      reason: "No Section found with the given ID",
    };
  } catch (error) {
    return handleError(error);
  }
};

var deleteSectionPermanently = async function (sectionId) {
  try {
    //Delete Invasive Sections
    const invasiveSectionResult =
      await InvasiveSectionService.getInvasiveSectionByParentId(sectionId);
    if (invasiveSectionResult.invasiveSections) {
      for (let invasiveSection of invasiveSectionResult.invasiveSections) {
        await InvasiveSectionService.deleteInvasiveSectionPermanently(
          invasiveSection._id
        );
      }
    }

    //Delete Conclusive Sections
    const conclusiveSectionResult =
      await ConclusiveSectionService.deleteConclusiveSectionPermanently(
        sectionId
      );
    if (conclusiveSectionResult.conclusiveSections) {
      for (let conclusiveSection of conclusiveSectionResult.conclusiveSections) {
        await ConclusiveSectionService.deleteConclusiveSectionPermanently(
          conclusiveSection._id
        );
      }
    }

    const section = await SectionDAO.getSectionById(sectionId);
    //Update Parent for the section
    await removeSectionMetadataFromParent(sectionId, section);

    const result = await SectionDAO.deleteSection(sectionId);

    //Mark parent as non-invasive if its all child are non invasive
    InvasiveUtil.markLocationNonInvasive(section.parentid);

    if (result.deletedCount === 1) {
      return {
        success: true,
        id: sectionId,
      };
    }
    return {
      code: 401,
      success: false,
      reason: "No Section found with the given ID",
    };
  } catch (error) {
    return handleError(error);
  }
};

var getSectionsByParentId = async function (parentId) {
  try {
    const result = await LocationDAO.getLocationByParentId(parentId);
    if (result) {
      return {
        success: true,
        sections: result,
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

const editSetion = async (sectionId, section) => {
  try {
    const result = await SectionDAO.editSection(sectionId, section);
    if (result.modifiedCount === 1) {
      const sectionFromDB = await SectionDAO.getSectionById(sectionId);
      await removeSectionMetadataFromParent(sectionId, sectionFromDB);
      await addSectionMetadataInParent(sectionId, sectionFromDB);
      //if section is invasive ,it will mark entire parent hierarchy as invasive
      if (
        sectionFromDB.furtherinvasivereviewrequired
      ) {
        await InvasiveUtil.markSectionInvasive(sectionId);
      } else {
        await InvasiveUtil.markLocationNonInvasive(section.parentid);
      }
      return {
        success: true,
      };
    }
    return {
      code: 401,
      success: false,
      reason: "No Section found with the given ID",
    };
  } catch (error) {
    return handleError(error);
  }
};

/**
 *
 * @param
 * @param {*} section
 * @returns
 */

const addSectionMetadataInParent = async (sectionId, section) => {
  try {
    sectionDataInParent = {
      "name": section.name,
      "conditionalassessment": section.conditionalassessment,
      "visualreview": section.visualreview,
      "coverUrl": section.coverUrl,
      "furtherinvasivereviewrequired": section.furtherinvasivereviewrequired,
      "isInvasive": section.isInvasive,
      "visualsignsofleak": section.visualsignsofleak,
      "isuploading":false
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

const handleError = (error) => {
  console.error("An error occurred:", error);
  return {
    code: 500,
    success: false,
    reason: `An error occurred: ${error.message}`,
  };
};

module.exports = {
  addSection,
  getSectionById,
  deleteSectionPermanently,
  getSectionsByParentId,
  editSetion,
};
