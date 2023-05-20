const LocationStrategyInterface = require('./locationStrategyInterface');

const ejs = require('ejs');
const path = require('path');
const fs = require('fs');

const filePath = path.join(__dirname, 'buildingcommonlocation.ejs');
const template = fs.readFileSync(filePath, 'utf8');

class BuildingCommonLocation extends LocationStrategyInterface {
    
        async getLocationHeaderhtml(requiredObj) {
            const tempObj = {
                buildingName: requiredObj.buildingName,
                buildingLocationName : requiredObj.BuildingCommonLocation,
                locationName: requiredObj.sectionName
            }
            let locationHeader = ejs.render(template, tempObj);
            return locationHeader;
        }
    }

module.exports = BuildingCommonLocation;