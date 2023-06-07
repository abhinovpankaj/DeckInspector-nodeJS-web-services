class ProcessExecutor{
    constructor(){
        this.processes = [];
    }

    addProcess(process){
        this.processes.push(process);
    }

    async executeProcess() {
        const htmlPromises = this.processes.map(async process => {
          return process.getHtml();
        });
      
        const htmlArray = await Promise.all(htmlPromises);
        const finalHtml = htmlArray.join('');
        return finalHtml;
      }
}

module.exports = ProcessExecutor;