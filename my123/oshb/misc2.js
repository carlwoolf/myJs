
// use links to single verses like: https://biblehub.com/interlinear/genesis/1-17.htm

function unpackOsisId(osisID) {
    return osisID.split(".");
}
function makeLinearLink(osisID) {
    let [book, chapter, verse] = unpackOsisId(osisID);

    let oshbBook = myO.booksMetadata[book].interlinear;
    return $(`<a target="_blank" href="https://biblehub.com/interlinear/${oshbBook}/${chapter}-${verse}.htm">Interlinear+</a>`);
}
function verseRangeFor123(startId, numVerses) {

    let parts = startId.match(/(\w+).(\w+).(\w+)/);

    let book = parts[1];
    let chapter = parts[2]-1;
    let verse = parts[3]-1;

    let mapmBase = myO.texts.mapm;
    let numChapters = mapmBase[`mapm-${book}`].chapters.length;

    for (let countVerses=0,
             chapterInfo = mapmBase[`mapm-${book}`].chapters[`${Number(chapter)}`],
             numChapVerses = chapterInfo.verses.length;
         countVerses<numVerses;
         countVerses++) {

        let verseInfo = chapterInfo.verses[`${Number(verse)}`];
        console.log(verseInfo.title);

        if (verse < numChapVerses-1) {
            verse++;
        }
        else if (chapter < numChapters-1) {
            chapterInfo = mapmBase[`mapm-${book}`].chapters[`${Number(++chapter)}`];
            numChapVerses = chapterInfo.verses.length;
            verse = 0;
        }
        else {
            break;
        }
    }

    return ""; // for now
}
function macroNameToPrefix(name) {
    let dictionary = new Map();
    dictionary.set('penta', '5B');
    dictionary.set('ps'   , 'ps');
    dictionary.set('prov' , 'pr');
    dictionary.set('haft' , 'hf');
    dictionary.set('job'  , 'jb');
    dictionary.set('haft' , 'hf');

    let result = dictionary.get(name);
    return result;
}
function macroPrefixToScopeName(prefix) {
    let dictionary = new Map();
    dictionary.set('5B', 'penta');
    dictionary.set('ps', 'ps');
    dictionary.set('pr', 'prov');
    dictionary.set('hf', 'haft');
    dictionary.set('jb', 'job');
    dictionary.set('hf', 'haft');

    let result = dictionary.get(prefix);
    return result;
}
function getMacroPrefix(osisID) {
    let fields = unpackOsisId(osisID);
    switch (fields[0]) {
        case "Gen":
        case "Exod":
        case "Lev":
        case "Num":
        case "Deut":
            return "5B";
        case "Ps":
            return "ps";
        case "Prov":
            return "pr";
        case "Song":
        case "Ruth":
        case "Eccl":
            return "sh";
        case "Job":
            if (fields[1] < 3 || (fields[1] == 42 && fields[2] > 6) || osisID == "Job.3.1") {
                return "hf";
            } else {
                return "jb";
            }
        default:
            return "hf";
    }
}
function sortArrayOfPairsBy1st(array) {
    let theSortedArray = copyArray(array).sort((a,b) => {
        let aVal = a[0];
        let bVal = b[0];

        let result;
        if (aVal === bVal) {
            result = 0;
        }
        else {
            result = (aVal < bVal) ? -1 : 1;
        }
        return result;
    });
    return theSortedArray
}
function copyArray(origArray) {
    let result = origArray.map(x => x);
    return result;
}

function newColumnSpec(classes, value) {
    if (value === undefined) value = $('<span></span>');

    return {classes: classes, value: value};
}
function makeRowWithColumns(target, idLabel, columnSpecArray, rowClass) {
    if (!rowClass) {
        rowClass = "";
    }
    let row = $(`<div id="${idLabel}Row" class="row ${rowClass}"></div>`);
    target.append(row);

    for (let i = 0; i < columnSpecArray.length; i++) {
        let colSpec = columnSpecArray[i];
        let col = $(`<div class="${colSpec.classes}" id="${idLabel}Col${i}"></div>`);
        col.append(colSpec.value)
        row.append(col);
    }
    return row; // may be useful in caller
}

function recursivePropertyCount(obj, filter, result) {
    if (obj == null) {
        return;
    }
    else if (obj.constructor === Array) { // should be array
        for (let i = 0; i < obj.length; i++) {
            let recursiveItem = obj[i];
            recursivePropertyCount(recursiveItem, filter, result);
        }
    }
    else {
        let objectKeys = Object.keys(obj);
        for (let i = 0; i < objectKeys.length; i++) {
            let objectKey = objectKeys[i];
            if (objectKey == '0') continue;

            if (filter(objectKey, obj)) {
                //console.log(`..........found goal, ${objectKey}, in:`, obj);
                result.push(obj[objectKey]);
            }
            recursivePropertyCount(obj[objectKey], filter, result);
        }
    }
}

// ai: google: jquery place element in viewport
function ensureElementInViewport(element) {
    if ( ! element.length) return; // hidden rainbow

    // Get the element's bounding rectangle
    var rect = element[0].getBoundingClientRect();

    // Check if the element is outside the viewport
    if (rect.right > (window.innerWidth || document.documentElement.clientWidth)) {
        // Adjust the scroll
        let container = $('#rainbowTableDiv');
        let leftPos = container.scrollLeft();
        //console.log(leftPos);
        container.scrollLeft(leftPos + rect.right/2);
    }
}

// ai: jquery how to tell if svg is in viewport

function scrollIt(newTop) {
    if (!newTop) {
        let cursor = $('.abcjs-cursor');
        newTop = Number(cursor.attr("y1") * svgScale);
    }
    let container = $('.songScroll');
    container.scrollTop(newTop)
}

let showCoords = false;
let svgScale = 1.5;
function trackCoordsForSheet(e) {
    let trackingInfo = {};

    let container = $('.songScroll');
    let rect = container[0].getBoundingClientRect();
    let paper = $('#paper');

    let paperParentOffset = paper.parent().offset();
    let paperOffset = paper.offset();
    let paperY = paperOffset.top;

    let cursor = $('.abcjs-cursor');
    let bboxWidth = paper.find('svg')[0].getBBox().width;
    let clientWidth = paper.find('svg')[0].getBoundingClientRect().width;
    //console.log('Widths: ', bboxWidth, clientWidth);
    svgScale = clientWidth / bboxWidth;

    let containerHeight = container[0].clientHeight;
    let containerTop = container.offset().top;
    let cursorTopScaled = Number(cursor.attr("y1") * svgScale);
    let scrollTop = container.scrollTop();
    // let paperHeight = paper[0].clientHeight;
    // let relPaperParent = paperY - paperParentOffset.top;
    // let rectTop = rect.top;
    // let rectBot = rect.bottom;
    // let cursorDivY = (cursor.length) ? cursor.position().top - cursor.parent().position().top: "";
    // let cursorBot = Number(cursor.attr("y2"));

    trackingInfo.containerHeight = containerHeight;
    trackingInfo.containerTop = containerTop;
    trackingInfo.cursorTopScaled = cursorTopScaled;
    trackingInfo.scrollTop = scrollTop;
    trackingInfo.paperY = paperY;

    trackingInfo.newScrollTop = cursorTopScaled - 125;

    trackingInfo.isOut = cursorTopScaled >= scrollTop + (.7 * containerHeight)
                            || cursorTopScaled < scrollTop;

    if (e) {
        $('.buttonReport').html(`mouseYinPaper: ${e.pageY - paperY} mouseYinPage: ${e.pageY}`);
    }
    let report = JSON.stringify(trackingInfo).replace(/,/g, ", ");
    $('.buttonReport2').html(report);

    trackingInfo.container = container;
    return trackingInfo;
}
async function adjustSvgInViewport(override) {
    let rtn2 = $('#rtnBtn2');
    if (showCoords) {
        rtn2.show();
    }
    else {
        rtn2.hide();
    }

    await waitableTimeout(30);
    let trackingInfo = trackCoordsForSheet();
    let newTop = override;

    if (trackingInfo.isOut && !override) {
        // console.log("--------------You are OUT! cursor top " +
        //             trackingInfo.cursorTop +
        //                 " is bigger than scrollTop + containerHeight - 100 " +
        //                 String(trackingInfo.scrollTop + trackingInfo.containerHeight - 75));
        newTop =  trackingInfo.newScrollTop;
    }

    if (newTop) {
        trackingInfo.container.scrollTop(newTop);
        //console.log("--------------New scrollTop: " + newTop);
    }
}
function scrollFunction() {
    if (document.body.scrollTop > 250 || document.documentElement.scrollTop > 250) {
        $(".rtnBtn").show();
    } else {
        $(".rtnBtn").hide();
    }
    return true;
}
function focusTop() {
    $('body,html').animate({ scrollTop: 0 }, 300);
    $('#pills-about-tab').click();
    return true;
}
