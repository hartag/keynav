#Make file for generating Thunderbird extension .xpi file

INSTALLRDF=install.rdf
EXT-NAME=$(shell cat $(INSTALLRDF) |grep '<em:id>' |head -1 |sed 's/^.*<em:id>\s*\(.*\)\s*<\/em:id>.*$$/\1/')
XPI-FILE=$(EXT-NAME).xpi

all : $(XPI-FILE)

$(XPI-FILE): install.rdf chrome.manifest chrome/* defaults/*
	@echo 'Generating $(XPI-FILE) ...'
	@zip -qr keynav@andrew.hart.xpi install.rdf chrome.manifest chrome defaults -x *.bak

.PHONEY: clean
clean:
	@rm -f *.xpi
	@rm -rf *.bak
	@rm -f log.txt
