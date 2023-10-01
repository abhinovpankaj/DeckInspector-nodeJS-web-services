const locations = require("../../../../model/location");
const sections = require("../../../../model/sections.js")
const SectionPartProcessExecutorFactory = require("../../sectionPartProcessExecutorFactory.js");
const projectReportType = require("../../../../model/projectReportType.js");
const docxTemplate = require('docx-templates');
const path = require('path');
const fs = require('fs');
const ProjectReportType = require("../../../../model/projectReportType.js");
const invasiveSections  = require("../../../../model/invasiveSections");
const conclusiveSections  = require("../../../../model/conclusiveSections");
const blobManager = require("../../../../database/uploadimage");
const jo = require('jpeg-autorotate')

const generateDocReportForLocation = async function (locationId,companyName, sectionImageProperties, reportType,subprojectName='') {
  try {
    const sectionDataDoc =
    [];
    const location = await locations.getLocationById(locationId);

    if (!location.data) {
      return "";
    } else {

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
      var template;
      if (companyName==='Wicr') {
       if (subprojectName=='') {
          template = fs.readFileSync('Wicr2AllData.docx');
        }
        else{
          template = fs.readFileSync('WicrAllData.docx');
        }
      }else{
       if (subprojectName=='') {
          template = fs.readFileSync('Deck2AllData.docx');
        }else{
          template = fs.readFileSync('DeckAllData.docx');
        }
      }
      if (reportType === projectReportType.INVASIVEONLY || reportType === projectReportType.INVASIVEVISUAL) {
        if (location.data.item.isInvasive && location.data.item.isInvasive === true) {
          var mysections = location.data.item.sections;
        
          if(!mysections)
          {
            return "";
          }
          const newSections = mysections.filter(section =>  isSectionIncluded(reportType, section));
          await Promise.all(newSections.map(async (section, index) => {
            const sectionData =  await sections.getSectionById(section._id);
            const invasiveSectionData = await invasiveSections.getInvasiveSectionByParentId(section._id);
            if(sectionData.data && sectionData.data.item)
            {
              var sectionDocValues;

              if (reportType===ProjectReportType.INVASIVEONLY) {
                if (invasiveSectionData.data && invasiveSectionData.data.item) {
                  const conclusiveSectionData = await conclusiveSections.getConclusiveSectionByParentId(section._id);
                  if (conclusiveSectionData.data && conclusiveSectionData.data.item) {
                    sectionDocValues = {
                      isUnitUnavailable: sectionData.data.item.unitUnavailable?'true':'false',
                      reportType : reportType,
                      buildingName: subprojectName,
                      parentType: locationType,
                      parentName: location.data.item.name,
                      name: sectionData.data.item.name,
                      furtherInvasiveRequired: invasiveSectionData.data.item.postinvasiverepairsrequired?'true':'false',
                      invasiveDesc: invasiveSectionData.data.item.invasiveDescription,
                      invasiveImages : invasiveSectionData.data.item.invasiveimages,
                      conclusiveImages : conclusiveSectionData.data.item.conclusiveimages,
                      propowneragreed:conclusiveSectionData.data.item.propowneragreed?'true':'false',
                      invasiverepairsinspectedandcompleted:conclusiveSectionData.data.item.invasiverepairsinspectedandcompleted?'true':'false',
                      };
                  }else{
                    sectionDocValues = {
                      isUnitUnavailable: sectionData.data.item.unitUnavailable?'true':'false',
                      reportType : reportType,
                      buildingName: subprojectName,
                      parentType: locationType,
                      parentName: location.data.item.name,
                      name: sectionData.data.item.name,
                      furtherInvasiveRequired: invasiveSectionData.data.item.postinvasiverepairsrequired?'true':'false',
                      invasiveDesc: invasiveSectionData.data.item.invasiveDescription,
                      invasiveImages : invasiveSectionData.data.item.invasiveimages,   
                      invasiverepairsinspectedandcompleted:false
                      };
                  }
                  
                  };
                }else{
                  if (invasiveSectionData.data && invasiveSectionData.data.item) {
                    sectionDocValues = {
                      isUnitUnavailable: sectionData.data.item.unitUnavailable?'true':'false',
                      reportType : reportType,
                      buildingName: subprojectName,
                      parentType: locationType,
                      parentName: location.data.item.name,
                      name: sectionData.data.item.name,
                      exteriorelements: sectionData.data.item.exteriorelements.toString().replaceAll(',',', '),
                      waterproofing:sectionData.data.item.waterproofingelements.toString().replaceAll(',',', '),
                      visualreview:sectionData.data.item.visualreview,
                      signsofleak : sectionData.data.item.visualsignsofleak=='True'?'Yes':'No',
                      furtherinvasive:sectionData.data.item.furtherinvasivereviewrequired=='True'?'Yes':'No',
                      conditionalassesment:sectionData.data.item.conditionalassessment=='Futureinspection'?'Future Inspection':sectionData.data.item.conditionalassessment,
                      additionalconsiderations:sectionData.data.item.additionalconsiderations,
                      eee:sectionData.data.item.eee,
                      lbc:sectionData.data.item.lbc,
                      awe:sectionData.data.item.awe,
                      images:sectionData.data.item.images,
                      furtherInvasiveRequired: false,
                      invasiveDesc: invasiveSectionData.data.item.invasiveDescription,
                      invasiveImages : invasiveSectionData.data.item.invasiveimages,   
                      invasiverepairsinspectedandcompleted:false
                      };
                  }else{
                    sectionDocValues = {
                      isUnitUnavailable: sectionData.data.item.unitUnavailable?'true':'false',
                      reportType : reportType,
                      buildingName: subprojectName,
                      parentType: locationType,
                      parentName: location.data.item.name,
                      name: sectionData.data.item.name,
                      exteriorelements: sectionData.data.item.exteriorelements.toString().replaceAll(',',', '),
                      waterproofing:sectionData.data.item.waterproofingelements.toString().replaceAll(',',', '),
                      visualreview:sectionData.data.item.visualreview,
                      signsofleak : sectionData.data.item.visualsignsofleak=='True'?'Yes':'No',
                      furtherinvasive:sectionData.data.item.furtherinvasivereviewrequired=='True'?'Yes':'No',
                      conditionalassesment:sectionData.data.item.conditionalassessment=='Futureinspection'?'Future Inspection':sectionData.data.item.conditionalassessment,
                      additionalconsiderations:sectionData.data.item.additionalconsiderations,
                      eee:sectionData.data.item.eee,
                      lbc:sectionData.data.item.lbc,
                      awe:sectionData.data.item.awe,
                      images:sectionData.data.item.images,
                      furtherInvasiveRequired: false,
                      invasiveDesc: 'Invasive inspection not done',//invasiveSectionData.data.item.invasiveDescription,
                      invasiveImages : ['https://www.deckinspectors.com/wp-content/uploads/2020/07/logo_new_new-1.png'],//invasiveSectionData.data.item.invasiveimages,   
                      invasiverepairsinspectedandcompleted:false
                      };
                  }                 
              }
              var filename = await getLocationDoc(sectionData.data.item._id,template,sectionDocValues) ;
              sectionDataDoc.push(filename);  
            }  
            
            
          }));
          return sectionDataDoc;
        }else{
          return "";
        }
      } else if (reportType === projectReportType.VISUALREPORT) {
          var mysections = location.data.item.sections;
          
          if(!mysections)
          {
            return "";
          }
          const newSections = mysections.filter(section =>  isSectionIncluded(reportType, section));
          
          await Promise.all(newSections.map(async (section, index) => {
          const sectionData =  await sections.getSectionById(section._id);
          
          if(sectionData.data && sectionData.data.item)
          {

            var sectionDocValues;
            
            if (sectionData.data.item.unitUnavailable) {
              sectionDocValues = {
                isUnitUnavailable: sectionData.data.item.unitUnavailable?'true':'false',
                reportType : reportType,
                buildingName: subprojectName,
                parentType: locationType,
                parentName: location.data.item.name,
                name: sectionData.data.item.name,                  
              };
            }else{
                sectionDocValues = {
                  isUnitUnavailable: sectionData.data.item.unitUnavailable?'true':'false',
                  reportType : reportType,
                  buildingName: subprojectName,
                  parentType: locationType,
                  parentName: location.data.item.name,
                  name: sectionData.data.item.name,
                  exteriorelements: sectionData.data.item.exteriorelements.toString().replaceAll(',',', '),
                  waterproofing:sectionData.data.item.waterproofingelements.toString().replaceAll(',',', '),
                  visualreview:sectionData.data.item.visualreview,
                  signsofleak : sectionData.data.item.visualsignsofleak=='True'?'Yes':'No',
                  furtherinvasive:sectionData.data.item.furtherinvasivereviewrequired=='True'?'Yes':'No',
                  conditionalassesment:sectionData.data.item.conditionalassessment=='Futureinspection'?'Future Inspection':sectionData.data.item.conditionalassessment,
                  additionalconsiderations:sectionData.data.item.additionalconsiderations,
                  eee:sectionData.data.item.eee,
                  lbc:sectionData.data.item.lbc,
                  awe:sectionData.data.item.awe,
                  images:sectionData.data.item.images
                  
              };
            }
            var filename = await getLocationDoc(sectionData.data.item._id,template,sectionDocValues) ;
            sectionDataDoc.push(filename);
        }
        }));
        return sectionDataDoc;
      }
    }
  } catch (error) {
    console.log("Error is " + error);
    return "";
  }
}
function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}
const getLocationDoc = async function(sectionId,template,sectionDocValues){
  const options = {
    
    jpegjsMaxResolutionInMP: 2048,
  }
  try {
    const buffer = await docxTemplate.createReport({
      template,
      failFast:false,
      data: {
          section: sectionDocValues      
      },
      additionalJsContext: {
        
        getChunks : async (imageArray,chunk_size=4) => {
          var index = 0;
          var tempArray = [];
          if (imageArray===undefined) {
            return tempArray;
          }
          var arrayLength = imageArray.length;
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
          if (!imageurl.startsWith('http')) {
            //imageurl = 'https://www.deckinspectors.com/wp-content/uploads/2020/07/logo_new_new-1.png';
            return;
          }
          
          try {
              
              // const resp = await fetch(
              //   imageurl,
              //   {setTimeout:16000}
              // );

              //const resp = await fetchPlus(imageurl,{keepAlive: true },3);
              var urlArray = imageurl.toString().split('/');
              const imagebuffer = await blobManager.getBlobBuffer(urlArray[urlArray.length-1],urlArray[urlArray.length-2])
              if (imagebuffer===undefined) {
                console.log('Failed to load image .');
                return;
              }
              // if (resp) {
              //   const imagebuffer = resp.arrayBuffer
              //   ? await resp.arrayBuffer()
              //   : await resp.buffer();
                const extension  = path.extname(imageurl);
                //fix image rotation
                try {
                  var {buffer} = await jo.rotate(Buffer.from(imagebuffer), {quality:50});
                  
                  return { height: 6,width: 4.8,  data: buffer, extension: extension };
                } catch (error) {
                  console.log('An error occurred when rotating the file: ' + error);
                  return { height: 6,width: 4.8,  data: imagebuffer, extension: extension };
                }
              // }else{
              //   return;
              // }                        
          } catch (error) {
             console.log(imageurl);
            console.log(error);
            return ;
          }   
        }, 
    }
  });
    var filename = sectionId +'.docx'
    fs.writeFileSync(filename, buffer);
    return filename;
  } catch (error) {
    console.log(error);
    return "";
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

const fetchPlus = (url, options = {setTimeout:20000}, retries) =>
  fetch(url, options)
    .then(res => {
      if (res.ok) {
        return res;
      }
      if (retries > 0) {
        sleep(2000);
        return fetchPlus(url, options, retries - 1)
      }
      return res.status;
    })
    .catch(error => 
      {
        console.log(url);
        console.log(error);
      }
      );


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
