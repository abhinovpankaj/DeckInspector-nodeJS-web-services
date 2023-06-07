const locations = require("../../../../model/location");
const SectionPartProcessExecutorFactory = require("../../sectionPartProcessExecutorFactory.js");
const projectReportType = require("../../../../model/projectReportType.js");


const generateReportForLocation = async function(locationId,sectionImageProperties,reportType) {
    try {
        var location = await locations.getLocationById(locationId);
        if(!(location.data))
        {
          return  "";
        }
        else{
          if(reportType === projectReportType.INVASIVEONLY || reportType === projectReportType.INVASIVEANDVISUAL)
          {
            if(location.data.item.isInvasive && location.data.item.isInvasive === true)
            {
              const sectionHtmls = await getSectionshtmls(location,location.data.item.sections,sectionImageProperties,reportType);
              let locationhtml = '';
              for (let key in sectionHtmls) {
                locationhtml += sectionHtmls[key];
              }
              return locationhtml;
            }
            else
            {
              return "";
            }
          }
          else if(reportType === projectReportType.VISUALREPORT){
            const sectionHtmls = await getSectionshtmls(location,location.data.item.sections,sectionImageProperties,reportType);
            let locationhtml = '';
            for (let key in sectionHtmls) {
              locationhtml += sectionHtmls[key];
            }
            return locationhtml;
          }
        }
      } catch (error) {
        console.log("Error is " + error);
      }
  }

  const getSectionshtmls = async function(location,sections,sectionImageProperties,reportType) 
  {
      try{
        const promises = [];
        const sectionhtmls = [];
        const newSections = [];

        for(let key in sections)
        {
          isSectionIncluded(reportType,sections[key])
          {
            newSections.push(sections[key]);
          }
        }
        for (let key in newSections) {
            const processExecutor = SectionPartProcessExecutorFactory.getProcessExecutorChain(location,sections[key].name,sections[key]._id,sectionImageProperties,reportType);
            const promise = processExecutor.executeProcess()
              .then((section_html) => {
              sectionhtmls[key] = section_html;
              });
            promises.push(promise);
          }
          await Promise.all(promises);
          return sectionhtmls;
    }catch(error){
        console.log(error);
    }
  }

  const isSectionIncluded = async function(reportType,section)
  {
    if(reportType === projectReportType.INVASIVEONLY || reportType === projectReportType.INVASIVEANDVISUAL)
    {
      if(section.furtherinvasivereviewrequired === true)
      {
        return true;
      }
      else{
        return false;
      }
    }
    else if(reportType === projectReportType.VISUALREPORT){
      return true;
    }
  }

module.exports = {generateReportForLocation};