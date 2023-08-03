/*
  This Source Code Form is subject to the terms of the Mozilla Public
  License, v. 2.0. If a copy of the MPL was not distributed with this
  file, You can obtain one at http://mozilla.org/MPL/2.0/.
*/

"use strict"; // use strict mode

messenger.commands.onCommand.addListener((command, tab) => {
  if (!tab.mailTab) {
    return;
  }
  messenger.browserAction.openPopup();
});
	
// Show a What's New dialog
messenger.runtime.onInstalled.addListener(	details => {
  //if (details.reason=="update") {
    messenger.windows.create({
      allowScriptsToClose: true,
      //focused: true,
      state: "maximized",
      type: "popup",
      url: "whatsnew/whatsnew.html"
    });
  //}
});
