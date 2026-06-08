import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  buildNetworkPath,
  normalizePosixPath,
  toWindowsPath,
} from "../out/pathUtils.js";

describe("normalizePosixPath", () => {
  it("converts backslashes to forward slashes", () => {
    assert.equal(normalizePosixPath("\\home\\user\\foo"), "/home/user/foo");
  });
});

describe("buildNetworkPath", () => {
  it("strips POSIX prefix from POSIX remote path", () => {
    const result = buildNetworkPath(
      "/home/user/project/file.txt",
      "K:",
      "/home/user"
    );
    assert.equal(result, "K:/project/file.txt");
  });

  it("strips prefix when remote path uses backslashes", () => {
    const result = buildNetworkPath(
      "\\home\\user\\project\\file.txt",
      "K:",
      "/home/user"
    );
    assert.equal(result, "K:/project/file.txt");
  });

  it("leaves path unchanged when prefix does not match", () => {
    const result = buildNetworkPath(
      "/home/user/file.txt",
      "K:",
      "/other/prefix"
    );
    assert.equal(result, "K:/home/user/file.txt");
  });

  it("handles UNC network prefix", () => {
    const result = buildNetworkPath(
      "/home/user/docs/readme.md",
      "\\\\host\\share",
      "/home/user"
    );
    assert.equal(result, "\\\\host\\share/docs/readme.md");
  });

  it("handles prefix without trailing slash", () => {
    const result = buildNetworkPath(
      "/home/user",
      "K:",
      "/home/user"
    );
    assert.equal(result, "K:");
  });
});

describe("toWindowsPath", () => {
  it("converts forward slashes on win32", () => {
    assert.equal(
      toWindowsPath("K:/project/file.txt", "win32"),
      "K:\\project\\file.txt"
    );
  });

  it("preserves UNC and normalizes separators", () => {
    assert.equal(
      toWindowsPath("\\\\host\\share/docs/file.txt", "win32"),
      "\\\\host\\share\\docs\\file.txt"
    );
  });

  it("returns path unchanged on non-windows platforms", () => {
    assert.equal(
      toWindowsPath("K:/project/file.txt", "linux"),
      "K:/project/file.txt"
    );
  });
});
