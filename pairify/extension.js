const vscode = require('vscode');

let hoverDecoration;
let statusBarItem;
let currentDecorations = [];

function activate(context) {
    // Create decoration type for the hover widget
    hoverDecoration = vscode.window.createTextEditorDecorationType({
        after: {
            contentText: "🔧 Wrap with {}",
            color: new vscode.ThemeColor('editorLightBulb.foreground'),
            margin: '0 0 0 10px'
        }
    });

    // Create status bar item
    statusBarItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Right, 100);
    statusBarItem.text = "$(symbol-bracket) Wrap Selection";
    statusBarItem.command = 'pairify.wrapInBrackets';
    statusBarItem.tooltip = "Wrap selected text with curly brackets";

    // Register the wrap command
    const disposable = vscode.commands.registerCommand('pairify.wrapInBrackets', () => {
        const editor = vscode.window.activeTextEditor;
        if (editor) {
            const selection = editor.selection;
            const text = editor.document.getText(selection);
            editor.edit(editBuilder => {
                editBuilder.replace(selection, `{${text}}`);
            });
        }
    });

    // Track mouse clicks using document links
    const clickDisposable = vscode.languages.registerDocumentLinkProvider('*', {
        provideDocumentLinks(document) {
            return currentDecorations.map(decoration => {
                const link = new vscode.DocumentLink(decoration.range);
                link.tooltip = "Wrap with brackets";
                return link;
            });
        },
        resolveDocumentLink(link) {
            vscode.commands.executeCommand('pairify.wrapInBrackets');
            return link;
        }
    });

    // Update decorations when selection changes
    vscode.window.onDidChangeTextEditorSelection(updateDecorations);
    vscode.window.onDidChangeActiveTextEditor(updateDecorations);

    context.subscriptions.push(
        disposable,
        clickDisposable,
        hoverDecoration,
        statusBarItem
    );
}

function updateDecorations() {
    const editor = vscode.window.activeTextEditor;
    if (!editor) return;

    const selection = editor.selection;
    const hasSelection = !selection.isEmpty;

    // Clear existing decorations
    editor.setDecorations(hoverDecoration, []);
    currentDecorations = [];

    // Show decoration if text is selected
    if (hasSelection) {
        const decoration = { range: selection };
        editor.setDecorations(hoverDecoration, [decoration]);
        currentDecorations = [decoration];
        statusBarItem.show();
    } else {
        statusBarItem.hide();
    }
}

function deactivate() {
    if (hoverDecoration) hoverDecoration.dispose();
    if (statusBarItem) statusBarItem.dispose();
    currentDecorations = [];
}

module.exports = { activate, deactivate };