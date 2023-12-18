const fs = require("fs");
const ReportGenerationUtil = require("./ReportGenerationUtil.js");
const ProjectReportType = require("../../model/projectReportType");
const blobManager = require("../../database/uploadimage");
const path = require('path');
class ReportDocGeneration {
    async generateReportDoc(projectId, project,companyName,sectionImageProperties,reportType){
        try{
            console.time("generateReportDocs");
            const template = this.getTemplate(companyName);

            const createdAtString = project.data.item.createdat;
            const date = new Date(createdAtString);
            var createdBy='WICR  Waterproofing & Construction';

            if (companyName=='Wicr') {
                
            }else{
                createdBy ='E3 Inspection Reporting Solutions.';                
            }
            const data = {
                project:{
                    reportType: reportType,
                    name: project.data.item.name,
                    address: project.data.item.address,
                    description:project.data.item.description,
                    createdBy:createdBy,
                    createdAt : date.toLocaleString(),
                    headerName: this.getProjectHeader(reportType)
                }
            };
            
            const filePath = projectId + '-projectheader.docx'
            const additionalJsContext = {
                tile: async () => {
                    var projurl = project.data.item.url===''?'https://deckinspectorsappdata.blob.core.windows.net/highlandmountainshadow/image_1.png':
                    project.data.item.url;

                    var urlArray = projurl.toString().split('/');
                    var imageBuffer ;
                    if (projurl.includes('deckinspectorsappdata')) {
                        imageBuffer = await blobManager.getBlobBuffer(urlArray[urlArray.length-1],urlArray[urlArray.length-2]);
                    }else{
                        imageBuffer = await blobManager.getBlobBufferFromOld(urlArray[urlArray.length-1],urlArray[urlArray.length-2]);
                    }
                    
                    if (imageBuffer===undefined) {
                      console.log('Failed to load image .');
                      return;
                    }
                  
                  const extension  = path.extname(projurl);
                  try {
                    var {buffer} = await jo.rotate(Buffer.from(imageBuffer), {quality:50});
                    return { height: 15,width: 19.8,  data: buffer, extension: extension };
                  } catch (error) {
                    //console.log('An error occurred when rotating the file: ' + error);
                    return { height: 15,width: 19.8,  data: imageBuffer, extension: extension };
                  }                                                  
                },
            };
            const buffer = await ReportGenerationUtil.createDocReportWithParams(template,data,additionalJsContext)
            fs.writeFileSync(filePath, buffer);
            return filePath;
        }
        catch(err){
            console.log(err);
        }
    }

    getTemplate(companyName) {
        if (companyName === 'Wicr') {
            return fs.readFileSync('WicrProjectHeader.docx');
        } else {
            return fs.readFileSync('DeckProjectHeader.docx');
        }
    }
    getProjectHeader(reportType){
        if(ProjectReportType.VISUALREPORT === reportType)
        {
            return "Visual Inspection Report";
        }
        else if(ProjectReportType.INVASIVEONLY === reportType)
        {
            return "Invasive only Project Report";
        }
        else if(ProjectReportType.INVASIVEVISUAL === reportType)
        {
            return "Invasive Project Report";
        }
    }
}

module.exports = new ReportDocGeneration();