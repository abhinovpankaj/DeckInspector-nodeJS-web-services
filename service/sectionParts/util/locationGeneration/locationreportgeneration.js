const locations = require("../../../../model/location");
const sections = require("../../../../model/sections.js")
const SectionPartProcessExecutorFactory = require("../../sectionPartProcessExecutorFactory.js");
const projectReportType = require("../../../../model/projectReportType.js");
const docxTemplate = require('docx-templates');
const path = require('path');
const fs = require('fs');

const generateDocReportForLocation = async function (locationId,companyName, sectionImageProperties, reportType,subprojectName='') {
  try {
    const sectionDataDoc =
    [];
    const location = await locations.getLocationById(locationId);
    if (!location.data) {
      return "";
    } else {
      if (reportType === projectReportType.INVASIVEONLY || reportType === projectReportType.INVASIVEVISUAL) {
        if (location.data.item.isInvasive && location.data.item.isInvasive === true) {
          // const sectionHtmls = await getSectionshtmls(location, location.data.item.sections, sectionImageProperties, reportType);
          // return Object.values(sectionHtmls).join("");
        } else {
          return "";
        }
      } else if (reportType === projectReportType.VISUALREPORT) {

        var mysections = location.data.item.sections;
        //create document
        if(!mysections)
        {
          return "";
        }
        const newSections = mysections.filter(section =>  isSectionIncluded(reportType, section));
        var locationType='';
        if( location.data.item.type==='buildinglocation'){
           locationType = "Building Common"
        }
        if( location.data.item.type==='apartment'){
          locationType = "Apartment"
       }
       if( location.data.item.type==='projectlocation'){
        locationType = "Project Common"
     }
        await Promise.all(newSections.map(async (section, index) => {
            const sectionData =  await sections.getSectionById(section._id);

            if(sectionData.data && sectionData.data.item)
            {
              // var htmlData = `+++HTML
              // <p style="color: red;">${sectionData.data.item.eee}</p>
              // +++`;
              var template;
              if (companyName==='Wicr') {
                if (subprojectName=='') {
                  template = fs.readFileSync('Wicr2VisualDetails.docx');
               }else{
                  template = fs.readFileSync('WicrVisualDetails.docx');
               }
              }else{
                if (subprojectName=='') {
                  template = fs.readFileSync('Deck2VisualDetails.docx');
               }else{
                  template = fs.readFileSync('DeckVisualDetails.docx');
               }
              }
              
              const buffer = await docxTemplate.createReport({
              template,
              failFast:false,
              data: {
                  section:{
                    reportType : reportType,
                    buildingName: subprojectName,
                      parentType: locationType,
                      parentName: location.data.item.name,
                      name: sectionData.data.item.name,
                      exteriorelements: sectionData.data.item.exteriorelements.toString().replaceAll(',',', '),
                      waterproofing:sectionData.data.item.waterproofingelements.toString().replaceAll(',',', '),
                      visualreview:sectionData.data.item.visualreview,
                      signsofleak : sectionData.data.item.visualsignsofleak?'Yes':'No',
                      furtherinvasive:sectionData.data.item.furtherinvasivereviewrequired?'Yes':'No',
                      conditionalassesment:sectionData.data.item.conditionalassessment,
                      additionalconsiderations:sectionData.data.item.additionalconsiderations,
                      eee:sectionData.data.item.eee,
                      lbc:sectionData.data.item.lbc,
                      awe:sectionData.data.item.awe,
                      images:sectionData.data.item.images
                      
                  }               
              },
              additionalJsContext: {
                
                getChunks : async (imageArray,chunk_size=4) => {
                  var index = 0;
                  var arrayLength = imageArray.length;
                  var tempArray = [];
                  
                  for (index = 0; index < arrayLength; index += chunk_size) {
                      myChunk = imageArray.slice(index, index+chunk_size);
                      
                      tempArray.push(myChunk);
                    }
                  
                  return tempArray;
                },
                tile: async (imageurl) => {
                  if (imageurl===undefined) {
                    return;
                  }
                  const resp = await fetch(
                    imageurl
                  );
                  const buffer = resp.arrayBuffer
                    ? await resp.arrayBuffer()
                    : await resp.buffer();
                  const extension  = path.extname(imageurl);
                  return { height: 6.2,width: 4.85,  data: buffer, extension: extension };
                }, 
            }
          });
            var filename = sectionData.data.item._id +'.docx'
            fs.writeFileSync(filename, buffer);
            sectionDataDoc.push(filename);
        }
        }));
        return sectionDataDoc;
      }
    }
  } catch (error) {
    console.log("Error is " + error);
  }
}


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

module.exports = { generateReportForLocation ,generateDocReportForLocation};
