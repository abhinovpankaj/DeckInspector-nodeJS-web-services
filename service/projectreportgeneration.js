const projects = require("../model/project");
const {generateReportForLocation} = require("./locationreportgeneration.js")

const projectId = "644aadcd6c15624d02429d4e";

const generateProjectReport = async function generate()
{
    try{
        const project  = await projects.getProjectById(projectId);
        for (let key in project.data.item.children) {
            const html = await getReport(project.data.item.children[key]);
        }
    }
    catch(err){
        console.log(err);
    }
}


const getReport = async function(child){
    try{
        if(child.type === "location")
        {
            await generateReportForLocation(child.id);
        }else if(child.type === "subproject")
        {
            //console.log("Project SubProject : " ,child);
        }
        return "hello";
    }catch(error){
        console.log(error);
    }

}

module.exports = { generateProjectReport};