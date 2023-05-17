class LocationStrategyFactoryImpl{
    getLocationStrategy(type){
       if(type === "buildingapartment"){
           const BuildingApartment = require('../locationheaderstrategy/buildingApartment');
           return new BuildingApartment();
       }
       else if(type === "buildingcommon"){
           const BuildingCommonLocation = require('../locationheaderstrategy/buildingCommonLocation');
           return new BuildingCommonLocation();
       }
       else if(type==="projectcommon"){
           const ProjectCommonLocation = require('../locationheaderstrategy/projectCommonLocation');
           return new ProjectCommonLocation();
       }
       else{
        throw new Error(`Invalid location type: ${type}`);
       }
     }
}

module.exports = LocationStrategyFactoryImpl;