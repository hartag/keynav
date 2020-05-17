"use strict"; // use strict mode


// Default settings. Initialize storage to these values.
const defaultSettings = {
  MailFolderKeyNav: true,
  MailFolderKeyNavMenuItem: true
}

async function enableKeyNavigation(enable) {
await browser.myapi.enableKeyNavigation(enable);
return enable;
}
	
var updateMenuItem = function(itemId) {
  let iid = itemId;
  return async (changes, areaName) => {
  	if (areaName!="local") {
  	  return;
    }
    await enableKeyNavigation(changes.MailFolderKeyNav.newValue);
    browser.menus.update(iid, {
      checked: changes.MailFolderKeyNav.newValue
    });
  };
}

/*
On startup, check whether we have stored settings.
If we don't, then store the default settings.
*/
async function checkSavedSettings(settings) {
  if (!settings.MailfolderKeyNav || !settings.MailFolderKeyNavMenuItem) {
    settings.MailFolderKeyNav = defaultSettings.MailFolderKeyNav;
    settings.MailFolderKeyNavMenuItem = defaultSettings.MailFolderKeyNavMenuItem;
    await browser.storage.local.set(settings);
  }
}

async function startUp() {
// Set up menu
  const settings = await browser.storage.local.get();
  await checkSavedSettings(settings); // check if the settings are saved, otherwise use defaults
  let keyNavActive = 	settings.MailFolderKeyNav;
  let showMenuItem = settings.MailFolderKeyNavMenuItem;
  let itemId = browser.menus.create({
    id: "appmenu_goMailFolderKeyNavMenuItem",
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
  await enableKeyNavigation(keyNavActive);
  return itemId;
}

//startUp().catch(function(e) {});
browser.runtime.onStartup.addListener(startUp);
