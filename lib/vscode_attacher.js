const vscode = require('vscode');

function shareVscodeEditor(editor , ctx){ // editor not covered

    if (!ctx.provides.text) throw new Error('Cannot attach to non-text document');

    editor.suppress = false; //??????? don't know why this supress is used
    var text = ctx.get() //|| ''; // Due to a bug in share - get() returns undefined for empty docs.
    if (text.length === 0){
      ctx.insert(0, editor.document.getText()); // DONE ??? editor has to be changed with vscode editor
    } else if (text !== editor.document.getText()) { //?? getText function may change
      setText(editor,text)  /// DONE ??? no setText present in Vs code editor api has to be done manually
    }

    check(); //checking doc context realtime with 0 intervals

    ctx.onInsert = function(index , text){
         /// DONE ?????? has to be changes isDistroyed not present in Vs code Editor api
        if (editor.document.isClosed) return; // returns when editor is destroyed.
    
    //// this is an api provided by sharejs to right own logic when some changes are inserted in the contect of doc
        check();
    }

    ctx.onRemove = function (index, length) {
        if (editor.document.isClosed) return; // returns when editor is destroyed.
        check();
      };

    var disposal = vscode.workspace.onDidChangeTextDocument(onLocalChange)

    function onLocalChange(event){
        if(editor.supress) return ;
        applyToSharejs(event);
        check();
    }

    function applyToSharejs(event){
        var startPos = 0
        
    }

    function setText(editor,text){
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
}