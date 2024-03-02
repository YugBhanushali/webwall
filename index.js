#!/usr/bin/env node

import fs from "fs";
import { program } from "commander";
import inquirer from "inquirer";
import { execSync } from "child_process";
import { Presets, SingleBar } from "cli-progress";
import colours from "ansi-colors";
import os from "os";

const hostsPath = getHostsPath();
function getHostsPath() {
  switch (os.platform()) {
    case "darwin":
      return "/private/etc/hosts";
    case "linux":
      return "/etc/hosts";
    case "win32":
      return "C:\\Windows\\System32\\drivers\\etc\\hosts";
    default:
      console.error("Unsupported platform");
      process.exit(1);
  }
}

function removeExtraNewLines() {
  const hostsContent = fs.readFileSync(hostsPath, "utf-8");
  const cleanedContent = hostsContent.replace(/\n{2,}/g, "\n");
  fs.writeFileSync(hostsPath, cleanedContent);
}

function getDuration(duration) {
  const durationStr = String(duration);
  const durationMatch = durationStr.match(/^(\d+)([mh])?$/i);
  const value = parseInt(durationMatch[1]);
  const unit = durationMatch[2] ? durationMatch[2].toLowerCase() : "m";

  if (!durationMatch) {
    console.error(
      "Invalid duration format. Please use format like '2m' for 2 minutes or '3h' for 3 hours."
    );
    return;
  }

  let durationInMs;

  if (unit === "m") {
    durationInMs = value * 60 * 1000;
  } else if (unit === "h") {
    durationInMs = value * 60 * 60 * 1000;
  }

  if (!durationInMs || durationInMs <= 0) {
    console.error(
      "Invalid duration. Please provide a valid positive duration."
    );
    return;
  }

  if (durationInMs >= 0) {
    return {
      duration: durationInMs,
      type: unit === "m" ? "minutes" : "hours",
      originalTime: parseInt(durationMatch[1]),
    };
  }
}

function blockWebsites(urls) {
  const existingUrls = getBlockedUrls();
  const newUrls = urls.filter((url) => !existingUrls.includes(url));

  if (newUrls.length === 0) {
    return;
  }

  const rules = newUrls.map((url) => `127.0.0.1\t${url}\n`);
  removeExtraNewLines();
  fs.appendFileSync(hostsPath, rules.join(""));
}

function unblockWebsite(url) {
  const hostsContent = fs.readFileSync(hostsPath, "utf-8");
  const entry = `127.0.0.1\t${url}\n`;

  const updatedContent = hostsContent.replace(entry, "");

  fs.writeFileSync(hostsPath, updatedContent);
}

function getBlockedUrls() {
  const hostsContent = fs.readFileSync(hostsPath, "utf-8");
  const regex = /127\.0\.0\.1\t(.+)/g;
  const blockedUrls = [];
  let match;

  while ((match = regex.exec(hostsContent)) !== null) {
    blockedUrls.push(match[1]);
  }

  return blockedUrls;
}

function blockWebsiteWithouDuration(action, urls) {
  urls.map((url) => {
    console.log(`Website ${url} blocked`);
  });
  modifyHosts(action, urls);
}

function modifyHosts(action, urls) {
  // Check if the hosts file exists
  if (!fs.existsSync(hostsPath)) {
    console.error("Hosts file not found.");
    return;
  }

  if (action === "block") {
    blockWebsites(urls);
    console.log("Websites blocked successfully.");
  } else if (action === "unblock") {
    urls.forEach((url) => {
      unblockWebsite(url);
    });
  }

  // Clear DNS cache
  try {
    execSync("sudo killall -HUP mDNSResponder");
    // console.log("DNS cache cleared.");
  } catch (error) {
    console.error("Error clearing DNS cache:", error.message);
  }
}

async function listAndUnblockBlockedUrls() {
  const blockedUrls = getBlockedUrls();

  blockedUrls.map((url) => {
    console.log(`Website '${url}' unblocked successfully.\n`);
  });

  if (blockedUrls.length === 0) {
    console.log("No websites are currently blocked.");
    return;
  }

  const { urlsToUnblock } = await inquirer.prompt([
    {
      type: "checkbox",
      name: "urlsToUnblock",
      message: "Select the websites to unblock:",
      choices: blockedUrls,
    },
  ]);

  modifyHosts("unblock", urlsToUnblock);
}

async function blockForDuration(duration, filePath) {
  const durationType = getDuration(duration);
  console.log(
    `Blocking websites for ${durationType.originalTime} ${durationType.type}`
  );

  const progressBar = new SingleBar(
    {
      format:
        "Remaining time [" +
        colours.cyan("{bar}") +
        "] Progress: {value}/{total}",
      barCompleteChar: "#",
      barIncompleteChar: ".",
      hideCursor: true,
    },
    Presets.shades_grey
  );

  console.log(
    "\nYou can access your blocket website after the below progress gets complete"
  );
  progressBar.start(100, 0);

  let urls = [];
  try {
    const fileContent = fs.readFileSync(filePath, "utf-8");
    urls = fileContent.trim().split("\n");
  } catch (error) {
    console.error("Error reading the file:", error.message);
    return;
  }

  blockWebsites(urls);

  const interval = Math.floor(durationType.duration / 100);
  let progress = 0;

  const progressTimer = setInterval(() => {
    progress++;
    progressBar.update(progress);
  }, interval);

  // When user terminate program using ctrl+c
  process.on("SIGINT", () => {
    clearInterval(progressTimer);
    progressBar.stop();
    modifyHosts("unblock", urls);
    console.log(
      "Program has been terminated. Blocked websites have been unblocked."
    );
    process.exit();
  });

  setTimeout(() => {
    clearInterval(progressTimer);
    progressBar.stop();
    modifyHosts("unblock", urls);
    console.log("Websites unblocked.");
  }, durationType.duration);
}

program
  .version("1.0.0")
  .description(
    "CLI tool to block and unblock websites by modifying the hosts file"
  );

program
  .arguments("<duration> <filePath>")
  .description(
    "Block websites for a specified duration using URLs from a text file"
  )
  .action((duration, filePath) => {
    blockForDuration(duration, filePath).catch((error) =>
      console.error("Error:", error.message)
    );
  });

program
  .command("block [urls...]")
  .description("Block one or more websites by name")
  .action((urls) => {
    blockWebsiteWithouDuration("block", urls);
  });

program
  .command("unblock")
  .description("List currently blocked websites and allow selection to unblock")
  .action(() => {
    listAndUnblockBlockedUrls().catch((error) =>
      console.error("Error:", error.message)
    );
  });

program.parse(process.argv);
