#Make file for generating Thunderbird extension .xpi file

# This Source Code Form is subject to the terms of the Mozilla Public
# License, v. 2.0. If a copy of the MPL was not distributed with this
# file, You can obtain one at http://mozilla.org/MPL/2.0/.

MANIFEST=manifest.json
EXT-NAME=$(shell cat $(MANIFEST) |grep '"id":' |sed 's/^.*"id":\s*"\(.*\)".*$$/\1/')
EXT-VERSION=$(shell cat $(MANIFEST) |grep '"version":' |sed 's/^.*"version":\s*"\(.*\)".*$$/\1/')
XPI-FILE=$(EXT-NAME).xpi

#Extra files to include or exclude
INCLUDE-FILES=
EXCLUDE-FILES=

#Collect files for packing into the .xpi file
CONTENT-FILES=$(wildcard chrome/content/*.xul chrome/content/*.js chrome/content/*.dtd)
INTL-FILES=$(wildcard _locales/*/messages.json _locales/messages.json chrome/locale/*/*.dtd)
LOCALE-FILES=$(wildcard chrome/locale/*/*.properties chrome/locale/*/*.dtd)
DEFAULTS-FILES=defaults/preferences/*.js
ALL-FILES=$(MANIFEST) chrome.manifest $(CONTENT-FILES) $(LOCALE-FILES) $(INTL-FILES) $(DEFAULTS-FILES) $(INCLUDE-FILES)
SRC-FILES=$(filter-out $(EXCLUDE-FILES),$(ALL-FILES))

all : $(XPI-FILE)

$(XPI-FILE): $(SRC-FILES)
	@echo Generating $(XPI-FILE).
	@zip -qr $(XPI-FILE) $(SRC-FILES)
	
.PHONEY: clean version
clean:
	-@rm -f *.xpi
#	@rm -rf *.bak
	-@find . -name "*.bak" -delete
	-@rm -f log.txt

version:
	@echo $(EXT-NAME) version $(EXT-VERSION)
	