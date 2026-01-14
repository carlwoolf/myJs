
////////////// re functions //////////////////////
let re = {};
re.subLast = (from, to, target) => {
    let result = target.split("").reverse().join("").replace(from, to).split("").reverse().join("");
    return result;
}
re.subFirst = (from, to, target) =>  {
    let result = target.replace(from, to);
    return result;
}
re.outerParens = (target)  => {
    target = re.subFirst(":","(", target);
    target = re.subLast(":",")", target);
    return target;
}
re.oneGroup = (target) =>  {
    target = re.outerParens(target);
    target = target.replaceAll(":", "");
    return target;
}
re.simpleOneIfy = (target) => {
    let result = "(" + target + ")";
    return result;
}
re.separateGroups = (target) =>  {
    target = re.outerParens(target);
    target = target.replaceAll(":", ")(");
    return target;
}
re.noGroups = (target)  => {
    target = target.replaceAll(":", "");
    return target;
}
re.orGroup = (items) =>  {
    return "(?:" + items.join(")|(?:") + ")";
}

////////// lexing functions //////////////////
let lx = {};
lx.RE_AT_P = "@[+]";
lx.RE_AT_M = "@-";
lx.RE_AT_AT = "@@";
lx.RE_UN_DOT = "o";
lx.RE_GT = ">";
lx.RE_LT = "<";
lx.RE_ANGLE = "[<>]";
lx.RE_DOT = "[o.]";

lx.dotStateReSt = `:${lx.RE_DOT}|${lx.RE_UN_DOT}:`;
lx.dotStateRe = new RegExp(re.oneGroup(lx.dotStateReSt));

lx.octStateReSt = `:${lx.RE_AT_P}|${lx.RE_AT_M}|${lx.RE_AT_AT}:`;
lx.octStateRe = new RegExp(re.oneGroup(lx.octStateReSt));

lx.RE_NOTE_ONE_SHIFTS = "[-+]*";
lx.RE_NOTE_ACCIDENTS = "[_^=]?"; // at most one for now
lx.RE_NOTE_DIGIT = "[0-9]"; // use z only in abc
lx.RE_NOTE_TICKS = "[',]*";
lx.RE_NOTE_SOME_TICKS = "[',]+";
lx.RE_NOTE_SOME_TICK_DURS = "[a-h/',]+";
lx.RE_NOTE_DURATION = "[a-h/]";
lx.RE_NOTE_DURATIONS = "[a-h/]*";
lx.RE_REP_SOME_TICKS = "(?<!\d)'+";
lx.RE_SOME_PARENS = "[()]+"
lx.RE_BARS = "\\|+";
lx.RE_ENDING_VARIANT_OR_CHORD_BAR = "\\[|\\||\\]";
lx.RE_DUR_F2_ENDING_VARIANT_OR_CHORD = `(?<=${lx.RE_ENDING_VARIANT_OR_CHORD_BAR})([a-h,]+)`;

lx.reNoSlashB4Re = /(?<!\\)/;

lx.noteRawNoDurationSt =
                `${lx.RE_NOTE_ONE_SHIFTS}${lx.RE_NOTE_ACCIDENTS}${lx.RE_NOTE_DIGIT}(?:(?:${lx.RE_NOTE_SOME_TICKS}(?!${lx.RE_NOTE_DURATION}))|(?!${lx.RE_NOTE_SOME_TICK_DURS}))`
lx.noteReSt =
    `:${lx.RE_NOTE_ONE_SHIFTS}:${lx.RE_NOTE_ACCIDENTS}:${lx.RE_NOTE_DIGIT}:${lx.RE_NOTE_TICKS}:${lx.RE_NOTE_DURATIONS}:`
lx.noteWithoutDurationReSt =
    `:${lx.RE_NOTE_ONE_SHIFTS}:${lx.RE_NOTE_ACCIDENTS}:${lx.RE_NOTE_DIGIT}:${lx.RE_NOTE_TICKS}:`

lx.endingVariantBarRe = new RegExp(lx.RE_ENDING_VARIANT_OR_CHORD_BAR, "g");
lx.durF2endingVariantRe = new RegExp(lx.RE_DUR_F2_ENDING_VARIANT_OR_CHORD, "g");

lx.noteDurationReG = new RegExp(lx.RE_NOTE_DURATION, "g");
lx.noteDurationsRe = new RegExp(lx.RE_NOTE_DURATIONS);
lx.noteRe = new RegExp(re.oneGroup(lx.noteReSt));
lx.noteReG = new RegExp(re.oneGroup(lx.noteReSt), "g");
lx.noteWithoutDurationReG = new RegExp(re.oneGroup(lx.noteWithoutDurationReSt), "g");
lx.noteNoDurationRe = new RegExp(`(${lx.noteRawNoDurationSt})`);
lx.noteNoDurationReG = new RegExp(`(${lx.noteRawNoDurationSt})`, "g");
lx.notesWithParts = new RegExp(re.separateGroups(lx.noteReSt), "g");
lx.noteOrTicksOrStateRe = new RegExp(re.orGroup([
    re.oneGroup(lx.octStateReSt),
    lx.RE_REP_SOME_TICKS,
    re.noGroups(lx.noteReSt)]), "g");
lx.groupNoteOrTicksOrOctStateRe = new RegExp(re.simpleOneIfy(re.orGroup([
    re.noGroups(lx.octStateReSt),
    lx.RE_REP_SOME_TICKS,
    re.noGroups(lx.noteReSt)]), "g"));
lx.groupNoteOrDotStateRe = new RegExp(re.simpleOneIfy(re.orGroup([
    re.noGroups(lx.dotStateReSt),
    re.noGroups(lx.noteReSt)]), "g"));
lx.noteOrTicksOrStateReWithParts = new RegExp(re.orGroup([
    re.oneGroup(lx.octStateReSt),
    lx.RE_REP_SOME_TICKS,
    re.separateGroups(lx.noteReSt)]), "g");

lx.noteOrBarReGpG = new RegExp(`(${lx.RE_NOTE_DIGIT}|${lx.RE_BARS})`, "g");

lx.noteNoDurOrAngleOrParenSt = `${lx.RE_SOME_PARENS}|${`(${lx.noteRawNoDurationSt})`}|${lx.RE_GT}|${lx.RE_LT}`;
lx.noteNoDurOrAngleOrParenRe = new RegExp(lx.noteNoDurOrAngleOrParenSt, "g");

// quotes are pass through unless they begin with i-vii (chords)
lx.RE_ROMAN = "[ivIV]*";
lx.RE_QUOTE = `(?<!\\\\)"`;
lx.RE_BANG = `(?<!\\\\)!`;
lx.RE_QUOTE_BODY = ".*?";
lx.quoteReSt = `:${lx.RE_QUOTE}:${lx.RE_ROMAN}:${lx.RE_QUOTE_BODY}:${lx.RE_QUOTE}:`;
lx.quoteReG = new RegExp(re.oneGroup(lx.quoteReSt), "g");

lx.nonMiscReSt = `:${lx.octStateReSt}|${lx.noteReSt}|${lx.quoteReSt}:`;
lx.nonMiscRe = new RegExp(re.oneGroup(lx.nonMiscReSt));

lx.spaceOrQuoteMarkerSt = `((\\s|[\u0001])+)`;
lx.spaceOrQuoteMarkerReG = new RegExp(lx.spaceOrQuoteMarkerSt, "g");
lx.quotationOrCourtesySt = `((?:${lx.RE_QUOTE}.*?${lx.RE_QUOTE})|(?:${lx.RE_BANG}.*?${lx.RE_BANG}))+`;
lx.quotationOrCourtesyRe = new RegExp(lx.quotationOrCourtesySt);
lx.tickSlurRe = new RegExp('(' +
    /(?<![(])/.source +
    lx.noteRe.source +
    lx.spaceOrQuoteMarkerReG.source +
    "'" +
    lx.noteDurationsRe.source +
    /(?![)])/.source +
    ')', "g");


////////// misc functions //////////////////
let msc = {};

msc.makeToneFrom123 = (tuplay, theNoteIndex, rainColumn) => {
    if (rainColumn) theNoteIndex = rainColumn;

    let num = tuplay.num;
    let duration = tuplay.duration.replace(/[a-h]/g, abcFrom123.dursAbcTo123);


    // no courtesy or equality when it's time for tones
    let abcNote = tuplay.letterForPlaying.replace("=", ""); // natural is assumed
    abcNote = abcNote.replace(/.courtesy./, "");

    let tone;

    let fractionDuration = msc.durationToFraction(duration);

    highlightLegend(num, theNoteIndex);

    if (abcNote.includes('z')) {
        tone = new Tone(1, fractionDuration, true)
    }
    else {
        let abcNoteIndex = indexAbc[abcNote];
        tone = new Tone(frequencies[abcNoteIndex], fractionDuration);
    }
    return tone;
}
msc.durationToFraction = (duration) => {
    let result;

    let pureSlashMatch = duration.match(/^\/+$/);
    if (pureSlashMatch) {
        let power = pureSlashMatch[0].length;
        result = 1.0 / 2 ** power;
    }
    else if (!duration) {
        result = 1;
    }
    else {
        if (duration.match(/\/$/)) duration = duration + '1'; // denominator
        result = eval(duration);
    }

    return result;
}

//// yikes /////// https://stackoverflow.com/questions/499126/jquery-set-cursor-position-in-text-area ////
function setSelectionRange(input, selectionStart, selectionEnd) {
    if (input.setSelectionRange) {
        input.focus();
        input.setSelectionRange(selectionStart, selectionEnd);
    }
    else if (input.createTextRange) {
        var range = input.createTextRange();
        range.collapse(true);
        range.moveEnd('character', selectionEnd);
        range.moveStart('character', selectionStart);
        range.select();
    }
}
function setCaretToPos (input, pos) {
    setSelectionRange(input, pos, pos);
}

function canonicalKeyDisplay(keyDisplay) {
    keyDisplay = keyDisplay.replace(/_([^ \t])/, "$1" + "b");
    keyDisplay = keyDisplay.replace(/\^([^ \t])/, "$1" + "#");
    keyDisplay = keyDisplay.replace(/[\[\]]/g, "");
    keyDisplay = keyDisplay.replace("K:", "");
    return keyDisplay.trim();
}

function toggleVisibility(element) {
    if (element.is(":hidden")) {
        element.removeClass("d-none");
        element.show();
    }
    else {
        element.hide();
    }
}
function toggleDemoLine() {
    parseToAbc.showDemoLine = ! parseToAbc.showDemoLine;
    $('#_123Entry').change();
}
function toggleStarLine() {
    parseToAbc.showStarLine = ! parseToAbc.showStarLine;
    $('#_123Entry').change();
}
function useExtraLyrics() {
    let extraLyricsText = $('#_123EntryLyrics').val();
    $('#ExtraLyricsDiv').hide();  // reduce confusion from recursive extras
    $('#_123Entry').val(extraLyricsText);
    $('#_123Entry').change();

}

function lyricsStuff() {
    /*******
            rawLyricsLine = sourLyrics.join(" ");
            splitLine = rawLyricsLine.split(lx.noteOrBarReGpG);
            let goodParts = [];
            for (let j = 0; j < splitLine.length; j++) {
                if (j % 2 == 1) {
                    let part = splitLine[j].replace(/[0-9]/g, "* ");
                    goodParts.push(part);
                }
            }
            lyricsLine = goodParts.join(" ").replace(/\|+/g, "|"); // one bar at a time


        let val = $('#_123EntryLyrics').val();
        let newVal = `${val}${line}\n`;
        if (lyricsLine) {
            let demoLine = line.replace(/:/g, "")   // simplify bars, no repeaty ones
                .replace(/\\"/g, '"')               // surface all quotes
                .replace(/"/g, '\"')                // and now escape them ("hey, wake up and go to sleep")
                .replace(/\s+/g, "~~");             // one 'word' per measure

            lyricsLine = parseToAbc.showStarLine ? `w: ${lyricsLine}\n` : "";
            demoLine = parseToAbc.showDemoLine ? `w: ${demoLine}\n` : "";
            newVal += `${lyricsLine}${demoLine}`;
        }
        $('#_123EntryLyrics').val(newVal);
}




     */
}