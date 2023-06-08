const locationStrategyInterface = require('./locationStrategyInterface');

const ejs = require('ejs');
const path = require('path');
const fs = require('fs');

const filePath = path.join(__dirname, 'projectcommonlocation.ejs');
const template = fs.readFileSync(filePath, 'utf8');

class ProjectCommonLocation extends locationStrategyInterface {

    async getLocationHeaderhtml(requiredObj) {
        const tempObj = {
            headerTitle : requiredObj.headerTitle,
            projectcommonLocationName : requiredObj.ProjectCommonLocation,
            locationName : requiredObj.sectionName
        }
        let locationHeader = ejs.render(template,tempObj);
        return locationHeader;
    }
}

module.exports = ProjectCommonLocation;