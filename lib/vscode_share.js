const shareVscodeEditor = require('./vscode_attacher')
const vscode = require('vscode');


class VscodeShare{
    constructor(ws){
        this.vs = vscode.window.activeTextEditor
        this.ws = ws;
        this.sharejs = require('./share').client; //adding client sharejs
        this.sjs = new this.sharejs.Connection(this.ws);  //providing websocket connection to sharejs

    }

    start(sessionId){  // sending some data through websocket connection 
                        // DON'T KNOW EXACTLY WHY

            this.ws.send(JSON.stringify(
                {
                    a: 'meta', 
                    type: 'init',
                    sessionId,
                    atomVersion: '1.23.3', //hardcoded
                    motepairVersion: '1.0.0' // hardcoded
                }
            )
        );
        const doc = this.sjs.get('editors', `${sessionId}:test`);// here 'test' is hardcoded this has to be a relative path of the file

        this.setupDoc(doc, this.vs); // DONE ??????????????? editor not covered
    }

    setupDoc(doc,editor){ // DONE ????????????? editor not covered 
        doc.subscribe();

        doc.whenReady(()=>{
            if(doc.type == null){
                doc.create('text');
            }
            if (doc.type && (doc.type.name === 'text')) {
                let ctx;
                if (ctx == null) { ctx = doc.createContext(); } //here ctx is the context of the file which takes care of OT
                shareVscodeEditor(editor, ctx);
              }
        })
    }

}

module.exports = VscodeShare