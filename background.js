/*
  This Source Code Form is subject to the terms of the Mozilla Public
  License, v. 2.0. If a copy of the MPL was not distributed with this
  file, You can obtain one at http://mozilla.org/MPL/2.0/.
*/

"use strict"; // use strict mode


// Default settings. Initialize storage to these values.
const defaultSettings = {
  MailFolderKeyNav: true,
  MailFolderKeyNavMenuItem: true
}


var updateMenuItem = function(itemId) {
  let iid = itemId;
  return async (changes, areaName) => {
  	if (areaName!="local") {
  	  return;
    }
    let menuProperties = {};
    if (changes.hasOwnProperty("MailFolderKeyNav")) {
  	  menuProperties.checked = changes.MailFolderKeyNav.newValue;
      await messenger.FolderUI.enableKeyNavigation(changes.MailFolderKeyNav.newValue);
    }
    if (changes.hasOwnProperty("MailFolderKeyNavMenuItem")) {
      menuProperties.enabled = changes.MailFolderKeyNavMenuItem.newValue;
      menuProperties.visible = changes.MailFolderKeyNavMenuItem.newValue;
    }
    messenger.menus.update(iid, menuProperties);
  };
}

// If there are missing settings, save their default values.
async function checkSavedSettings(settings) {
  if (!settings.hasOwnProperty("MailFolderKeyNav") ||
     !settings.hasOwnProperty("MailFolderKeyNavMenuItem")) {
    settings.MailFolderKeyNav = defaultSettings.MailFolderKeyNav;
    settings.MailFolderKeyNavMenuItem= defaultSettings.MailFolderKeyNavMenuItem;
    await messenger.storage.local.set(settings);
  }
}

 
async function setup() {
  // Get saved settings
  const settings = await messenger.storage.local.get();
  // Apply key navigation setting to mail folder tree
  await messenger.FolderUI.enableKeyNavigation(settings.MailFolderKeyNav);
  console.debug("keynav.enableKeyNavigation: called");
}

var setKeyNavOnCreate = function (tab) {
  console.debug("keynav.onCreated fired");
  if (tab.status=="complete" && tab.mailTab) {
  	console.debug("keynav.onCreated: success");
    setup();
  }
};

var setKeyNavOnActivate = function (activeInfo) {
  console.debug("keynav.onActivated fired");
  messenger.tabs.get(activeInfo.tabId)
  .then((tab) => {
    if (tab.status=="complete" && tab.mailTab) {
  	  console.debug("keynav.onActivated: success");
      setup();
    }
  });
};

var setKeyNavOnUpdate = function (tabId, changeInfo, tab) {
  console.debug("keynav.onUpdated fired");
  if (changeInfo.hasOwnProperty("status") && changeInfo.status=="complete" && 
  tab.mailTab) {
  	console.debug("keynav.onUpdated: success");
    setup();
  }
};

var setKeyNavOnInstall = function (details) {
	if (details.reason=="update") {
    messenger.windows.create({
      allowScriptsToClose: true,
      //focused: true, //not allowed in Thunderbird
      state: "maximized",
      type: "popup",
      url: "whatsnew/whatsnew.html"
    });
  }
};

messenger.runtime.onInstalled.addListener(setKeyNavOnInstall );

// init all future windows
messenger.windows.onCreated.addListener(window => {
  console.debug("keynav.windows.onCreated: fired");
  let hasMailTab = false;
  let win = messenger.windows.get(window.id, {populate: true});
  if (win.hasOwnProperty("tabs")) {
    for (let tab of win.tabs) {
      if (tab.mailTab) {
        hasMailTab = true;
        break;
      }
    }
  }
  hasMailTab = true;
  if (hasMailTab) {
	  setup();
	  console.debug("keynav.windows.onCreated: found mailTab, called setup");
  }
});


(async function() {
  // Get saved settings
  const settings = await messenger.storage.local.get();
  await checkSavedSettings(settings); // check if the settings are saved, otherwise use defaults
  // Set up menu
  let itemId = messenger.menus.create({
    id: "appmenu_MailFolderKeyNavMenuItem",
    type: "checkbox",
    contexts: ["folder_pane"],
    title: messenger.i18n.getMessage("menu_EnableMailFolderKeyNav.label"),
    checked: settings.MailFolderKeyNav,
    visible: settings.MailFolderKeyNavMenuItem,
    enabled: settings.MailFolderKeyNavMenuItem,
    onclick: async function(ev) {
      await messenger.storage.local.set({"MailFolderKeyNav": ev.checked});
    }
  });
  messenger.storage.onChanged.addListener(updateMenuItem(itemId));
  // Initialise all existing windows
  let windows = await messenger.windows.getAll({windowTypes:["normal"]});
  if (windows.length>0) {
    setup();
    console.debug("keynav.init: success");
  } else {
    console.debug("keynav.init: no windows found");
  }
})();
