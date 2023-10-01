const { BlobServiceClient } = require("@azure/storage-blob");
require("dotenv").config();

// containerName: string
// blobName: string, includes file extension if provided
// localFileWithPath: fully qualified path and file name
// uploadOptions: {
//   metadata: { reviewer: 'john', reviewDate: '2022-04-01' }, 
//   tags: {project: 'xyz', owner: 'accounts-payable'}
// }
const account = process.env.AZURE_STORAGE_ACCOUNT_NAME;
//const defaultAzureCredential = new DefaultAzureCredential();

const blobServiceClient = BlobServiceClient.fromConnectionString(process.env.STORAGE_CONNECTION_STRING);

async function uploadFile(containerName, blobName, localFileWithPath, uploadOptions) {

  try {
    
    if (!account) return ('{"error":"Azure Storage accountName not found"}');
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

async function getBlobBuffer(blobName,containerName) {
  const containerClient = blobServiceClient.getContainerClient(containerName);
  const blobClient = containerClient.getBlobClient(blobName);

  // Get blob content from position 0 to the end
  // In Node.js, get downloaded data by accessing downloadBlockBlobResponse.readableStreamBody
  const downloadBlockBlobResponse = await blobClient.download();
  const downloaded = (
    await streamToBuffer(downloadBlockBlobResponse.readableStreamBody)
  );
  //console.log("Downloaded blob content:", downloaded);
  
  // [Node.js only] A helper method used to read a Node.js readable stream into a Buffer
  async function streamToBuffer(readableStream) {
    return new Promise((resolve, reject) => {
      const chunks = [];
      readableStream.on("data", (data) => {
        chunks.push(data instanceof Buffer ? data : Buffer.from(data));
      });
      readableStream.on("end", () => {
        resolve(Buffer.concat(chunks));
      });
      readableStream.on("error", reject);
    });
  }
  return downloaded;
}
module.exports = { uploadFile ,getBlobBuffer};

