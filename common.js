/*
  This Source Code Form is subject to the terms of the Mozilla Public
  License, v. 2.0. If a copy of the MPL was not distributed with this
  file, You can obtain one at http://mozilla.org/MPL/2.0/.
*/

"use strict";

// Localise page
// Search  for page elements with a data-l10n-id attribute, which holds
// an id corresponding to a localization string retrievable via
// messenger.i18n.getMessage. For each such string, do the following:
// - If it contains no "\n" char, copy it directly into the element's
//   textContent.
// - If it contains "\n\n" sequences, append each segment delimited
//   by "\n\n" to the element as the textContent of a p element.
// - Otherwise, it contains isolated "\n" chars. Append the segments
//   bounded by "\n" as text nodes to the element and the "\n" chars
//   themselves as br elements.
//
function localisePage() {
  for (let el of document.querySelectorAll("[data-l10n-id]")) {
    let id = el.getAttribute("data-l10n-id");
    let text = messenger.i18n.getMessage(id);
    if (text.includes("\n\n")) {
      appendParagraphs(el, text);
    } else {
      appendLines(el, text);
    }
  }
}

// appendLines
// if text contains no "\n"chars, copy it to   el.textContent. Otherwise,
// split up the  string in text using "\n" as the separator. Then, append
// each segment to el as a text node and insert a br element between each
// pair of text nodes.
function appendLines(el, text) {
  if (!text.includes("\n")) {
    el.textContent = text;
    return;
  }
  const lines = text.split("\n");
  let firstLine = true;
  for (let line of lines) {
    if (firstLine) {
      firstLine = false;
   } else {
     el.appendChild(document.createElement("BR"));
    }
    let tn = document.createTextNode(line);
    el.appendChild(tn);
  }
}

// appendParagraphs
// Split text up using "\n\n" as a separator. Stuff  each segment into
// a p element using appendLines and then append it to el.
function appendParagraphs(el, text) {
  let paragraphs = text.split("\n\n");
  for (let para of paragraphs) {
    let p = document.createElement("p");
    appendLines(p, para);
    el.appendChild(p);
  }
}
