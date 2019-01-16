import * as vscode from 'vscode';
import * as path from 'path';

export class StitchTreeData implements vscode.TreeDataProvider<Dependency> {

	private _onDidChangeTreeData: vscode.EventEmitter<Dependency | undefined> = new vscode.EventEmitter<Dependency | undefined>();
	readonly onDidChangeTreeData: vscode.Event<Dependency | undefined> = this._onDidChangeTreeData.event;

	constructor(private functionList: StitchFunction[]) {
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
		// if (element) {
		// 	return Promise.resolve(this.getDepsInPackageJson(path.join(this.workspaceRoot, 'node_modules', element.label, 'package.json')));
		// } else {
		// 	const packageJsonPath = path.join(this.workspaceRoot, 'package.json');
		// 	if (this.pathExists(packageJsonPath)) {
		// 		return Promise.resolve(this.getDepsInPackageJson(packageJsonPath));
		// 	} else {
		// 		vscode.window.showInformationMessage('Workspace has no package.json');
		// 		return Promise.resolve([]);
		// 	}
		// }

	}

	private functionsToTree(functionList: StitchFunction[]): Dependency[] {
		const toDep = (fn: StitchFunction): Dependency => {
					return new Dependency(fn.name, fn._id, vscode.TreeItemCollapsibleState.None, {
						command: 'extension.openPackageOnNpm',
						title: '',
						arguments: [fn._id]
					});
			};

			return functionList.map(dep => toDep(dep));
	}

	// /**
	//  * Given the path to package.json, read all its dependencies and devDependencies.
	//  */
	// private getDepsInPackageJson(packageJsonPath: string): Dependency[] {
	// 	if (this.pathExists(packageJsonPath)) {
	// 		const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf-8'));

	// 		const toDep = (moduleName: string, version: string): Dependency => {
	// 			if (this.pathExists(path.join(this.workspaceRoot, 'node_modules', moduleName))) {
	// 				return new Dependency(moduleName, version, vscode.TreeItemCollapsibleState.Collapsed);
	// 			} else {
	// 				return new Dependency(moduleName, version, vscode.TreeItemCollapsibleState.None, {
	// 					command: 'extension.openPackageOnNpm',
	// 					title: '',
	// 					arguments: [moduleName]
	// 				});
	// 			}
	// 		};

	// 		const deps = packageJson.dependencies
	// 			? Object.keys(packageJson.dependencies).map(dep => toDep(dep, packageJson.dependencies[dep]))
	// 			: [];
	// 		const devDeps = packageJson.devDependencies
	// 			? Object.keys(packageJson.devDependencies).map(dep => toDep(dep, packageJson.devDependencies[dep]))
	// 			: [];
	// 		return deps.concat(devDeps);
	// 	} else {
	// 		return [];
	// 	}
	// }

	// private pathExists(p: string): boolean {
	// 	try {
	// 		fs.accessSync(p);
	// 	} catch (err) {
	// 		return false;
	// 	}

	// 	return true;
	// }
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

	iconPath = {
		light: path.join(__filename, '..', '..', 'resources', 'light', 'dependency.svg'),
		dark: path.join(__filename, '..', '..', 'resources', 'dark', 'dependency.svg')
	};

	contextValue = 'dependency';
}