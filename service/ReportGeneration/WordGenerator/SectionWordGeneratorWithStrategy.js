const projectReportType = require("../../../model/projectReportType");
const invasiveSections = require("../../../model/invasiveSections");
const ProjectReportType = require("../../../model/projectReportType");
const conclusiveSections = require("../../../model/conclusiveSections");

class SectionWordGeneratorWithStrategy {
    async createSectionDoc(sectionId, sectionData, reportType, subprojectName, location, companyName) {
        const baseSectionDocValues = this.getBaseSectionDocValues(sectionData, reportType, subprojectName, locationType, location);
        const context = new SectionDocContext(null);

        if (location.data.item.isInvasive && location.data.item.isInvasive === true) {
            if (sectionData) {
                if (reportType === ProjectReportType.INVASIVEONLY) {
                    context.setStrategy(new InvasiveOnlyStrategy(baseSectionDocValues, sectionData, sectionId, location, reportType));
                } else if (reportType === ProjectReportType.INVASIVEVISUAL) {
                    context.setStrategy(new InvasiveVisualStrategy(baseSectionDocValues, sectionData, sectionId, location, reportType));
                }
            }
        }

        if (reportType === ProjectReportType.VISUALREPORT) {
            context.setStrategy(new VisualReportStrategy(baseSectionDocValues, sectionData, sectionId, location, reportType));
        }

        if (context.strategy) {
            let sectionDocValues = context.generateSectionDocValues();
        } else {
            return "";
        }
    }
}