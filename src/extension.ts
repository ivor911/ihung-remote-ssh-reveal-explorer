import * as vscode from "vscode";
import {
  openInWindowsExplorer,
  selectInWindowsExplorer,
  verifyTargetExists,
} from "./explorer.js";
import {
  buildNetworkPath,
  remotePathMatchesStripPrefix,
  toWindowsPath,
} from "./pathUtils.js";

interface RevealConfig {
  networkPath: string;
  pathPrefixToStrip: string;
  showSuccessNotification: boolean;
}

function getRevealConfig(): RevealConfig | undefined {
  const config = vscode.workspace.getConfiguration("remote-ssh-reveal-explorer");
  const networkPath = config.get<string>("networkPath", "").trim();
  const pathPrefixToStrip = config.get<string>("pathPrefixToStrip", "").trim();
  const showSuccessNotification = config.get<boolean>("showSuccessNotification", false);

  if (!networkPath) {
    void vscode.window.showErrorMessage(
      "remote-ssh-reveal-explorer.networkPath is not configured. Set it in Local User Settings."
    );
    return undefined;
  }

  if (!pathPrefixToStrip) {
    void vscode.window.showErrorMessage(
      "remote-ssh-reveal-explorer.pathPrefixToStrip is not configured. Set it in Local User Settings."
    );
    return undefined;
  }

  return { networkPath, pathPrefixToStrip, showSuccessNotification };
}

function parseCommandUri(
  arg?: vscode.Uri | string | { uri?: vscode.Uri | string }
): vscode.Uri | undefined {
  if (arg instanceof vscode.Uri) {
    return arg;
  }

  if (typeof arg === "string") {
    return vscode.Uri.parse(arg);
  }

  if (arg && typeof arg === "object" && "uri" in arg && arg.uri) {
    if (arg.uri instanceof vscode.Uri) {
      return arg.uri;
    }
    if (typeof arg.uri === "string") {
      return vscode.Uri.parse(arg.uri);
    }
  }

  return undefined;
}

function resolveTargetUri(
  arg?: vscode.Uri | string | { uri?: vscode.Uri | string }
): vscode.Uri | undefined {
  const fromArg = parseCommandUri(arg);
  if (fromArg) {
    return fromArg;
  }

  const editor = vscode.window.activeTextEditor;
  if (editor) {
    return editor.document.uri;
  }

  return undefined;
}

async function resolveIsDirectory(uri: vscode.Uri): Promise<boolean> {
  try {
    const stat = await vscode.workspace.fs.stat(uri);
    const isDirectory = (stat.type & vscode.FileType.Directory) !== 0;
    const isFile = (stat.type & vscode.FileType.File) !== 0;

    if (isDirectory && !isFile) {
      return true;
    }
    if (isFile && !isDirectory) {
      return false;
    }
  } catch (error) {
    console.warn("Failed to stat target, trying readDirectory fallback:", error);
  }

  try {
    await vscode.workspace.fs.readDirectory(uri);
    return true;
  } catch {
    return false;
  }
}

export function activate(context: vscode.ExtensionContext): void {
  const disposable = vscode.commands.registerCommand(
    "remote-ssh-reveal-explorer.revealInExplorer",
    async (arg?: vscode.Uri | string | { uri?: vscode.Uri | string }) => {
      if (process.platform !== "win32") {
        void vscode.window.showErrorMessage(
          "Remote-SSH Reveal in File Explorer requires a Windows local machine."
        );
        return;
      }

      if (vscode.env.remoteName !== "ssh-remote") {
        void vscode.window.showErrorMessage(
          "Remote-SSH Reveal in File Explorer requires an active Remote-SSH connection."
        );
        return;
      }

      const revealConfig = getRevealConfig();
      if (!revealConfig) {
        return;
      }

      const targetUri = resolveTargetUri(arg);
      if (!targetUri) {
        void vscode.window.showWarningMessage(
          "No file or folder selected. Right-click a file or folder in the Explorer or editor title bar."
        );
        return;
      }

      const remotePath = targetUri.fsPath;
      console.log("Reveal in Explorer command executed with path:", remotePath);

      if (!remotePathMatchesStripPrefix(remotePath, revealConfig.pathPrefixToStrip)) {
        void vscode.window.showErrorMessage(
          `Remote path "${remotePath}" does not start with pathPrefixToStrip "${revealConfig.pathPrefixToStrip}". Check Local User Settings.`
        );
        return;
      }

      const localPath = toWindowsPath(
        buildNetworkPath(
          remotePath,
          revealConfig.networkPath,
          revealConfig.pathPrefixToStrip
        )
      );
      console.log("Local network path:", localPath);

      const isDirectory = await resolveIsDirectory(targetUri);

      try {
        await verifyTargetExists(localPath, isDirectory);

        if (isDirectory) {
          await openInWindowsExplorer(localPath);
        } else {
          await selectInWindowsExplorer(localPath);
        }

        if (revealConfig.showSuccessNotification) {
          void vscode.window.showInformationMessage(`Revealed: ${localPath}`);
        }
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        console.error("Error opening explorer:", error);
        void vscode.window.showErrorMessage(
          `Failed to reveal: ${localPath}. Error: ${message}`
        );
      }
    }
  );

  context.subscriptions.push(disposable);
}

export function deactivate(): void {}
