const vscode = require('vscode');
const textdiff = require('diff');

function shareVscodeEditor(editor , ctx){ // editor not covered
    this.currText = '';
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
        //console.log(index,text);
         /// DONE ?????? has to be changes isDistroyed not present in Vs code Editor api
        if (editor.document.isClosed) return; // returns when editor is destroyed.
    
    //// this is an api provided by sharejs to right own logic when some changes are inserted in the contect of doc
        // editor.edit(editBuilder => {
        //     editBuilder.insert(vscode.window.activeTextEditor.document.positionAt(index), text);
        // })
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

        let changes = textdiff.diffChars(this.currText, editor.document.getText());
        this.currText = editor.document.getText();
        
        if(changes.length > 1){
            if(event.contentChanges.length > 0){

                if(event.contentChanges[0].text.length > 0){
                    pos = vscode.window.activeTextEditor.document.offsetAt(new vscode.Position(event.contentChanges[0].range.start.line,event.contentChanges[0].range.start.character));
                    ctx.insert(pos, event.contentChanges[0].text);
                }
                else{
                    pos = vscode.window.activeTextEditor.document.offsetAt(new vscode.Position(event.contentChanges[0].range.start.line,event.contentChanges[0].range.start.character));
                    ctx.remove(pos, event.contentChanges[0].rangeLength);
                }
            }
        }
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