import * as vscode from 'vscode';
import { StitchRestClient } from './stitch_rest_client';

export class StitchTreeData implements vscode.TreeDataProvider<Dependency> {

	private _onDidChangeTreeData: vscode.EventEmitter<Dependency | undefined> = new vscode.EventEmitter<Dependency | undefined>();
	readonly onDidChangeTreeData: vscode.Event<Dependency | undefined> = this._onDidChangeTreeData.event;

	constructor(private functionList: StitchFunction[], private _client: StitchRestClient) {
	}

	refresh(): void {
		this._onDidChangeTreeData.fire();
	}

	getTreeItem(element: Dependency): vscode.TreeItem {
		return element;
	}

	getChildren(element?: Dependency): Thenable<Dependency[]> {
		if (!this.functionList) {
			vscode.window.showInformationMessage('No Stitch Functions Defined');
			return Promise.resolve([]);
		}

		return Promise.resolve(this.functionsToTree(this.functionList));
	}

	private functionsToTree(functionList: StitchFunction[]): Dependency[] {
		const toDep = (fn: StitchFunction): Dependency => {
					return new Dependency(fn.name, fn._id, vscode.TreeItemCollapsibleState.None, {
						command: 'mongodb.stitch.openFunction',
						title: '',
						arguments: [this._client, fn._id]
					});
			};

			return functionList.map(dep => toDep(dep));
	}
}

export class StitchFunction {
	constructor(
		public readonly _id: string,
		public readonly name: string,
	) { }
}

export class Dependency extends vscode.TreeItem {

	constructor(
		public readonly label: string,
		public readonly _id: string,
		public readonly collapsibleState: vscode.TreeItemCollapsibleState,
		public readonly command?: vscode.Command
	) {
		super(label, collapsibleState);
	}

	get tooltip(): string {
		return `${this.label}`;
	}

	get description(): string {
		return `${this._id}`;
	}

	contextValue = 'dependency';
}