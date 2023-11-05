const crypto = require('crypto');
const docxTemplate = require('docx-templates');
const fs = require('fs');
const DocxMerger = require('docx-merger');
const util = require('util');
const objectHash = require('object-hash');
const serialize = require("serialize-javascript");
const axios = require('axios');
const {getBlobBuffer} = require("../../database/uploadimage");
const fspromises = require('fs').promises;

class ReportGenerationUtil {
    constructor() {
        this.readFileAsync = util.promisify(fs.readFile);
        this.writeFileAsync = util.promisify(fs.writeFile);
    }

    async saveDocxMerger(docxMerger, outputType) {
        return new Promise((resolve, reject) => {
            docxMerger.save(outputType, (data) => {
                if (data) {
                    resolve(data);
                } else {
                    reject('Error saving DocxMerger data');
                }
            });
        });
    }


    async mergeDocxArray(docxUrls, fileName) {
        try {
            const docFilePath = `${fileName}.docx`;
            const fileList = [];

            for (const url of docxUrls) {
                if(!url) continue;
                try {
                    var urlArray = url.toString().split('/');
                    const docxBuffer = await getBlobBuffer(urlArray[urlArray.length-1],urlArray[urlArray.length-2]);
                    fileList.push(docxBuffer);
                } catch (error) {
                    console.error(`Error fetching the file from URL: ${url}`, error);
                }
            }

            if (fileList.length === 0) {
                console.error('No valid files to merge.');
                return null;
            }

            const docx = new DocxMerger({}, fileList);

            const data = await this.saveDocxMerger(docx, 'nodebuffer');
            await fspromises.writeFile(docFilePath, data);
            console.log('Merged DOCX file saved:', docFilePath);
            return docFilePath;
        } catch (error) {
            console.error(error);
        }
    }
    async createDocReportWithParams(template,data,additionalJsContext)
    {
        const buffer = await docxTemplate.createReport({
                template,
                data: data,
                additionalJsContext: additionalJsContext,
                failFast:false
            },
        );
        return buffer;
    }

    calculateHash = (doc) => {
        const str = serialize(doc);
         // Create a SHA-256 hash of the string
        const hash = crypto.createHash('sha256');
        hash.update(str);

        // Return the hash code as a hex string
        return hash.digest('hex');
    }

     combineHashesInArray(hashArray) {
        const combinedHash = hashArray.join(''); // Concatenate all hash codes
         return crypto.createHash('sha256').update(combinedHash).digest('hex');
    }

}
module.exports = new ReportGenerationUtil();