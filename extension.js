// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
var vscode = require('vscode');
var btoa = require("btoa");
var io = require('socket.io-client');
var socket = io.connect('http://localhost:3000');


socket.on('init', function(data){
    console.log("Connected to server")
})

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
function activate(context) {

    // Use the console to output diagnostic information (console.log) and errors (console.error)
    // This line of code will only be executed once when your extension is activated
    console.log('Congratulations, your extension "rce" is now active!');

    // The command has been defined in the package.json file
    // Now provide the implementation of the command with  registerCommand
    // The commandId parameter must match the command field in package.json
    var disposable = vscode.commands.registerCommand('extension.sayHello', function () {
        // The code you place here will be executed every time your command is executed

        socket.on('init', function (data) {
            console.log(data);

            vscode.window.showInputBox().then(function (username) {
                vscode.window.showInputBox().then(function (password) {
    
                    
                    socket.emit('creds', {
                        username : username,
                        password: btoa(password)
                    })
    
                    socket.on('confirm', function(data){
                        vscode.window.showInformationMessage(data.p);
                    })
                })
            })
          });
        
    });

    context.subscriptions.push(disposable);
}
exports.activate = activate;

// this method is called when your extension is deactivated
function deactivate() {
}
exports.deactivate = deactivate;