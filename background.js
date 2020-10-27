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
      await browser.KeyNavigationAPI.enableKeyNavigation(changes.MailFolderKeyNav.newValue);
    }
    if (changes.hasOwnProperty("MailFolderKeyNavMenuItem")) {
      menuProperties.enabled = changes.MailFolderKeyNavMenuItem.newValue;
      menuProperties.visible = changes.MailFolderKeyNavMenuItem.newValue;
    }
    browser.menus.update(iid, menuProperties);
  };
}

// If there are missing settings, save their default values.
async function checkSavedSettings(settings) {
  if (!settings.hasOwnProperty("MailFolderKeyNav") ||
     !settings.hasOwnProperty("MailFolderKeyNavMenuItem")) {
    settings.MailFolderKeyNav = defaultSettings.MailFolderKeyNav;
    settings.MailFolderKeyNavMenuItem= defaultSettings.MailFolderKeyNavMenuItem;
    await browser.storage.local.set(settings);
  }
}

var contextMenuReady = false;

async function setup() {
  // Get saved settings
  const settings = await browser.storage.local.get();
  await checkSavedSettings(settings); // check if the settings are saved, otherwise use defaults
  let keyNavActive = 	settings.MailFolderKeyNav;
  // Set up menu
  if (!contextMenuReady) {
    let showMenuItem = settings.MailFolderKeyNavMenuItem;
    let itemId = browser.menus.create({
      id: "appmenu_MailFolderKeyNavMenuItem",
      type: "checkbox",
      contexts: ["folder_pane"],
      title: browser.i18n.getMessage("menu_EnableMailFolderKeyNav.label"),
      checked: keyNavActive,
      visible: showMenuItem,
      enabled: showMenuItem,
      onclick: async function(ev) {
        await browser.storage.local.set({"MailFolderKeyNav": ev.checked});
      }
    });
    browser.storage.onChanged.addListener(updateMenuItem(itemId));
    contextMenuReady = true;
  }
  await browser.KeyNavigationAPI.enableKeyNavigation(keyNavActive);
}

// init all future windows
browser.windows.onCreated.addListener(setup);

// init all existing windows
browser.windows.getAll({windowTypes:["normal"]})
  .then(windows => {
    for (let window of windows) {
      setup();
    }
  });
