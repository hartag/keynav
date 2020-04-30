/*
Store the currently selected settings using browser.storage.local.
*/
function storeSettings() {
  browser.storage.local.set({
      MailFolderKeyNav: MailFolderKeyNavInput.checked,
      GoMenuMailFolderKeyNavToggle: GoMenuMailFolderKeyNavToggleInput.checked
  });
}

/*
Update the options UI with the settings values retrieved from storage,
or the default settings if the stored settings are empty.
*/
function updateUI(restoredSettings) {
  MailFolderKeyNavInput.checked = restoredSettings.MailFolderKeyNav;
  GoMenuMailFolderKeyNavToggleInput.checked = restoredSettings.GoMenuMailFolderKeyNavToggle;
}

function onError(e) {
  console.error(e);
}


function translateLanguageStrings() {
  var objects = document.getElementsByTagName("html");
  for(var i = 0; i < objects.length; i++) {
    var strVal = objects[i].innerHTML.toString();
    var newVal = strVal.replace(/__MSG_(\S+)__/g, function(match, group1) {
      return group1 ? browser.i18n.getMessage(group1) : "";
    });
    if (newVal != strVal) {
      objects[i].innerHTML = newVal;
    }
  } // for
}

// Translate language-specific text in the page
translateLanguageStrings();
 

const MailFolderKeyNavInput = document.querySelector("#MailFolderKeyNav");
const GoMenuMailFolderKeyNavToggleInput = document.querySelector("#GoMenuMailFolderKeyNavToggle");

/*
On opening the options page, fetch stored settings and update the UI with them.
*/
const gettingStoredSettings = browser.storage.local.get();
gettingStoredSettings.then(updateUI, onError);

function updateUIOnSettingChange(changes, areaName) {
  if (areaName!="local") {
	  return;
  }
  if (changes.MailFolderKeyNav.newValue) {
    MailFolderKeyNavInput.checked = changes.MailFolderKeyNav.newValue;
  }
  if (changes.GoMenuMailFolderKeyNavToggle.newValue) {
    GoMenuMailFolderKeyNavToggleInput.checked = changes.GoMenuMailFolderKeyNavToggle.newValue;
  }
}

/*
On change, save the currently selected settings.
*/
MailFolderKeyNavInput.addEventListener("change", storeSettings);
GoMenuMailFolderKeyNavToggleInput.addEventListener("change", storeSettings);
browser.storage.onChange.addListener(updateUIOnSettingChange);

window.addEventListener("unload", function(ev) {
  browser.storage.onChanged.removeListener(updateUIOnSettingChange);
});
