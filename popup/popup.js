/*
  This Source Code Form is subject to the terms of the Mozilla Public
  License, v. 2.0. If a copy of the MPL was not distributed with this
  file, You can obtain one at http://mozilla.org/MPL/2.0/.
*/

"use strict";

// Define a pretty separator to demarcate the various components of a
// complete folder path. The unicode non-breaking space prevents the
// space following the slash from being collapsed if it is the last
// thing in the textContent of an element.
const PRETTYSEP = " /\u00a0";
// Separator for constructing folder IDs
const FOLDERSEP = "\x00";

let caseInsensitiveMatch = true;
let verbosityMode = "concise";
let searchType = "start";

let hiddenFolderSet;
let allFolders = [];
let folders = [];
let hiddenFolders = [];
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

function filterFolders(folders, value, searchType="start", caseSensitive=false) {
  const searchTerms = value.split(/\s+/);
  const normalize = (token) => caseSensitive ? token : token.toLocaleLowerCase();
  return folders.filter((folder) =>
    // All search terms have to match
    searchTerms.every(searchTerm => {
      if (searchType === "start") {
        return folder.matchPath.some((token) => normalize(token).startsWith(searchTerm));
      }
      return folder.matchPath.some((token) => normalize(token).includes(searchTerm));
    })
  );
}

// Filter the list of folders according to the search criteria
async function applySearchToFolderListEvent(event) {
  let value = event.target.value;
  if (value == lastValue) {
    return;
  }
  await applySearchToFolderList(value, true);
}

async function applySearchToFolderList(value, gotoFirstMatch) {
  console.log(`Value update '${value}'`);
  lastValue = value;
  let matchValue = caseInsensitiveMatch ? value.toLocaleLowerCase() : value;
  currentSubSearch = filterFolders(folders, matchValue, searchType, caseInsensitiveMatch);
  // Display results of filtering
  if (gotoFirstMatch || currentSubSearchIdx>=currentSubSearch.length) currentSubSearchIdx = 0;
  if (currentSubSearch.length == 0) {
    // Make the input element red, to indicate to the user: No result found.
    updateFolderDisplay({valid: false});
  } else if (value == "" ) {
    updateFolderDisplay({valid: true});
  } else {
    updateFolderDisplay({valid: true, folder: currentSubSearch[currentSubSearchIdx]});
  }
}

// Recursive function to get all folders.
function getFolders(subFolders, id, path) {
  let folders = [];
  if (subFolders) {
    for (let subFolder of subFolders) {
      //let subFolderPrettyPath = `${prettyPath}${PRETTYSEP}${subFolder.name}`;
      const subFolderID = `${id}${FOLDERSEP}${subFolder.name}`;
      const matchPath = [...path, caseInsensitiveMatch ? subFolder.name.toLocaleLowerCase() : subFolder.name];
      folders.push({
        mailFolder: subFolder,
        matchPath,
        id: subFolderID
      });
      folders.push(...getFolders(subFolder.subFolders, subFolderID, matchPath));
    }
  }
  return folders;
}

// Filter allFolders array into folders and hiddenFolders based on folders
// whose IDs are contained in hiddenFolderSet.
function splitFoldersIntoSearchableAndHidden() {
  folders = [];
  hiddenFolders = [];
  for (let folder of allFolders) {
    if (hiddenFolderSet.has(folder.id)) {
      hiddenFolders.push(folder);
    } else {
      folders.push(folder);
    }
  }
}

function populateHiddenFolders() {
  let hiddenFoldersElement = document.getElementById("hidden-folders");
  // Clear the select control first
  while (hiddenFoldersElement.length) hiddenFoldersElement.remove(0);
  // Add all the hidden folders to the select element
  for (let folder of hiddenFolders) {
    let option = document.createElement("option");
    option.textContent = folder.id.replaceAll(FOLDERSEP, PRETTYSEP);
    hiddenFoldersElement.add(option);
  }
  if (hiddenFoldersElement.length==0) {
    // If the hiddenFolders combo is empty, disable the show buttons;
    document.getElementById("show-folder").disabled = true;
    document.getElementById("show-all-folders").disabled = true;
    hiddenFoldersElement.focus();
  } else {
    // otherwise, enable them
    document.getElementById("show-folder").disabled = false;
    document.getElementById("show-all-folders").disabled = false;
  }
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

function populateCurrentFolder(folderID) {
  let quietEl = document.getElementById("quiet");
  let folder = folderID.replaceAll(FOLDERSEP, PRETTYSEP);
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
  let searchTextElement = document.getElementById("search-text");
  let idxElement = document.getElementById("idx");

  if (config.valid) {
    searchTextElement.classList.remove("invalid");
  } else {
    searchTextElement.classList.add("invalid");
  }

  if (config.folder) {
    folderIsSelected = true;
    // The following line is commented to defer actual folder display until ENTER is pressed.
    //messenger.mailTabs.update({ displayedFolder: config.folder.mailFolder });
    //currentFolderElement.textContent = config.folder.prettyPath;
    idxElement.textContent = `${currentSubSearchIdx+1}/${currentSubSearch.length}`;
    populateCurrentFolder(config.folder.id);
  } else {
    folderIsSelected = false;
    idxElement.textContent = `0/${folders.length}`;
    clearCurrentFolder();
  }
}

async function hideFolderEvent(event) {
  if (!folderIsSelected) {
    return;
  }
  let id = currentSubSearch[currentSubSearchIdx].id;
  hiddenFolderSet.add(id);
  await messenger.storage.local.set({ "hiddenFolders": Array.from(hiddenFolderSet) });
  splitFoldersIntoSearchableAndHidden();
  let searchText = document.getElementById("search-text");
  await applySearchToFolderList(searchText.value, false);
  document.getElementById("show-folder").disabled = false;
  document.getElementById("show-all-folders").disabled = false;
  populateHiddenFolders();
}

async function showFolderEvent(event) {
  let hiddenFoldersElement = document.getElementById("hidden-folders")
  let id = hiddenFoldersElement[hiddenFoldersElement.selectedIndex].value.replaceAll(PRETTYSEP, FOLDERSEP);
  hiddenFolderSet.delete(id);
  // Remember the position in the select element
  let idx = hiddenFoldersElement.selectedIndex
  hiddenFoldersElement.remove(hiddenFoldersElement.selectedIndex);
  if (idx>=hiddenFoldersElement.length) {
    idx -= 1; // decrease idx so it's not past the end of the select options
  }
  await messenger.storage.local.set({ "hiddenFolders": Array.from(hiddenFolderSet) });
  splitFoldersIntoSearchableAndHidden();
  let searchText = document.getElementById("search-text");
  await applySearchToFolderList(searchText.value, false);
  if (hiddenFoldersElement.length) {
    // Select the appropriate option
    hiddenFoldersElement.selectedIndex = idx
  } else {
    // Since the hidden-folders element is empty, disable the show buttons
    // and move focus to the search box
    document.getElementById("show-folder").disabled = true;
    document.getElementById("show-all-folders").disabled = true;
    document.getElementById("search-text").focus();
  }
}

async function showAllFoldersEvent() {
  hiddenFolderSet.clear();
  let hiddenFoldersElement = document.getElementById("hidden-folders");
  while (hiddenFoldersElement.length) hiddenFoldersElement.remove(0);
  await messenger.storage.local.set({ "hiddenFolders": Array.from(hiddenFolderSet) });
  splitFoldersIntoSearchableAndHidden();
  let searchText = document.getElementById("search-text");
  await applySearchToFolderList(searchText.value, false);
  populateHiddenFolders();
  // Move focus to search box since the hidden-folders element is now empty
  document.getElementById("search-text").focus();
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
  // Build flat folder list.
  let accounts = await messenger.accounts.list(true);
  allFolders = [];
  for (let account of accounts) {
    allFolders.push(...getFolders(account.folders, account.name, [account.name]));
  }
  //folders = allFolders;

  let searchText = document.getElementById("search-text");
  searchText.addEventListener("keydown", async event => {
    if (
      event.key === "ArrowDown" || event.key === "ArrowUp" ||
      (event.ctrlKey && (event.key === "n" || event.key === "p"))
    ) {
      // keys are used to cycle to the next or previous folder, so make sure we do jump out of the input field.
      event.preventDefault();
      event.stopPropagation();

      // If currentSubSearch is empty (no match) or only one result, ignore the keypress.
      // Also ignore the keypress if there is no entered text.
      let value = event.target.value;
      if (currentSubSearch.length < 2 || value == "") {
        clearCurrentFolder();
        return;
      }

      if (event.key === "ArrowDown" || (event.ctrlKey && event.key === "n")) {
        // Cycle forward through results, wrap back to first result if at the end.
        if (currentSubSearchIdx + 1 < currentSubSearch.length) {
          currentSubSearchIdx++;
        } else {
          currentSubSearchIdx = 0;
        }
        console.log("ArrowDown cycle");
      }

      if (event.key === "ArrowUp" || (event.ctrlKey && event.key === "p")) {
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

    if (event.ctrlKey && event.key==="Delete") {
      await hideFolderEvent();
    }
  });

  searchText.addEventListener("keyup", applySearchToFolderListEvent);

  // Add event listeners to buttons
  let goButton = document.getElementById("btnGo");
  goButton.addEventListener("click", jumpToFolder);
  let cancelButton = document.getElementById("btnCancel");
  cancelButton.addEventListener("click", event => {window.close();});
  let goNewButton = document.getElementById("btnGoNew");
  // Test for messenger.mailTabs.create. If it exists,
  if (messenger.mailTabs.hasOwnProperty("create")) {
    // Add an event  listener to  the "Go to new tab" button to respond to clicks.
    goNewButton.addEventListener("click", jumpToFolderInNewTab);
  } else {
    // Otherwise, do not display the "Go to new tab" button.
    goNewButton.style.display = "none";
  }

// Add keydown event to hiddenFoldersElement
  document.getElementById("hidden-folders")
  .addEventListener("keydown", async event => {
    if (event.key==="Delete" && event.target.selectedIndex>=0) {
      event.preventDefault();
    event.stopPropagation();
      await showFolderEvent();
    }
    if (event.ctrlKey && event.key==="Delete") {
      event.stopPropagation();
      event.preventDefault();
      await showAllFoldersEvent();
    }
  });

// Add event listeners to the hide-folder, show-folder and show-all-folders buttons
  document.getElementById("hide-folder").addEventListener("click", hideFolderEvent);
  document.getElementById("show-folder").addEventListener("click", showFolderEvent);
  document.getElementById("show-all-folders").addEventListener("click", showAllFoldersEvent);

// Retrieve the list of hidden folders from local storage and split the
// folder list into searchable and hidden
  hiddenFolderSet = new Set(await getSetting("hiddenFolders", []));
  splitFoldersIntoSearchableAndHidden();
  populateHiddenFolders();

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
    let searchText = document.getElementById("search-text");
    await applySearchToFolderList(searchText.value);
  });

// Set focus on input field and fill initial match values
  searchText.focus();
  let idxElement = document.getElementById("idx");
  idxElement.textContent = `0/${folders.length}`;
}

document.addEventListener("DOMContentLoaded", localisePage, { once: true });
document.addEventListener("DOMContentLoaded", load, { once: true });
