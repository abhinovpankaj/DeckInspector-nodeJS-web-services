class  ReportHeaderAndFooterStrategy{
    async getReportHeader(){
        throw new Error('getReportHeader must be implemented');
    }
    async getReportFooter(){
        throw new Error('getReportHeader must be implemented');
    }
}

module.exports = ReportHeaderAndFooterStrategy;