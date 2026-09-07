const vscode = require("vscode");
const { spawn } = require("child_process");

function activate(context) {
    const output = vscode.window.createOutputChannel("Lambda Discipline");

    const runCurrentFile = vscode.commands.registerCommand(
        "lbd.runCurrentFile",
        () => {
            const editor = vscode.window.activeTextEditor;

            if (!editor) {
                vscode.window.showErrorMessage("No active editor.");
                return;
            }

            if (editor.document.languageId !== "lbd") {
                vscode.window.showErrorMessage(
                    "The current file is not a Lambda Discipline file."
                );
                return;
            }

            const file = editor.document.fileName;

            output.clear();
            output.show(true);

            const process = spawn("lbd", ["run", file], {
                cwd: vscode.workspace.getWorkspaceFolder(
                    editor.document.uri
                )?.uri.fsPath
            });

            process.stdout.on("data", data => {
                output.append(data.toString());
            });

            process.stderr.on("data", data => {
                output.append(data.toString());
            });

            process.on("error", error => {
                if (error.code === "ENOENT") {
                    vscode.window.showErrorMessage(
                        "Lambda Discipline interpreter 'lbd' was not found. " +
                        "Make sure lbd is installed and available on PATH."
                    );

                    output.appendLine(
                        "Error: Lambda Discipline interpreter 'lbd' was not found."
                    );

                    return;
                }

                output.appendLine(`Error: ${error.message}`);
            });

            process.on("close", code => {
                output.appendLine("");
                output.appendLine(`Process exited with code ${code}.`);
            });
        }
    );

    context.subscriptions.push(runCurrentFile, output);
}

function deactivate() { }

module.exports = {
    activate,
    deactivate
};