let globalCurrentMode;

let pushedGlobalCurrentMode;
let globalSpeedRatio;
let selectK = 'Select';

// debug helpers
let stopWord = "9999";
let doStop = false;

let globalSave123 = "";

let nameToModeMap = new Map();

let speeds = [0,6,5,4,3,2,1, 1/2,1/3,1/4,1/5,1/6];

let deferParse;
let inProgress;
let skipSelectNeutralize = false;


let resultDiv;
let verbose = true;
let naturalSign = "!courtesy!=";

let weightedDurations =         ['/', '///', '///', '////', '//', '////'];
let shuffleDurations = false;

let samplesNames = ['kids', 'demo', 'trupSystems', 'bro', 'davqah', 'almei', 'adon', 'nigun-23-12', 'scales', 'twelve'];

function getGCMode() {
    if (!globalCurrentMode) globalCurrentMode = scalesMap.C.major;
    return globalCurrentMode;
}

function toggleChords() {
    globalChordsOff = !globalChordsOff;
    let entry = $('#_123Entry');
    // let newVal = entry.val().replace(/".*?"/g, "");
    // entry.val(newVal);
    entry.change();
}
function clear123() {
    globalPlayCount++
    clearById('_123Entry');
    clearById('abcResult');
    clearById('abc');
    $('#abc').change();
    $('#_123Entry').change();

    clearById('rainbowTable');
    resetGlobalNotes();
    //globalCurrentMode = scalesMap.C.major;
    //adjustTonicModeDropdowns();
    abc = [""];
    setTune(true)

    adjustToMeterDirective(4,4)
    testClear();
}

function showRainbow() {
    let table = $('#rainbowTable');
    if (table.html() == '') {
        displayRainbow();
    }
    table.show();
}
function redisplayRainbow() {
    let table = $('#rainbowTable');
    table.empty();
    displayRainbow();
}
function toggleRainbow() {
    let table = $('#rainbowTable');
    if (table.html() == '') {
        displayRainbow();
    }
    else {
        if (table.is(':visible')) {
            table.hide();
        }
        else {
            table.show();
        }
    }
}

async function setup() {
    deferParse = true;

    resultDiv = $('#result1');

    $('#rainbowClearButton').hide();

    let macrosDiv = $('#macrosDisplayDiv');
    macrosDiv.hide();
    let macroClickDirectionsDiv = $('#macroClickDirectionsDiv');
    macroClickDirectionsDiv.hide();

    $('#macroClipboardButton').on('click', function() {
        importMacrosFromClipboard(macrosDiv);
    });

    $('#macrosDisplayButton').on('click', function() {
        toggleVisibility(macrosDiv);
        toggleVisibility(macroClickDirectionsDiv);
    });
    $('#howImportSpan').on('click', function() {
        toggleVisibility($('#howImport'));
    });

    $('#toggleAbcContent').on('click', function() {
        let content = $('#abcContent');
        if (! content.is(':visible')) {
            content.removeClass('d-none');
            content.show();
        }
        else {
            toggleVisibility(content);
        }
    });

    $('#dynamicTest').on('click', dynamicTest);
    $('#dynamicTest1').on('click', dynamicTest1);

    $('#play').on('click', function() { playNotes(util123.tuples, 0, ++globalPlayCount);});
    $('#loopShuffle').on('click', function() { loopShufflePlay(0, true, ++globalPlayCount); })
    $('#loop').on('click', function() { loopPlay(0); })
    $('#toggleRainbow').on('click', function() { toggleRainbow(); })

    $('#stop').on('click', function() { globalPlayCount++;});

    $('#samples').on('change', adjustSamples);

    $('#_123EntryClearButton').on('click', clear123);
    $('#toggleChords').on('click', toggleChords);

    $('#abcResultClearButton').on('click', function() {
        clearById('abcResult');
        clearById('abc');
        $('#abc').change();
    });

    $('#pickMode').on('change', adjustBareMode);
    $('#pickTonic').on('change', adjustTonic);

    $('#shuffle').on('click', shuffle123);

    $('#_123Entry').on('input change paste propertychange',
        function (e) {
            if (! skipSelectNeutralize) {
                neutralizeSamples();
            }
            parse123();
        });

    $('#speed').val(6);
    adjustSpeed();
    $('#speed').on('change', adjustSpeed);

    $('#shuffleDurations').on("change", function() {
        shuffleDurations = $(this).is(':checked');
    });
}

function usingBible(defer) {
    let usedBible = false;
    let ls123Val = localStorage.getItem("bible123");
    if (ls123Val) {
        usedBible = restoreFromLocalStorage(defer);
    }
    return usedBible;
}
async function setup2(prefix) {
    make123s();

    setupNoteIndices();
    setupMajorShlatsMap();
    setupScaleMaps();

    globalCurrentMode = scalesMap.C.major;
    if (pickTonicAvailable()) {
        setupKeyChoices();
    }
    setupSamples();
    setupRadio();

    loadAbcjs();

    $('#ExtraLyricsDiv').hide();
    parseToAbc.showStarLine = true;
    parseToAbc.showDemoLine = false;

    parseToAbc.bounceColors = "none";
    $('.color-radio').on("click", function (e) {
        let value = $(e.target).val();
        console.log("Bounce: " + value)
        parseToAbc.bounceColors = value;
        redisplayRainbow();
    });
    $('#hoverPlay').on("change", function () {
        hoverPlay = !hoverPlay;
    });

    $('.toggleInnerVisibleInnerDiv').on('click', buttonClick);
    if (window.location.search.match(/bible/) && usingBible(deferParse)) {
        neutralizeSamples();
    }
    else {
        let select = $('#samples');
        select.val('kids');
        select.change();
    }

    $('#instrument-picker').val(0); // piano . selected attr seems ignored
    $('#instrument-picker').change();

    await initMacroMap(prefix);

    deferParse = false;

    // just this time defer neutralizing selection due to change
    skipSelectNeutralize = true;
    $('#_123Entry').change();
    skipSelectNeutralize = false;

    $('#playButtons').prepend(
        $(`<div class="mb-2">
                        <span class="big"></span>
                        <button onclick="removeBrackets()">Remove quasi-optional notes (if any)</button> 
                        <button onclick="restoreBrackets()">Restore quasi-optional notes</button>
                        <span class="biggg"></span></div>`));

    // thank you ppj project
    window.onscroll = function () { scrollFunction() };

    $('#rtnBtn').on("click", focusTop);

    // showCoords turns it on/off
    let rtn2 = $('#rtnBtn2');
    rtn2.append($(`<div width="30%"  class="buttonReport"></div>`));
    rtn2.append($(`<div width="30%" class="buttonReport2"></div>`));

    if ($('.songScroll').length) {
        $('body').on('mousemove', trackCoordsForSheet);
    }
}
function neutralizeSamples() {
    let select = $('#samples');
    select.val(selectK);
}
function buttonClick(e) {
    let elt = $(e.target);
    let innerClass = elt.attr('inner');
    let innerDiv = $(`div.toggleInner.${innerClass}`);
    toggleVisibility(innerDiv);

    if (innerDiv.is(":visible")) {
        innerDiv.insertAfter($('#top'));
    }
}
function setupRadio() {
    $('.radio-input').on('click', function(e) {
        $('.radio-div').hide();
        let clicked = $(e.target);
        let divId = clicked.val();
        $(`#${divId}`).show();
    });
    $("#notation-radio").click();
}

function adjustSamples() {
    let name = $('#samples').val();
    if (name != selectK) {
        loadFile(name);
    }
}
function setupSamples() {
    let select = $('#samples');
    let placeholderOption = $(`<option value="${selectK}" disabled selected>Select</option>`);
    select.append(placeholderOption);

    for (let i=0; i<samplesNames.length; i++) {
        let sampleName = samplesNames[i];

        let option = $(`<option name="${sampleName}" value="${sampleName}">${sampleName}</option>`);
        select.append(option);
    }
}
function loadFile(file123) {
    globalPlayCount++
    $('#buffer').empty();
    $('#buffer').load(`${file123}.html`, function() {
        let val = $('#buffer').val();
        $('#_123Entry').val(val);
        skipSelectNeutralize = true;

        // onchange does not catch, parse instead
        // $('#_123Entry').change();
        parse123();
        skipSelectNeutralize = false;
    });

}
function copyText(text) {
    window.navigator.clipboard.writeText(text);
}
function save123() {
    let text = $('#_123Entry').val();
    globalSave123 = text;
}
function copy123Lyrics() {
    let text = $('#_123EntryLyrics').val();
    copyText(text);
}
function copy123() {
    let text = $('#_123Entry').val();
    copyText(text);
}
function restore123() {
    globalPlayCount++;
    $('#_123Entry').val(globalSave123);
    $('#_123Entry').change();
}
function showProgress(doIt, context) {
    if (doIt && inProgress) {
        return;
    }

    let progressNums = $('#progressNums');
    progressNums.html(context);

    let tooLong = $('#tooLong');
    let loading = $('#loading');
    console.log(`=== in-progress ${doIt ? 'T...' : 'F (done)'} ${context}`);

    if (doIt) {
        inProgress = true;

        tooLong.addClass('biggg');
        loading.show();
        $('#mainDisplay').css('opacity', '0.4');
        $('#mainDisplay').css('background-color', 'lightblue');
    }
    else {
        tooLong.removeClass('biggg');
        loading.hide();
        $('#mainDisplay').css('opacity', '1');
        $('#mainDisplay').css('background-color', 'transparent');

        inProgress = false;
    }
}
let bracketAbc;
function removeBrackets() {
    let abc = $('#abc');
    bracketAbc = abc.val();
    abc.val(bracketAbc.replace(/"<\["\s+">\]"\s+\w\d?/g, ""));
    abc.change();
}
function restoreBrackets() {
    if (bracketAbc) {
        let abc = $('#abc');
        abc.val(bracketAbc);
        abc.change();
    }
}
function restoreFromLocalStorage(defer) {
    $('#button_setup').click();
    let usedBible = false;
    globalPlayCount++;
    showProgress(true, "Loading from browser storage data");
    //setTimeout(function () {
        let storedContent = localStorage.getItem("bible123");
        if (storedContent) {
            usedBible = true;
            $('#_123Entry').val(storedContent);
            showProgress(false, "Loading from browser storage data");
            alert("123 Bible content loaded from browser storage");

            if (! defer) {
                $('#_123Entry').change();
            }
        }
        else {
            showProgress(false, "Loading from browser storage data");
            alert("No browser storage data, so cannot load. (Nada in, nada out)");
        }
    //}, 100);

    return usedBible;
}
async function paste123() {
    globalPlayCount++;
    let text = await window.navigator.clipboard.readText();

    $('#_123Entry').val(text);
    $('#_123Entry').change();
}
async function loopShufflePlay(depth, doShuffle, checkNum) {
    if (!util123.tuples || globalPlayCount != checkNum) return;

    if (!depth) {
        globalPlayCount++;
    }
    else {
        if (doShuffle) {
            await shuffle123();
        }
    }

    showRainbow();
    playNotes(util123.tuples, 0, ++globalPlayCount, "", "",
        async function() { await loopShufflePlay(1, doShuffle, globalPlayCount);}
    );
}
function loopPlay(depth) {
    loopShufflePlay(depth, false, ++globalPlayCount);
}
function setupKeyChoices() {
    let select = $('#pickMode')
    select.empty();
    for (let m=0; m<_modeNames.length; m++) {
        let selected = m == 0 ? "selected" : "";
        let modeName = _modeNames[m];
        let option = $(`<option ${selected} name="${modeName}" value="${modeName}">
                            ${modeName.replace(modeName.charAt(0), modeName.charAt(0).toUpperCase())}
                       </option>`);
        select.append(option);
    }
    // initial selected mode is major
    setupTonicChoices(allKeysMajorArray);
}
function setupTonicChoices(tonics) {
    globalCurrentMode = scalesMap.C.major;

    let select = $('#pickTonic');
    select.empty();
    for (let t = 0; t < tonics.length; t++) {
        let tonicName = tonics[t];
        let selected = tonicName == 'C' ? "selected" : "";
        let option = $(`<option ${selected} name="${tonicName}" value="${tonicName}">${tonicName}</option>`);
        select.append(option);
    }
    updateCurrentMode();
}
function populateTonicSelect(selectId, defaultTonic, modeFlavor) {
    let tonics = modeKeysArray[modeFlavor]
    let select = $(`<select id="${selectId}"></select>`);

    for (let t = 0; t < tonics.length; t++) {
        let tonicName = tonics[t];
        let selected = tonicName == defaultTonic ? "selected" : "";
        let option = $(`<option ${selected} name="${tonicName}" value="${tonicName}">${tonicName}</option>`);
        select.append(option);
    }
    return select;
}
function pickTonicAvailable() {
    return $('#pickTonic').length > 0
}
function updateCurrentMode() {
    let tonic = $('#pickTonic').val();
    let mode = $('#pickMode').val();
    globalCurrentMode = scalesMap[tonic][mode];
}
function adjustBareMode() {
    let currentBareMode = $('#pickMode').val();

    setupTonicChoices(modeKeysArray[currentBareMode]);
    updateCurrentMode();
    parse123();
}
function adjustTonic() {
    let val = $('#pickTonic').val();
    updateCurrentMode();
    parse123();
}
function pushCurrentMode() {
    pushedGlobalCurrentMode = globalCurrentMode;
}
function popCurrentMode() {
    globalCurrentMode = pushedGlobalCurrentMode;
    adjustTonicModeDropdowns();
}
function adjustTonicModeDropdowns() {
    if (!globalCurrentMode) return;

    let tonic = globalCurrentMode.tonic;
    let mode = globalCurrentMode.mode;

    $('#pickTonic').val(tonic);
    $('#pickMode').val(mode);
}
function adjustSpeed(event) {
    let val = $('#speed').val();
    globalSpeedRatio = (speeds[val]);
    $('#currentSpeed').html(1/globalSpeedRatio);
}
function get123NotePart(note) {

    let notePart = note.replace(/[\/a-h=]/g, "");
    return notePart;
}
function bogusNoteTuple(noteTuple) {
    let result = ! noteTuple || ! noteTuple.num.match(noteOrEndReGpG);
    return result;
}
// function resetMode() {
//     globalCurrentMode = scalesMap.C.major;
//     adjustTonicModeDropdowns();
//     parse123();
// }
function markMode() {
    let modeDisplayName = ` [K:${globalCurrentMode._123DisplayName}] `;
    let [_123textEntry, textEntry0, caretPos, current123text] = get123caretPosAndVal();

    update123atCaret(_123textEntry, textEntry0, caretPos, current123text,
                            modeDisplayName);
}
function maxNoteIndex(notes) {
    let indices = notes.map(function(n) {
        let notePart = get123NotePart(n.num);
        let index = noteToScaleIndex(notePart, getGCMode().scale);
        return index;
    });
    let result = Math.max(...indices);
    return result;
}
function leastNoteIndex(notes, highMax) {
    let indices = notes.map(function(n) {
        let notePart = get123NotePart(n.num);
        let index = noteToScaleIndex(notePart, globalCurrentMode.scale);

        if (index === -1) { // not a num
            index = highMax;
        }
        return index;
    });
    let result = Math.min(...indices);
    return result;
}
function clearById(id) {
    let elt = $(`#${id}`);
    elt.val('');
    elt.html('');
}
function log(msg, mode, override) {
    if (!override && !doLog) {
        return;
    }

    let line = verbose ? "(" + currentLine() + ")" : "";
    let p;

    if (!mode) {
        p = `<br>% ${line}======>${msg}`;
    } else if (mode == "mid") {
        p = `<br>% ${line}======>${msg}---------------- -------------------- --------------`;
    } else if (mode == "big") {
        p = `<br>% ${line}======>${msg}================== ======================== =================`;
    } else if (mode == "123") {
        p = `<br>${msg}`;
    }
    resultDiv.append(p);
}

function extraLyrics() {
    parse123(true);
}

function currentLine() {
    let line = Error().stack;
    line = line.replace(/(\r\n|\n|\r)/gm, "");
    line = line.replace(/Error\s*/gm, "NB): ");
    line = line.replace(/at currentLine [^ ]+/, "");
    line = line.replace(/at log [^ ]+/, "");
    line = line.replace(/at assert\w+ [^ ]+/, "");
    line = line.replace(/at ([^ ]+ +[^ ]+).*/, "$1");
    line = line.replace(/.*eight-tone./, "");
    line = line.replace(/\)/, "");

    line = line.replace(/http.*my123./, "");

    return line;
}

function assertEqual(first, second, context) {
    first = String(first).replace(/\s+/g, " ").trim();
    second = String(second).replace(/\s+/g, " ").trim();

    if (first !== second) {
        log(`!!! Blast !!!! ${context}:<br/>[${first}] expected <br/>[${second}] received`,
            "mid", true);
        testFails = true;
    }
}

function assertTrue(item) {
    assertEqual(item, true);
}

function assertFalse(item) {
    assertEqual(item, false);
}

function myClone(input) {
    let result = JSON.parse(JSON.stringify(input));
    return result;
}

function shlatOfNote(note) {
    let match = note.match(/[_=^]+/);
    let shlat = match ? match[0] : "";
    return shlat;
}

function innerMostNote(note) {
    let result = note.replace(/[_=^'+-,]|[a-h/]/g, '').toUpperCase();
    return result;
}

function noShlatNoDurationNote(note) {
    let result = note.replace(/[_=^]|[a-h\/]/g, '').toUpperCase();
    return result;
}

function noShlatNote(note) {
    if (!note) {
        let x = "oy";
    }
    let result = note.replace(/[_=^]/g, '');
    return result;
}

function nextIndexMod(list, current) {
    let result = (current + 1) % list.length;
    return result;
}

function isOneSubsetOfOther(list1, list2) {
    let firstIs = true;
    let result = true;
    for (let i = 0; i < list1.length; i++) {
        let item = list1[i];
        if (!list2.includes(item)) {
            firstIs = false;
            break;
        }
    }
    if (!firstIs) {
        for (let i = 0; i < list2.length; i++) {
            let item = list2[i];
            if (!list1.includes(item)) {
                result = false;
                break;
            }
        }
    }
    return result;
}

// https://stackoverflow.com/questions/10726638/how-do-you-map-replace-characters-in-javascript-similar-to-the-tr-function-in
function trAbcTo123(input) {
    let result = input.replace(/[A-Ga-z],?/g, function (abc) {
        let result;
            if (abc == 'C,') { result = "1,"; }
            if (abc == 'D,') { result = "2,"; }
            if (abc == 'E,') { result = "3,"; }
            if (abc == 'F,') { result = "4,"; }
            if (abc == 'G,') { result = "5,"; }
            if (abc == 'A,') { result = "6,"; }
            if (abc == 'B,') { result = "7,"; }
            if (abc == 'C' ) { result =  "1"; }
            if (abc == 'D' ) { result =  "2"; }
            if (abc == 'E' ) { result =  "3"; }
            if (abc == 'F' ) { result =  "4"; }
            if (abc == 'G' ) { result =  "5"; }
            if (abc == 'A' ) { result =  "6"; }
            if (abc == 'B' ) { result =  "7"; }
            if (abc == 'c' ) { result = "1'"; }
            if (abc == 'd' ) { result = "2'"; }
            if (abc == 'e' ) { result = "3'"; }
            if (abc == 'f' ) { result = "4'"; }
            if (abc == 'g' ) { result = "5'"; }
            if (abc == 'a' ) { result = "6'"; }
            if (abc == 'b' ) { result = "7'"; }
        return result;
    })
    return result;
}

function chooseAdjustedAbcNoteAndAbsolute(abcIndex, mode, numShlat) {
    let keyShlat = mode.shlat;
    let group = notesAbc[abcIndex];
    let choices = classifyGroupNotes(group, keyShlat, numShlat, "", mode);
    let [adjusted, absolute] = chooseNoteForScale(choices);
    return [adjusted, absolute];
}

function modeContains(mode, note) {
    return mode.scale.indexOf(note) != -1;
}

function noteToScaleIndex(numNote, scale) {
    let result;

    let parts = numNote.match(/(\d)([,']*)/);
    if (parts == null || parts[1].match(/0/)) { // non-notes, including 0=rest
        result = -1;
    }
    else {
        let num = parts[1];
        let ticks = parts[2];

        let scaleIndex = num - 1;
        if (ticks !== ",") {
            scaleIndex += notesPerOctave;
        } // one diatonic octave
        if (ticks.match(/'+/)) {
            let count = ticks.length;
            let delta = count * notesPerOctave;
            scaleIndex += delta;
        }
        while (scaleIndex >= scale.length) {
            scaleIndex -= notesPerOctave;
        }
        result = scaleIndex;
    }
    return result;
}
function findAbcScaleNoteInfo(num, mode) {
    if (!mode) mode = getGCMode();

    let innerNote = noShlatNote(num);

    let abcScaleNoteIndex = noteToScaleIndex(innerNote, mode.scale);

    let abcNote = mode.scale[abcScaleNoteIndex];

    let numShlat = shlatOfNote(num);

    let delta = 0;

    if (numShlat === "_") delta = -1;
    else if (numShlat === "^") delta = 1;
    else if (numShlat === "__") delta = -2;
    else if (numShlat === "^^") delta = 2;
    else if (numShlat === "=") {
        // natural sign does not apply to numbers, only to letters
    }

    return {note: abcNote, delta: delta};
}

// https://stackoverflow.com/questions/2450954/how-to-randomize-shuffle-a-javascript-array
function shuffle(array) {
    let currentIndex = array.length;
    let randomIndex;

    // While there remain elements to shuffle...
    while (currentIndex != 0) {

        // Pick a remaining element...
        randomIndex = Math.floor(Math.random() * currentIndex);
        currentIndex--;
        ////console.log(`${currentIndex} <-> ${randomIndex}`);

        // And swap it with the current element.
        [array[currentIndex], array[randomIndex]] = [
            array[randomIndex], array[currentIndex]];
    }

    return array;
}
function partitionTuples() {
    let currentArray = [];
    let arrayOfArrays = [];

    let numTuples = util123.tuples.length;
    for (let i=0; i<numTuples; i++) {
        let tuple = util123.tuples[i];

        if (tuple.num == '||') {
            arrayOfArrays.push(currentArray);
            arrayOfArrays.push([{num: '||', letterForRainbowLegendRow: '||', letterForAbcOutput: '||', duration: ''}]);
            currentArray = [];
        }
        else {
            currentArray.push(tuple);
            if (i == numTuples-1) {
                arrayOfArrays.push(currentArray);
            }
        }
    }
    return arrayOfArrays;
}
function unpartitionAndShuffleTuples(arrayOfArrays) {
    let result = [];

    for (let i=0; i<arrayOfArrays.length; i++) {
        let array = arrayOfArrays[i];
        shuffle(array);
        result = result.concat(array);
    }
    return result;
}
async function shuffle123() {

    util123.shuffleInProcess = true;

    if (!util123.tuples || util123.tuples.length == 0) return;
    globalPlayCount++;

    let arrayOfArrays = partitionTuples();
    util123.tuples = unpartitionAndShuffleTuples(arrayOfArrays);

    // need to filter K: in advance, seems not to work on the fly
    let myTuples = util123.tuples.filter(e => ! e.num.match(/K:/));

    //console.log(myTuples);
    let content123 = "";

    // https://stackoverflow.com/questions/5915096/get-a-random-item-from-a-javascript-array

    for (let i=0; i<myTuples.length; i++) {
        let tuple = myTuples[i];
        let note = tuple.num;
        let shlat = shlatOfNote(tuple.letterForAbcOutput);

        let duration = tuple.duration;
        if (shuffleDurations) {
            duration =
                weightedDurations[Math.floor(Math.random() * (weightedDurations.length))];
        }

        if (note.match(/K:/)) {
            content123 += `\nK:${noteMode.abcDisplayPhrase}\n`
        }
        else {
            content123 += shlat + note + duration + ' ';
        }

        if ((i > 0 && (i % 10 == 0)) || i == (myTuples.length - 1)) {
            content123 += "\n";
        }
    }
    $('#_123Entry').val(content123);
    await parse123();

    util123.shuffleInProcess = false;
}

///////////////
function adjustAbcDisplayForKey(input, mode) {
    let result = input;
    let resultShlat = shlatOfNote(result);

    if (modeContains(mode, result)) {
        result = result.replace(/[_^]/g, "");
    }
    else if (!modeContains(mode, result) && !resultShlat) {
        result = naturalSign + result;
    }
    return result;
}
// https://stackoverflow.com/questions/33289726/combination-of-async-function-await-settimeout
function waitableTimeout(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

