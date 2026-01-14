
let an = {};
an.synonyms = { prose: "The 21 'regular' books, such as Genesis and Jeremiah",
                poetic: "The 3 so-called 'EMeT' books: Job, Proverbs and Psalms"
}

function analyzeBoth() {
    showProgress(true, `Analyzing!`);

    $('#analysis-oshb').empty();
    $('#analysis-mapm').empty();
    $('#booksCovered').empty();
    $('.justChapter').empty();

    if (myO.loadedBookNames.length) {
        setTimeout(function() {
            let analysisDisplay = $('#analysis');
            analysisDisplay.empty();

            // figure that set of books does not depend on oshb vs mapm
            let shortnames = myO.loadedBookNames;
            let bookNamesString = shortnames.join(' , ');
            analysisDisplay.append($(`<div id="booksCovered" class="biggg">Book(s) covered in this analysis: ${bookNamesString}</div>`));
            for (let book of shortnames) {
                analysisDisplay.append($(`<div id="justChapter${book}" class="justChapter biggg">(${book}. Chapter(s) ${myO.chosenChapters[book].join(', ')})</div>`));
            }

            analysisDisplay.append($('<br/><br/>'));

            let displayOshb = $('<div id="analysis-oshb"></div>');
            let displayMapm = $('<div id="analysis-mapm"></div>');

            analysisDisplay.append(displayMapm);
            displayMapm.append($('<a class="big" href="#analysis-oshb">TO OSHB ANALYSIS</a>'));
            analysisDisplay.append(displayOshb);
            displayOshb.append($('<a class="big" href="#analysis-mapm">TO MAPM ANALYSIS</a>'));

            let toggleDetails = $('<button type="button" id="toggleAllDetails" style="display: none" title="Toggle Analysis Details">Toggle All Details (+/-) </button>');
            analysisDisplay.append(toggleDetails);

            analyze("mapm", displayMapm, shortnames);
            analyze("oshb", displayOshb, shortnames);

            window.onscroll = function () { scrollFunction() };
            $('#rtnBtnR').on("click", focusTop);

            toggleDetails.on("click", function() { an.toggleVisibility($('.accentContent')); });
            toggleDetails.click();
            toggleDetails.show();

        }, 100);
    }

    showProgress(false, `Analyzing!`);
}
function analyze(source, displaySource, shortNames) {

    an.trupCounts = {};
    an.trupTuples = {};
    an.trupComments = {};

    shortNames.forEach(shortName => {
        //let bookKey = `${source}-` + shortNames[0];
        for (let chap of myO.chosenChapters[shortName]) {
            //let verses = myO.loadedTexts[source][shortName].chapters[Number(chap) - 1].verses;
            let verses = getChosenOrAllChapterVerses(shortName, Number(chap), source, true);
            verses.forEach(verseInfo => {
                tallyVerseTrups(verseInfo, source);
            });
        }
    });

    displaySource.append(`<div class="bigg">
        Analysis for ${source.toUpperCase()} verses in covered chapters</div>`);
    dumpTrupCounts(displaySource, source);
}

function addHoverVerse(target, osisID) {
    let verseInfoO = findVerseInfo(osisID, "oshb");
    let verseInfoM = findVerseInfo(osisID, "mapm");

    let verseDivContainer = $('<div class="medium"></div>');
    if (verseInfoO) verseDivContainer.append(assembleOshbVerseDiv(verseInfoO, true, "", " from oshb XML "));
    if (verseInfoM) verseDivContainer.append(assembleMapmVerseDiv(verseInfoM, true, "", "from mapm XML"));

    let hoverDiv = $(`<div dir="rtl" style="display: none"><br/>${verseDivContainer[0].outerHTML}<br/></div>`);
    target.append(hoverDiv);
    target.on("mouseenter", function() { hoverDiv.show(); });
    target.on("mouseleave", function() { hoverDiv.hide(); });
}
function findVerseInfo(osisID, source) {
    let parts = unpackOsisId(osisID);
    let book = parts[0];
    let chapter = Number(parts[1]);
    let verse = Number(parts[2]);

    let result = myO.loadedTexts[source][book].chapters[chapter-1].verses[verse-1];
    return result;
}

function tallyTrupName(scope, countTrupNameEntry, combinedReferenceTuple) {
    let count = an.trupCounts[scope][countTrupNameEntry];
    if (count) {
        an.trupCounts[scope][countTrupNameEntry] = count + 1;
        an.trupTuples[scope][countTrupNameEntry].push(combinedReferenceTuple);
    } else {
        an.trupCounts[scope][countTrupNameEntry] = 1;
        an.trupTuples[scope][countTrupNameEntry] = [combinedReferenceTuple];
    }
}

async function gotoOsid(clickId) {
    await $('#pills-verses-tab').click();
    await $('#pills-verses').show();
    let targetId = `#${clickId}`;
    $(targetId)[0].scrollIntoView();
}
function osIdToTitle(osid) {
    return osid.replace(/[.]/g, "-");
}
function tallyVerseTrups (verseInfo, source) {

    verseInfo.wordTuples.forEach( tuple => {
        let scope = tuple.scope;
        let unicode = tuple.unicode;
        let trupName = tuple.trup;
        let osisID = tuple.osisID;
        let comments = tuple.comment ? tuple.comment : [];
        let sefariaReference = getSefariaAncherOuter(osisID, "", "");

        let warning = "Click to go near this verse in the Verses tab";
        let idForClick = osIdToTitle(osisID);
        let combinedReferenceForTuple = $(`<div title="${warning}" class="big refToOsh">
                <a href="javascript:gotoOsid('${idForClick}')">${osisID}</a></div>`);

        let wordSpan = $(`<span> [${tuple.word}]</span>`);
        combinedReferenceForTuple.append(wordSpan);

        let commentNames = comments.map(c => `<span class="${c.klass}">${c.name}</span>`).join(" ");
        if (commentNames) commentNames = ` (${commentNames})`;
        let commentSpan = $(`<span> [${source}] ${commentNames}</span>`);
        combinedReferenceForTuple.append(commentSpan);

        let sefariaSpan = $(`<span>[ ${sefariaReference} </span>`);

        combinedReferenceForTuple.append(sefariaSpan);

        let interlinearRef = makeLinearLink(osisID);
        let interlinearSpan = $(`<span> (${interlinearRef[0].outerHTML}) ]</span>`);
        combinedReferenceForTuple.append(interlinearSpan);

        let commentLines = $('<div dir="rtl" style="display:none"></div>');
        combinedReferenceForTuple.append(commentLines);
        if (comments.length > 0) {
            comments.forEach(c => commentLines.append(`<div><span class="${c.klass}">
                    --- ${c.name}: ${c.blurb} ---</span></div>`))
        }
        addHoverVerse(combinedReferenceForTuple, osisID);

        combinedReferenceForTuple.on("mouseenter", function(e) {
            wordSpan.addClass("biggg");
            commentLines.show();
        });
        combinedReferenceForTuple.on("mouseleave", function(e) {
            wordSpan.removeClass("biggg");
            commentLines.hide();
        });

        if (!an.trupCounts[scope]) {
            an.trupCounts[scope] = {};
            an.trupTuples[scope] = {}; // they travel in triples
            an.trupComments[scope] = {};
        }

        let trupPlusUni = `${trupName} . ${unicode}`;
        tallyTrupName(scope, trupPlusUni, combinedReferenceForTuple);

        if (!an.trupComments[scope][trupPlusUni]) an.trupComments[scope][trupPlusUni] = [];
        if (comments) {
            an.trupComments[scope][trupPlusUni] = unicat(an.trupComments[scope][trupPlusUni], comments);
        }
    });
}

function myIndexOf(myArray, element) {
    let result = -1;
    for (let i=0; i<myArray.length; i++) {
        if (myArray[i] === element) {
            result = myArray[i];
            break;
        }
    }
    return result;
}

function dumpTrupCounts(analysisDisplay, source) {
    dumpTrupCountsHelper("poetic", analysisDisplay, source);
    dumpTrupCountsHelper("prose", analysisDisplay, source);
}

function setupUsedAndUns(analysisDisplay, scope) {
    analysisDisplay.append($('<hr>'));
    analysisDisplay.append($('<hr>'));
    let usedHeader = $(`<div><h2> Used (${scope}) T'amim (Toggle +/-)</h2></div>`);
    analysisDisplay.append(usedHeader);
    let usedDiv = $(`<div id="usedDiv-${scope}"></div>`);
    analysisDisplay.append(usedDiv);
    usedHeader.on("click", function () {
        an.toggleVisibility(usedDiv);
    });

    let unusedHeader = $(`<div><hr/><h2>Unused (${scope}) T'amim (Toggle +/-)</h2></div>`);
    let unusedDiv = $(`<div id="unusedDiv-${scope}"></div>`);
    analysisDisplay.append(unusedHeader);
    analysisDisplay.append(unusedDiv);
    unusedHeader.on("click", function () {
        an.toggleVisibility(unusedDiv);
    });

    unusedDiv.append($('<hr>'));
    unusedDiv.append($('<hr>'));
    return {usedDiv, unusedDiv};
}

function dumpTrupCountsHelper(scope, analysisDisplay, source) {
    let counters = {};
    counters[scope] = 0;

    if (!an.trupCounts[scope]) {
        analysisDisplay.append($(`<h2>No t'amim with scope: ${scope} (${an.synonyms[scope]})</h2>`));
        return;
    }
    else {
        analysisDisplay.append($(`<h2>T'amim with scope: ${scope} (${an.synonyms[scope]})</h2>`));
    }

    let { usedDiv, unusedDiv } = setupUsedAndUns(analysisDisplay, scope);
    let unused = [];

    let foundEntries = Object.keys(an.trupCounts[scope]).sort();

    foundEntries.forEach(trupEntry => {
        let klass = "";
        let blurb = "";
        let moreComments = "";

        let comments = uniq(  an.trupComments[scope][trupEntry]);
        console.log('comments for ' + trupEntry, comments)
        if (comments.length > 0) {
            moreComments = " ( " + comments.map(n => `<span class="${n.klass}">${n.name}</span>`)
                .join(' ') + ")";
        }

        let accentTitleDiv = $(`<div>[${trupEntry}] (+/-) ${moreComments} </div>`);

        let overallAccentDiv = $(`<div></div>`);
        usedDiv.append(overallAccentDiv);

        overallAccentDiv.append($('<hr>'));
        overallAccentDiv.append(accentTitleDiv);

        let accentContentDiv = $(`<div class="ms1 accentContent"></div>`);
        let countDiv = $(`<div> Count: ${an.trupCounts[scope][trupEntry]}</div>`);
        let overallVersesDiv = $(`<div class="ms1"> Verses: <br/></div>`);

        overallAccentDiv.append(accentContentDiv);
        accentContentDiv.append(countDiv);
        accentContentDiv.append(overallVersesDiv);

        let bookName = "";
        let bookVersesDiv;

        let trupTuples = an.trupTuples[scope][trupEntry];
        for (let i=0; i<trupTuples.length; i++) {
            let trupTuple = trupTuples[i];
            let osisID = trupTuple[0].innerText.replace(/(\w+\.[0-9]+\.[0-9]+).*/, "$1"); // content up to the span
            let tupleBook = osisID.split('.')[0];
            if (tupleBook != bookName) {
                bookName = tupleBook;
                counters[scope] = counters[scope] + 1;
                let count = counters[scope];
                // console.log(`bookName is now: ${bookName}. counter is ${count}`);

                let divId = `d-${scope}${count}`;
                bookVersesDiv = $(`<div id="${divId}" class="ms2 accentContent"></div>`);

                let bookNameSubtitleButton = $(`<button>-----------${bookName} (+/-) -----------</button>`);
                bookNameSubtitleButton.on("click", function() {
                    console.log(`toggle id="${divId}`);
                    let div = $(`#${divId}`);
                    an.toggleVisibility(div);
                });

                overallVersesDiv.append(bookNameSubtitleButton).append($('<br/>'));
                overallVersesDiv.append(bookVersesDiv);
            }
            bookVersesDiv.append(trupTuple);
        }

        accentTitleDiv.on("click", function() {
            an.toggleVisibility(accentContentDiv);
            if (accentContentDiv.is(":visible")) {
                accentContentDiv.find('.accentContent').show();
            }
        });

        if (accentContentDiv.find('.verseClass').length > 0) {
            accentTitleDiv.append($('<span class="specialComment"> (Some/all words have special comments)</span>'));
        }
    });

    let catalogEntries = [];
    [misc.conjunctive, misc.disjunctive].forEach(division => {
        let shortScope = scope == "poetic" ? "3" : "21";
        let shortDiv = division == misc.conjunctive ? "c" : "d";

        let catalogDivisionEntries = Object.keys(accentCatalog[scope][division])
            .map(symbolKey => {
                // that extra MAPM atnach-hafukh has no entry!
                let result = `${symbolWordToTaamUnicodes(symbolKey)} / ${symbolKey} has no entry`;

                if (accentCatalog[scope][division][symbolKey]) {
                    let catalogTrupName = accentCatalog[scope][division][symbolKey].name + `-${shortScope}${shortDiv}`;
                    catalogTrupName = cleanupTrupname(catalogTrupName);
                    let unicode = symbolWordToTaamUnicodes(symbolKey);
                    result = `${catalogTrupName} . ${unicode}`;
                }
                return result;
            });
        catalogEntries = catalogEntries.concat(catalogDivisionEntries);
    });
    catalogEntries = catalogEntries.sort();
    console.log(`available entries for ${scope}: `, catalogEntries);

    // https://stackoverflow.com/questions/5767325/how-can-i-remove-a-specific-item-from-an-array-in-javascript
    foundEntries.forEach(entry => {
        catalogEntries = catalogEntries.filter(catEntry => catEntry !== entry);

        // should really be gone now
        let index = myIndexOf(catalogEntries, entry);
        if (index != -1) {
            console.log(`------------Hey, [${entry}] is still there after being 'removed' from set of entries!`);
        }
    });

    unused = catalogEntries; // the leftovers

    unused = uniq(unused);
    unusedDiv.append($(`<div>${unused.sort().join(' <br/> ')}</div></div>`));
}

an.toggleVisibility = (togglers, absolute) => {
    console.log("---toggleVisibility: ", togglers);

    if ( ! absolute === undefined) {
        if (!absolute) {
            togglers.hide();
        }
        else {
            togglers.show();
        }
    }
    else if (togglers.is(":visible")) {
        togglers.hide();
    }
    else {
        togglers.show();
    }
}
