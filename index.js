#!/usr/bin/env node

// const fs = require("fs");
// const { program } = require("commander");
// const inquirer = require("inquirer");
// const ora = require("ora");
// const { execSync } = require("child_process");
import fs from "fs";
import { program } from "commander";
import inquirer from "inquirer";
import ora from "ora";
import { execSync } from "child_process";

const hostsPath = "/private/etc/hosts"; // Path to the hosts file, may vary based on OS

function blockWebsites(urls) {
  const rules = urls.map((url) => `127.0.0.1\t${url}`);

  fs.appendFileSync(hostsPath, rules.join("\n"));
}

function unblockWebsite(url) {
  const hostsContent = fs.readFileSync(hostsPath, "utf-8");
  const entry = `127.0.0.1\t${url}`;

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

function modifyHosts(action, urls) {
  // Check if the hosts file exists
  if (!fs.existsSync(hostsPath)) {
    console.error("Hosts file not found.");
    return;
  }

  if (action === "block") {
    blockWebsites(urls);
    console.log("\nWebsites blocked successfully.");
  } else if (action === "unblock") {
    urls.forEach((url) => {
      unblockWebsite(url);
      console.log(`Website '${url}' unblocked successfully.`);
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

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function blockForDuration(duration, filePath) {
  console.log(`Blocking websites for ${duration} minutes...`);

  const spinner = ora("Blocking websites...").start();

  // Read the list of URLs from the text file
  let urls = [];
  try {
    const fileContent = fs.readFileSync(filePath, "utf-8");
    urls = fileContent.trim().split("\n");
  } catch (error) {
    console.error("Error reading the file:", error.message);
    return;
  }

  modifyHosts("block", urls);

  await sleep(duration * 60 * 1000);

  modifyHosts("unblock", urls);

  spinner.stop();
  console.log("Websites unblocked.");
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
    blockForDuration(parseInt(duration), filePath).catch((error) =>
      console.error("Error:", error.message)
    );
  });

program
  .command("block [urls...]")
  .description("Block one or more websites by name")
  .action((urls) => {
    modifyHosts("block", urls);
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
