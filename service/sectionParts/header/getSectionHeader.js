const subProject = require("../../../model/subproject");
const LocationStrategyFactoryImpl = require("./factoryforlocationstrategy/locationfactoryImpl.js");
const LocationType = require("../../../model/locationType.js");
const ProjectChildType = require("../../../model/projectChildType.js")
const ProjectReportType = require("../../../model/projectReportType.js");
const LocationHeaderTitle = require("../../../model/LocationHeaderTitle.js");

const getSectionHeader = async function (location, sectionName,projectReportType) {
  const factory = new LocationStrategyFactoryImpl();
  const locationHeaderTitle = getHeaderTitle(projectReportType,location.data.item.type);
  if (location.data.item.parenttype === ProjectChildType.SUBPROJECT) {
    return getSubprojectSectionHeader(location, sectionName, factory,locationHeaderTitle);
  } else {
    return getProjectSectionHeader(location, sectionName, factory,locationHeaderTitle);
  }
};

const getSubprojectSectionHeader = async function (location, sectionName, factory,locationHeaderTitle) {
  const subProjectData = await subProject.getSubProjectById(location.data.item.parentid);
  if (location.data.item.type === LocationType.APARTMENT) {
    const requiredObj = {
      headerTitle :locationHeaderTitle,
      buildingName: subProjectData.data.item.name,
      apartmentName: location.data.item.name,
      sectionName: sectionName
    };
    const strategy = factory.getLocationStrategy(LocationType.APARTMENT);
    return strategy.getLocationHeaderhtml(requiredObj);
  } else if (location.data.item.type === LocationType.BUILDINGLOCATION) {
    const requiredObj = {
      headerTitle :locationHeaderTitle,
      buildingName: subProjectData.data.item.name,
      BuildingCommonLocation: location.data.item.name,
      sectionName: sectionName
    };
    const strategy = factory.getLocationStrategy(LocationType.BUILDINGLOCATION);
    return strategy.getLocationHeaderhtml(requiredObj);
  }
};

const getProjectSectionHeader = function (location, sectionName, factory,locationHeaderTitle) {
  const requiredObj = {
    headerTitle :locationHeaderTitle,
    ProjectCommonLocation: location.data.item.name,
    sectionName: sectionName
  };
  const strategy = factory.getLocationStrategy(LocationType.PROJECTLOCATION);
  return strategy.getLocationHeaderhtml(requiredObj);
};

//TODO convert into MAP and use directly
const getHeaderTitle = function(reportType,locationType)
{
  if(reportType === ProjectReportType.VISUALREPORT)
  {
    if(locationType === LocationType.PROJECTLOCATION)
    {
      return LocationHeaderTitle.VISUAL_REPORT_COMMON_LOCATIONS;
    }
    else if(locationType === LocationType.BUILDINGLOCATION)
    {
      return LocationHeaderTitle.VISUAL_REPORT_BUILDING_COMMON_LOCATIONS;
    }
    else if(locationType === LocationType.APARTMENT)
    {
      return LocationHeaderTitle.VISUAL_REPORT_BUILDING_APARTMENTS;
    }
  }
  else if(reportType === ProjectReportType. INVASIVEVISUAL || reportType === ProjectReportType.INVASIVEONLY)
  {
    return LocationHeaderTitle.INVASIVE_REPORT_INSPECTION;
  }
};

exports.getSectionHeader = getSectionHeader;
