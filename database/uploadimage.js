const { BlobServiceClient } = require("@azure/storage-blob");
require("dotenv").config();

// containerName: string
// blobName: string, includes file extension if provided
// localFileWithPath: fully qualified path and file name
// uploadOptions: {
//   metadata: { reviewer: 'john', reviewDate: '2022-04-01' }, 
//   tags: {project: 'xyz', owner: 'accounts-payable'}
// }
async function uploadFile(containerName, blobName, localFileWithPath, uploadOptions) {

  try {
    //console.log(containerName+ blobName+ localFileWithPath+ uploadOptions);
    const accountName = process.env.AZURE_STORAGE_ACCOUNT_NAME;
    if (!accountName) return ('{"error":"Azure Storage accountName not found"}');

    const blobServiceClient = BlobServiceClient.fromConnectionString(process.env.STORAGE_CONNECTION_STRING);
    // Get a reference to a container
    const containerClient = blobServiceClient.getContainerClient(containerName);
    
      const options = {
        access: 'blob'
      };
      var response = await containerClient.createIfNotExists(options);   
      //console.log(response);
    const blockBlobClient = containerClient.getBlockBlobClient(blobName);
    //blockBlobClient.createIfNotExists();
    // upload file to blob storage
    var uploadResult = await blockBlobClient.uploadFile(localFileWithPath, uploadOptions);
    return (`{"message":"${blobName} succeeded","url":"${blockBlobClient.url}"}`);
    //console.log(uploadResult);
  } catch (err) {
    return (`{"error": "${err.message}"}`);
  }

}
module.exports = { uploadFile };

