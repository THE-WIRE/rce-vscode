const vscode = require('vscode');
const textdiff = require('diff');
//const fs = require('fs');

function shareVscodeEditor(editor , ctx){ // editor not covered
    this.currText = '';
    if (!ctx.provides.text) throw new Error('Cannot attach to non-text document');

    var suppress = false; //??????? don't know why this supress is used
    var text = ctx.get() //|| ''; // Due to a bug in share - get() returns undefined for empty docs.
    this.currText = vscode.window.activeTextEditor.document.getText();
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
        //if(editor.supress) return ;
        if(event.contentChanges.length > 0)
        {
            applyToSharejs(event);
            check();
        }
    });


    function applyToSharejs(event){
        console.log("Event occured!");

        let changes = textdiff.diffChars(this.currText, vscode.window.activeTextEditor.document.getText());
        
        
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
                this.currText = editor.document.getText();
            }
        }
    }

    function setText(editor,text){
        
        // finding total range of editor
        var firstLine = vscode.window.activeTextEditor.document.lineAt(0);
        
        //var curSelection = editor.selection;////////////////???????? there must be some problem of asynchronous in this portion

        vscode.window.activeTextEditor.edit((editBuilder)=>{
            suppress = true;
            var lastLine = vscode.window.activeTextEditor.document.lineAt(editor.document.lineCount - 1);
            var textRange = new vscode.Range(new vscode.Position(0, 0), new vscode.Position(vscode.window.activeTextEditor.document.lineCount - 1, lastLine.range.end.character));
            console.log(editBuilder);
            //var curSelection = editor.selection
            editBuilder.replace(textRange,text);
            this.currText = text;
            suppress = false;
            //return curSelection
            
        }).then(succes => {
            if(succes){
                
                // lastLine = editor.document.lineAt(editor.document.lineCount - 1);
                // var s1= new vscode.Position(editor.selection.start.line,editor.selection.start.character)
                // var s2 = new vscode.Position(editor.selection.end.line,editor.selection.end.character)
                
                // var p1 = new vscode.Position(0, 0);
                // var p2 = new vscode.Position(editor.document.lineCount - 1, lastLine.range.end.character)
                // if((s1.line == 0 ) && (s1.character == 0)){
                //     if((s2.line == p2.line)  && (s2.character == p2.character)){
                //     editor.selection = new vscode.Selection(s2,s2)
                //     }
                // }
                //editor.selection = selection
            }
        });                 
        
        // fs.writeFile(editor.document.uri.fsPath, text, function(err) {
        //     if(err) {
        //         return console.log(err);
        //     }

        //     editor.suppress = false;
        // }); 

    };
    
    function check() {
        setTimeout(function () {
            if(!suppress)
            {
                var editorText = vscode.window.activeTextEditor.document.getText();
                if(ctx.get() == undefined){
                    var otText = ''
                }
                else{
                    otText = ctx.get() || '';
                }
                if (editorText != otText) {
                    console.error("Text does not match!");
                    console.error("editor: " + editorText);
                    console.error("ot: " + otText);
                    // Replace the editor text with the ctx snapshot.
                   
                    setText(editor,otText);
                   
                }
            }    

        }, 120);
      }
      return ctx
}

module.exports = shareVscodeEditor