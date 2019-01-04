const STITCH_API_BASE_URL = "https://stitch.mongodb.com/api/admin/v3.0";

import * as vscode from 'vscode';

const Client = require('node-rest-client').Client;
const client = new Client();

var authenticationPayload = null;

export function authorize() {
  var username = vscode.workspace.getConfiguration('mongodb').get("atlas.username");
  var apiKey = vscode.workspace.getConfiguration('mongodb').get("atlas.api_key");

  var args = {
    data: {
      'username': username,
      'apiKey': apiKey
    },
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    }
  };

  client.post(STITCH_API_BASE_URL + "/auth/providers/mongodb-cloud/login", args, function(data: any, response: any) {
    if (response.statusCode === 200) {
      authenticationPayload = data;
      vscode.window.showInformationMessage(data);
    } else {
      vscode.window.showErrorMessage(data.error);
    }
  });
}