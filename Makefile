all :
	@zip -r keynav@andrew.hart.xpi install.rdf chrome.manifest chrome defaults -x *.bak

.PHONEY: clean
clean:
	@rm -f *.xpi
	@rm -rf *.bak
	@rm -f log.txt
		