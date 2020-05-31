// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
const vscode = require('vscode');

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed

/**
 * @param {vscode.ExtensionContext} context
 */
function activate(context) {

	console.log('Congratulations, your extension "first-ext" is now active!');

	//#region AutoSave

	vscode.commands.executeCommand('extension.autoSave');

	// If window focus is changes => save
	let listener = (e) =>{
		if(e.focused == false){
			vscode.workspace.saveAll();
		}
	}

	let autoSaveCommand = vscode.commands.registerCommand('extension.autoSave', () => {
		let change = vscode.window.onDidChangeWindowState(listener);
		return change;
	});

	context.subscriptions.push(autoSaveCommand);

	//#endregion

	//#region Header

    let headerCommand = vscode.commands.registerCommand("extension.addJsFileHeader", function() {
        // The code you place here will be executed every time your command is executed
        var config = vscode.workspace.getConfiguration("jsFileHeader");
        console.log(config);

        var editor = vscode.window.activeTextEditor;
        if (!editor) {
            vscode.window.showErrorMessage("No open files, please open a file to add header!");
            return;
        }

        editor.edit(function(editBuilder) {
            try {
                editBuilder.insert(new vscode.Position(0, 0), compileFileHeader(config));
            } catch (error) {
                console.error(error);
            }
        });
	});
	
	var compileFileHeader = function(config) {
        var line = "/**\n";

        if (config.Copyright) {
            var copyright = config.Copyright.replace(/\n/g, "\n * ");
            line += " * Copyright: {copyright}\n".replace("{copyright}", copyright);
            line += " *\n";
        }

        if (config.License) {
            var license = config.License.replace(/\n/g, "\n * ");
            line += ` * License: ${license}\n`;
            line += " *\n";
        }

        line += " * long description for the file\n";
        line += " *\n";
        line += " * @summary short description for the file\n";
        line += ` * @author ${config.Author}\n`;
        line += " *\n";
		line += ` * Created at     : ${new Date().toString()} \n`;
		line += ` * Last modified  : ${new Date().toString()} \n`;
        line += " */\n\n";
        return line;
	};
	
	var fileHeaderFormatter = function() {
        setTimeout(function() {
            console.log("Invoke fileHeaderFormatter");
            try {
                var editor = vscode.editor || vscode.window.activeTextEditor;
                var document = editor.document;
                var lastModifiedRange = null;
                var lastModifiedText = null;
                var lineCount = document.lineCount;
                var found = false;
                var diff = 0;
                for (var i = 0; i < lineCount; i++) {
                    var linetAt = document.lineAt(i);
                    var line = linetAt.text;
                    line = line.trim();
                    if (line.indexOf("Last modified  :") > -1) {
                        var time = line
                            .replace("Last modified  : ", "")
                            .replace("*", "")
                            .replace(" ", "");
                        var oldTime = new Date(time);
                        var curTime = new Date();
                        diff = (curTime - oldTime) / 1000;
                        lastModifiedRange = linetAt.range;
                        lastModifiedText = ` * Last modified  : ${new Date().toString()}`;
                        found = true;
                    }
                    if (found) {
                        break;
                    }
                }
                if (found && diff > 15 && lastModifiedRange != null) {
                    console.log("Replace last modified time");
                    setTimeout(function() {
                        editor.edit(function(edit) {
                            edit.replace(lastModifiedRange, lastModifiedText);
                        });
                        document.save();
                    }, 200);
                }
            } catch (error) {
                console.error(error);
            }
        }, 200);
	};
	
	context.subscriptions.push(headerCommand);
    context.subscriptions.push(compileFileHeader);

    // Listen to file changes and run formatter
	vscode.workspace.onDidSaveTextDocument(fileHeaderFormatter);
	
	//#endregion
}
exports.activate = activate;

// this method is called when your extension is deactivated
function deactivate() {}

module.exports = {
	activate,
	deactivate
}
