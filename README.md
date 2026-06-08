# ihung-remote-ssh-reveal-explorer

A VS Code / Cursor extension that opens Windows File Explorer from Remote-SSH, allowing you to reveal files and folders in the native Windows file manager with a simple right-click or keyboard shortcut.

## Fork

This repository is a personal fork of [sbaillou/vscode-remote-ssh-reveal-explorer](https://github.com/sbaillou/vscode-remote-ssh-reveal-explorer), which itself is based on [doonfrs/vscode-wsl-reveal-explorer](https://github.com/doonfrs/vscode-wsl-reveal-explorer).

Licensed under the [MIT License](LICENSE). Original copyright notices are preserved.

## Changes from upstream

| Version | Change |
|---------|--------|
| **1.2.3-dirfix** | Fix right-click on a **directory** opening the parent folder instead of the directory itself. The upstream version always calls `path.dirname()`, which moves one level up for folders. |
| **1.2.4** | Improve reveal behavior for daily use: **directories** open directly inside the folder; **files** use Windows `explorer /select` to open the parent folder and highlight the file. |

### Reveal behavior (1.2.4)

| Right-click target | Behavior |
|--------------------|----------|
| **File** | Open the containing folder and **select** the file |
| **Directory** | Open **inside** the directory |

## Features

- **Context Menu Integration** - Right-click any file or folder to reveal it in Windows Explorer
- **Keyboard Shortcut** - Default keybinding `Shift+Alt+R` to reveal the currently open file in Windows Explorer
- **Reliable Path Translation** - Converts UNIX paths to Windows-compatible UNC paths or mapped drive letters

## Prerequisites

- Visual Studio Code or Cursor running in Remote-SSH mode
- Remote files accessible from Windows via a network share (UNC) or mapped drive (e.g. `K:`)

## Configuration

1. **Connect via Remote-SSH** in VS Code or Cursor.
2. Set `remote-ssh-reveal-explorer.networkPath` to your Windows path prefix, for example:
   - UNC: `\\192.168.222.250\ihung`
   - Mapped drive: `K:`
3. Set `remote-ssh-reveal-explorer.pathPrefixToStrip` to the remote path prefix to remove, for example: `/home/ihung`

Example `settings.json`:

```json
{
  "remote-ssh-reveal-explorer.networkPath": "K:",
  "remote-ssh-reveal-explorer.pathPrefixToStrip": "/home/ihung"
}
```

Or with UNC:

```json
{
  "remote-ssh-reveal-explorer.networkPath": "\\\\192.168.222.250\\ihung",
  "remote-ssh-reveal-explorer.pathPrefixToStrip": "/home/ihung"
}
```

## Usage

**1. Context Menu (Right-Click):**

1. Right-click any file or folder in the Explorer panel or editor title bar.
2. Select **Remote-SSH Reveal in File Explorer**.
3. Windows File Explorer opens with the expected location.

**2. Keyboard Shortcut:**

1. Press `Shift+Alt+R` when a file is open in the editor.
2. Windows File Explorer opens and selects that file.

## Install from VSIX

This fork is not published on the VS Code Marketplace. Build or download a `.vsix` and install locally:

```cmd
cursor --install-extension path\to\ihung-remote-ssh-reveal-explorer-1.2.4.vsix
```

Then run **Developer: Reload Window** from the Command Palette.

> Use a normal user command prompt, not an elevated (Administrator) prompt, if you rely on mapped network drives such as `K:`.

## Development

```bash
git clone https://github.com/ivor911/ihung-remote-ssh-reveal-explorer.git
cd ihung-remote-ssh-reveal-explorer
npm install
npm run compile
```

Press `F5` in VS Code / Cursor to run in the Extension Development Host.

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.

## Authors

**ivor911 / ihung** (fork maintainer)

**Sebastien Baillou** (upstream Remote-SSH extension)
- GitHub: [@sbaillou](https://github.com/sbaillou)
- Upstream: [vscode-remote-ssh-reveal-explorer](https://github.com/sbaillou/vscode-remote-ssh-reveal-explorer)

**Feras Abdalrahman** (original WSL Reveal in File Explorer)
- GitHub: [@doonfrs](https://github.com/doonfrs)
- Original: [vscode-wsl-reveal-explorer](https://github.com/doonfrs/vscode-wsl-reveal-explorer)
