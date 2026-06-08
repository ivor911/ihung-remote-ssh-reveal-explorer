import { access } from "fs/promises";
import path from "path";
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

  if (!isDirectory) {
    const parent = path.dirname(winPath);
    if (await pathIsAccessible(parent)) {
      return;
    }
  }

  throw new Error(`Path does not exist or is not accessible: ${winPath}`);
}

function spawnExplorer(args: string[]): Promise<void> {
  return new Promise((resolve, reject) => {
    const child = spawn("explorer.exe", args, { shell: false });
    child.on("error", reject);
    child.on("spawn", () => resolve());
  });
}

export async function openInWindowsExplorer(winPath: string): Promise<void> {
  await spawnExplorer([winPath]);
}

export async function selectInWindowsExplorer(winPath: string): Promise<void> {
  const selectArg = winPath.includes(" ")
    ? `/select,"${winPath}"`
    : `/select,${winPath}`;
  await spawnExplorer([selectArg]);
}
