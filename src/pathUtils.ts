/**
 * Normalize a path to POSIX forward slashes for remote Linux path comparison.
 */
export function normalizePosixPath(p: string): string {
  return p.replace(/\\/g, "/");
}

/**
 * Return true when the remote path starts with the configured strip prefix.
 */
export function remotePathMatchesStripPrefix(
  remotePath: string,
  pathPrefixToStrip: string
): boolean {
  const normalizedRemote = normalizePosixPath(remotePath);
  const normalizedPrefix = normalizePosixPath(pathPrefixToStrip).replace(/\/+$/, "");
  if (!normalizedPrefix) {
    return true;
  }
  return normalizedRemote.startsWith(normalizedPrefix);
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
  const trimmedNetwork = networkPathPrefix.replace(/[\\/]+$/, "");

  let remainder = normalizedRemote;
  if (normalizedPrefix && normalizedRemote.startsWith(normalizedPrefix)) {
    remainder = normalizedRemote.slice(normalizedPrefix.length);
    if (remainder && !remainder.startsWith("/")) {
      remainder = `/${remainder}`;
    }
  }

  if (!remainder) {
    return trimmedNetwork;
  }

  const suffix = remainder.startsWith("/") ? remainder : `/${remainder}`;
  return `${trimmedNetwork}${suffix}`;
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
