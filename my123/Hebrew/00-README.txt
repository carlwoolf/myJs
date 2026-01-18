Latest csv in sheet-form, at https://docs.google.com/spreadsheets/d/1WSW147ickCoUujw-ETp43baSbPxpDEt6O9qk2cAc4pY/edit?gid=2013393131#gid=2013393131

Save as csv, eg foo.csv and then: source generateJs foo.csv

sort -R                             will randomize line order
split -l 30 <input.csv> foo_        will make 30-line pieces with filename prefix foo_

eg:
    sort -R rebWords-24nov.csv > t.csv
    split -l 30 t.csv o30_

and then, eg:
    (18 jan '26) source generateJs o30_aa o30_ab rebWords-24nov.csv    ## aa for test, aa+ab for study, rebWords-24nov.csv for full-study

