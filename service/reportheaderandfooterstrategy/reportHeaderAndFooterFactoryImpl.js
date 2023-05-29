const DeckInspectorHeaderAndFooter = require("./deckInspector/deckinspectorsheaderandfooter");
const WicrHeaderAndFooter = require("./wicr/wicrheaderandfooter");

class ReportHeaderAndFooterFactoryImpl {
    getReportHeaderAndFooterStrategy(companyName) {
        if(companyName === 'DeckInspectors')
        {
            return new DeckInspectorHeaderAndFooter();
        }
        else if(companyName === 'Wicr')
        {
            return new WicrHeaderAndFooter();
        }
        else{
            throw new Error(`Invalid Company Name: ${companyName}`);
        }
    }
}

module.exports = ReportHeaderAndFooterFactoryImpl;