const vscode = require('vscode');
const textdiff = require('../text-change');

function shareVscodeEditor(editor , ctx){ // editor not covered
    this.currText = '';
    td = new textdiff();
    if (!ctx.provides.text) throw new Error('Cannot attach to non-text document');

    editor.suppress = false; //??????? don't know why this supress is used
    var text = ctx.get() //|| ''; // Due to a bug in share - get() returns undefined for empty docs.
    this.currText = editor.document.getText();
    if (text.length === 0){
      ctx.insert(0, this.currText); // DONE ??? editor has to be changed with vscode editor
    } else if (text !== this.currText) { //?? getText function may change
      setText(editor,text)  /// DONE ??? no setText present in Vs code editor api has to be done manually


    }

    check(); //checking doc context realtime with 0 intervals

    ctx.onInsert = function(index , text){
        console.log(index,text);
         /// DONE ?????? has to be changes isDistroyed not present in Vs code Editor api
        if (editor.document.isClosed) return; // returns when editor is destroyed.
    
    //// this is an api provided by sharejs to right own logic when some changes are inserted in the contect of doc
        editor.edit(editBuilder => {
            editBuilder.insert(vscode.window.activeTextEditor.document.positionAt(index), text);
        })
        check();
    }

    ctx.onRemove = function (index, length) {
        if (editor.document.isClosed) return; // returns when editor is destroyed.
        check();
      };

    vscode.workspace.onDidChangeTextDocument(event => {
        if(editor.supress) return ;
        applyToSharejs(event);
        check();
    });


    function applyToSharejs(event){
        console.log("Event occured!");
        // var startPos = 0
        // if((event.contentChanges[0].range[0].rangeLength + 1) !== 0){
        //     startPos = [event.contentChanges[0].range[0].line , event.contentChanges[0].range[0].character];///???????? not sure about this position it is oldrange start pos
        //     ctx.remove(startPos,event.contentChanges[0].text)
        // } 
        
        // if((event.contentChanges[0].range[0].rangeLength + 1) > 0){
        // startPos = [event.contentChanges[0].range[0].line , event.contentChanges[0].range[0].character];
            // ctx.insert(startPos,event.contentChanges[0].text)
            // console.log('Text inserted : ', startPos, event.contentChanges[0].text);
            //ctx.insert(0, editor.document.getText())
        // }
        changes = td.get(this.currText, editor.document.getText());
        this.currText = editor.document.getText();
        console.log(changes);
        changes.forEach(change => {
            //TODO: change pos with relative offset
            
            pos = vscode.window.activeTextEditor.document.offsetAt(new vscode.Position(change.startLineNumber, change.startColumn));
            // pos = [change.startLineNumber, change.startColumn]; 
            ctx.insert(pos, change.text);
        });

    }

    function setText(editor,text){
        this.currText = text;
        // finding total range of editor
        var firstLine = editor.document.lineAt(0);
        var lastLine = editor.document.lineAt(editor.document.lineCount - 1);
        var textRange = new vscode.Range(0, 
                                 firstLine.range.start.character, 
                                 editor.document.lineCount - 1, 
                                 lastLine.range.end.character);

        editor.edit((editBuilder)=>{
            editBuilder.replace(textRange,text)
        })                         

    };
    
    function check() {
        setTimeout(function () {
          var editorText = editor.document.getText();
          var otText = ctx.get() || '';
  
          if (editorText != otText) {
            console.error("Text does not match!");
            console.error("editor: " + editorText);
            console.error("ot: " + otText);
            // Replace the editor text with the ctx snapshot.
            editor.suppress = true;
            setText(editor,otText);
            editor.suppress = false;
          }
        }, 0);
      }
      return ctx
}

module.exports = shareVscodeEditor