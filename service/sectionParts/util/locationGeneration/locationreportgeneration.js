const locations = require("../../../../model/location");
const SectionPartProcessExecutorFactory = require("../../sectionPartProcessExecutorFactory.js");
const projectReportType = require("../../../../model/projectReportType.js");

const generateReportForLocation = async function (locationId, sectionImageProperties, reportType) {
  try {
    const location = await locations.getLocationById(locationId);
    if (!location.data) {
      return "";
    } else {
      if (reportType === projectReportType.INVASIVEONLY || reportType === projectReportType.INVASIVEVISUAL) {
        if (location.data.item.isInvasive && location.data.item.isInvasive === true) {
          const sectionHtmls = await getSectionshtmls(location, location.data.item.sections, sectionImageProperties, reportType);
          return Object.values(sectionHtmls).join("");
        } else {
          return "";
        }
      } else if (reportType === projectReportType.VISUALREPORT) {
        const sectionHtmls = await getSectionshtmls(location, location.data.item.sections, sectionImageProperties, reportType);
        return Object.values(sectionHtmls).join("");
      }
    }
  } catch (error) {
    console.log("Error is " + error);
  }
}

const getSectionshtmls = async function (location, sections, sectionImageProperties, reportType) {
  try {
    const sectionHtmls = {};
    if(!sections)
    {
      return "";
    }
    const newSections = sections.filter(section =>  isSectionIncluded(reportType, section));

    await Promise.all(newSections.map(async (section, index) => {
      const processExecutor = SectionPartProcessExecutorFactory.getProcessExecutorChain(location, section.name, section._id, sectionImageProperties, reportType);
      const sectionHtml = await processExecutor.executeProcess();
      sectionHtmls[index] = sectionHtml;
    }));

    return sectionHtmls;
  } catch (error) {
    console.log(error);
  }
}

const isSectionIncluded = function (reportType, section) {
  if (reportType === projectReportType.INVASIVEONLY || reportType === projectReportType.INVASIVEVISUAL) {
    return section.furtherinvasivereviewrequired === true;
  } else if (reportType === projectReportType.VISUALREPORT) {
    return true;
  }
}

module.exports = { generateReportForLocation };
