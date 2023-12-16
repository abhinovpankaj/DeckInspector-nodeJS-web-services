class Doc {
    constructor(hashCode, filePath) {
        this.hashCode = hashCode;
        this.filePath = filePath;
    }
}
class LocationDoc {
    constructor(doc) {
        this.doc = doc;
        this.sectionMap = new Map();
    }
}

class SubprojectDoc {
    constructor(doc) {
        this.doc = doc;
        this.buildingLocationMap = new Map();
        this.buildingApartmentMap = new Map();
    }
}

class ProjectDocs {
    constructor(doc) {
        this.projectId = null;
        this.doc = doc;
        this.projectHeaderDoc = null;
        this.locationMap = new Map();
        this.subprojectMap = new Map();
    }
}


module.exports = { Doc, LocationDoc, SubprojectDoc, ProjectDocs }