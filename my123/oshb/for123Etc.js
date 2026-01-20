
function sendTo123Page() {
    let triesFor123 = 0;
    emit123Lyrics();

    let intervalId;
    let repFunction = () => {
        triesFor123++;

        let content123 = gabi_content('lyrics');
        localStorage.setItem("bible123", content123);
        if (triesFor123 > 3) {
            clearInterval(intervalId);
            alert("Maybe try clicking again?");
        }

        let content = localStorage.getItem("bible123");
        if (content && content == content123) {
            window.open("../?bible");
            clearInterval(intervalId);
        }
    };
    intervalId = setInterval(repFunction, 1000); // give storage a chance to receive
}
// https://stackoverflow.com/questions/6743912/how-to-get-the-pure-text-without-html-element-using-javascript
// Gabi's elegant approach, but eliminating one unnecessary line of code:
function gabi_content(id) {
    let element = document.getElementById(id);
    let flatContent = (element.innerText || element.textContent).trim();

    return flatContent;
}

function emit123Lyrics(doReverse) {
    let wpl = $('#wpl').val();
    emitHelper("T:", "P: ",  "w: ", "|", wpl, doReverse);
}
function emitTrup(doReverse) {
    let wpl = $('#wpl').val();
    emitHelper("", "",  "", " ", wpl, doReverse);
}
function emitHelper(chapterPrefix, versePrefix, wordsPrefix, sep, wordsPerLine, doReverse) {
    showProgress(true, "Loading data...");
    let onlyTrupAndWords = versePrefix;

    // give progress a head start
    setTimeout(function() {

        if (!chapterPrefix) chapterPrefix = "";
        if (!versePrefix) versePrefix = "";

        let source = "mapm";

        $('#lyrics').empty();
        if (onlyTrupAndWords) {
            appendOutputLine('Q:1/4=170');
        }

        myO.loadedBookNames.forEach(book => {
            if (onlyTrupAndWords) {
                appendOutputLine("%%vocalfont Arial Bold 16");
                appendOutputLine("%%staffsep 90");
                appendOutputLine("%%gchordfont Arial Bold 10");
            }

            let sourceBook = myO.loadedTexts[source][book];
            let chapterInfos = myO.chosenChapters[book].map(chapterInfo => sourceBook.chapters[chapterInfo-1]);

            chapterInfos.forEach(chapterInfo => {
                let chapterNumOneI = chapterInfo.title.replace("Chapter ", "");
                let verses = getChosenOrAllChapterVerses(book, chapterNumOneI, source, true);

                let title1 = chapterPrefix + myO.shortNameToFullName.get(book) + ' ' + chapterInfo.title;
                appendOutputLine(title1);
                if (onlyTrupAndWords) {
                    appendOutputLine(chapterPrefix + ' ( via https://cwoolf.neocities.org/openBible/oshb )');
                }
                emit123Verses(verses, versePrefix, wordsPrefix, sep, wordsPerLine, doReverse);
            });
        });
        showProgress(false, "Loading data...");
    }, 100);
}

function emit123Verses(verses, prefix, wordsPrefix, sep, wordsPerLine, doReverse) {
    //console.log('Emit 123 Verses');
    //console.log(verses);

    for (let i=0; i<verses.length; i++) {
        let v = verses[i];

        emitVerse(v, prefix, wordsPrefix, sep, wordsPerLine, doReverse)
    }
}
function isEoChapter(osisID) {
    if (! myO.showEndings) {
        return false;
    }
    let [book, chapOneI, verseOneI] = unpackOsisId(osisID);
    return (myO.loadedTexts["mapm"][book].chapters[chapOneI-1].verses.length == verseOneI);
}
function isLastChapter(osisID) {
    if (! myO.showEndings) {
        return false;
    }
    let [book, chapOneI, verseOneI] = unpackOsisId(osisID);
    return (myO.loadedTexts["mapm"][book].chapters.length == chapOneI);
}
function emitVerse(verse, versePrefix, wordsPrefix, sep, wordsPerLine, doReverse) {
    let osisID = verse.title;

    let eoChapter = isEoChapter(osisID);
    let lastChapter = isLastChapter(osisID);

    let onlyTrupAndWords = versePrefix;

    myO.macroPrefix = getMacroPrefix(osisID);
    let infoScope = macroPrefixToScopeName(myO.macroPrefix);

    let shortScope = ["ps", "pr", "jb"].includes(myO.macroPrefix) ? 3 : 21;

    appendOutputLine(`${versePrefix + osisID}`);

    let its123 = wordsPrefix; // hacky way to identify 123 output vs simple trup
    let macroLines = [];
    let macroLine = ""; // updated throughout loop
    let wordCounter = 0;
    for (let i=0; i<verse.wordTuples.length; i++, wordCounter++) {
        if (verse.wordTuples[i].trup == 'Ktiv') {
            continue;
        } // cannot put text below 'rest'

        let processOneResult = processOneTupleMacro(verse, i, eoChapter, lastChapter, its123,
            shortScope, wordCounter, macroLine, sep, wordsPerLine, macroLines);
        wordCounter = processOneResult.wordCounter;
        macroLine = processOneResult.macroLine;
    }
    if (macroLine) macroLines.push(macroLine);

    let lyricsLines = [];
    let tuples = verse.wordTuples;
    let numTuples = tuples.length;
    let words = [];
    wordCounter = 0;
    let i;
    for (i=0; i<numTuples; i++, wordCounter++) {
        if (verse.wordTuples[i].trup == 'Ktiv') {
            continue;
        } // cannot put text below 'rest'

        let processOneResult = processOneTupleWord(tuples, i, words, wordCounter, wordsPerLine,
            lyricsLines, wordsPrefix, sep, doReverse);
        words = processOneResult.words;
        wordCounter = processOneResult.wordCounter;
    }
    if (words.length > 0) {
        if (doReverse) {
            words = words.reverse();
        }
        lyricsLines.push(`${wordsPrefix} ${i==wordCounter ? sep : ""} ` +
            words.join(` ${sep} `) + ` ${sep} `);
    }

    let lines = macroLines.length;
    for (let j=0; j<lines; j++) {
        appendOutputLine(macroLines[j]);
        appendOutputLine(lyricsLines[j]);
    }
}
function firstUpcomingMatch(tuples, index, pattern) {
    let result = "";
    for (let i=index+1; i<tuples.length; i++) {
        let tuple = tuples[i];
        let match = tuple.trup.match(pattern)
        if (match) {
            result = match[0];
            break;
        }
    }
    return result;
}

function processOneTupleMacro(verse, i, eoChapter, lastChapter, its123, shortScope, wordCounter, macroLine, sep, wordsPerLine, macroLines) {
    let tupleTrup = verse.wordTuples[i].trup;
    if (eoChapter && tupleTrup.match(/Sof_Pasuq/)) {
        let sof = lastChapter ? "Sof_Sefer" : "Sof_Pereq";
        tupleTrup = tupleTrup.replace(/Sof_Pasuq/, sof);
    }
    if (!its123) { // table identification available only for trup-names, not 123
        if (myO.showOutputSource) {
            tupleTrup = tupleTrup.replace(/(-\d+[cd]+)/g, " class='table'>($1)");
        } else {
            tupleTrup = tupleTrup.replace(/(-\d+[cd]+)/g, "");
        }
        tupleTrup = tupleTrup.replace(/[{}]/g, "");
    } else {
        tupleTrup = tupleTrup.replace(/(-\d+)[cd]+/g, "$1");

        tupleTrup = tupleTrup.replace(/[{]?(.*)(-\d+[}])?_with_[{]?Paseq/g, "$1_Paseq");
        tupleTrup = tupleTrup.replace(/[{]?(.*)(-\d+[}])?_and_[{]?Paseq/g, "$1_Paseq");
        tupleTrup = tupleTrup.replace(/_with_/g, `-${shortScope}_with_`);
        tupleTrup = tupleTrup.replaceAll(`-${shortScope}}-${shortScope}`, `-${shortScope}`); // not sure how dup's arise
        tupleTrup = tupleTrup.replace(/_and_/g, `-${shortScope}_and_`);
        tupleTrup = tupleTrup.replace(/[{}]/g, "");
        tupleTrup = tupleTrup.replace(/_wi\u200Bth_/g, `_with_`);
        tupleTrup = tupleTrup.replace(/_and_/g, " ");
        tupleTrup = tupleTrup.replace(/_with_/g, " ");
        tupleTrup = tupleTrup.replace(/(\S+) \1/, "$1"); // double pashta / segol should make 1 macro
        tupleTrup = tupleTrup.replace(/([ë0-9a-zA-Z_-]+)/g, `::${myO.macroPrefix}-$1::`);

        // contextual adjustments -- based on what comes after
        if (tupleTrup.match(/Revia-3/)) {
            let nextWord = firstUpcomingMatch(verse.wordTuples, i, /.*/);
            if (nextWord.match(/Ole/)) {
                tupleTrup = tupleTrup.replace(/Revia/, "Revia_Qaton");
            }
            // let followingAtnachOrSof = firstUpcomingMatch(verse.wordTuples, i, /(Atnach)|(Sof_)/);
            // console.log(`${verse.wordTuples[i].osisID}.${i}: Revia, next word: ${nextWord}. AtnachOrSof: ${followingAtnachOrSof}`)
        } else if (tupleTrup.match(/Tarcha/)) {
            let firstMatch = firstUpcomingMatch(verse.wordTuples, i, /(Atnach)|(Sof_)|(Mugrash)/);
            if (firstMatch.match(/Atnach/)) {
                tupleTrup = tupleTrup.replace(/Tarcha/, "Tarcha_B4_Atnach");
            } else if (firstMatch.match(/Mugrash/)) {
                tupleTrup = tupleTrup.replace(/Tarcha/, "Tarcha_B4_Mugrash");
            } else {
                tupleTrup = tupleTrup.replace(/Tarcha/, "Tarcha_B4_Sof");
            }
        } else if (tupleTrup.match(/Tipcha/)) {
            let firstMatch = firstUpcomingMatch(verse.wordTuples, i, /(Atnach)|(Munnach)|(Sof_)|(Merkha)/);
            if (firstMatch.match(/(Atnach)|(Munnach)/)) {
                tupleTrup = tupleTrup.replace(/-21/, "_B4_Atnach-21");
            } else if (firstMatch.match(/(Sof_)|(Merkha)/)) {
                tupleTrup = tupleTrup.replace(/-21/, "_B4_Sof-21");
            }
        }
    }
    if (wordCounter == 0) macroLine = ` ${sep} `;
    let coordsOutput = myO.showOutputCoords ? ` class="coord" (${i})` : "";
    macroLine += ` ${coordsOutput}${tupleTrup} ${sep}`;
    if (wordCounter >= wordsPerLine - 1) {
        macroLines.push(macroLine);
        if (verse.title == "Job.42.10") {
            console.log("J42.10 lines", macroLines);
        }
        macroLine = "";
        wordCounter = -1; // let auto-increment make it 0
    }
    return {wordCounter, macroLine};
}

function processOneTupleWord(tuples, i, words, wordCounter, wordsPerLine,
                             lyricsLines, wordsPrefix, sep, doReverse) {
    let tuple = tuples[i];
    let word = tuple.word;
    let coordsOutput = myO.showOutputCoords ? ` (${i})` : "";
    words.push(`${word}${coordsOutput}`);
    if (wordCounter >= wordsPerLine - 1) {
        if (doReverse) {
            words = words.reverse();
        }
        lyricsLines.push(`${wordsPrefix} ${i == wordCounter ? sep : ""} ` +
            words.join(` ${sep} `) + ` ${sep} `);
        words = [];
        wordCounter = -1; // let auto-increment make it 0
    }
    return {words, wordCounter};
}

function appendOutputLine(value) {
    let lyrics = $('#lyrics');
    lyrics.append(`${value}\n`);

    //lyrics.val(lyrics.val() + value + "");
}
function fixNoSyms(tuple, index, tuples) {
    let tuplesResult = tuples;
    if (! tuple.trup.match(/NoSym/)) {
        return tuplesResult;
    }
    else {
        if (tuple.osisID == "Ps.38.10") {
            // MAPM has Revia
            tuple.trup = "Revia-3d";
            tuple.comment = addComment(tuple.comment, myO.comment.manualEditMisc);
        }
        if (tuple.osisID == "Ps.105.28") {
            // colon was stolen by following ktiv
            tuple.trup = "Sof_Pasuq-3d";
            tuple.comment = addComment(tuple.comment, myO.comment.ktivSof);
            tuple.word += '׃';
        }
        if (   tuple.osisID == "Ps.68.13"
            || tuple.osisID == "Exod.10.13"
            || tuple.osisID == "Num.12.9"
            || tuple.osisID == "Deut.32.6"
        ) {
            // MAPM has Revia
            let nextTuple = tuples[index+1];
            tuplesResult = hyphenateTuples(tuple, nextTuple, index, tuples);
        }
        return tuplesResult;
    }
}

function tuplesPostProcess(tuples) {
    let tuplesResult = tuples;
    tuplesResult.forEach((tuple, index) => {
        if (tuple.trup.match(/Munnach_with_Zaqef_Qatan-21d/)) {
            tuple.trup = tuple.trup.replace(/Munnach_with_/, "Munnach-21c_b4")
                .replace(/Zaqef_Qatan-21d/, "Zqf_Qtn") + "_wi\u200Bth_Zaqef_Qatan-21d";
        }
        if (tuple.trup.match(/Munnach_with_Revia-21d/)) {
            tuple.trup = tuple.trup.replace(/Munnach_with_/, "Munnach-21c_b4")
                .replace(/Revia-21d/, "Rv") + "_wi\u200Bth_Revia-21d";
        }
        if (tuple.trup.match(/Munnach_with_Pazer-21d/)) {
            tuple.trup = tuple.trup.replace(/Munnach_with_/, "Munnach-21c_b4")
                .replace(/Pazer-21d/, "Pzr") + "_wi\u200Bth_Pazer-21d";
        }
        if (tuple.trup.match(/Shalshelet_Qetana_Paseq/)) {
            // a simple misunderstanding b/t a chain of friends
            tuple.trup = tuple.trup.replace(/Shalshelet_Qetana_Paseq/, "Shalshelet_Gegola");
        }
        if (tuple.trup.match(/{Segol-21d}_with_{Segol-21d}/)) {
            // a simple misunderstanding b/t a chain of friends
            tuple.trup = "Segol-21d";
        }
        let mOrYregex = /(.*[_]?[}]?)Merkha-3c-or-Yored-3d(.*)/;
        if (tuple.trup.match(mOrYregex)) {
            //console.log('tuplesResult=', tuplesResult);
            if (index > 0 && tuplesResult[index-1].trup.match(/Ole-3[cd]*}?$/)) {
                tuple.trup = tuple.trup.replace(mOrYregex, "$1Yored-3d$2");
            }
            else {
                tuple.trup = tuple.trup.replace(mOrYregex, "$1Merkha-3c$2");
            }
            tuple.comment = addComment(tuple.comment, myO.comment.manualEditDiv);
        }
        if (tuple.trup == "Geresh_Muqdam-3d" || tuple.trup == "{Revia-3d}_with_{Geresh-3d}") {
            tuple.trup = "Revia_Mugrash-3d";
            tuple.comment = addComment(tuple.comment, myO.comment.manualEditMugrash);
        }
        ///// fix MAPM nosyms
        tuplesResult = fixNoSyms(tuple, index, tuplesResult);

        // MAPM (not WLC) uses 0599 for Qadma, but it's rendered Pashta in displays
        if (tuple.trup.match(/Pashta-3d/) && tuple.osisID == "Ps.52.7") {
            tuple.trup = "Qadma-3c";
            tuple.comment = addComment(tuple.comment, myO.comment.manualEditAntiPashta);
        }
    });
    while (tuplesResult.find(t => t.trup == "Yored-3d")) {
        let oleIndex;
        tuplesResult.forEach((tuple, index) => {
            if (tuple.trup == "Yored-3d") {
                oleIndex = index - 1;

                let oleTuple = tuplesResult[oleIndex];
                let yoredTuple = tuplesResult[oleIndex + 1];
                let newTuple = combineOleAndYored(oleTuple, yoredTuple);

                tuplesResult = abToC(tuplesResult, oleIndex, 2, newTuple);
                newTuple.comment = addComment(newTuple.comment, myO.comment.manualEditUpDown);
            }
        });
    }
    // smooshing _Paseq onto preceding -- next block for exception Legarmeh, and Shalshelet here below
    // probably only matters in MAPM, oshb handles Paseq earlier
    while (tuplesResult.find(t => t.trup.match(/^Paseq-/))) {
        let paseqIndex = tuplesResult.findIndex(t => t.trup.match(/^Paseq-/));

        let paseqTuple = tuplesResult[paseqIndex];
        let priorTuple = tuplesResult[paseqIndex - 1];

        let newTuple = combinePriorAndPaseq(priorTuple, paseqTuple);

        tuplesResult = abToC(tuplesResult, paseqIndex - 1, 2, newTuple);

        if (newTuple.trup.match(/Shalshelet_Qetana_Paseq/)) {
            // a simple misunderstanding b/t a chain of friends
            newTuple.trup = newTuple.trup.replace(/Shalshelet_Qetana_Paseq/, "Shalshelet_Gegola");
        }
        else {
            newTuple.comment = addComment(newTuple.comment, myO.comment.gluePaseq);
        }
    }
    /// Legarmeh
    let vettedMuSeqs = "";
    let getPossibleLegarmehIndex = (tuplesResult) => {
        return tuplesResult.findIndex(t => t.trup.match(/Munnach_Paseq/) &&
            (null == vettedMuSeqs.match(`(${t.word})` )));
    }
    while (getPossibleLegarmehIndex(tuplesResult) > -1) {

        let muSeqIndex = getPossibleLegarmehIndex(tuplesResult);

        let tuple = tuplesResult[muSeqIndex];

        // array.includes() doesn't seem to work
        vettedMuSeqs += `(${tuple.word})`;

        if (foundAndInRange(muSeqIndex + 1, tuplesResult.length)) {
            if (tuplesResult[muSeqIndex + 1].trup.match(/Revia/) ||
                tuplesResult[muSeqIndex + 1].trup.match(/Legarmeh/) ||
                tuplesResult[muSeqIndex + 1].trup.match(/Munnach_b4Rv/) ||
                (tuplesResult[muSeqIndex + 1].trup.match(/Munnach/) &&
                    foundAndInRange(muSeqIndex + 2, tuplesResult.length) &&
                    tuplesResult[muSeqIndex + 2].trup.match(/Revia/))) {
                tuple.trup = tuple.trup.replace(/Munnach_Paseq/, "Legarmeh");
                tuple.comment = addComment(tuple.comment, myO.comment.manualEditLeg);
                tuple.comment = tuple.comment.filter(c => c != myO.comment.gluePaseq);
            }
            // as a bonus we reach back one tuple
            if (foundAndInRange(muSeqIndex - 1, tuplesResult.length)) {
                if (tuplesResult[muSeqIndex - 1].trup.match(/Munnach_Paseq/)) {
                    tuple = tuplesResult[muSeqIndex - 1];
                    tuple.trup = tuple.trup.replace(/Munnach_Paseq/, "Legarmeh");
                    tuple.comment = addComment(tuple.comment, myO.comment.manualEditLeg);
                    tuple.comment = tuple.comment.filter(c => c != myO.comment.gluePaseq);
                }
            }
        }
    }

    // after some Munachs have morphed into Legs or Paseqs,
    //  differentiate by context
    tuplesResult = manyMunachsBefore(tuplesResult);

    // not sure how extra -21s got in
    tuplesResult.forEach(t => {
        if (!t.trup.match(/_with_/)) {
            t.trup = t.trup.replace(/(b4[_\w]+)-21[cd]+/g, "$1");
        }
    })

    return tuplesResult;
}

function manyMunachsBefore(tuplesIn) {
    let tuplesResult = tuplesIn;

    let munachSequences = subSequences(tuplesResult, /(Munnach-21c)|(Munnach_Paseq-21d)|(Ktiv)/, (t)=>t.trup);
    munachSequences.forEach(ms => {
        let lastMs = ms[ms.length - 1];
        if (foundAndInRange(lastMs +1, tuplesIn.length)) { // protects case of ktiv at eo verse
            let nextTrup = tuplesIn[lastMs + 1].trup;
            for (let i = 0; i < ms.length; i++) {
                let m = ms[i];
                let tuple = tuplesIn[m];
                if (tuple.trup != "Ktiv" && null == tuple.trup.match(/_wi\u200Bth_/)) {
                    tuple.trup += `_b4${nextTrup
                        .replace(/[aeiou]/g, "")
                        .replace(/(.*)-21[cd]*/, "$1")}`;
                }
            }
        }
    });

    return tuplesResult;
}

function subSequences(arrayIn, regex, extractArrayItem) {
    let collectionOfSubSeqs = [];
    let subSeq = [];
    collectionOfSubSeqs.push(subSeq);

    for (let i=0; i<arrayIn.length; i++) {
        let elt = arrayIn[i];
        let item = extractArrayItem(elt);
        if (item.match(regex)) {
            subSeq.push(i);
        }
        if (!item.match(regex)) {
            if (subSeq.length > 0 || item.match(/_with_/)) {
                subSeq = [];
                collectionOfSubSeqs.push(subSeq);
            }
        }
    }
    collectionOfSubSeqs = collectionOfSubSeqs.filter(s => s.length > 0);
    return collectionOfSubSeqs;
}
function combinePriorAndPaseq(prior, paseq) {
    let result = {};

    if (prior.comment) {
        result.comment = prior.comment;
    }

    result.trup = prior.trup.replace(/(.*)-\d+[cd]+(}?)/, "$1_FOOFOO$2")
        .replace(/FOOFOO/, paseq.trup)
        .replace(/(.*)-(\d+)[cd]/, "$1-$2d"); // Paseq makes it disjunctive!
    result.word = `${prior.word} ${paseq.word}`;
    result.osisID = prior.osisID;
    result.unicode = `${prior.unicode}${paseq.unicode}`;
    result.scope = prior.scope;

    if (result.unicode == '\\u0593\\u05C0') {
        let scope = getScope(result.osisID);
        if (scope == "poetic") {
            result.trup = "Shalshelet_Gedola-3d";
        }
        else {
            result.trup = 'Shalshelet-21d';
        }
    }

    return result;
}
function hyphenateTuples(a, b, aIndex, tuples) {
    let newTuple = {};
    newTuple.comment = [myO.comment.manualEditMisc];

    [a.comment, b.comment].forEach(n => {
        if (n) {
            newTuple.comment = unicat(newTuple.comment, n);
        }
    });

    let trups = [];
    [a.trup, b.trup].forEach(n => {
        if (! n.match(/NoSym/)) {
            trups.push(n);
        }
    });

    newTuple.trup = trups.join('_with_');
    newTuple.word = `${a.word}-${b.word}`;
    newTuple.osisID = a.osisID;
    newTuple.unicode = `${a.unicode}${b.unicode}`;
    newTuple.scope = a.scope;

    tuples = abToC(tuples, aIndex, 2, newTuple);

    return tuples;
}

function combineOleAndYored(oleTuple, yoredTuple) {
    let result = {};

    let oleComment = oleTuple.comment;
    if (!oleComment) oleComment = [];

    let yoredComment = yoredTuple.comment;
    if (!yoredComment) yoredComment = [];

    result.comment = oleComment.concat(yoredComment);
    result.comment = unipush(result.comment, myO.comment.synthName);

    result.trup = oleTuple.trup.replace(/Ole-3[cd]+/, "FooFoo")
        .replace("FooFoo", `Ole_We_${yoredTuple.trup}`);

    result.word = `${oleTuple.word}-${yoredTuple.word}`;

    result.osisID = yoredTuple.osisID;
    result.unicode = `${oleTuple.unicode}${yoredTuple.unicode}`;

    result.scope = yoredTuple.scope;

    return result;
}



