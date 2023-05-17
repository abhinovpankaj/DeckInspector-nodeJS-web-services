const subProject = require("../model/subproject");
const LocationStrategyFactoryImpl = require("./factoryforlocationstrategy/locationfactoryImpl.js");

const getSectionHeader = async function (location, sectionName) {
  const factory = new LocationStrategyFactoryImpl();
  
  if (location.data.item.parenttype === "subproject") {
    return getSubprojectSectionHeader(location, sectionName, factory);
  } else if (location.data.item.parenttype === "project") {
    return getProjectSectionHeader(location, sectionName, factory);
  }
};

const getSubprojectSectionHeader = async function (location, sectionName, factory) {
  const subProjectData = await subProject.getSubProjectById(location.data.item.parentid);
  
  if (location.data.item.type === "apartment") {
    const requiredObj = {
      buildingName: subProjectData.data.item.name,
      apartmentName: location.data.item.name,
      sectionName: sectionName
    };
    const strategy = factory.getLocationStrategy("buildingapartment");
    return strategy.getLocationHeaderhtml(requiredObj);
  } else if (location.data.item.type === "location") {
    const requiredObj = {
      buildingName: subProjectData.data.item.name,
      BuildingCommonLocation: location.data.item.name,
      sectionName: sectionName
    };
    const strategy = factory.getLocationStrategy("buildingcommon");
    return strategy.getLocationHeaderhtml(requiredObj);
  }
};

const getProjectSectionHeader = function (location, sectionName, factory) {
  const requiredObj = {
    ProjectCommonLocation: location.data.item.name,
    sectionName: sectionName
  };
  const strategy = factory.getLocationStrategy("projectcommon");
  return strategy.getLocationHeaderhtml(requiredObj);
};

exports.getSectionHeader = getSectionHeader;
