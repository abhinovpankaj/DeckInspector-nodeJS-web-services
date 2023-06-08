const LocationType = require ('../../../../model/locationType');
class LocationStrategyFactoryImpl{
    getLocationStrategy(type){
       if(type === LocationType.APARTMENT){
           const BuildingApartment = require('../locationheaderstrategy/buildingApartment');
           return new BuildingApartment();
       }
       else if(type === LocationType.BUILDINGLOCATION){
           const BuildingCommonLocation = require('../locationheaderstrategy/buildingCommonLocation');
           return new BuildingCommonLocation();
       }
       else if(type===LocationType.PROJECTLOCATION){
           const ProjectCommonLocation = require('../locationheaderstrategy/projectCommonLocation');
           return new ProjectCommonLocation();
       }
       else{
        throw new Error(`Invalid location type: ${type}`);
       }
     }
}

module.exports = LocationStrategyFactoryImpl;