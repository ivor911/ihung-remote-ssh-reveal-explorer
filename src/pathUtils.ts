/**
 * Normalize a path to POSIX forward slashes for remote Linux path comparison.
 */
export function normalizePosixPath(p: string): string {
  return p.replace(/\\/g, "/");
}

/**
 * Map a remote Unix path to a Windows network path prefix.
 */
export function buildNetworkPath(
  remotePath: string,
  networkPathPrefix: string,
  pathPrefixToStrip: string
): string {
  const normalizedRemote = normalizePosixPath(remotePath);
  const normalizedPrefix = normalizePosixPath(pathPrefixToStrip).replace(/\/+$/, "");

  let remainder = normalizedRemote;
  if (normalizedPrefix && normalizedRemote.startsWith(normalizedPrefix)) {
    remainder = normalizedRemote.slice(normalizedPrefix.length);
    if (remainder && !remainder.startsWith("/")) {
      remainder = `/${remainder}`;
    }
  }

  return `${networkPathPrefix}${remainder}`;
}

/**
 * Convert forward slashes to backslashes on Windows. UNC paths are preserved.
 */
export function toWindowsPath(
  localPath: string,
  platform: NodeJS.Platform = process.platform
): string {
  if (platform !== "win32") {
    return localPath;
  }
  if (localPath.startsWith("\\\\")) {
    return `\\\\${localPath.slice(2).replace(/\//g, "\\")}`;
  }
  return localPath.replace(/\//g, "\\");
}
