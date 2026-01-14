
// "some like ihot"...

// last few are width-less space, s/hin-dot and sof-pasuk
let hebrewConsonantsRegSt = "[\u05D0-\u05EA\u200B\u05C1\u05C2׃]";
let englishRegSt = "[\u0020-\u007E]";

let splitRegexSt = `(${hebrewConsonantsRegSt}+)`;
let splitRegex = new RegExp(splitRegexSt, "g");

async function loadIhotCsv() {
    let lines;
    await loadDataFileAsText(`IHOT/verses.csv`,
        function() {showProgress(true, `Loading IHOT csv`);},
        function() {showProgress(false, `Done loading IHOT csv`);},
        function (text) {
            lines = text.split('\n');
        });
    lines.shift(); // first line is headers
    lines = lines.map(l => l.replace(/<S>\d+<.S>/g, " "));
    lines = lines.map(l => l.replace(/['"]/g, ""));
    lines = lines.map(l => l.replace(/^"?(\d+),(\d+),(\d+).*?([\u05D0-\u05EA].*)/, "--$1--.$2.$3 $4"));
    lines = lines.map(l => l.replace(/--(\d+)--/, function(m, p1) {return ihot[Number(p1)];}));

    return lines;
}
async function spreadHotness(initialCount) {
    let numBooksSeen = 0;

    let lines = await loadIhotCsv();
    let currentBook = "";
    let bookContent = "";
    let bookVerses = [];

    for (let i=0; i<lines.length; i++) {
        let line = lines[i];
        let tokens = line.split(splitRegex);
        let osisID = tokens[0];
        let [book, chapter, verse] = unpackOsisId(osisID);

        //if ( book != "Prov") continue;

        if (book != currentBook) {
            if (numBooksSeen >= initialCount && bookVerses.length > 0) {
                bookContent = bookVerses.join('\n');
                download(bookContent, `ihot-${currentBook}.txt`);
            }
            numBooksSeen++;
            currentBook = book;
            bookVerses = [];
        }
        bookVerses.push(line);
    }
    if (numBooksSeen >= initialCount && bookVerses.length > 0) {
        bookContent = bookVerses.join('\n');
        download(bookContent, `ihot-${currentBook}.txt`);
    }

}
function ingestIhotBook(lines, shortName, fullName) {
    myO.loadedTexts.ihot['ihot-' + shortName] = { bookTitle: fullName, chapters: [] };
    let bookInfo = myO.loadedTexts.ihot['ihot-' + shortName];

    let currentChapter = 0;
    let infoChapter;

    for (let i=0; i<lines.length; i++) {
        let line = lines[i];

        let tokens = line.split(splitRegex);
        let osisID = tokens[0].trim();
        let [book, chapter, verse] = unpackOsisId(osisID);

        if (chapter != currentChapter) {
            infoChapter = { title: `Chapter ${chapter}`, verses: [] };
            bookInfo.chapters.push(infoChapter);
            currentChapter = chapter;
        }
        verse = { title: osisID, wordTuples: [] };
        infoChapter.verses.push(verse);

        for (let j=1; j<tokens.length-1; j+=2) {
            let hToken = tokens[j].trim();
            let eToken = tokens[j+1].trim();
            if (!eToken) {
                eToken = "...yeah...";
                if (hToken == "אתו") eToken = "him";
            }

            let tuple = { osisID: osisID, english: eToken, hebrew: hToken };
            verse.wordTuples.push(tuple);
        }

    }
}
// see ihot d/l on https://www.ph4.org/b4_index.php . sqlite3 DB
// RR: words per book (to avoid worry re verse numbers, or even chap numbers
//    Note words that are missing tr values
//    For 'et', rr: '[namely]/[with]'
let ihot = {};
ihot[10]  ="Gen"  ;
ihot[20]  ="Exod" ;
ihot[30]  ="Lev"  ;
ihot[40]  ="Num"  ;
ihot[50]  ="Deut" ;
ihot[60]  ="Josh" ;
ihot[70]  ="Judg" ;
ihot[90]  ="1Sam" ;
ihot[100] ="2Sam" ;
ihot[110] ="1Kgs" ;
ihot[120] ="2Kgs" ;
ihot[290] ="Isa"  ;
ihot[300] ="Jer"  ;
ihot[330] ="Ezek" ;
ihot[350] ="Hos"  ;
ihot[360] ="Joel" ;
ihot[370] ="Amos" ;
ihot[380] ="Obad" ;
ihot[390] ="Jonah";
ihot[400] ="Mic"  ;
ihot[410] ="Nah"  ;
ihot[420] ="Hab"  ;
ihot[430] ="Zeph" ;
ihot[440] ="Hag"  ;
ihot[450] ="Zech" ;
ihot[460] ="Mal"  ;
ihot[230] ="Ps"   ;
ihot[240] ="Prov" ;
ihot[220] ="Job"  ;
ihot[260] ="Song" ;
ihot[80]  ="Ruth" ;
ihot[310] ="Lam"  ;
ihot[250] ="Eccl" ;
ihot[190] ="Esth" ;
ihot[340] ="Dan"  ;
ihot[150] ="Ezra" ;
ihot[160] ="Neh"  ;
ihot[130] ="1Chr" ;
ihot[140] ="2Chr" ;
