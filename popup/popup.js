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
  browser.mailTabs.update({displayedFolder: folder})

  let currentFolderElement = document.getElementById("currentFolder");
  // TODO: Make this use pretty names and let cache have the correct hierarchy with pretty names already. 
  currentFolderElement.textContent = `${folder.accountId}/${folder.path}`;
}

async function load() {
  // Build flat folder list. Maybe use a cache, which is not rebuild each time the popup is opened
  // but only if the folders changed?
  let accounts = await browser.accounts.list(true);
  for (let account of accounts) {
    folders.push(...getFolders(account.folders));
  }
  folders.sort((a,b) => a.name.localeCompare(b.name, undefined, {sensitivity: 'base'}))

  let quickNav = document.getElementById("quick-nav");
  quickNav.addEventListener("keydown", async event => {
    // The tab key is used to cycle to the next folder, so make sure we do jump
    // out of the input field.
    if (event.key == "Tab" && currentSubSearch.length > 1) {
      event.preventDefault();
      event.stopPropagation();
      currentSubSearchIdx++;
      if (currentSubSearchIdx == currentSubSearch.length) {
        currentSubSearchIdx = 0;
      } 
      console.log("TAB cycle");
      updateFolderDisplay(currentSubSearch[currentSubSearchIdx]);
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
    let newSubSearch = folders.filter(f => f.name.startsWith(value));
    if (newSubSearch.length == 0) {
      // TODO: Make the input element red, to indicate to the user, no result found.
      return;
    }
    currentSubSearch = newSubSearch;
    currentSubSearchIdx = 0;
    updateFolderDisplay(currentSubSearch[currentSubSearchIdx])
  });
  quickNav.focus();
}

document.addEventListener("DOMContentLoaded", localisePage, {once: true});
document.addEventListener("DOMContentLoaded", load, {once: true});
