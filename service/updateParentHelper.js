const ProjectDAO = require("../model/projectDAO");
const subProjectDAO = require("../model/subProjectDAO");
const LocationDAO = require("../model/locationDAO");

const addLocationMetadataInParent = async (locationId, location) => {
  const locationDataInParent = {
    name: location.name,
    type: location.type,
    url: location.url,
    description: location.description,
    isInvasive: location.isInvasive ? location.isInvasive : false,
    sequenceNo: location.sequenceNo !== undefined ? location.sequenceNo : null,
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
};

const removeLocationFromParent = async (locationId, location) => {
  if (location.parenttype == "subproject") {
    const result = await subProjectDAO.removeSubProjectChild(
      location.parentid,
      locationId
    );
    if (result.modifiedCount === 1) {
      console.log(
        `Removed Location with id ${locationId} in subProject id ${location.parentid} successfully`
      );
    }
  } else if (location.parenttype == "project") {
    const result = await ProjectDAO.removeProjectChild(
      location.parentid,
      locationId
    );
    if (result.modifiedCount === 1) {
      console.log(
        `Removed Location with id ${locationId} in Project id ${location.parentid} successfully`
      );
    }
  }
};

const addSectionMetadataInParent = async (sectionId, section) => {
  const sectionDataInParent = {
    name: section.name,
    conditionalassessment: section.conditionalassessment,
    visualreview: section.visualreview,
    coverUrl: section.images ? section.images[0] : "",
    furtherinvasivereviewrequired: section.furtherinvasivereviewrequired,
    isInvasive: section.furtherinvasivereviewrequired,
    visualsignsofleak: section.visualsignsofleak,
    isuploading: false,
    count: section.images.length,
    sequenceNo: section.sequenceNo !== undefined ? section.sequenceNo : null,
  };

  if (section.parenttype == "project") {
    await ProjectDAO.addChildInSingleLevelProject(
      section.parentid,
      sectionId,
      sectionDataInParent
    );
    console.log(
      `Added section with id ${sectionId} in Project id ${section.parentid} for Single Level Project successfully`
    );
  } else {
    await LocationDAO.addLocationChild(
      section.parentid,
      sectionId,
      sectionDataInParent
    );
    console.log(
      `Added section with id ${sectionId} in location id ${section.parentid} successfully`
    );
  }
};

const removeSectionMetadataFromParent = async (sectionId, section) => {
  if (section.parenttype == "project") {
    await ProjectDAO.removeChildFromSingleLevelProject(
      section.parentid,
      sectionId
    );
    console.log(
      `Removed section with id ${sectionId} from Project id ${section.parentid} for Single Level Project successfully`
    );
  } else {
    await LocationDAO.removeLocationChild(section.parentid, sectionId);
    console.log(
      `Removed section with id ${sectionId} from location id ${section.parentid} successfully`
    );
  }
};

const addSubprojectMetaDataInProject = async (subProjectId, subProject) => {
  const subProjectDataInParent = {
    name: subProject.name,
    type: "subproject",
    url: subProject.url,
    description: subProject.description,
    isInvasive: subProject.isInvasive,
    sequenceNo: subProject.sequenceNo !== undefined ? subProject.sequenceNo : null,
  };
  await ProjectDAO.addProjectChild(
    subProject.parentid,
    subProjectId,
    subProjectDataInParent
  );
  console.log(
    `Added subproject with id ${subProjectId} in project id ${subProject.parentid} successfully`
  );
};

const removeSubprojectMetaDataInProject = async (subProjectId, subProject) => {
  await ProjectDAO.removeProjectChild(subProject.parentid, subProjectId);
  console.log(
    `Removed subproject with id ${subProjectId} in project successfully`
  );
};

module.exports = {
  addLocationMetadataInParent,
  removeLocationFromParent,
  addSectionMetadataInParent,
  removeSectionMetadataFromParent,
  addSubprojectMetaDataInProject,
  removeSubprojectMetaDataInProject,
};
