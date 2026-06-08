import * as vscode from "vscode";
import { spawn } from "child_process";
import path from "path";

export function activate(context: vscode.ExtensionContext): void {
  console.log("Remote-SSH reveal Explorer extension is now active!");
  console.log("Extension context:", context.extensionPath);

  const disposable = vscode.commands.registerCommand(
    "remote-ssh-reveal-explorer.revealInExplorer",
    async (arg?: vscode.Uri) => {
      let remotePath: string | undefined;
      let targetUri: vscode.Uri | undefined;

      if (arg instanceof vscode.Uri) {
        console.log(`Right-clicked item: ${arg.fsPath}`);
        remotePath = arg.fsPath;
        targetUri = arg;
      } else {
        const editor = vscode.window.activeTextEditor;
        if (editor) {
          const doc = editor.document;
          console.log(`Shortcut on active file: ${doc.uri.fsPath}`);
          remotePath = doc.uri.fsPath;
          targetUri = doc.uri;
        } else {
          console.log("No editor is active");
          vscode.window.showWarningMessage("No file or folder selected.");
          return;
        }
      }

      console.log("Reveal in Explorer command executed with path:", remotePath);

      const localPath = toWindowsPath(networkPath(remotePath));
      console.log("Local network path:", localPath);

      let isDirectory = false;
      if (targetUri) {
        try {
          const stat = await vscode.workspace.fs.stat(targetUri);
          isDirectory = stat.type === vscode.FileType.Directory;
        } catch (error) {
          console.warn("Failed to stat target, treating as file:", error);
        }
      }

      try {
        if (isDirectory) {
          await openInWindowsExplorer(localPath);
        } else {
          await selectInWindowsExplorer(localPath);
        }
        vscode.window.showInformationMessage(`Revealed: ${localPath}`);
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        console.error("Error opening explorer:", error);
        vscode.window.showErrorMessage(`Failed to reveal: ${localPath}. Error: ${message}`);
      }
    }
  );

  const testDisposable = vscode.commands.registerCommand(
    "remote-ssh-reveal-explorer.test",
    () => {
      console.log("Test command executed");
      vscode.window.showInformationMessage("Extension is working!");
    }
  );

  context.subscriptions.push(disposable);
  context.subscriptions.push(testDisposable);
  console.log("Commands registered successfully");
}

function networkPath(remotePath: string): string {
  const { platform } = process;
  const locale = path[platform === "win32" ? "win32" : "posix"];

  const prefixToStrip = vscode.workspace
    .getConfiguration("remote-ssh-reveal-explorer")
    .get<string>("pathPrefixToStrip", "");
  const prefixToStripLocal = prefixToStrip.replace(/[\\/]/g, locale.sep);

  let remotepathWithoutPrefix = remotePath;
  if (remotePath.startsWith(prefixToStripLocal)) {
    remotepathWithoutPrefix = remotePath.slice(prefixToStripLocal.length);
  }

  const networkPathPrefix = vscode.workspace
    .getConfiguration("remote-ssh-reveal-explorer")
    .get<string>("networkPath", "");

  return `${networkPathPrefix}${remotepathWithoutPrefix}`;
}

function toWindowsPath(localPath: string): string {
  if (process.platform !== "win32") {
    return localPath;
  }
  if (localPath.startsWith("\\\\")) {
    return "\\\\" + localPath.slice(2).replace(/\//g, "\\");
  }
  return localPath.replace(/\//g, "\\");
}

function spawnExplorer(args: string[]): Promise<void> {
  return new Promise((resolve, reject) => {
    const child = spawn("explorer.exe", args, { shell: false });
    child.on("error", reject);
    child.on("exit", () => {
      // explorer.exe often returns non-zero even on success
      resolve();
    });
  });
}

function openInWindowsExplorer(winPath: string): Promise<void> {
  const arg = winPath.includes(" ") ? `"${winPath}"` : winPath;
  return spawnExplorer([arg]);
}

function selectInWindowsExplorer(winPath: string): Promise<void> {
  const selectArg = winPath.includes(" ")
    ? `/select,"${winPath}"`
    : `/select,${winPath}`;
  return spawnExplorer([selectArg]);
}

export function deactivate(): void {}
