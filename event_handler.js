const { EventEmitter } = require('events');
const { Range, Position } = require('vscode');
const vscode = require('vscode');
const RemoteCursorView = require('./remote-cursor-view');
const fs = require('fs');
const config = require('./extension').config;

class EventHandler {
    constructor(remoteClient) {
        this.remoteClient = remoteClient;
        this.emitter = new EventEmitter;
        this.project = vscode.project;
        this.workspace = vscode.workspace;
        this.localChange = false;
        this.userEmail = config.userEmail;
        this.lastCursorChange = new Date().getTime();
        this.remoteAction = false;
        if(process.platform === "win32") {
            this.separator = '\\';
        } else {
            this.separator = '/';
        }
        this.syncTabsEvents = ['open', 'close'];
    }
}