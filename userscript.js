// ==UserScript==
// @name         Download this article as markdown
// @namespace    http://tampermonkey.net/
// @version      0.0
// @description  Use turndown to convert this page's <article/> element (or something else) to markdown, then download it.
// @author       Peter Huang
// @match        *://*/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=github.com
// @require      https://unpkg.com/turndown/dist/turndown.js
// @grant        GM_registerMenuCommand
// @run-at       document-end
// ==/UserScript==

(async function () {
  "use strict";
  let selector = "article";
  let el = document.querySelector(selector);
  const turndownService = new TurndownService({
    headingStyle: "atx",
    hr: "---",
    bulletListMarker: "-",
    codeBlockStyle: "fenced",
    emDelimiter: "*",
  });
  function promptForSelector(event) {
    const input = prompt(
      `Current selector is "${selector}". ${
        el === null ? "No element found!" : "Element selected."
      }
Set selector to: (Enter nothing to keep current selector)`,
      selector
    );
    if (input !== null && input !== "") {
      selector = input;
      el = document.querySelector(selector);
      if (el === null) {
        alert(`No element found with "${selector}"`);
      }
    }
  }
  function convertAndDownload(event) {
    if (el === null) {
      console.error(`No element found with "${selector}"`);
      return;
    }
    const markdown = turndownService.turndown(el);
    const filename =
      document.title
        .replace(/[^a-z0-9]+/gi, "-")
        .toLowerCase()
        .replace(/^-|-$/g, "") + ".md";
    const blob = new Blob([markdown], { type: "text/markdown" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = filename;
    link.click();
    URL.revokeObjectURL(link.href);
  }
  const downloadID = GM_registerMenuCommand(
    "Download as markdown",
    convertAndDownload,
    {
      accessKey: "d",
      title: "Download the <article/> as markdown",
    }
  );
  const promptID = GM_registerMenuCommand("Set selector", promptForSelector, {
    accessKey: "s",
    title: "Set the selector to find the <article/>",
  });
})();
