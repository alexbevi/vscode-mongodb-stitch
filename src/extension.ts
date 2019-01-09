// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import { DepNodeProvider } from './node_dependencies';

const window = vscode.window;
const workspace = vscode.workspace;
const settings = workspace.getConfiguration('mongodb');

import { StitchRestClient } from './stitch_rest_client';

var client : StitchRestClient;

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {

	if (settings.get("atlas.api_key") === "") {
		window
			.showErrorMessage("No MongoDB Atlas API key defined", "Generate an API Key")
			.then(function() {
				gotoUrl('https://docs.mongodb.com/stitch/admin/api/admin-v3/#generating-an-atlas-api-key');
			});
		return;
	}

	if (settings.get("atlas.project_id") == "") {
		window
			.showErrorMessage("No MongoDB Atlas Project/Group Id defined", "See Documentation")
			.then(function() {
				gotoUrl('https://docs.mongodb.com/stitch/admin/api/admin-v3/#project-application-ids');
			});
		return;
	}

	if (settings.get("atlas.username") === "") {
		window.showErrorMessage("No MongoDB Atlas username defined. This value can be found under Account Settings -> Profile -> User Name");
		return;
	}

	if (settings.get("stitch.app_id") === "") {
		window.showErrorMessage("No MongoDB Stitch Application Id defined");
		return;
	}

	client = new StitchRestClient();
	client.authorize()
		.then(response => {
				client.getFunctions(response)
					.then()
					.catch(message => {
						window.showErrorMessage(message);
					});
		})
		.catch(message => {
			window.showErrorMessage(message);
		});

	vscode.window.registerTreeDataProvider('nodeDependencies', new DepNodeProvider('/Users/alex/Workspace/vscode-mongodb-stitch'));

}

function gotoUrl(url: string)  {
	vscode.commands.executeCommand('vscode.open', vscode.Uri.parse(url));
}

// this method is called when your extension is deactivated
export function deactivate() {}
