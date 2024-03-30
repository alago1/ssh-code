#!/usr/bin/env node

import { spawn } from "child_process";
import { Argument, Command } from "commander";
import { readFile } from "fs/promises";
import { existsSync } from "fs";
import { resolve } from "path";
import os from "os";
const { version } = JSON.parse(
  await readFile(new URL("./package.json", import.meta.url))
);

const program = new Command("ssh-code");

const resolveUserHostPath = (target) => {
  const resolvedPath = resolve(target);
  if (existsSync(resolvedPath)) {
    return {
      user: os.userInfo().username,
      host: os.hostname(),
      path: resolvedPath,
    };
  }

  const targetRegex = /^(((?<user>[^@]+)@)?(?<host>[^:]+):)?(?<path>.+)$/;
  const result = targetRegex.exec(target);

  if (!result) {
    console.error("Invalid target");
    process.exit(1);
  }

  return result.groups;
};

program
  .version(version)
  .description("A simple command for opening a ssh folder in vscode")
  .argument(
    "<target>",
    "The target folder to open in the format of [user@]host:path"
  )
  .usage("[options] [user@]host:path")
  .action((target) => {
    // Regex for the target string
    // The user is optional
    const { user, host, path } = resolveUserHostPath(target);

    // Run vscode with the ssh folder
    const connection = `${user ? user + "@" : ""}${host}`;
    const proc = spawn(
      "code",
      [`--folder-uri=vscode-remote://ssh-remote+${connection}/${path}`],
      { shell: process.platform === "win32" }
    );
  });

program.parse();
