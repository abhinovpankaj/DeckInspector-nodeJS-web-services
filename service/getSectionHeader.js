const subProject = require("../model/subproject");
const LocationStrategyFactoryImpl = require("./factoryforlocationstrategy/locationfactoryImpl.js");
const LocationType = require("../model/locationType.js");
const ProjectChildType = require("../model/projectChildType.js")

const getSectionHeader = async function (location, sectionName) {
  const factory = new LocationStrategyFactoryImpl();
  
  if (location.data.item.parenttype === ProjectChildType.SUBPROJECT) {
    return getSubprojectSectionHeader(location, sectionName, factory);
  } else {
    return getProjectSectionHeader(location, sectionName, factory);
  }
};

const getSubprojectSectionHeader = async function (location, sectionName, factory) {
  const subProjectData = await subProject.getSubProjectById(location.data.item.parentid);
  
  if (location.data.item.type === LocationType.APARTMENT) {
    const requiredObj = {
      buildingName: subProjectData.data.item.name,
      apartmentName: location.data.item.name,
      sectionName: sectionName
    };
    const strategy = factory.getLocationStrategy(LocationType.APARTMENT);
    return strategy.getLocationHeaderhtml(requiredObj);
  } else if (location.data.item.type === LocationType.BUILDINGLOCATION) {
    const requiredObj = {
      buildingName: subProjectData.data.item.name,
      BuildingCommonLocation: location.data.item.name,
      sectionName: sectionName
    };
    const strategy = factory.getLocationStrategy(LocationType.BUILDINGLOCATION);
    return strategy.getLocationHeaderhtml(requiredObj);
  }
};

const getProjectSectionHeader = function (location, sectionName, factory) {
  const requiredObj = {
    ProjectCommonLocation: location.data.item.name,
    sectionName: sectionName
  };
  const strategy = factory.getLocationStrategy(LocationType.PROJECTLOCATION);
  return strategy.getLocationHeaderhtml(requiredObj);
};

exports.getSectionHeader = getSectionHeader;
