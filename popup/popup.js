/*
  This Source Code Form is subject to the terms of the Mozilla Public
  License, v. 2.0. If a copy of the MPL was not distributed with this
  file, You can obtain one at http://mozilla.org/MPL/2.0/.
*/

"use strict";


let folders = [];
let lastValue = "";
let currentSubSearch = [];
let currentSubSearchIdx = 0;
let originalSelectedFolder = null;

// Recursive function to get all folders.
function getFolders(subFolders) {
  let folders = []
  if (subFolders) {
    for (let subFolder of subFolders) {
      folders.push(subFolder)
      folders.push(...getFolders(subFolder.subFolders))
    }
  }
  return folders;
}

function updateFolderDisplay(folder) {
  let currentFolderElement = document.getElementById("currentFolder");
  let quickNav = document.getElementById("quick-nav");

  if (folder) {
    browser.mailTabs.update({ displayedFolder: folder })
    quickNav.classList.remove("invalid");
    // TODO: Make this use pretty names and let cache have the correct hierarchy with pretty names already. 
    currentFolderElement.textContent = `${folder.accountId}/${folder.path}`;
  } else {
    quickNav.classList.add("invalid");
  }
}

async function load() {
  // Build flat folder list. Maybe use a cache, which is not rebuild each time the popup is opened
  // but only if the folders changed?
  let accounts = await browser.accounts.list(true);
  for (let account of accounts) {
    folders.push(...getFolders(account.folders));
  }
  folders.sort((a, b) => a.name.localeCompare(b.name, undefined, { sensitivity: 'base' }))

  let quickNav = document.getElementById("quick-nav");
  quickNav.addEventListener("keydown", async event => {
    switch (event.key) {
      case "Tab": {
        // The tab key is used to cycle to the next folder, so make sure we do jump
        // out of the input field.
        event.preventDefault();
        event.stopPropagation();

        // If currentSubSearch is empty (no match) or only one result, ignore tab.
        if (currentSubSearch.length < 2) {
          return;
        }

        // Cycle through results, wrap back to first result if at the end.
        if (currentSubSearchIdx + 1 < currentSubSearch.length) {
          currentSubSearchIdx++;
        } else {
          currentSubSearchIdx = 0;
        }

        console.log("TAB cycle");
        updateFolderDisplay(currentSubSearch[currentSubSearchIdx]);
      }
      break;

      case "Enter": {
        window.close();
      }
      break;
    }
  });

  quickNav.addEventListener("keyup", async event => {
    let value = event.target.value;
    if (value == lastValue) {
      return;
    }
    console.log("VALUE update");
    lastValue = value;
    // TODO: Improve case insensitive handling here.
    currentSubSearch = folders.filter(f => f.name.startsWith(value));
    currentSubSearchIdx = 0;
    if (currentSubSearch.length == 0) {
      // Make the input element red, to indicate to the user: No result found.
      updateFolderDisplay(null);
    } else {
      updateFolderDisplay(currentSubSearch[currentSubSearchIdx])
    }
  });

  quickNav.focus();

  let mailTab = await browser.mailTabs.getCurrent();
  originalSelectedFolder = mailTab.displayedFolder;
}

//document.addEventListener("DOMContentLoaded", localisePage, { once: true });
document.addEventListener("DOMContentLoaded", load, { once: true });
