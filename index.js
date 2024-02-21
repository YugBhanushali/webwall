#!/usr/bin/env node

// const fs = require("fs");
// const { program } = require("commander");
// // const ora = require("ora");
// const { execSync } = require("child_process");
import fs from "fs";
import { program } from "commander";
import ora from "ora";
import { execSync } from "child_process";

const hostsPath = "/etc/hosts"; // Path to the hosts file, may vary based on OS

function blockWebsites(urls) {
  const rules = urls.map((url) => `127.0.0.1\t${url}`);

  fs.appendFileSync(hostsPath, rules.join("\n"));
}

function unblockWebsites(urls) {
  const hostsContent = fs.readFileSync(hostsPath, "utf-8");
  const updatedContent = urls.reduce((acc, url) => {
    const entry = `127.0.0.1\t${url}`;
    return acc.replace(entry, "");
  }, hostsContent);

  fs.writeFileSync(hostsPath, updatedContent);
}

function modifyHosts(action, filePath) {
  // Check if the hosts file exists
  if (!fs.existsSync(hostsPath)) {
    console.error("Hosts file not found.");
    return;
  }

  // Read the list of URLs from the text file
  let urls = [];
  try {
    const fileContent = fs.readFileSync(filePath, "utf-8");
    urls = fileContent.trim().split("\n");
  } catch (error) {
    console.error("Error reading the file:", error.message);
    return;
  }

  if (action === "block") {
    blockWebsites(urls);
    console.log("Websites blocked successfully.");
  } else if (action === "unblock") {
    unblockWebsites(urls);
    console.log("Websites unblocked successfully.");
  }

  // Clear DNS cache
  try {
    execSync("sudo killall -HUP mDNSResponder");
    console.log("DNS cache cleared.");
  } catch (error) {
    console.error("Error clearing DNS cache:", error.message);
  }
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function blockForDuration(duration, filePath) {
  console.log(`Blocking websites for ${duration} minutes...`);

  const spinner = ora("Blocking websites...").start();

  modifyHosts("block", filePath);

  await sleep(duration * 60 * 1000);

  modifyHosts("unblock", filePath);

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

program.parse(process.argv);
