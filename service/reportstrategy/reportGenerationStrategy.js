class HtmlReportGenerationStrategy{
    async generateReportHtml(project,sectionImageProperties){
        throw new Error('generateReportHtml must be implemented');
    }
}

module.exports = HtmlReportGenerationStrategy;