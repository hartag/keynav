"use strict"; // use strict mode


// Default settings. Initialize storage to these values.
var defaultOptions = {
  MailFolderKeyNav: true,
  GoMenuMailFolderKeyNavToggle: true
}

// Generic error logger.
function onError(e) {
	// Do nothing since background scripts have no console.
  //console.log(e);
}

/*
On startup, check whether we have stored settings.
If we don't, then store the default settings.
*/
function checkStoredSettings(storedSettings) {
  if (!storedSettings.MailfolderKeyNav || !storedSettings.GoMenuMailFolderKeyNavToggle) {
    browser.storage.local.set(defaultOptions);
  }
}

const gettingStoredSettings = browser.storage.local.get()
// Set up menu
.then((settings) => {
    checkStoredSettings(settings); // check if there are settings, otherwise use defaults
    let showMenuItem = settings.GoMenuMailFolderKeyNavToggle;
    let keyNavActive = settings.MailFolderKeyNav;
    let itemId = browser.menus.create({
    id: "appmenu_goMailFolderKeyNavMenuItem",
    type: "checkbox",
    contexts: ["folder_pane"],
    title: browser.i18n.getMessage("menu_EnableMailFolderKeyNav.label"),
    checked: keyNavActive,
    visible: showMenuItem,
    enabled: showMenuItem,
    onclick: function(ev) {
      browser.storage.local.set({"MailFolderKeyNav": ev.checked})
      .catch(onError);
    }
  }, onError);
  browser.storage.onChanged.addListener(updateMenuItem(itemId));
  return itemId;
})
.then((itemId) => {
})
.catch(onError);

var updateMenuItem = function(itemId) {
  let iid = itemId;
  return async (changes, areaName) => {
  	if (areaName!="local") {
  	  return;
    }
    	let [tab, ...rest] = await browser.tabs.query({ currentWindow: true, active: true });
browser.myapi.enableKeyNavigation(tab.id, changes.MailFolderKeyNav.newValue);
    browser.menus.update(iid, {checked: changes.MailFolderKeyNav.newValue,
    	visible: changes.GoMenuMailFolderKeyNavToggle.newValue});
  };
}

window.addEventListener("unload", function() {
  browser.storage.onChanged.removeListener(updateMenuItem);
});
