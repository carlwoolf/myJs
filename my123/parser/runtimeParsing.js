
let util123 = { tuples: []};
let showThis = false;
let showAccumulator = true;
let star = 'x';
let starAccumulator;

function autoDeclared(keyString) {
    return `K:${keyString} %% "(auto-declared key: '${keyString}')"\n`;
}

function isSpecialElt(key, val, doStarLines, gather) {
    let emit = true;

    if (key == 'line') {
        state.octaveDelta = 0;
        state.starBasket = [];
        state.beginLine = true;
    }
    else if (key == 'rawInput') {
        emit = false;
    }
    else if (key == 'note') {
        emit = false; // visitor makes a custom emission here
        state.noteNum++;
        computeAndPushNote(val, gather);
        state.starBasket.push(star);
    }
    else if (key == 'inline') {
        emit = false;
        maybePrependCurrentKey(gather);
        handleKeyDirective(true, val.keyDirective, gather);
    }
    else if (key == 'metaKey') {
        emit = false;
        handleKeyDirective(false, val.keyDirective, gather);
    }
    else if (key == 'barBoundary') {
        util123.tuples.push(tupelize(val, 0, '', val, val));
        state.starBasket.push(val);
        state.recentShlatMap = new Map();
    }
    else if (key == 'miscMeta') {
        emit = false;
        accumulatorPush1(`${val}`, gather);
    }
    else if (key == 'mmacro') {
        emit = false;
        let newMode = handleKeyMod(val.prefix);
        if (newMode) {
            maybePrependCurrentKey(gather);
            tryKeyAdjust(`K:${newMode._123DisplayName}`);
            accumulatorPush1(`[K:${newMode.abcDisplayPhrase}]`, gather);
            state.justChangedKey = true;
        }
        let macroKey = `${val.prefix}-${val.mkey}`;
        if (val.colons.length > 1) {
            accumulatorPush1(`"[${macroKey}]"`, gather);
        }
        let macroNoteWords = macros.macroMap[macroKey];
        if (macroNoteWords) { // eg 'NoSym' can show up and be empty
            macroNoteWords = macroNoteWords.trim();
            let extra = val.extraNote;
            if (extra) {
                let extraNote = extra.note;
                macroNoteWords += extraNote.nShlat.shlat + extraNote.num + extraNote.nDur;
            }
            let parsedInput = _123parser.parse(macroNoteWords, {startRule: 'INPUT_LINE'});
            visit(parsedInput, "", doStarLines, gather);
            gather.pop(); // nuke the newline side-effect of startRule
        }
    }
    else if (key == 'L') {
        emit = false;
        let tweakValShort = `${val.numerator}/${val.denominator}`;
        let tweakVal = 'L:' + tweakValShort;
        accumulatorPush1(tweakVal, gather);
        accumulatorPush1(val.rest, gather);
        statUnitLength(tweakValShort);
    }
    else if (key == 'M') {
        emit = false;
        accumulatorPush1(`M:${val.numerator}/${val.denominator}`, gather);
        accumulatorPush1(val.rest, gather);
        statMeter(val);
    }
    else if (key == 'qpText') {
        emit = false;
        accumulatorPush1(`"<${val}" `, gather);
    }
    else if (key == 'qWord') {
        emit = false;
        accumulatorPush1(`"${val}" `, gather);
    }
    else if (key == 'qpNoteIsh') {
        emit = false;
        visit(val, "", doStarLines, gather);
    }
    else if (key == 'denominator') {
        emit = false;
    }
    else if (key == 'numerator') {
        emit = false;
    }
    else if (key == 'word') {
        accumulatorPush1(' ', gather); // before the recursions into it
        state.useThisDur = ""; // only noteWords can set it to non-empty
    }
    else if (key == 'tuple_word') {
        emit = false;

        // for 123 ==> abc, apply lettersToNumber()
        let result = "(" + tupleLettersToNumber(val.letters1);
        if (val.letters2) {
            result += ":" + tupleLettersToNumber(val.letters2);
        }
        if (val.letters3) {
            result += ":" + tupleLettersToNumber(val.letters3);
        }
        accumulatorPush1(result, gather);
    }
    else if (key == 'notesWord') {
        thisLine(new Error().stack);

        let notes = [];
        recursivePropertyCount(val, (x) => x == 'note', notes)

        let numNotes = notes.length;

        state.speedSlashes = 0;
        state.noteNum = 0;
        state.numNotes = numNotes;
        let durs = [];
        recursivePropertyCount(
            val,
            (key, obj) => (obj.nDur || key == 'shiftDur'),
            durs);
        let hasDurs = durs.length;

        if (state.allowAutoDuration) {
            if (state.numNotes == 1) {
                if (! hasDurs) {
                    state.useThisDur = state.solo; // lone note is a beat / quarter
                }
            }
        }
    }
    else if (key == 'chord') {
        emit = false;
        if (val.extraNote) {
            val.multi.push(val.extraNote);
            let xDur = val.extraNote.note.nDur;
            if (xDur) {
                val.multi[0].note.nDur = xDur;
            }
        }
        let abcChord = val.multi.map(n => {
            digestSugarOctaves(n.note);
            let [abcLetter, abcDuration, absoluteAbc] = assembleNoteWithAbc(n.note, gather);
            let abcNote = `${abcLetter}${abcDuration}`;
            return abcNote;
        });
        accumulatorPush1(`[${abcChord.join('')}]`, gather);
        if (val.nDur) {
            accumulatorPush1(durationToAbc(val.nDur), gather);
        }
    }
    else if (key == 'quoteChord') {
        emit = false;
        let abcChord;
        if (val.chord.roman) {
            let upperRoman = val.chord.roman.toUpperCase();
            let minor = (val.chord.roman != upperRoman);
            let num = upperRoman.replace(/[IV]+/, function(match) {
                if (match == 'I') return 1;
                else if (match == 'I')      return 1;
                else if (match == 'II')     return 2;
                else if (match == 'III')    return 3;
                else if (match == 'IV')     return 4;
                else if (match == 'V')      return 5;
                else if (match == 'VI')     return 6;
                else if (match == 'VII')    return 7;
            })
            abcChord = chordNumToAbc(num);
            if (minor) {
                val.postChord = 'm' + val.postChord;
            }
        }
        else {
            abcChord = chordNumToAbc(val.chord.arabic);
        }
        accumulatorPush1(`"${abcChord}${val.postChord}"`, gather);
    }
    else if (key == 'qWord') {
        emit = false;
        accumulatorPush1(`"${val}"`, gather);
    }
    else if (key == 'gtNotesWordDyn') {
        emit = false;
        maybeLongerShorterOrViceVers(val, true, gather);
    }
    else if (key == 'ltNotesWordDyn') {
        emit = false;
        maybeLongerShorterOrViceVers(val, false, gather);
    }
    else if (key == 'lgtNotesWord') {
        emit = false;
        emitLgtNote(val, gather);
    }

    else if (key == 'shiftDur') {
        emit = false;
        state.speedSlashes += val;
    }
    else if (key == 'octaveWord') {
        emit = false;

        if (val == 'octReset') {
            state.octaveDelta = 0;
        } // default: octReset
        else if (val == 'octUp') {
            state.octaveDelta += 1;
        }
        else if (val == 'octDown') {
            state.octaveDelta += -1;
            //printState("===== octv =====");
        }
    }
    else if (key == 'p_prefix') {
        emit = false;
        accumulatorPush1('"<[" ">]" ', gather);
    }
    else if (key == 'rest') {
        emit = false;
        accumulatorPush1(val, gather);
    }

    return emit;
}
function handleKeyDirective(inline, val, gather) {
    if (! state.beginLine) {
        accumulatorPush1(' ', gather);
    }
    else {
        state.beginLine = false; // for next time
    }

    let firstPart = val.content.replace(/ .*/, "");
    let rest = val.content.replace(firstPart, "");
    let valToAdjust = firstPart;
    let abcRest = '';

    if (rest) {
        let secondPart = rest.replace(/( \S+).*/, "$1");
        rest = rest.replace(secondPart, "");

        let abcModifier = modeModifiersToAbc.get(secondPart);
        if (abcModifier) {
            valToAdjust += secondPart;
        }
        else {
            abcRest = secondPart;
        }
    }
    abcRest += rest ? rest : '';

    let mode = tryKeyAdjust(valToAdjust);

    let abcModeDisplayPhrase = mode.abcDisplayPhrase;
    state.foundKey = true;
    state.justChangedKey = true;

    let abcDisplay = `K:${abcModeDisplayPhrase}${abcRest}`;
    if (inline) {
        abcDisplay = `[${abcDisplay}]`;
    }

    let rainbowDisplay = `K:${mode._123DisplayName}`;

    accumulatorPush1(`${abcDisplay} `, gather);
    util123.tuples.push(tupelize(rainbowDisplay, 0, '', rainbowDisplay, rainbowDisplay));
}
function thisLine(stack) {
    if (showThis) {
        let line = stack.replace(/Error.*\s*.*?js:(.*?)\)(\s|.)*/, "$1");
        console.log("==============> Line: ", line);
    }
}

function toggleVerbose() {
    showAccumulator = !showAccumulator;
}

async function runtimeParse() {
    thisLine(new Error().stack);
    await setup();
    await setup2('../');

    parseInput(songGram, songInput0, 'lines');

    $('#parseButton').on('click', parseFromInput);
    $('#reloadPrevious').on('click', reloadPrevious);
    $('#clearInput').on('click', clearInput);
    $('#toggleVerbose').on('click', toggleVerbose);
}

let _123parser;

let state;

function initState() {
    state = {};
    statMeter({numerator: '4', denominator: '4'});
    statUnitLength('1/8');
    state.recentShlatMap = new Map();
    state.justChangedKey = true;
}

function statMeter(val) {
    if (val.numerator % 3 == 0 && val.denominator == '8') {
        state.solo = 'c';
        state.longer = 'b'
        state.shorter = 'a';
    }
    else {
        state.solo = 'b';
        state.longer = 'c/b'
        state.shorter = 'a/';
    }
}
function statUnitLength(val) {
    state.allowAutoDuration = (val == '1/8');
}

function applyAbcIndexOctaveShifts(index, octaveShifts) {
    let absoluteShift = Math.abs(octaveShifts);
    let shiftUnit = octaveShifts / absoluteShift; // 1 or -1

    for (let i=0; i<absoluteShift; i++) {
        let candidate = index + (shiftUnit * halfStepsPerOctave);
        if (candidate < 0 || candidate >= notesAbc.length) {
            break;
        }
        index = candidate;
    }
    return index;
}

function noteToAbc(note) {

    let num = note.num;

    // canonical rest
    if (num == 'z') num = '0';

    let parsedNum = parseInt(num);
    if (! Number.isInteger(parsedNum)) {
        return note;
    }

    if (num == 0) {
        note.num = 'z';
        note.absoluteAbc = 'z';
    }
    else {
        let noteNoDurYesShlat = `${note.nShlat.shlat}${note.num}`;
        note.nShlat.shlat = ""; // built into 'num' soon
        [note.num, note.absoluteAbc] = noDur123toAbcScale(noteNoDurYesShlat, note.nPrimes);
        note.nPrimes = ""; // built into 'num' soon
    }

    note.nDur = durationToAbc(note.nDur);
    return note;
}
function durationToAbc(durString) {
    let dictionary = { "":"", '/':'/', a: '1', b: '2', c: '3', d: '4', e: '5', f: '6', g: '7', h: '8' };

    return (trViaDictionary(durString, dictionary));
}
function unPrimeAndPostPosShlat(chord) {
    chord = chord.replace("'", "");
    chord = chord
        .replace(/_(.)/, "$1♭")
        .replace(/=(.)/, "$1♮")
        .replace(/\^(.)/, "$1♯");
    return chord;
}
function chordNumToAbc(chord) {
    chord = numToLetterDefaultOctave(chord);
    chord = unPrimeAndPostPosShlat(chord);
    return chord;
}
// thanks: https://stackoverflow.com/questions/22624379/how-to-convert-letters-to-numbers-with-javascript
function tupleLettersToNumber(input){
    let dictionary = { A: '1', B: '2', C: '3', D: '4', E: '5', F: '6', G: '7', H: '8', I: '9', J: '0' };
    return (trViaDictionary(input.toUpperCase(), dictionary, '0'));
}
function trViaDictionary(input, dictionary, defaultVal) {
    let result = defaultVal;

    if(input.length == 1 && dictionary[input]) {
        result = dictionary[input];
    }
    else {
        let almost = input.split('').map(num => dictionary[num]).join('');
        // result = '{|' + almost + '|}';
        result = almost;
    }
    return result;
}
function maybeLongerShorterOrViceVers(val, longer1stVsShorter, gather) {
    let first = longer1stVsShorter ? 'longer' : 'shorter';
    let second = longer1stVsShorter ? 'shorter' : 'longer';

    if (state.allowAutoDuration) {
        let hasDurs =
            val.intery1.interN.note.nDur ||
            val.intery2.interN.note.nDur;
        if (!hasDurs) {
            val.intery1.interN.note.nDur =  state[first];
            val.intery2.interN.note.nDur =  state[second];
        }
    }
    emitIntery(val.intery1, gather);
    emitIntery(val.intery2, gather);
}
function emitLgtNote(val, gather) {
    if (state.allowAutoDuration) {
        let collect = [];
        recursivePropertyCount(val, (key, obj) =>
            key == 'nDur' && obj[key], collect);

        if (!collect.length) {
            val.intery1.interN.note.nDur =  '/';
            val.intery2.interN.note.nDur =  'a';
            val.intery3.interN.note.nDur =  '/';
        }
    }
    emitIntery(val.intery1, gather);
    emitIntery(val.intery2, gather);
    emitIntery(val.intery3, gather);
}
function emitIntery(intery, gather) {
    accumulatorPush1(intery.inter1.join(''), gather);
    computeAndPushNote(intery.interN.note, gather)
    accumulatorPush1(intery.inter2.join(''), gather);
}
function accumulatorPush1(val, gather) {
    accumulatorPush4(val, "", "", gather)
}
function accumulatorPush4(val, note, accIndex, gather) {
    let pushee = {val: val};
    if (note && typeof accIndex != undefined) {
        pushee.note = note;
        pushee.accIndex = accIndex;
        state.lastSeenNoteIndex = accIndex;
    }
    gather.push(pushee);
}

function adjustSpeedSlashesAndNdur(nDur) {
    if (!nDur) {
        nDur = '';
    }

    // if we're here, it is not a case of lonely 'use this dur'
    // isolated note '.4' should cancel the speed slash
    if (state.numNotes == 1) {
        if (state.speedSlashes > 0) {
            state.speedSlashes--;
        }
        if (nDur.match("^/+$")) {
            nDur = nDur.replace(/(.*)\//, "$1");
        }
    }
    let numDesiredSlashes = state.speedSlashes; // after any conditional adjustment

    let result = nDur;

    // it's (at most) just slashes
    if (nDur.match("^/*$")) {
        if (numDesiredSlashes < 0) {
            numDesiredSlashes = -numDesiredSlashes;
            for (let i=0; i < numDesiredSlashes; i++) {
                result = nDur.replace(/(.*)\//, "$1");
            }
        } else if (numDesiredSlashes > 0) {
            result = nDur + "/".repeat(numDesiredSlashes);
        }
    }
    return result;
}

function computeAndPushNote(_123note, gather) {
    // digestSugarOctaves(_123note);

    let accIndex = getCurrentAccumulatorIndex(gather);
    let courtesy = _123note.nShlat && _123note.nShlat.courtesy ? _123note.nShlat.courtesy: "";

    if (state.useThisDur) {
        if (!_123note.nDur) {
            _123note.nDur = state.useThisDur;
        }
    }
    else if ( ! util123.shuffleInProcess) // do not adjust during shuffle!
    {
        _123note.nDur = adjustSpeedSlashesAndNdur(_123note.nDur);
    }

    digestSugarOctaves(_123note);
    // nPrimes is now an integer for how many octaves up or down
    let tickRparen = deTickNoteAndMaybeRememberIndex(_123note, gather);

    let [abcLetter, abcDuration, absoluteAbc] = assembleNoteWithAbc(_123note, gather);
    let abcNoteDurable = `${abcLetter}${abcDuration}`;
    let absoluteDurable = `${absoluteAbc}${abcDuration}`;
    let assembledResult = `${courtesy}${abcNoteDurable}`;
    accumulatorPush4(assembledResult, _123note, accIndex, gather);
    accumulatorPush1(tickRparen, gather);

    let nPrimes = _123note.nPrimes;
    // boundaries
    if (nPrimes < 0) {
        nPrimes = -1;
    }
    else if (nPrimes > 3) {
        nPrimes = 3;
    }

    let tuple = tupelize(_123note.num, nPrimes, _123note.nDur, absoluteDurable, abcLetter, absoluteAbc);

    util123.tuples.push(tuple);
}
function tupelize(num, numPrimes, duration, abcNoteDurable, abcLetter, absoluteInfinite) {
    let octave = numPrimes < 0 ? "," : "'".repeat(numPrimes);
    let result = {
        letterForRainbowLegendRow: abcNoteDurable,
        letterForPlaying: absoluteInfinite,
        letterForAbcOutput: abcLetter,
        num: num + octave,
        duration: duration
    };
    return result;
}
function assembleNoteWithAbc(note, gather) {

    if (state.justChangedKey) {
        let announceKey = `"Key: [${globalCurrentMode.abcDisplayPhrase}]" `;
        accumulatorPush1(announceKey, gather);
        state.justChangedKey = false;
    }
    if (note.num != '0') {
        maybePrependCurrentKey(gather);
    }

    let abcNote = noteToAbc(copyObj(note));
    thisLine(new Error().stack);
    let result = [abcNote.num, abcNote.nDur, abcNote.absoluteAbc];
    return result;
}
function maybePrependCurrentKey(gather) {
    if (!state.foundKey) {
        let mode = getGCMode();
        let toDeclare = autoDeclared(mode.abcDisplayPhrase);
        gather.unshift({val: toDeclare});
        state.foundKey = true;
    }
}
function digestSugarOctaves(note) {
        thisLine(new Error().stack);

    let numPrimes = 0;
    if (note.nPrimes) { // incoming, it's either comma or bunch of ticks
        numPrimes = (note.nPrimes == ',') ? -1 : note.nPrimes.length;
    }

    let plusOcts = note.nOct ?
        note.nOct.replace(/[-]/g, "").length :
        0;
    let minusOcts = note.nOct ?
        note.nOct.replace(/[+]/g, "").length :
        0;

    note.nOct = "";

    if (note.num > 7) {
        note.num = String(note.num - 7);
        numPrimes++;
    }
    let netOcts = state.octaveDelta + plusOcts + numPrimes - minusOcts;

    note.nPrimes = netOcts;
}
function deTickNoteAndMaybeRememberIndex(_123note, gather) {
    let accIndex = getCurrentAccumulatorIndex(gather);
    let tickRparen = "";

    let tickKey;
    if (_123note.tick) {
        tickKey = 'tick';
    }
    else if (_123note.tock) {
        tickKey = 'tock';
    }

    if (tickKey) {
        let mostRecentRealNoteAccIndex = state.mostRecentRealNoteAccIndex;
        let mostRecentRealNoteNote = findAccumulatedEltByIndex(gather, mostRecentRealNoteAccIndex);
        if (!mostRecentRealNoteNote) {
            alert("Error: use a 'real' note prior to referring to 'it' via back-quote!");
        }

        if (tickKey == 'tick') {
            tickRparen = possiblyAddSlur(_123note, gather);
        }

        let tickDur = _123note[tickKey].nDur;
        if (tickDur) {
            _123note.nDur = tickDur;
        }
        _123note.num = mostRecentRealNoteNote.note.num;
        _123note.nPrimes = mostRecentRealNoteNote.note.nPrimes;
        _123note.nShlat = mostRecentRealNoteNote.note.nShlat;
    }
    else {
        // this was a real note. Remember upcoming result-index
        state.mostRecentRealNoteAccIndex = accIndex;
    }
    return tickRparen;
}
function possiblyAddSlur(note, gather) {
    let tickRparen = note.tick.tRparen ? note.tick.tRparen : "";

    if (! tickRparen && state.noteNum == 1 && state.lastSeenNoteIndex > 0) {
        let slurMatchAntecedent = findAccumulatedEltByIndex(gather, state.lastSeenNoteIndex - 1);
        if ( ! slurMatchAntecedent.val.match(/.*\($/)) {
            slurMatchAntecedent.val = slurMatchAntecedent.val + '(';
            tickRparen = ")"; // caller will insert
        }
    }
    return tickRparen;
}
function getCurrentAccumulatorIndex(accumulator) {
        thisLine(new Error().stack);

    return accumulator.length
}
function findAccumulatedEltByIndex(accumulator, noteAccIndex) {
    let result = accumulator[noteAccIndex];
    return result;
}
function pretty4Div(input) {
    return input.replace(/\n/g, "<br/>").replace(/ /g, "&nbsp;");
    //return input.replace(/(\w*)Word":/g, '<br/><br/>$1Word\":');
}
function copyObj(obj) {
    return JSON.parse(JSON.stringify(obj));
}

function parseFromInput() {
    let input = $('#_123Entry').val();
    sessionStorage.setItem("parse", input);

    parseInput(songGram, input);
}
function reloadPrevious() {
    let val = sessionStorage.getItem("parse");
    $('#_123Entry').val(val);
}
function clearInput() {
    let input = $('#_123Entry').val();
    sessionStorage.setItem("parse", input);
    $('#_123Entry').val('');
}


function visit(item, init, doStarLines, gather) {
    let topLevel = gather ? false : true;

    if (init) {
        gather = [];
        util123.tuples = [];
        initState();
    }
    let keys = Object.keys(item);
        thisLine(new Error().stack);

    for (let j = 0; j < keys.length; j++) {
        let key = keys[j];
        let val = item[key];

        let emit = isSpecialElt(key, val, doStarLines, gather);

        if (emit) {
            if (typeof val == 'string') {
                accumulatorPush1(val, gather);
            } else if (val.constructor === Array) { // should be array
                    thisLine(new Error().stack);

                for (let i = 0; i < val.length; i++) {
                    let recursiveItem = val[i];
                    visit(recursiveItem, "", doStarLines, gather);
                }
            }
            else { // function, int or object... do not produce output
                visit(val, "", doStarLines, gather);
            }

            // after the recursions into the line / word
            if (key == 'line') {
                accumulatorPush1('\n', gather);

                if (doStarLines) {
                    let prefix = "";
                    let starLine;
                    if (state.starBasket.length
                        && state.starBasket.includes(star)) {

                        prefix = '   ';
                        starLine = state.starBasket.join(" ");
                        starLine = 'w: ' + starLine;

                        console.log('push starLine', starLine);
                    }
                    starAccumulator.push(prefix + val.rawInput);
                    if (starLine) {
                        starAccumulator.push(starLine);
                    }

                }
            }
        }
        else if (val) {
            let breakpt = true;
        }
    }
    if (topLevel) {
        return gather;
    }
}
function parseInput(gram, input, mainArrayName, doStarLines) {

    $('#postOutput').empty();
    if (!$('#_123Entry').html()) {
        $('#_123Entry').html(songInput0);
    }
    _123parser = peggy.generate(gram, {allowedStartRules: ['SONG', 'INPUT_LINE']});
    starAccumulator = [];

    let targetTextarea = $('#parseOutput');
    let postTarget = $('#postOutput');
    let arrow = ' =================> ';
    let spacyPrefix = '       ';

    // space after meta's colon, to avoid treating it like macros
    input = input.replace(/(\n+|^)([\w]\:)[ \t]*/g, "$1$2 ");
    //input = expandMacros(input);

    let parsedInput = _123parser.parse(input, {startRule: 'SONG'});
    if (showAccumulator) {
        let outDiv = $(`<div><hr/></div>`);
        postTarget.prepend(outDiv);

        let jsonFull = JSON.stringify(parsedInput, null, spacyPrefix);

        if (mainArrayName) {
            let mainArray = parsedInput[mainArrayName];
            thisLine(new Error().stack);

            for (let i = 0; i < mainArray.length; i++) {
                let json = JSON.stringify(mainArray[i], null, spacyPrefix);
                let div = $(`<br/><div>(result) ${mainArrayName}[${i}]${arrow}'${pretty4Div(json)}'</div>`);
                outDiv.append(div);
            }
        } else {
            let div = $(`<div>result${arrow}'${pretty4Div(jsonFull)}'</div>`);
            outDiv.append(div);
        }
    }

    let gathering = visit(parsedInput, true, doStarLines);

    console.log('Output accumulator', gathering);
    let output = gathering
        .map(v => v.val)
        .join('');

    if (doStarLines) {
        let starOutput = starAccumulator.join('\n');
        localStorage.setItem("extractedText", starOutput);
        let wnd = window.open("output.html", "", "_blank");
    }
    targetTextarea.val(output);
    return output;
}
function numToLetterDefaultOctave(num) {
    // zero based nums are in 'comma', or low octave
    let zeroBasedNum = (num - 1) % 7;

    let mode = getGCMode();

    // move into un-comma'd, AKA 'first' octave
    let scaleIndex = zeroBasedNum + notesPerOctave;

    let result = mode.scale[scaleIndex].toUpperCase();

    return result;
}
function nullToEmpty(input) {
    return input ? input : "";
}