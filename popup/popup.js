/*
  This Source Code Form is subject to the terms of the Mozilla Public
  License, v. 2.0. If a copy of the MPL was not distributed with this
  file, You can obtain one at http://mozilla.org/MPL/2.0/.
*/

"use strict";

// Define a pretty separator to demarcate the various components of a 
// complete file path. The unicode non-breaking space prevents  the  
// space following the slash from being collapsed if it is the last 
// thing in the textContent of an element.
const PRETTYSEP = " /\u00a0";

let caseInsensitiveMatch = true;
let verbosityMode = "concise";
let searchType = "start";

let folders = [];
let lastValue = "";
let currentSubSearch = [];
let currentSubSearchIdx = 0;
let folderIsSelected = false;

// Get a setting
async function getSetting(name, defaultValue) {
  let value = null;
  let settings = await messenger.storage.local.get(null);
  if (settings.hasOwnProperty(name)) {
    value = settings[name];
  } else {
    value = defaultValue;
    await messenger.storage.local.set({ name: value });
  }
  return value;
}

// Search function factory
function createFolderSearch(value, searchType="start", caseSensitive=false) {
  if (searchType==="start") {
    return folder => folder.matchName.startsWith(value);
  }
  return folder => folder.matchName.includes(value);
}

// Filter the list of folders
async function applyFilterToFolderList(event) {
  let value = event.target.value;
  if (value == lastValue) {
    return;
  }
  console.log("VALUE update");
  lastValue = value;
  let matchValue = caseInsensitiveMatch ? value.toLocaleLowerCase() : value;
  currentSubSearch = folders.filter(createFolderSearch(matchValue, searchType, caseInsensitiveMatch));
  // Display results of filtering
  currentSubSearchIdx = 0;
  if (currentSubSearch.length == 0) {
    // Make the input element red, to indicate to the user: No result found.
    updateFolderDisplay({valid: false});
  } else if (value == "" ) {
    updateFolderDisplay({valid: true});
  } else {
    updateFolderDisplay({valid: true, folder: currentSubSearch[currentSubSearchIdx]})
  }
}

// Recursive function to get all folders.
function getFolders(subFolders, prettyPath) {
  let folders = [];
  if (subFolders) {
    for (let subFolder of subFolders) {
      let subFolderPrettyPath = `${prettyPath}${PRETTYSEP}${subFolder.name}`;
      folders.push({
        mailFolder: subFolder,
        matchName: caseInsensitiveMatch ? subFolder.name.toLocaleLowerCase() : subFolder.name,
        prettyPath: subFolderPrettyPath,
      });
      folders.push(...getFolders(subFolder.subFolders, subFolderPrettyPath));
    }
  }
  return folders;
}

// Function for determining how much two strings match from  their starts.
function commonStringLength(str1, str2) {
  if (caseInsensitiveMatch) {
    str1 = str1.toLocaleLowerCase();
	str2 = str2.toLocaleLowerCase();
  }
  let idx = 0;
  while (idx<str1.length && idx<str2.length && str1[idx]===str2[idx]) {
    idx++;
  }
  return idx;
}

function populateCurrentFolder(folder) {
  let quietEl = document.getElementById("quiet");
  let announceEl = document.getElementById("announce");
  let commonLength = 0;
  switch (verbosityMode) {
    case "folder":
      commonLength = folder.lastIndexOf(PRETTYSEP);
      if (commonLength==-1) {
        commonLength = 0;
      } else {
      commonLength += PRETTYSEP.length;
      }
      break;
    case "whole":
      break;
    case "concise":
    default:
      let oldFolder = `${quietEl.textContent}${announceEl.textContent}`;
      commonLength = commonStringLength(folder, oldFolder);
      commonLength = folder.slice(0, commonLength).lastIndexOf(PRETTYSEP);
      if (commonLength==-1) {
        commonLength = 0;
      } else {
      commonLength += PRETTYSEP.length;
      }
      break;
  }
  quietEl.textContent = folder.slice(0, commonLength);
  announceEl.textContent = folder.slice(commonLength, folder.length);
}

function clearCurrentFolder() {
  document.getElementById("quiet").textContent = "";
  document.getElementById("announce").textContent = "";
}

function updateFolderDisplay(config) {
  //let currentFolderElement = document.getElementById("currentFolder");
  let quickNavElement = document.getElementById("quick-nav");
  let idxElement = document.getElementById("idx");

  if (config.valid) {
    quickNavElement.classList.remove("invalid");
  } else {
    quickNavElement.classList.add("invalid");
  }

  if (config.folder) {
    folderIsSelected = true;
    // The following line is commented to defer actual folder display until ENTER is pressed.
    //messenger.mailTabs.update({ displayedFolder: config.folder.mailFolder });
    //currentFolderElement.textContent = config.folder.prettyPath;
    idxElement.textContent = `${currentSubSearchIdx+1}/${currentSubSearch.length}`;
    populateCurrentFolder(config.folder.prettyPath);
  } else {
    folderIsSelected = false;
    idxElement.textContent = `0/${folders.length}`;
    clearCurrentFolder();
  }
}

function jumpToFolder() {
  if (folderIsSelected) {
    messenger.mailTabs.update({ displayedFolder: currentSubSearch[currentSubSearchIdx].mailFolder });
  }
  window.close();
}

async function jumpToFolderInNewTab() {
  if (folderIsSelected) {
    await messenger.mailTabs.create({ displayedFolder: currentSubSearch[currentSubSearchIdx].mailFolder });
  }
  window.close();
}

async function load() {
  // Build flat folder list. Maybe use a cache, which is not rebuild each time the popup is opened
  // but only if the folders changed?
  let accounts = await messenger.accounts.list(true);
  for (let account of accounts) {
    folders.push(...getFolders(account.folders, account.name));
  }

  let quickNav = document.getElementById("search-text");
  quickNav.addEventListener("keydown", async event => {
    if (event.key==="ArrowDown" || event.key==="ArrowUp") {
      // up arrow and down arrow keys are  used to cycle to the next or previous folder, so 
      // make sure we do jump out of the input field.
      event.preventDefault();
      event.stopPropagation();

      // If currentSubSearch is empty (no match) or only one result, ignore the keypress.
      // Also ignore the keypress if there is no entered text.
      let value = event.target.value;
      if (currentSubSearch.length < 2 || value == "") {
        clearCurrentFolder();
        return;
      }

      if (event.key==="ArrowDown") {
        // Cycle forward through results, wrap back to first result if at the end.
        if (currentSubSearchIdx + 1 < currentSubSearch.length) {
          currentSubSearchIdx++;
        } else {
          currentSubSearchIdx = 0;
        }
        console.log("ArrowDown cycle");
      }

      if (event.key=== "ArrowUp") {
        // Cycle bacwards through results, wrap back to last result if at the start .
        if (currentSubSearchIdx > 0) {
          currentSubSearchIdx--;
        } else {
          currentSubSearchIdx = currentSubSearch.length-1;
        }
        console.log("ArrowUp cycle");
      }

      updateFolderDisplay({valid: true, folder: currentSubSearch[currentSubSearchIdx]});
    }

    if (event.key==="Enter" && !event.ctrlKey) {
      jumpToFolder();
    }

    if (event.key==="Enter" && event.ctrlKey) {
      jumpToFolderInNewTab();
    }
  });

  quickNav.addEventListener("keyup", applyFilterToFolderList);

  // Add event listeners to buttons
  let goButton = document.getElementById("btnGo");
  goButton.addEventListener("click", event => {jumpToFolder();});
  let cancelButton = document.getElementById("btnCancel");
  cancelButton.addEventListener("click", event => {window.close();});
  let goNewButton = document.getElementById("btnGoNew");
  // Test for messenger.mailTabs.create. If it exists,
  if (messenger.mailTabs.hasOwnProperty("create")) {
    // Add an event  listener to  the "Go to new tab" button to respond to clicks.
    goNewButton.addEventListener("click", event => {jumpToFolderInNewTab();});
  } else {
    // Otherwise, do not display the "Go to new tab" button.
    goNewButton.style.display = "none";
  }

// Set verbosityMode
  verbosityMode = await getSetting("verbosityMode", "concise");
  let verbosityElement = document.getElementById("verbosity");
  verbosityElement.value = verbosityMode;
  verbosityElement.addEventListener("change", async (event) => {
    verbosityMode = event.target.value;
    await messenger.storage.local.set({ "verbosityMode": verbosityMode });
  });

// Set searchType
  searchType = await getSetting("searchType", "start");
  let SearchTypeElement = document.getElementById("search-type");
  SearchTypeElement.value = searchType;
  SearchTypeElement.addEventListener("change", async (event) => {
    searchType = event.target.value;
    await messenger.storage.local.set({ "searchType": searchType });
    lastValue = "";
    await applyFilterToFolderList({ "target": quickNav.value });
  });
 
// Set focus on input field and fill initial match values
  quickNav.focus();
  let idxElement = document.getElementById("idx");
  idxElement.textContent = `0/${folders.length}`;
}

document.addEventListener("DOMContentLoaded", localisePage, { once: true });
document.addEventListener("DOMContentLoaded", load, { once: true });
