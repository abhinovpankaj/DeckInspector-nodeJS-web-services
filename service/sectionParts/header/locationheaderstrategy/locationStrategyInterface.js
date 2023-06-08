class LocationStrategyInterface{

    async getLocationHeaderhtml(requiredObj){
        throw new Error('This method must be overwritten!');
    }

}

module.exports = LocationStrategyInterface;