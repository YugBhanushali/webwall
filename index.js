#!/usr/bin/env node

import fs from "fs";
import { program } from "commander";
import inquirer from "inquirer";
import ora from "ora";
import { execSync } from "child_process";

const hostsPath = "/private/etc/hosts"; // Path to the hosts file, may vary based on OS

// Default hosts file content
const defaultHostsContent = `##
# Host Database
#
# localhost is used to configure the loopback interface
# when the system is booting.  Do not change this entry.
##
127.0.0.1	localhost
255.255.255.255	broadcasthost
::1             localhost
`;

function restoreDefaultHosts() {
  fs.writeFileSync(hostsPath, defaultHostsContent);
}

function removeExtraNewLines() {
  const hostsContent = fs.readFileSync(hostsPath, "utf-8");
  const cleanedContent = hostsContent.replace(/\n{2,}/g, "\n");
  fs.writeFileSync(hostsPath, cleanedContent);
}

function blockWebsites(urls) {
  const rules = urls.map((url) => `127.0.0.1\t${url}\n`);
  console.log(rules);
  removeExtraNewLines();
  fs.appendFileSync(hostsPath, rules.join("\n"));
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

  // Register signal handler for SIGINT (Ctrl + C)
  process.on("SIGINT", () => {
    console.log("\nReceived SIGINT signal. Unblocking websites...");
    modifyHosts("unblock", urls);
    process.exit();
  });

  modifyHosts("block", urls);

  await sleep(duration * 60 * 1000);

  // If the blocking process completes successfully, unregister the signal handler
  process.off("SIGINT");

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
  .command("default")
  .description("Restore hosts file to default")
  .action(() => {
    restoreDefaultHosts();
    console.log("Hosts file restored to default.");
  });

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
