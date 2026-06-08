import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { mkdtemp, mkdir, writeFile, rm } from "fs/promises";
import { tmpdir } from "os";
import { join } from "path";
import {
  buildSelectArg,
  verifyTargetExists,
} from "../out/explorer.js";

describe("buildSelectArg", () => {
  it("uses unquoted form for simple paths", () => {
    assert.equal(buildSelectArg("K:\\project\\file.txt"), "/select,K:\\project\\file.txt");
  });

  it("quotes paths with spaces", () => {
    assert.equal(
      buildSelectArg("K:\\my project\\file.txt"),
      '/select,"K:\\my project\\file.txt"'
    );
  });

  it("escapes embedded double quotes", () => {
    assert.equal(
      buildSelectArg('K:\\project\\file "draft".txt'),
      '/select,"K:\\project\\file ""draft"".txt"'
    );
  });
});

describe("verifyTargetExists", () => {
  it("passes when the file exists", async () => {
    const root = await mkdtemp(join(tmpdir(), "reveal-explorer-"));
    try {
      const filePath = join(root, "file.txt");
      await writeFile(filePath, "ok");
      await verifyTargetExists(filePath, false);
    } finally {
      await rm(root, { recursive: true, force: true });
    }
  });

  it("throws when the file is missing", async () => {
    const root = await mkdtemp(join(tmpdir(), "reveal-explorer-"));
    try {
      const filePath = join(root, "missing.txt");
      await assert.rejects(
        () => verifyTargetExists(filePath, false),
        /File does not exist or is not accessible/
      );
    } finally {
      await rm(root, { recursive: true, force: true });
    }
  });

  it("throws when only the parent directory exists for a file", async () => {
    const root = await mkdtemp(join(tmpdir(), "reveal-explorer-"));
    try {
      const filePath = join(root, "missing.txt");
      await assert.rejects(
        () => verifyTargetExists(filePath, false),
        /File does not exist or is not accessible/
      );
    } finally {
      await rm(root, { recursive: true, force: true });
    }
  });

  it("passes when the directory exists", async () => {
    const root = await mkdtemp(join(tmpdir(), "reveal-explorer-"));
    try {
      const dirPath = join(root, "subdir");
      await mkdir(dirPath);
      await verifyTargetExists(dirPath, true);
    } finally {
      await rm(root, { recursive: true, force: true });
    }
  });

  it("throws when the directory is missing", async () => {
    const root = await mkdtemp(join(tmpdir(), "reveal-explorer-"));
    try {
      const dirPath = join(root, "missing-dir");
      await assert.rejects(
        () => verifyTargetExists(dirPath, true),
        /Directory does not exist or is not accessible/
      );
    } finally {
      await rm(root, { recursive: true, force: true });
    }
  });
});
