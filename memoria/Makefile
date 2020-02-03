all: compile middle_clean
compile: 
	pdflatex -synctex=1 -interaction=nonstopmode main.tex
middle_clean:
	rm -f main.aux main.log main.synctex.gz main.toc main.fdb_latexmk chapters/referencias.aux main.fls
clean: middle_clean
	rm -f main.pdf
