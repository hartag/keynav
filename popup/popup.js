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

let folders = [];
let lastValue = "";
let currentSubSearch = [];
let currentSubSearchIdx = 0;
let folderIsSelected = false;

// Recursive function to get all folders.
function getFolders(subFolders, prettyPath) {
  let folders = [];
  if (subFolders) {
    for (let subFolder of subFolders) {
      let subFolderPrettyPath = `${prettyPath}${PRETTYSEP}${subFolder.name}`;
      folders.push({
        mailFolder: subFolder,
        matchName: caseInsensitiveMatch ? subFolder.name.toLowerCase() : subFolder.name,
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
    str1 = str1.toLowerCase();
	str2 = str2.toLowerCase();
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
  let oldFolder = `${quietEl.textContent}${announceEl.textContent}`;
  let commonLength = commonStringLength(folder, oldFolder);
  commonLength = folder.slice(0, commonLength).lastIndexOf(PRETTYSEP);
  if (commonLength==-1) {
    commonLength = 0;
  } else {
    commonLength += PRETTYSEP.length;
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

async function load() {
  // Build flat folder list. Maybe use a cache, which is not rebuild each time the popup is opened
  // but only if the folders changed?
  let accounts = await messenger.accounts.list(true);
  for (let account of accounts) {
    folders.push(...getFolders(account.folders, account.name));
  }
  // TODO: Is sorting the cache needed? It may cause jumping back and forth when looping through folders/accounts.
  // folders.sort((a, b) => a.matchName.localeCompare(b.matchName))

  let quickNav = document.getElementById("quick-nav");
  quickNav.addEventListener("keydown", async event => {
    if (event.key == "ArrowDown" || event.key == "ArrowUp") {
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

      if (event.key == "ArrowDown") {
        // Cycle forward through results, wrap back to first result if at the end.
        if (currentSubSearchIdx + 1 < currentSubSearch.length) {
          currentSubSearchIdx++;
        } else {
          currentSubSearchIdx = 0;
        }
        console.log("ArrowDown cycle");
      }

      if (event.key == "ArrowUp") {
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

    if (event.key == "Enter") {
      if (folderIsSelected) {
        messenger.mailTabs.update({ displayedFolder: currentSubSearch[currentSubSearchIdx].mailFolder });
      }
      window.close();
    }
  });

  quickNav.addEventListener("keyup", async event => {
    let value = event.target.value;
    if (value == lastValue) {
      return;
    }
    console.log("VALUE update");
    lastValue = value;
    
    let matchValue = caseInsensitiveMatch ? value.toLowerCase() : value;
    currentSubSearch = folders.filter(f => f.matchName.startsWith(matchValue));
    
    currentSubSearchIdx = 0;
    if (currentSubSearch.length == 0) {
      // Make the input element red, to indicate to the user: No result found.
      updateFolderDisplay({valid: false});
    } else if (value == "" ) {
      updateFolderDisplay({valid: true});
    } else {
      updateFolderDisplay({valid: true, folder: currentSubSearch[currentSubSearchIdx]})
    }
  });

  // Set focus on input field and fill initial match values
  quickNav.focus();
  let idxElement = document.getElementById("idx");
  idxElement.textContent = `0/${folders.length}`;
}

document.addEventListener("DOMContentLoaded", localisePage, { once: true });
document.addEventListener("DOMContentLoaded", load, { once: true });
