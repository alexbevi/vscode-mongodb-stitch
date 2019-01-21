// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import { StitchTreeData } from './stitch_tree_data';

const window = vscode.window;
const workspace = vscode.workspace;
const settings = workspace.getConfiguration('mongodb');

import { StitchRestClient } from './stitch_rest_client';
import * as path from 'path';

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

	if (settings.get("atlas.project_id") === "") {
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
				client.getFunctions()
					.then(functions => {
						vscode.window.registerTreeDataProvider('stitchTreeData', new StitchTreeData(functions, client));
					})
					.catch(message => {
						window.showErrorMessage(message);
					});
		})
		.catch(message => {
			window.showErrorMessage(message);
		});

		vscode.commands.registerCommand('mongodb.stitch.openFunction', handleFileOpenFromStitch);

}

// FIXME: files being temporarily created under /tmp
// FIXME: no save handler
// FIXME: edit.insert doesn't clear the file first so keeps appending content
function handleFileOpenFromStitch(client: StitchRestClient, functionId: string) {
	client.getFunction(functionId).then(func => {
		const newFile = vscode.Uri.parse('untitled:' + path.join("/tmp", func.name + ".js"));
		vscode.workspace.openTextDocument(newFile).then(async document => {
			const edit = new vscode.WorkspaceEdit();
			edit.insert(newFile, new vscode.Position(0, 0), func.source);
			const success = await vscode.workspace.applyEdit(edit);
			if (success) {
				vscode.window.showTextDocument(document);
			} else {
				vscode.window.showInformationMessage('Error!');
			}
		});
	});
}

function gotoUrl(url: string)  {
	vscode.commands.executeCommand('vscode.open', vscode.Uri.parse(url));
}

// this method is called when your extension is deactivated
export function deactivate() {}
