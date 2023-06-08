class LocationStrategyFactoryInterface{
     getLocationStrategy(type){
        throw new Error('This method must be overwritten!');
     }
}

module.exports = LocationStrategyFactoryInterface;

