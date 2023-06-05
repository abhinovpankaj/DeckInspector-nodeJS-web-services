const ProjectReportType = require('../../model/projectReportType.js');
const VisualReportGenerationStrategy = require('./visualReportGeneration.js');


class ReportGenerationStartegyFactoryImpl {
    

    getReportGenerationStartegy(reportType) {

        if(reportType === ProjectReportType.VISUALREPORT)
        {
            return new VisualReportGenerationStrategy();
        }
        
    }
}

module.exports = new ReportGenerationStartegyFactoryImpl();