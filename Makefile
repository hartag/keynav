#Make file for generating Thunderbird extension .xpi file

# This Source Code Form is subject to the terms of the Mozilla Public
# License, v. 2.0. If a copy of the MPL was not distributed with this
# file, You can obtain one at http://mozilla.org/MPL/2.0/.

INSTALLRDF=install.rdf
EXT-NAME=$(shell cat $(INSTALLRDF) |grep '<em:id>' |head -1 |sed 's/^.*<em:id>\s*\(.*\)\s*<\/em:id>.*$$/\1/')
XPI-FILE=$(EXT-NAME).xpi

#Extra files to include or exclude
INCLUDE-FILES=
EXCLUDE-FILES=

#Collect files for packing into the .xpi file
CONTENT-FILES=$(wildcard chrome/content/*.xul chrome/content/*.js chrome/content/*.dtd)
LOCALE-FILES=$(wildcard chrome/locale/*/*.properties chrome/locale/*/*.dtd)
DEFAULTS-FILES=defaults/preferences/*.js
ALL-FILES=$(INSTALLRDF) chrome.manifest $(CONTENT-FILES) $(LOCALE-FILES) $(DEFAULTS-FILES) $(INCLUDE-FILES)
SRC-FILES=$(filter-out $(EXCLUDE-FILES),$(ALL-FILES))

all : $(XPI-FILE)

$(XPI-FILE): $(SRC-FILES)
	@echo Generating $(XPI-FILE).
	@zip -qr $(XPI-FILE) $(SRC-FILES)
	
.PHONEY: clean
clean:
	@rm -f *.xpi
#	@rm -rf *.bak
	@find . -name "*.bak" -delete
	@rm -f log.txt
