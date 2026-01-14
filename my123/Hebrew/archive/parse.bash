## cut -f 1-2 -d "," $1  > heb-words.txt
## cut -f 3 -d ","   $1    > heb-phrase-test.txt
## cut -f 3-4 -d "," $1  > heb-phrase-solution.txt
cut -f 1-2 -d "," $1 | awk -v OFS=": " '{print NR, $0}' > heb-words.txt
cut -f 3 -d ","   $1                                    > heb-phrase-test.txt
cut -f 3-4 -d "," $1 | awk -v OFS=": " '{print NR, $0}' > heb-phrase-solution.txt
