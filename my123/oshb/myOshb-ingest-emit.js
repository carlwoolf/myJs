myO.loadedTexts = {};
myO.loadedTexts.oshb = {};
myO.loadedTexts.mapm = {};
myO.noiseInTrupname = /[^-ëa-zA-Z0-9_)(}{\]\[:]/g; // erase all other characters
myO.showComments = true; // subject to hiding w jquery

myO.comment = {
    noName: { name: 'noName', klass: 'noName', blurb: "Could not get/derive trup name for this symbol from OSHB table for the prose / poetic 'scope' of the verse"},
    dupKeys: { name: 'dupKeys', klass: 'dupKeys', blurb: "Same trup symbol appears in both OSHB conjunctive / disjunctive tables" },
    ktiv: { name: 'ktiv', klass: 'ktiv', blurb: "Pay no attention to the ktiv behind the parens" },
    ktivSof: { name: 'ktivSof', klass: 'ktivSof', blurb: "Ktiv stole Sof-Pasuq from rightful owner" },
    synthName: { name: 'synthName', klass: 'synthName', blurb: "OSHB table has no trup names for the sequence of symbols, trying for flips or sub-sequences" },
    pairFlip: { name: 'pairFlip', klass: 'pairFlip', blurb: "(Similar to 'synthetic' solution) Found a name by switching the order in a two-symbol trup"},
    gluePaseq: { name: 'gluePaseq', klass: 'gluePaseq', blurb: "To simplify semantics, combining Paseq with previous"},
    manualEditDiv: { name: 'manualEditDiv', klass: 'manualEditDiv', blurb: "Overrode trup value manually, choose division based on context"},
    manualEditMugrash: { name: 'manualEditMugrash', klass: 'manualEditMugrash', blurb: "Designating Revia Mugrash manually, based on Sefaria/MAPM website"},
    manualEditMisc: { name: 'manualEditMisc', klass: 'manualEditMisc', blurb: "Overrode/Added trup value manually, based on Sefaria/MAPM website"},
    manualEditAntiPashta: { name: 'manualEditAntiPashta', klass: 'manualEditAntiPashta', blurb: "Overrode trup value manually, Pashta makes no sense"},
    manualEditUpDown: { name: 'manualEditUpDown', klass: 'manualEditUpDown', blurb: "Overrode word boundaries manually, uniting Ole and Yored"},
    manualEditLeg: { name: 'manualEditLeg', klass: 'manualEditLeg', blurb: "Munnach_Paseq before Munnach Revia is a Legarmeh"},
}
myO.biblehubStrongUrlTemplate = 'https://biblehub.com/hebrew/0000.htm';

async function loadSelectedBooksOrChapter(shortNames, forceRefresh) {
    if (!shortNames || shortNames.length == 0) return; // yikes

    let mainDisplay = $('#mainDisplay');
    let bookTitleAnchors = $('#bookTitleAnchors');
    let currentBookTitles = $('.currentBookTitles');

    mainDisplay.empty();
    bookTitleAnchors.empty();

    // prune (oshb chaps == mapm chaps)
    let myOshb = myO.loadedTexts.oshb;
    Object.keys(myOshb).forEach(shortName => {
        if ( ! myO.loadedBookNames.includes(shortName)) {
            delete myOshb[shortName];
            delete myO.loadedTexts.mapm[shortName];
            $(`#chaps_${shortName}`).empty();
            $(`.verses.${shortName}`).hide();
        }
    });
    //console.log('___________ F2 prune ___________________', myO.loadedTexts);

    if (shortNames.length > 1) {
        currentBookTitles.show();
    }
    else {
        currentBookTitles.hide();
    }

    for (let i=0; i<shortNames.length; i++) {
        let shortName = shortNames[i];

        myO.bookShortName = shortName;

        if (! myO.loadedTexts.mapm[shortName] || forceRefresh) {
            await loadDataFileAsText(`texts/oshb-${shortName}.xml`,
                function() {showProgress(true, `Loading xml for OSHB ${shortName}`);},
                function() {showProgress(false, `Done loading xml for OSHB ${shortName}`);},
                function (text) {
                    let lines = text.split('\n');
                    let cookedLines = lines.map(l => cookOshbLine(l));
                    let cookedText = cookedLines.join('\n');
                    let xmlDoc = $.parseXML(cookedText);

                    myO.chosenChapters[shortName] = ['1'];
                    //console.log(`---- Injesting OSHB ${fullName} -------------`);
                    ingestOshbBookXml(xmlDoc, shortName);
                    // emit book after ingesting the MAPM also
                });
            await loadDataFileAsText(`texts/mapm-${shortName}.xml`,
                function() {showProgress(true, `Loading xml for MAPM ${shortName}`);},
                function() {showProgress(false, `Done loading xml for MAPM ${shortName}`);},
                function (text) {
                    let lines = text.split('\n');
                    let cookedLines = lines.map(l => cookMapmLine(l));
                    let cookedText = cookedLines.join('\n');
                    let xmlDoc = $.parseXML(cookedText);

                    myO.chosenChapters[shortName] = ['1'];
                    //console.log(`---- Ingesting MAPM ${fullName} -------------`);
                    ingestMapmBookXml(xmlDoc, shortName);
                });
        }
        emitBookData(shortName);
    }
    if (myO.eagerAnalyze) {
        analyzeBoth();
    }
}
function prependHide(elt) {
    let hideSpan2 = $('<span class="hideSpan">--Click to Hide--</span>');
    elt.prepend(hideSpan2);
    hideSpan2.on('click', function() {
        elt.hide();
        hideSpan2.hide();
    })
}
function logAndSpan(target, msg, klass) {
    let klassInsert = klass ? ` class="${klass}"` : '';
    console.log(msg)
    target.append($(`<br/><span ${klassInsert}><b>${msg}</b></span>`));
}
function compareCountsOshbMapm(name, fullName, target) {
    let compareDiv = $('<div class="commentKey compareTexts"></div>');
    target.prepend(compareDiv);

    let chaptersList = `Chapter(s) ${myO.chosenChapters[name].join(', ')}`;
    logAndSpan(compareDiv,
            'Checking for differences in OSHB and MAPM: ' + fullName,
                'checkForTitle');
    compareDiv.append($(`<div>${chaptersList}</div>`));

    let selectedChapters = myO.chosenChapters[name];

    for (let i=0; i<selectedChapters.length; i++) {
        let selectedChapter = selectedChapters[i] - 1; // zero-based in the arrays
        let mChap = myO.loadedTexts.mapm[name].chapters[selectedChapter];
        let oChap = myO.loadedTexts.oshb[name].chapters[selectedChapter];

        if (oChap.verses.length != mChap.verses.length) {
            logAndSpan(compareDiv,
                `${name}, CHAPTER ${i+1} : VERSES, oshb vs mapm, ${oChap.verses.length} vs ${mChap.verses.length}`);
        }
        else {
            for (let j=0; j< max(oChap.verses.length, mChap.verses.length); j++) {
                let oVerse = (j<oChap.verses.length) ? oChap.verses[j] : "";
                let mVerse = (j<mChap.verses.length) ? mChap.verses[j] : "";

                if (oVerse && mVerse && mVerse.wordTuples.length != oVerse.wordTuples.length) {
                    let verseTitle = oVerse.title;
                    logAndSpan(compareDiv,
                        `<a href="#${verseTitle}">${verseTitle}</a> -- WORDS, oshb vs mapm, ${oVerse.wordTuples.length} vs ${mVerse.wordTuples.length}`);
                }
            }
        }
    }
}

function mapmAddCloseVerseByOsisId(line) {
    let result = line;
    if (line.match(/<verse osisID="Eccl.12.15"/)) {
        result = line + "</verse>";
    }
    else if (line.match(/verse osisID="Isa.66.25"/)) {
        result = line + "</verse>";
    }
    return result;
}
function cookMapmLine(line) {

    let result = mapmAddCloseVerseByOsisId(line)
        .replace(/(<verse.*? )sID=.*?>/, "$1>")
        .replace(/<verse eID=.*?>/, '</verse>');

    result = result.replace(/<\/?(?:cell|row|table|p|lb).*?>/g, " ");

    result = result.replace(/<seg type="x-symbol".*?>.*?>/g, "");
    result = result.replace(/<note.*?>.*?>/g, "");

    // attach psiq with underscore to make one logical world. peel off _ later
    result = result.replace(/<seg type="x-paseq">(.)<\/seg>/g, " $1 ")
        .replace(/(\u05C0)\s*/g, "_$1");

    result = result.replace(/<seg type="x-(?:big|small|suspended).*?>(.*?)<.*?>/g, "$1");

    result = result.replace(/<l .*?>(.*?)<\/l>/g, "$1");

    result = result.replace(/׆/g, ""); // backwards Nun

    return result;
}
function distributeKtiv(ktivWords) {
    let words = ktivWords.split(/\s+/);
    words = words.map(word => `ktiv_${word}`);
    words[0] += ')';
    words[words.length-1] = '(' + words[words.length-1];

    let result = `${words.join(' ')}`;
    return result;
}
function ingestMapmBookXml(xmlDoc, bookShortName) {
    let jDoc = $(xmlDoc);

    let bookFullName = myO.shortNameToFullName.get(bookShortName);
    myO.loadedTexts.mapm[bookShortName] = { bookTitle: bookFullName, chapters: []};

    let chapters = jDoc.find('chapter[eID]');
    chapters.each((i,chap) => {
        let chapNum = i+1;
        let chapterInfo = {title: `Chapter ${chapNum}`, verses: []};
        myO.loadedTexts.mapm[bookShortName].chapters.push(chapterInfo);
        let versesXml = jDoc.find(`verse[osisID*='${bookShortName}.${chapNum}.']`);
        //console.log(`---------verses mapm, ch. ${i+1} -------`, verses);
        let numVerses = versesXml.length;
        for (let i=0; i<numVerses; i++) {
            let jV = $(versesXml[i]);

            let osisID = jV.attr('osisID');
            let content0 = jV.html();
            let content = content0.replace(/\s+/g, " ");

            content = higherContent(content, osisID);

            // textual adjustment that doesn't nicely go in the mapmTweakMapmLineByOsisId() or cook*Line() helpers
            // extra space might be inter-line, so here is where to prune
            content = content.replace(/\n/g, " ");
            content = content.replace(/\s+/g, " ");
            content = content.replace(/\s*\u05BE\s*/g, "\u05BE"); // space-maqqef-space ==> maqqef
            content = content.replace(/(<seg.*?<\/seg>)׃/, "׃$1"); // that actually moves the Siluq to front
            content = content.replace(/<seg.*?ketiv.*?>(.*?)<\/seg>/g, function(fullMatch, captured) {
                return distributeKtiv(captured);
            });
            content = content.replace(/\s+׃\s+/, "׃");

            let words = content.split(/\s+/);
            // split or 'higher' might add "" words
            words = words.filter(w => w.length > 0);

            let wordTuples = words.map(w => ingestMapmWord(w, osisID));
            if (myO.aggressive) {
                wordTuples = tuplesPostProcess(wordTuples);
            }

            let chapterVerses = chapterInfo.verses;
            chapterVerses.push({title: osisID, total: content, wordTuples: wordTuples});
        }
    });
}
function ingestMapmWord(wordInput, osisID) {
    let trupName = "";
    let unicode = "";
    let scope = getScope(osisID); // using oshb logic
    let result = {};
    let comments = [];
    let word;

    if (wordInput.match(/ktiv_/)) {
        word = wordInput.replace(/ktiv_(.*)/, "$1");
        trupName = "Ktiv";
        comments.push(myO.comment.ktiv);
    }
    else {
        word = wordInput.replace(/_/, " ");
        let taam = extractTaamSymbol(word);
        unicode = symbolWordToTaamUnicodes(taam);
        if (!unicode) {
            trupName = "NoSym";
        }
        if (taam) {
            let trupInfo = getOshbNameInfo(taam, scope, true, comments, osisID, word);
            trupName = cleanupTrupname(trupInfo.name);
            if (!trupName) trupName = "NoTableEntry";
        }
    }

    result = {
        word: word,
        scope: scope,
        osisID: osisID,
        trup: trupName,
        unicode: unicode
    };
    if (comments.length > 0) {
        result.comment = uniq(comments);
    }
    return result;
}
function cleanupTrupname(name) {
    let result = name.replace(myO.noiseInTrupname, "_")
        .replace(/{{/, "{").replace(/}}/, "}");
    if ( ! result.match(/_with_/)) {
        // remove 'with-y' brackets
        result = result.replace(/^{/, "").replace(/}$/, "");
    }
    return result;
}
function cookOshbLine(line) {
    // it's already in pretty good (cooked) state
    return line;
}
function rearrangeKri(jElts) {

    let numElts = jElts.length;

    if (numElts > 0) {
        // move ketiv before dashed word
        let ktivIndex = jElts.findIndex(elt => matchOuter(elt, /x-ketiv/));
        if (foundAndInRange(ktivIndex, numElts)) {
            if (foundAndInRange(ktivIndex - 1, numElts) && matchOuter(jElts[ktivIndex - 1], /<seg .*type="x-maqqef"/)
                && foundAndInRange(ktivIndex - 2, numElts)
            )  {
                // put ktiv before the dashed (real) word
                exchange(ktivIndex, ktivIndex - 1, jElts);
                exchange(ktivIndex - 2, ktivIndex - 1, jElts);
            }
        }
    }
    return jElts;
}
async function loadDataFileAsText(url, before, complete, success) {
    before();
    await $.ajax({
        type: "GET",
        url: url,
        dataType: "text",
        success: function(text) {
            //console.log(`Loaded url: ${url}`);
            success(text); },
        complete: complete
        // https://stackoverflow.com/questions/19220873/how-to-read-xml-file-contents-in-jquery-and-display-in-html-elements
    });
}

function addComment(priorComment, comment) {
    if (!priorComment) {
        priorComment = [ comment ];
    }
    else {
        priorComment.push(comment);
        priorComment = uniq(priorComment);
    }
    return priorComment;
}

function ingestOshbBookXml(xmlDoc, bookShortName) {

    let bookFullName = myO.shortNameToFullName.get(bookShortName);

    // For ingestion, set up bookInfo as alias / abbreviation for myO.loadedTexts....
    myO.bookInfo = { bookTitle: bookFullName, chapters: [] };
    myO.loadedTexts.oshb[bookShortName] = myO.bookInfo;

    let chapter = 1;
    let jXmlDoc = $(xmlDoc);

    // For ingestion, set up chapterInfo as alias / abbreviation for myO.loadedTexts....
    myO.chapterInfo = { title: `Chapter ${chapter}`, verses: [] };
    myO.bookInfo.chapters.push(myO.chapterInfo);

    let verses = jXmlDoc.find("verse");

    verses.each(function (index, element) {
        let verse = $(element);
        let osisID = verse.attr('osisID');

        let fields = unpackOsisId(osisID);
        if (fields[1] != chapter) {
            ++chapter;

            myO.chapterInfo = { title: `Chapter ${chapter}`, verses: [] };
            myO.bookInfo.chapters.push(myO.chapterInfo);
        }

        let xmlWords = verse.find("w,seg");
        let tuples2 = ingestOshbVerseWords(xmlWords, osisID);
        if (myO.aggressive) {
            tuples2 = tuplesPostProcess(tuples2);
        }

        let verseInfo = {
            title: osisID,
            wordTuples: tuples2
        };
        myO.chapterInfo.verses.push(verseInfo);
    })
}
function ingestOshbVerseWords(jXmlWords, osisID) {
    let xmlWords = jXmlWords.toArray();

    xmlWords = rearrangeKri(xmlWords);

    let tuples123 = [];
    let numWords = xmlWords.length;

    for (let ind = 0; ind < numWords; ind++) {
        let elt = xmlWords[ind];
        let jElt = $(elt);

        let ktiv = false;

        let currentType = jElt.attr("type");
        if (currentType) {
            if (currentType == "x-ketiv") {
                ktiv = true;
            }
            else {
                //console.log(`Skipping type: ${currentType} at ${osisID}`);
                continue;
            }
        }

        let strongNumbers = [];
        let word = jElt.text();
        let n = jElt.attr('n') != undefined;

        strongNumbers.push(harvestStrongNumber(jElt));

        // possibly attach following tokens, including maqqef-chain
        while (ind < numWords - 1) {
            let qEltNext = $(xmlWords[ind + 1]); // the possible maqqef
            let nextType = qEltNext.attr("type");
            if (nextType == "x-maqqef") {
                let qEltP2 = $(xmlWords[ind + 2]); // maqqef entails one more following word!
                ind += 2; // skip next two

                word += qEltNext.text(); // the maqqef
                word += qEltP2.text();
                let n2 = qEltP2.attr('n') != undefined;
                if (n2) n = true;

                strongNumbers.push(harvestStrongNumber(qEltP2));
            } else if (nextType == "x-sof-pasuq") {
                ind++; // next word consumed now, does not get its loop-place
                word += qEltNext.text();
            } else if (nextType == "x-paseq") {
                ind++; // next word consumed now, does not get its loop-place
                word += ' ' + qEltNext.text();
            } else {
                break;
            }
        }
        word = word.replace(/[\u002F]/g, ""); // nuke forward-slash
        let trupName = "";
        let taam = extractTaamSymbol(word);
        let scope = getScope(osisID);
        if (!taam && ind == numWords - 1) {
            taam = extractTaamSymbol("׃");
        }

        let comments = [];

        let unicode = "";
        if (taam) {
            unicode = symbolWordToTaamUnicodes(taam);
            let trupInfo = getOshbNameInfo(taam, scope, true, comments, osisID, word, n);
            trupName = cleanupTrupname(trupInfo.name);
            if (!trupName) trupName = "NoTableEntry";
        }
        if (!unicode && !ktiv) {
            trupName = "NoSym"
        }
        if (ktiv) {
            trupName = "Ktiv";
            comments.push(myO.comment.ktiv);
            word = `(${word})`;
        }

        let wordEntry = {
            word: word,
            scope: scope,
            osisID: osisID,
            trup: trupName,
            strongs: strongNumbers.join(' . '),
            unicode: unicode,
            n: n
        }
        if (comments.length > 0) {
            wordEntry.comment = uniq(comments);
        }

        tuples123.push(wordEntry);
    }
    return tuples123;
}
function emitBookData(bookShortName) {
    let bookFullName = myO.shortNameToFullName.get(bookShortName);

    let mainDisplay = $('#mainDisplay');
    let bookDivId = `${bookShortName}Div`;

    let bookDiv = $(`<div id="${bookDivId}"></div>`);
    bookDiv.attr("dir", "rtl");
    mainDisplay.append(bookDiv);

    let anchor = $(`<span class="anchorBookTitles"> <a href="#${bookDivId}"> ${bookFullName} </a> </span>`);
    $('#bookTitleAnchors').append(anchor);

    let bookTitleDiv = $(`<div class="bookTitleDiv right"> </div>`);
    bookTitleDiv.append($(`<div dir="ltr" class="bookTitleSpan"> <span class="biggg">${bookFullName}</span> 
        ((XML from <a target="_blank" href="texts/oshb-${bookShortName}.xml">OSHB</a> or 
        <a target="_blank" href="texts/mapm-${bookShortName}.xml">MAPM))</a></div>`));

    bookDiv.append(bookTitleDiv);

    let commentsDivsId = `chapterComments${bookShortName}`;
    let commentsDiv;

    if (myO.showComments) {
        commentsDiv = $(`<div style="display:none" class="commentsDiv ${bookShortName}" id="${commentsDivsId}"></div>`);

        let hideDivSummary = $('<span class="hideSpan">--Toggle Summary of Analysis--</span>');
        hideDivSummary.on("click", function() {an.toggleVisibility(commentsDiv)});

        bookDiv.append(hideDivSummary);
        bookDiv.append(commentsDiv);

        let commentsDivO = $(`<div class="oshbC"></div>`);
        let commentsDivM = $(`<div class="mapmC"></div>`);
        let commentsDivMO = $(`<div id="commentsDivMO"></div>`);
        prependHide(commentsDivMO);
        logAndSpan(commentsDivMO,
                'Checking for verse-comments in OSHB and MAPM',
                'checkForTitle');

        commentsDivMO.append(commentsDivO);
        commentsDivMO.append(commentsDivM);
        commentsDiv.append(commentsDivMO);

        let commentKeys = Object.keys(myO.comment);
        commentKeys.forEach(k => {
            let keyDivO = $(`<div class="${k} commentKey oshb" source="oshb"></div>`);
            commentsDivO.append(keyDivO);
            commentsDiv[k + '-oshb'] = keyDivO;
            keyDivO.hide(); // display later if there are comments

            let keyDivM = $(`<div class="${k} commentKey mapm" source="mapm"></div>`);
            commentsDivM.append(keyDivM);
            commentsDiv[k + '-mapm'] = keyDivM;
            keyDivM.hide(); // display later if there are comments
        });
    }

    let anchorsDivId = `chapterAnchors${bookShortName}`;
    let anchorsDiv = $(`<div class="anchorsDiv" id="${anchorsDivId}"></div>`);
    bookDiv.append(anchorsDiv);
    anchorsDiv.html('Chapters: ');

    setupChapterSelect(bookShortName);

    let chosenChaptersOneI = myO.chosenChapters[bookShortName];
    if (chosenChaptersOneI) {
        for (let i=0; i<chosenChaptersOneI.length; i++) {
            emitChapter(bookDiv, bookShortName, chosenChaptersOneI[i], commentsDiv);
        }
    }

    if (commentsDiv) {
        compareCountsOshbMapm(bookShortName, bookFullName, commentsDiv);

        analyzeCatalogs(commentsDiv);

        commentsDiv.find('.commentKey').each(function () {
            let that = $(this);
            if (that.html()) {
                let hideSpan = $('<span class="hideSpan">--Click to Hide--</span>');
                that.prepend(hideSpan);
                hideSpan.on("click", function() {an.toggleVisibility(that)});

                let sourceFlavor = that.attr("source");
                if (sourceFlavor) {
                    let sourceSpan = getSourceSpan(sourceFlavor);
                    that.prepend(sourceSpan);
                    sourceSpan.on("click", function() {an.toggleVisibility(that)});
                }
            }
        });
    }
}
function setupChapterSelect(bookShName) {
    let target = $(`#chaps_${bookShName}`);

    if ( ! myO.chosenChapters[bookShName]) {
        myO.chosenChapters[bookShName] = [];
    }

    target.empty(); // clean slate
    //$(`.anchorsDiv`).remove();

    let numChapters = myO.booksMetadata[bookShName].chapsPerBook;

    let chapterSelect = $('<select class="chapter-select mt-4" multiple></select>');
    let allButton = $('<button class="rounders absoluteTop small">All</button>');
    target.append(allButton);
    target.append(chapterSelect);

    allButton.on('click', function() {
        chapterSelect.find('option').attr('selected', true);
        chapterSelect.change();
        });

    for (let i=0; i<numChapters; i++) {
        let chapNumOneI = i+1;
        let selected = (myO.chosenChapters[bookShName].includes(String(chapNumOneI)) ? 'selected="selected"' : "");

        let option = $(`<option ${selected} value="${chapNumOneI}">${bookShName}:${chapNumOneI}</option>`);

        chapterSelect.append(option);
        option.on('contextmenu', function (e) {
            if (e.shiftKey || e.altKey || e.metaKey || e.ctrlKey) {
                e.preventDefault();
                e.stopPropagation();
                if ($(e.target).attr('selected')) {
                    let verseDropdowns = $('#verseDropdowns');
                    let vdId = `${bookShName}${chapNumOneI}`;
                    let vdDiv = $(`#${vdId}`);
                    if (vdDiv.length == 0) {
                        vdDiv = setupVerseDropdown(bookShName,chapNumOneI);
                        verseDropdowns.append(vdDiv);
                        vdDiv.hide(); // so that initial toggle shows it
                    }
                    if (vdDiv.is(":visible")) { // if hiding, revert to 'all verses'
                        vdDiv.find('option').prop('selected', true);
                        vdDiv.find('select').change();
                    }
                    an.toggleVisibility(vdDiv);
                }
            }
        });
    }

    chapterSelect.on("change", function() {
        let chaps = $(this).val();
        if (chaps.length == 0) {
            myO.chosenChapters[bookShName] = ['1']; // need at least 1
        }
        else {
            myO.chosenChapters[bookShName] = $(this).val();
        }
        pruneDropdownsForChapter(bookShName);
        loadSelectedBooksOrChapter(myO.loadedBookNames, false);
    });
}
function setupVerseDropdown(bookShName, chapNumOneI) {
    let chapNumZeroI = chapNumOneI-1;
    let vdDiv = $(`<div style="display:inline-block" 
                    class="verses ${bookShName} ${chapNumOneI}" 
                    id="${bookShName}${chapNumOneI}"></div>`);

    let numVerses = myO.loadedTexts.mapm[bookShName].chapters[chapNumZeroI].verses.length;

    if ( ! myO.chosenChapterVerses[bookShName]) {
        myO.chosenChapterVerses[bookShName] = new Map();
        myO.chosenChapterVerses[bookShName].set('cache', new Map());
    }
    myO.chosenChapterVerses[bookShName].set(chapNumOneI, []);
    myO.chosenChapterVerses[bookShName].get('cache').set(chapNumOneI, []);

    let buttonDiv = $('<div class="versesSelectButtonDiv"></div>');
    let verseSelect = $('<select class="chapter-select mt-4" multiple></select>');
    vdDiv.append(buttonDiv);
    vdDiv.append(verseSelect);
    vdDiv.append($('<div class="bold">Verse(s)</div>'));

    let allButton = $('<button class="rounders absoluteTop small">All</button>');

    buttonDiv.append(allButton);

    allButton.on('click', function() {
        verseSelect.find('option').prop('selected', true);
        verseSelect.change();
    });

    for (let i=0; i<numVerses; i++) {
        let verseNumOneI = i+1;
        let selected = (myO.chosenChapterVerses[bookShName].get(chapNumOneI).includes(String(verseNumOneI)) ? 'selected="selected"' : "");

        let option = $(`<option ${selected} selected='selected' value="${verseNumOneI}">${bookShName}:${chapNumOneI}.${verseNumOneI}</option>`);

        verseSelect.append(option);
    }

    verseSelect.on("change", function() {
        let that = $(this);
        let verses = that.val();
        if (verses.length == 0) {
            verses = ['1']; // need at least 1
        }
        that.find('option').prop('selected', false);
        for (let verse of verses) {
            that.find(`option[value ="${verse}"]`).prop('selected', true);
        }
        myO.chosenChapterVerses[bookShName].set(chapNumOneI, verses);
        myO.chosenChapterVerses[bookShName].get('cache').set(chapNumOneI, verses);
        loadSelectedBooksOrChapter(myO.loadedBookNames, false);
    });
    return vdDiv;
}
function getChosenOrAllChapterVerses(book, chapNumOneI, source, cacheOnly) {
    let chapNumZeroI = chapNumOneI - 1;
    let result = myO.loadedTexts[source][book].chapters[chapNumZeroI].verses;

    if (myO.chosenChapterVerses[book]) {
        let numberChapNumOneI = Number(chapNumOneI);
        if (cacheOnly) {
            let verseNums = myO.chosenChapterVerses[book].get('cache').get(numberChapNumOneI);
            result = verseNums.map(vNumOneI => myO.loadedTexts[source][book].chapters[chapNumZeroI].verses[vNumOneI - 1]);
        }
        else {
            let verseNums = myO.chosenChapterVerses[book].get(numberChapNumOneI);
            // it has verses... AND it is visible / pertinent
            if (verseNums && $(`#${book}${chapNumOneI}`).is(":visible")) {
                result = verseNums.map(vNumOneI => myO.loadedTexts[source][book].chapters[chapNumZeroI].verses[vNumOneI - 1]);
            }
        }
    }
    return result;
}
function getChosenBookVerses(book, source) {
    let result = [];

    for (let chapNumOneI of myO.chosenChapters[book]) {
        let vals = getChosenOrAllChapterVerses(book, chapNumOneI, source);
        result = result.concat(vals);
    }
    return result;
}
function pruneDropdownsForChapter(bookShName) {
    let numChapters = myO.loadedTexts.mapm[bookShName].chapters.length;
    let selectedChaps = myO.chosenChapters[bookShName];

    for (let i = 0; i < numChapters; i++) {
        let chapNumOneI = i + 1;
        let vDropId = `${bookShName}${chapNumOneI}`;
        if (!selectedChaps.includes(String(chapNumOneI))) {
            $(`#${vDropId}`).hide();
        }
        else {
            $(`#${vDropId}`).show(); // if it exists
        }
    }
}
function emitChapter(bookDiv, bookShortName, chapNumOneI, commentsDiv) {
    let chapterTitle = 'Chapter ' + chapNumOneI;

    let id = `anchor-${bookShortName}${chapterTitle.replace(/\s+/g, "_")}`;
    let anchorsId = `chapterAnchors${bookShortName}`;
    let chapterTitleH2 = $(`<h2 id="${id}"> === ${chapterTitle} === </h2>`);

    bookDiv.append(chapterTitleH2);

    setupForwardReference(id, chapterTitle.replace("Chapter ", ""), anchorsId);

    let oshbVerses = getChosenOrAllChapterVerses(bookShortName, chapNumOneI, 'oshb');
    let mapmVerses = getChosenOrAllChapterVerses(bookShortName, chapNumOneI, 'mapm');

    for (let i=0; i< max(oshbVerses.length, mapmVerses.length); i++) {
        let oVerse = (i<oshbVerses.length) ? oshbVerses[i] : "";
        let mVerse = (i<mapmVerses.length) ? mapmVerses[i] : "";

        let verseForInfo = mVerse ? mVerse : oVerse;
        let title = verseForInfo.title;
        let sefariaAnchorOuterHtml = getSefariaAncherOuter(title, "bi");

        let interlinearRef = makeLinearLink(title);

        let verseTitleField = $(`<div></div>`)
            .append(`<a id="${osIdToTitle(title)}"></a>`)
            .append(`<span class="bigg"> ${title}</span>`)
            .append(getOshbAnchor(title))
            .append(`<span> ${sefariaAnchorOuterHtml}</span>`)
            .append(`<span> (${interlinearRef[0].outerHTML})</span>`);
        bookDiv.append(verseTitleField);

        if (oVerse) emitOshbVerse(oVerse, bookDiv, commentsDiv);
        if (mVerse) emitMapmVerse(mVerse, bookDiv, commentsDiv);
        if (myO.useOshb && myO.useMapm) bookDiv.append($('<hr/>'));
    }
}

function emitOshbVerse(verseInfo, bookDiv, commentsDiv) {
    if (!myO.useOshb || !verseInfo) return;

    let verseDiv = assembleOshbVerseDiv(verseInfo, false, commentsDiv);
    verseDiv.prepend(getSourceSpan('  oshb  '));
    bookDiv.append(verseDiv);

}

function assembleOshbVerseDiv(verseInfo, skipAnnotations, commentsDiv, prefix) {
    if (!prefix) {
        prefix = "";
    }
    else {
        prefix = `<span> (${prefix})</span>`;
    }

    let doAnnotate = ! skipAnnotations;

    let title = verseInfo.title;

    let wordTuples = verseInfo.wordTuples;

    let numWords = wordTuples.length;
    let verseDiv = $(`<div direction="rtl" class="rtlVerse" id="${title}-oshb">${prefix}</div>`);

    for (let i = 0; i < numWords; i++) {

        let wordTuple = wordTuples[i];
        let word = wordTuple.word;
        let annotatedWord = handlePossibleAnnotations(doAnnotate, wordTuple, commentsDiv, title, word, "oshb");

        let separator = "&nbsp; ";
        let wordSpan = $(`<span dir="ltr" class="hebrewLook">${annotatedWord}${separator}</span>`);

        verseDiv.append(wordSpan);
    }
    return verseDiv;
}
function getSourceSpan(source) {
    return $(`<span class="hideSpan"> -${source}- </span>`);
}
function emitMapmVerse(verseInfo, bookDiv, commentsDiv) {
    if (!myO.useMapm || !verseInfo) return;

    let verseDiv = assembleMapmVerseDiv(verseInfo, false, commentsDiv);
    verseDiv.prepend(getSourceSpan(' mapm '));
    bookDiv.append(verseDiv);
}
function assembleMapmVerseDiv(verseInfo, skipAnnotations, commentsDiv, prefix) {
    if (!prefix) {
        prefix = "";
    }
    else {
        prefix = `<span> (${prefix})</span>`;
    }

    let doAnnotate = ! skipAnnotations;

    let title = verseInfo.title;
    let wordTuples = verseInfo.wordTuples;

    let numWords = wordTuples.length;
    let verseDiv = $(`<div direction="rtl" class="titleMapm rtlVerse" id="${title}-mapm">${prefix}</div>`);

    for (let i = 0; i < numWords; i++) {

        let wordTuple = wordTuples[i];
        let word = wordTuple.word;
        let annotatedWord = handlePossibleAnnotations(doAnnotate, wordTuple, commentsDiv, title, word, "mapm");

        let separator = "&nbsp; ";
        let wordSpan = $(`<span dir="ltr" class="hebrewLook">${annotatedWord}${separator}</span>`);

        verseDiv.append(wordSpan);
    }
    return verseDiv;
}
function handlePossibleAnnotations(annotate, wordTuple, commentsDiv, title, word, oshbOrMapm) {
    let annotations = [];
    let comments = wordTuple.comment;

    if (annotate && myO.showTrup) annotations.push(wordTuple.trup);
    if (annotate && myO.showUnicode) annotations.push(wordTuple.unicode);
    if (annotate && myO.showStrong && wordTuple.strongs) annotations.push(wordTuple.strongs); // mapm doesn't have strongs

    if (commentsDiv && comments && comments.length > 0 && myO.showComments) {
        for (let i=0; i<comments.length; i++) {
            let comment = comments[i]
            let keyDiv = commentsDiv[comment.name + '-' + oshbOrMapm];
            let verseSpan = `<span dir="ltr" title="${comment.blurb}" class="${comment.klass}">${comment.name}</span>`;
            let refSpan = `<span dir="ltr" title="${comment.blurb}" class="refSpan ${comment.klass}"> <a
                                class="${comment.klass}"href="#${title}-${oshbOrMapm}">[${title}: ${comment.name}] </a> </span>`;

            setupCommentReference(keyDiv, refSpan);
            annotations.push(verseSpan);
        }
    }
    let annotation = annotations.join(' . ');

    let annotatedWord = (annotations.length > 0) ? `${word}[<span class="word-annotations">${annotation}</span>]` : word;
    return annotatedWord;
}

function setupForwardReference(id, chapter, anchorsId) {
    let fwdReference = $(`<span><a class="tocAnchor" href="#${id}">${chapter}</a></span>`);
    $(`#${anchorsId}`).append(fwdReference);
}
function setupCommentReference(refDiv, commentRefSpan) {
    if (!refDiv) {
        console.log('where is my refdiv');
    }
    else {
        refDiv.show();
        refDiv.append(commentRefSpan).append($('<span> -- </span>'));
    }
}
function getOshbAnchor(osisID, content, klass) {
    let fields = unpackOsisId(osisID);
    if (!content) content = "";
    let classContent = klass ? `class=${klass}` : "";

    let book = fields[0];
    let chapter = fields[1];
    let verse = fields[2];

    let filledTemplate = myO.ohbUrlTemplate.replace('bbb', book)
        .replace('ccc', chapter).replace('vvv', verse);

    let a = $(`<span><span>${content}</span> <span><a title="OSHB" target="_blank" ${classContent} href="${filledTemplate}">(OSHB-parsed)</a></span></span>`);
    return a;
}
function getSefariaAncherOuter(osisID, lang, klass, noBookname) {
    if (!lang) lang = "bi";

    let classIs = klass ? `class="${klass}"` : "";

    let fields = unpackOsisId(osisID);

    let book = fields[0];
    let chapVerse = fields[1] + "." + fields[2];

    let sefariaBook = myO.booksMetadata[book].sefariaBookname;

    // try &with=MIQRA%20ACCORDING%20TO%20THE%20MASORAH&lang2=en
    let sefariaUrl = "https://www.sefaria.org/BOO.FOO?lang=BAR"
        .replace("BOO", sefariaBook)
        .replace("FOO", chapVerse)
        .replace("BAR", lang);

    let result1 = ` <a title="Sefaria" ${classIs} target="_blank" href="${sefariaUrl}">(Sefaria)</a>`;

    let miqraUrl = sefariaUrl; //.replace(lang, "he");
    let result2 = ` <a title="SefariaMiqra" ${classIs} target="_blank" href="${miqraUrl}&with=MIQRA%20ACCORDING%20TO%20THE%20MASORAH">(Miqra-Sefaria)</a>`;
    return result1 + result2;
}

function harvestStrongNumber(jElt) {
    let strongNumber = jElt.attr('lemma');
    if (strongNumber) {
        strongNumber = strongNumber.replace(/.*?(\d+).*/, "$1");
        if (!strongNumber.match(/\d/)) {
            strongNumber = "";
        }
    }

    let link = myO.biblehubStrongUrlTemplate.replace(/0000/, strongNumber);
    let anchor = `<a target="_blank" href="${link}">${strongNumber}</a>`;
    return anchor;
}
// https://stackoverflow.com/questions/6639770/how-do-i-get-the-unicode-hex-representation-of-a-symbol-out-of-the-html-using-ja
function symbolToUnicodeLiteral(sym) {
    let result = "\\u0" + sym.charCodeAt(0).toString(16).toUpperCase();
    return result;
}
function symbolWordToTaamUnicodes(symIn, keepMeteggef) {
    let result = "";
    let sym = extractTaamSymbol(symIn, keepMeteggef);

    for (let i=0; i<sym.length; i++) {
        let sym1 = sym[i];
        result += symbolToUnicodeLiteral(sym1);
    }
    return result;
}
function literalUnicodeCharsToSymbols(uChars) {
    let result = "";

    let charsArray = uChars.match(/\\u0\w\w\w/g);
    // if (!charsArray) {
    //     console.log(`============= Hey, could not symbol-ate [${uChars}]`);
    // }
    // else
        if (charsArray) {
        let symsArray = charsArray.map(ucode => String.fromCharCode(parseInt(ucode.substring(2), 16)))
        result = symsArray.join('');
    }
    return result;
}
// ElementMarkup.js plus \u200D
// Meteg is 05bd . Maqqef is 05be
function  extractTaamSymbol(word, keepMetegAndMaqqef) {

    let erasorRegex = keepMetegAndMaqqef ?
        /\u002F|[\u05AF-\u05BC]|\u05BF|[\u05C1-\u05C2]|[\u05C4-\u05F4]|\u200D/g :
        /\u002F|[\u05AF-\u05BE]|\u05BF|[\u05C1-\u05C2]|[\u05C4-\u05F4]|\u200D/g
    let result = word.replace(/\s+/g, "");

    result = result.replace(erasorRegex, "");

    return result;
}

