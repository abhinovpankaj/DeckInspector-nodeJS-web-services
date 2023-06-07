const LocationStrategyInterface =  require('./locationStrategyInterface');
const ejs = require('ejs');
const path = require('path');
const fs = require('fs');

const filePath = path.join(__dirname, 'buildingapartmentlocation.ejs');
const template = fs.readFileSync(filePath, 'utf8');

class BuildingApartment extends LocationStrategyInterface{

    async getLocationHeaderhtml(requiredObj){
        const tempObj = {
            headerTitle : requiredObj.headerTitle,
            buildingName : requiredObj.buildingName,
            apartmentName : requiredObj.apartmentName,
            locationName : requiredObj.sectionName
        }
        let locationHeader =  ejs.render(template,tempObj);
        return locationHeader;
    }
}

module.exports = BuildingApartment;