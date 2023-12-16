class ProjectDoc {
    constructor() {
        this.wICRMap = new Map();
        this.deckInspectorMap = new Map();
    }

    getMap(companyName) {
        if (companyName === "Wicr") {
            return this.wICRMap;
        } else if (companyName === "DeckInspectors") {
            return this.deckInspectorMap;
        }
    }

}
class ProjectDocDetails {
    constructor(projectdocument, hash) {
        this.projectDocHash = projectDocHash;
        this.projectPath = projectPath;
    }
}

module.exports =  { ProjectDoc, ProjectDocDetails};