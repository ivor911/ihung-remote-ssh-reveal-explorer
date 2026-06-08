# ihung-remote-ssh-reveal-explorer

A VS Code / Cursor extension that opens Windows File Explorer from Remote-SSH, allowing you to reveal files and folders in the native Windows file manager with a simple right-click.

## Fork

This repository is a personal fork of [sbaillou/vscode-remote-ssh-reveal-explorer](https://github.com/sbaillou/vscode-remote-ssh-reveal-explorer), which itself is based on [doonfrs/vscode-wsl-reveal-explorer](https://github.com/doonfrs/vscode-wsl-reveal-explorer).

Licensed under the [MIT License](LICENSE). Original copyright notices are preserved.

## Changes from upstream

| Version | Change |
|---------|--------|
| **1.2.3-dirfix** | Fix right-click on a **directory** opening the parent folder instead of the directory itself. The upstream version always calls `path.dirname()`, which moves one level up for folders. |
| **1.2.4** | Improve reveal behavior for daily use: **directories** open directly inside the folder; **files** use Windows `explorer /select` to open the parent folder and highlight the file. |
| **1.2.5** | Fix POSIX path prefix stripping on Windows, validate settings before reveal, improve directory detection and explorer error handling, support Explorer focus with `Shift+Alt+R`, and add unit tests. |
| **1.2.6** | Remove `Shift+Alt+R` keybindings so VS Code / Cursor built-in `revealFileInOS` is unchanged (context menu only). Require VS Code / Cursor 1.75+. Validate `pathPrefixToStrip` before reveal, require files to exist locally, normalize `networkPath` trailing slashes, improve symlink handling and `/select` quoting, and add explorer unit tests. |

### Reveal behavior (1.2.3-1.2.6)
| Right-click target and select 'Remote-SSH Reveal in File Explorer' | Behavior |
|--------------------|----------|
| **File** | Open the containing folder and **select** the file |
| **Directory** | Open **inside** the directory |

## Features

- **Context Menu Integration** - Right-click any file or folder to reveal it in Windows Explorer
- **Reliable Path Translation** - Converts UNIX paths to Windows-compatible UNC paths or mapped drive letters

## Prerequisites

- Visual Studio Code or Cursor **1.75 or newer**, running in Remote-SSH mode
- Remote files accessible from Windows via a network share (UNC) or mapped drive (e.g. `K:`)

## Install on Local (not Remote)

This extension **must be installed on the IDE Local side** (your Windows machine running Cursor or VS Code). It cannot run on the SSH remote host.

This is by design. The extension is declared as a **UI extension** (`extensionKind: ["ui"]` in `package.json`), so it always runs locally and talks to the remote workspace over Remote-SSH.

| Install target | Works? | Why |
|----------------|--------|-----|
| **Local** (Windows Cursor / VS Code) | Yes | `explorer.exe`, `K:`, and UNC paths exist on Windows |
| **SSH remote** (Linux host) | No | Remote Linux has no Windows File Explorer or mapped drives |

`settings.json` entries for `remote-ssh-reveal-explorer.*` also belong in **Local User Settings**, for example:

`%APPDATA%\Cursor\User\settings.json`

### How it works

```
Cursor (Windows Local)                 SSH remote (Linux)
       |                                       |
       |  Right-click /home/user/foo.txt       |
       |  (remote path sent to Local ext)      |
       |                                       |
       +- extension maps to K:\foo.txt         |
       +- Local explorer.exe opens             |
```

1. You edit files over Remote-SSH in Cursor.
2. The extension receives the remote Unix path from the IDE.
3. It translates the path using `networkPath` and `pathPrefixToStrip`.
4. It launches **local** Windows File Explorer on your PC.

### Verify install location

1. Open Extensions (`Ctrl+Shift+X`).
2. In the dropdown at the top, select **Local**.
3. Install or confirm the extension is listed under **Local**, not under `SSH: ...`.

When installing from the command line, run `cursor --install-extension ...` from a **normal user** Windows command prompt on your PC, not on the remote server.

## Configuration

1. **Connect via Remote-SSH** in VS Code or Cursor.
2. Set `remote-ssh-reveal-explorer.networkPath` to your Windows path prefix, for example:
   - UNC: `\\192.168.XXX.YYY\<YOUR_USER_NAME>`
   - Mapped drive: `K:` (do not add a trailing backslash)
3. Set `remote-ssh-reveal-explorer.pathPrefixToStrip` to the remote path prefix to remove, for example: `/home/<YOUR_USER_NAME>`. It must match the start of remote paths exactly (case sensitive).
4. Optionally set `remote-ssh-reveal-explorer.showSuccessNotification` to control feedback after a successful reveal:
   - `false` (default): open File Explorer silently; errors still show an error message.
   - `true`: show an information message with the resolved local path (for example `Revealed: K:\project\file.txt`).

Example `settings.json`:

```json
{
  "remote-ssh-reveal-explorer.networkPath": "K:",
  "remote-ssh-reveal-explorer.pathPrefixToStrip": "/home/<YOUR_USER_NAME>",
  "remote-ssh-reveal-explorer.showSuccessNotification": false
}
```

Or with UNC:

```json
{
  "remote-ssh-reveal-explorer.networkPath": "\\\\192.168.XXX.YYY\\<YOUR_USER_NAME>",
  "remote-ssh-reveal-explorer.pathPrefixToStrip": "/home/<YOUR_USER_NAME>",
  "remote-ssh-reveal-explorer.showSuccessNotification": false
}
```

## Usage

1. Right-click any file or folder in the Explorer panel or editor title bar.
2. Select **Remote-SSH Reveal in File Explorer**.
3. Windows File Explorer opens with the expected location (directory inside the folder, file selected in the parent folder).

## Install from VSIX

This fork is not published on the VS Code Marketplace. Download a `.vsix` from [GitHub Releases](https://github.com/ivor911/ihung-remote-ssh-reveal-explorer/releases) and install on the **Local** IDE (see [Install on Local (not Remote)](#install-on-local-not-remote)):

```cmd
cursor --install-extension path\to\ihung-remote-ssh-reveal-explorer-1.2.6.vsix
```

Then run **Developer: Reload Window** from the Command Palette.

> Use a normal user command prompt, not an elevated (Administrator) prompt, if you rely on mapped network drives such as `K:`.

## Releasing

Tagged releases are built automatically by GitHub Actions (`.github/workflows/release.yml`).

1. Bump `version` in `package.json`.
2. Commit and push to `main`.
3. Create and push a matching tag:

```bash
git tag v1.2.6
git push origin v1.2.6
```

4. GitHub Actions will compile, package the `.vsix`, and publish a [GitHub Release](https://github.com/ivor911/ihung-remote-ssh-reveal-explorer/releases) with the file attached.

The tag must match `package.json` (for example, tag `v1.2.6` requires `"version": "1.2.6"`).

## Development

```bash
git clone https://github.com/ivor911/ihung-remote-ssh-reveal-explorer.git
cd ihung-remote-ssh-reveal-explorer
npm install
npm run compile
npm test
```

Press `F5` in VS Code / Cursor to run in the Extension Development Host.

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.

## Authors

**ivor911 / ihung** (fork maintainer)
- GitHub: [@ivor911](https://github.com/ivor911)
- Upstream: [ihung-remote-ssh-reveal-explorer](https://github.com/ivor911/ihung-remote-ssh-reveal-explorer)

**Sebastien Baillou** (upstream Remote-SSH extension)
- GitHub: [@sbaillou](https://github.com/sbaillou)
- Upstream: [vscode-remote-ssh-reveal-explorer](https://github.com/sbaillou/vscode-remote-ssh-reveal-explorer)

**Feras Abdalrahman** (original WSL Reveal in File Explorer)
- GitHub: [@doonfrs](https://github.com/doonfrs)
- Original: [vscode-wsl-reveal-explorer](https://github.com/doonfrs/vscode-wsl-reveal-explorer)
