import { access } from "fs/promises";
import { spawn } from "child_process";

async function pathIsAccessible(targetPath: string): Promise<boolean> {
  try {
    await access(targetPath);
    return true;
  } catch {
    return false;
  }
}

/**
 * Verify the target exists on the local Windows filesystem before launching explorer.
 */
export async function verifyTargetExists(
  winPath: string,
  isDirectory: boolean
): Promise<void> {
  if (await pathIsAccessible(winPath)) {
    return;
  }

  if (isDirectory) {
    throw new Error(`Directory does not exist or is not accessible: ${winPath}`);
  }

  throw new Error(`File does not exist or is not accessible: ${winPath}`);
}

/**
 * Build the explorer.exe /select argument for a Windows path.
 */
export function buildSelectArg(winPath: string): string {
  const needsQuotes = /[\s"]/.test(winPath);
  if (!needsQuotes) {
    return `/select,${winPath}`;
  }

  const escaped = winPath.replace(/"/g, '""');
  return `/select,"${escaped}"`;
}

function spawnExplorer(args: string[]): Promise<void> {
  return new Promise((resolve, reject) => {
    const child = spawn("explorer.exe", args, { shell: false });
    child.on("error", reject);
    child.on("spawn", () => resolve());
    child.on("exit", (code) => {
      if (code !== null && code !== 0) {
        console.warn(`explorer.exe exited with code ${code} for args:`, args);
      }
    });
  });
}

export async function openInWindowsExplorer(winPath: string): Promise<void> {
  await spawnExplorer([winPath]);
}

export async function selectInWindowsExplorer(winPath: string): Promise<void> {
  await spawnExplorer([buildSelectArg(winPath)]);
}
