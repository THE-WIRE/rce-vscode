const vscode = require('vscode');
const btoa = require("btoa");
const EventHandler = require('./event_handler');
const VscodeShare = require('./lib/vscode_share');
const WebSocket = require("ws");
const NewSessionView = require('./new-session-view');
const SessionView = require('./session-view');
const RemoteCursorView = require("./remote-cursor-view");

const config = {
    version: require('./package.json').version,
    serverAddress: 'wire-pair-server.herokuapp.com',
    serverPort : 80,
    secureConnection : false,
    userEmail: '',
    syncTabs : true
}

function setDefaultValues(){
    this.address = config.serverAddress;
    this.portNumber = config.serverPort;
    this.secureConnection = config.secureConnection;
}

function createSocketConnection(){
    setDefaultValues();

    const proto = this.secureConnection ? 'wss' : 'ws';

    return new WebSocket(`${proto}://${this.address}:${this.portNumber}`);
}

function activate(context) {

    var connectDisposable = vscode.commands.registerCommand('extension.rce-connect', () => startSession());
    var disconnectDisposable = vscode.commands.registerCommand('extension.rce-disconnect', () => deactivate());

    context.subscriptions.push(connectDisposable);
    context.subscriptions.push(disconnectDisposable);
}

function startSession(){
    
    this.sessionStatus = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Left);
    this.sessionStatus.text = "$(broadcast)RCE : Enter team Key...";
    this.sessionStatus.show();
    
    vscode.window.showInputBox({ prompt: "Enter Team Key", ignoreFocusOut: true})
    .then(sessionId => {
        this.sessionStatus.text = "$(broadcast)RCE : Initiating connection...";
        sessionId == ''? vscode.window.showErrorMessage("Session Id Cannot be empty!") : connect(sessionId);
    })
}

function setupHeartbeat(){
    this.hearbeatId = setInterval(() => {
        try {
            this.ws.send('ping', error => {
                if(error != null){
                    // this.event_handler.emitter.emit('socket-not-opened');
                    this.sessionStatus.text = "$(broadcast)RCE : Disconnected";
                }
                else{
                    this.sessionStatus.text = "$(broadcast)RCE : Connected";
                }
            })
        } catch (error1){
            // this.event_handler.emitter.emit('socket-not-opened');
            this.sessionStatus.text = "$(broadcast)RCE : Disconnected";
            deactivate();
        }
    }, 30000);
}

function connect(sessionId){
    this.ws = this.ws == null ? createSocketConnection() : this.ws;

    this.ws.on("open",  () => {
        vscode.window.showInformationMessage("Session Started");
        setupHeartbeat();
        this.vscode_share = new VscodeShare(this.ws);
        this.vscode_share.start(sessionId);
        this.sessionStatus.text = "$(broadcast)RCE : Connected";

        // this.event_handler = new EventHandler(this.ws);
        // this.event_handler.listen();

        // this.event_handler.emitter.on('socket-not-opened', () => {
        //     vscode.window.showWarningMessage("RCE : Connection Lost");
        //     this.deactivate();
        // });

        //TODO : this.sessionStatusView = new SessionView;

    });

    this.ws.on('message', function(data){
        console.log(data);
    })

    this.ws.on('close', function(data){
        this.sessionStatus.text = "$(broadcast)RCE : Disconnected";
    })

    this.ws.on('error',  e => {
        console.log('error', e);
        vscode.window.showErrorMessage('RCE : Could not connect');
        deactivate();
    })
}

exports.activate = activate;

// this method is called when your extension is deactivated
function deactivate() {
    if(this.heartbeatId){
        clearInterval(this.heartbeatId);
    }
    if(this.ws != null){
        this.sessionStatus.hide();
        vscode.window.showInformationMessage('RCE : Disconnected');
        this.ws.close();
        this.ws = null;
        // if(this.event_handler != null){
        //     this.event_handler.subscriptions.dispose();
        // }
        // if(this.vscode_share != null){
        //     this.vscode_share.subscriptions.dispose();
        // }
        
    }
    else{
        vscode.window.showWarningMessage("RCE : No active sessions found");
    }
    
}

exports.deactivate = deactivate;
exports.config = config