let notesAbc = [
    ["C,"], ["^C,", "_D,"], ["D,"], ["^D,", "_E,"], ["E,", "_F,"], ["F,", "^E,"], ["^F,", "_G,"], ["G,"], ["^G,", "_A,"], ["A,"], ["^A,", "_B,"], ["B,", "_C"],
    ["C", "^B,"], ["^C", "_D"], ["D"], ["^D", "_E"], ["E", "_F"], ["F", "^E"], ["^F", "_G"], ["G"], ["^G", "_A"], ["A"], ["^A", "_B"], ["B", "_c"],
    ["c", "^B"], ["^c", "_d"], ["d"], ["^d", "_e"], ["e", "_f"], ["f", "^e"], ["^f", "_g"], ["g"], ["^g", "_a"], ["a"], ["^a", "_b"], ["b", "_c'"],
    ["c'", "^b"], ["^c'", "_d'"], ["d'"], ["^d'", "_e'"], ["e'", "_f'"], ["f'", "^e'"], ["^f'", "_g'"], ["g'"], ["^g'", "_a'"], ["a'"], ["^a'", "_b'"], ["b'", "_c''"],
    ["c''", "^b'"], ["^c''", "_d''"], ["d''"], ["^d''", "_e''"], ["e''", "_f''"], ["f''", "^e''"], ["^f''", "_g''"], ["g''"], ["^g''", "_a''"], ["a''"], ["^a''", "_b''"], ["b''", "_c'''"],
    ["c'''", "^b''"]
];
let notes123 = [];
let max123notesIndex; // do we ever need this?

let flatKeysMajorArray = "_A _B _D _E F _G".split(' ');
let sharpKeysMajorArray = "A B D E G".split(' ');
let allKeysMajorArray = flatKeysMajorArray.concat(sharpKeysMajorArray).concat(["C"]).sort();
let allKeysMinorArray = [];
let allKeysFreygishArray = [];
let allKeysMisheberakhArray = [];

let majorSteps =        [2, 2, 1, 2, 2, 2, 1]; // intervals in major scale
let minorSteps =        [2, 1, 2, 2, 1, 2, 2]; // intervals in minor scale
let misheberakhSteps =  [2, 1, 3, 1, 2, 1, 2]; // intervals in misheberakh scale
let freygishSteps =     [1, 3, 1, 2, 1, 2, 2]; // intervals in freygish scale

majorSteps.name = 'major';
minorSteps.name = 'minor';
freygishSteps.name = 'freygish';
misheberakhSteps.name = 'misheberakh';

majorSteps.modifier = '';
minorSteps.modifier = 'm';
freygishSteps.modifier = ' frey';
misheberakhSteps.modifier = ' mish';

let modeModifiersToAbc = new Map();
modeModifiersToAbc.set('', '');
modeModifiersToAbc.set('m', "m");
modeModifiersToAbc.set(' frey', " Phr");
modeModifiersToAbc.set(' mish', " Dor");

let modeNameToModifier = new Map();
modeNameToModifier.set('major', '');
modeNameToModifier.set('minor', "m");
modeNameToModifier.set('freygish', " frey");
modeNameToModifier.set('misheberakh', " mish");

majorSteps.keyNameSweetModifier = '';
minorSteps.keyNameSweetModifier = '';
freygishSteps.keyNameSweetModifier = 'freygish';
misheberakhSteps.keyNameSweetModifier = 'misheberakh';

let _modeNames = ['major', 'minor', 'freygish', 'misheberakh'];
let modeKeysArray = {};
modeKeysArray['major'] = allKeysMajorArray;
modeKeysArray['freygish'] = allKeysFreygishArray;
modeKeysArray['misheberakh'] = allKeysMisheberakhArray;
modeKeysArray['minor'] = allKeysMinorArray;

let whiteNotes = "A B C D E F G".split(' ');

let notesPerOctave = 7;
let halfStepsPerOctave = 12;

let indexAbc = [];
let index123 = [];
let scalesMap = [];

let majorShlats = {}; // associative array
let minorShlats = {};
let freygishShlats = {};
let misheberakhShlats = {};

let relativeMinor = {};
let relativeMajor = {};

function make123s() {
    notes123 = [];
    for (let i = 0; i < notesAbc.length; i++) {
        let group = notesAbc[i];

        if (group[0] === "^c''") {
            max123notesIndex = i;
            break; // remaining abc's only to support 1''' in all keys
        }

        let newGroup = [];
        notes123.push(newGroup);
        for (let j = 0; j < group.length; j++) {
            let note = group[j];
            let newNote = trAbcTo123(note);
            newGroup.push(newNote);
        }
    }
}

let allNumNotes = [];
function setupNoteIndices() {
    setupNoteIndex(notesAbc, indexAbc);
    setupNoteIndex(notes123, index123, allNumNotes);
}

function setupNoteIndex(array, index, allNotes) {
    for (let i = 0; i < array.length; i++) {
        let noteGroup = array[i];
        for (let j = 0; j < noteGroup.length; j++) {
            let note = noteGroup[j];
            index[note] = i;
            if (allNotes) allNotes.push(note);
        }
    }
}

function setupMajorShlatsMap() {

    for (let i = 0; i < flatKeysMajorArray.length; i++) {
        let key = flatKeysMajorArray[i];
        majorShlats[key] = '_';
    }
    for (let i = 0; i < sharpKeysMajorArray.length; i++) {
        let key = sharpKeysMajorArray[i];
        majorShlats[key] = '^';
    }
    majorShlats['C'] = '';
}

function setupScaleMaps() {
    setupOneScaleMapForKeys(majorSteps, allKeysMajorArray, majorShlats);

    for (let i = 0; i < allKeysMajorArray.length; i++) {
        let key = allKeysMajorArray[i];
        let majorScale = scalesMap[key].major.scale;
        let sixth = majorScale[notesPerOctave + 5].replace(/[-'=,]/g,"").toUpperCase();
        allKeysMinorArray.push(sixth);
        allKeysFreygishArray.push(sixth);
        allKeysMisheberakhArray.push(sixth);

        minorShlats[sixth] = majorShlats[key];
        freygishShlats[sixth] = majorShlats[key];
        misheberakhShlats[sixth] = majorShlats[key];
        relativeMajor[sixth] = key;
        relativeMinor[key] = sixth;
    }
    allKeysMinorArray = allKeysMinorArray.sort();

    setupOneScaleMapForKeys(minorSteps, allKeysMinorArray, minorShlats);
    setupOneScaleMapForKeys(freygishSteps, allKeysFreygishArray, freygishShlats);
    setupOneScaleMapForKeys(misheberakhSteps, allKeysMisheberakhArray, misheberakhShlats);
}

function prettyKey(key) {
    let displayKey = key.replace(/_(\w)(.*)/, "$1b$2");
    displayKey = displayKey.replace(/\^(\w)(.*)/, "$1#$2");
    return displayKey;
}

function adjustWhiteOrNatural(note) {
    let shlat = shlatOfNote(note);
    let result = note; // no-op by default
    if (shlat == '=') {
        let whiteNote = noShlatNote(note);
        let whiteNoteIndex = whiteNotes.indexOf(whiteNote);
        let previousIndex = (whiteNoteIndex - 1) % whiteNotes.length;
        let whitePrevious = whiteNotes[previousIndex];

        result = "^^" + whitePrevious;
        console.log('************** DoubleShlat: ' + note + ' ==>  ' + result);
    }
    else if (! shlat) {
        result = "=" + note;
    }
    return result;
}
function setupOneScaleMap(mode, key, shlat) {
    let scale = createKeyScale(key, mode);

    if ( !scalesMap[key]) {
        scalesMap[key] = [];
    }
    let modes = scalesMap[key];
    let modifier = mode.modifier;
    let modeName = mode.name;
    let scaleContainer = {};
    modes[modeName] = scaleContainer;

    scaleContainer.scale = scale;
    let threeNote = scale[2].replace(",", "").toUpperCase();
    threeNote = threeNote.match(/[_^]/) ? threeNote : adjustWhiteOrNatural(threeNote);
    let fourNote = scale[3].replace(",", "").toUpperCase();
    fourNote = fourNote.match(/[_^]/) ? fourNote : adjustWhiteOrNatural(fourNote);

    let molecularKeySweetName = (prettyKey(key) + modifier).trim();
    let molecularKeyDisplayNameMaybeXtra = molecularKeySweetName;

    if (modifier) {
        molecularKeyDisplayNameMaybeXtra =
            `${molecularKeySweetName.replace(modifier, modeModifiersToAbc.get(modifier))}`
                .trim();
        if (modifier == ' frey') {
            molecularKeyDisplayNameMaybeXtra += ' ' + threeNote;
        }
        else if (modifier == ' mish') {
            molecularKeyDisplayNameMaybeXtra += ' ' + fourNote;
        }
    }

    nameToModeMap.set(molecularKeySweetName, scaleContainer);

    scaleContainer.tonic = key;
    scaleContainer.shlat = shlat;
    scaleContainer.abcDisplayPhrase = molecularKeyDisplayNameMaybeXtra;
    scaleContainer.mode = modeName;
    scaleContainer._123DisplayName = molecularKeySweetName;
}
function setupOneScaleMapForKeys(mode, keys, shlats) {
    for (let i = 0; i < keys.length; i++) {
        let key = keys[i];
        setupOneScaleMap(mode, key.replace("=",""), shlats[key]); // not sure how '=' showed up
    }
}

function nextScaleNote(noteIndex, keyShlat, desiredDiatone) {
    let result = "";
    let noteGroup = notesAbc[noteIndex];

    if (noteGroup) {
        let candidates = classifyGroupNotes(noteGroup, keyShlat, "", desiredDiatone);

        result = chooseNoteForScale(candidates)[0];
    }
    return result;
}

function homeOctave(letter) {
    return letter.replace(/[,']/g, "");
}
function classifyGroupNotes(noteGroup, modeKeyShlat, numShlat, desiredDiatone, mode) {

    let numShlatNote = "";
    let keyShlatNote = "";
    let otherShlatNote = "";
    let whiteNote = "";
    let desiredDiatonicNote = "";
    let oneNote = "";
    let scaleNote = "";
    let scaleNoteAbsolute = "";
    let naturalNote = "";

    if (!noteGroup) {
        let x = "oy";
        throw("bad note");
    }
    if (noteGroup.length == 1) {
        oneNote = noteGroup[0];
    }

    for (let i = 0; i < noteGroup.length; i++) {
        let candidate = noteGroup[i];

        if (mode && mode.scale.includes(homeOctave(candidate))) {
            scaleNote = candidate;
            scaleNoteAbsolute = candidate.replace(/[_^]/, "");
            if (numShlat == '=') {
                naturalNote = '=' + scaleNoteAbsolute;
            }
        }
        // desired diatonic
        if (desiredDiatone && candidate.toUpperCase().match(desiredDiatone)) {
            desiredDiatonicNote = candidate;
        }
        // white
        if (!candidate.match(/[_^]/)) {
            whiteNote = candidate;
        }
        // override
        if (numShlat) {
            if (candidate.includes(`${numShlat}`)) {
                numShlatNote = candidate;
            }
            else if (!candidate.match(/[_^]/) && numShlat == "=") {
                numShlatNote = "=" + candidate;
            }
        }


        // no key signature: shlat = white
        if (!modeKeyShlat) {
            if (whiteNote) {
                keyShlatNote = whiteNote;
            }
            if (candidate.match(/[_=^]/)) {
                otherShlatNote = candidate;
            }
        }
        // flat or sharp
        if (modeKeyShlat) {
            if (candidate.includes(modeKeyShlat)) {
                keyShlatNote = candidate;
            } else if (candidate.match(/[_=^]/)) {
                otherShlatNote = candidate;
            }
        }
    }
    return {
        'one': oneNote,
        'desiredDiatonic': desiredDiatonicNote,
        'shlat': keyShlatNote,
        'white': whiteNote,
        'otherShlat': otherShlatNote,
        'numShlat': numShlatNote,
        'scaleNote': scaleNote,
        'scaleNoteAbsolute': scaleNote,
        'naturalNote': naturalNote
    }
}
function chooseNoteForScale(c) {
    let adjusted;

    if (c.naturalNote) {
        adjusted = c.naturalNote;
    }
    else if (c.numShlat) {
        adjusted = c.numShlat;
    }
    else if (c.one) {
        adjusted = c.one;
    }
    else if (c.scaleNote) {
        // remove shlats as they come from key signature
        adjusted = c.scaleNote.replace(/[_^]/, "");
    }
    else if (c.scaleNoteAbsolute) {
        // leave shlats explicit
        adjusted = c.scaleNote;
    }
    else if (c.desiredDiatonic) {
        adjusted = c.desiredDiatonic
    }
    else if (c.white) {
        adjusted = c.white;
    }
    else if (c.shlat) {
        adjusted = c.shlat;
    }
    else if (c.otherShlat) {
        adjusted = c.otherShlat;
    }
    return [adjusted, c.scaleNoteAbsolute ? c.scaleNoteAbsolute : adjusted];
}

function lowAbc(input) {
    let result = input;
    if ( ! input.match(",")) {
        result = input.toUpperCase() + ',';
    }
    return result;
}
function createKeyScale1(key, steps) {
    let result = [lowAbc(key)];

    let whiteKey = innerMostNote(key);
    let whiteNoteIndex = whiteNotes.indexOf(whiteKey);

    let stepsIndex = -1; // ready to roll...
    let noteIndex = indexAbc[lowAbc(key)];

    let nextNote;
    let desiredWhite;
    let step;

    while (1) {
        stepsIndex = nextIndexMod(steps, stepsIndex);
        step = steps[stepsIndex];
        noteIndex += step;

        whiteNoteIndex = nextIndexMod(whiteNotes, whiteNoteIndex);
        desiredWhite = whiteNotes[whiteNoteIndex];

        // done when we overrun the array
        if (noteIndex >= notesAbc.length) {
            break;
        }

        let candidates = notesAbc[noteIndex];
        nextNote = candidates.find(c => c.toUpperCase().match(desiredWhite));
        if (nextNote) {
            if ( ! nextNote.includes(desiredWhite)) {
            }
        } else {
            console.log(`--------------------------------- Desired: ${desiredWhite}. Candidates: ${candidates} (Key: ${key})`);
            nextNote = candidates.find(c => ! c.match(/[_^]/));
            if (!nextNote) nextNote = candidates[0];

            if (nextNote == noShlatNote(nextNote)) {
                nextNote = ('=' + nextNote);
            }
            //console.log('************** Key: ' + key + '. Desperate choice for next note is: ' + nextNote);
        }

        result.push(nextNote);
    }

    return result;
}
function createKeyScale(key, steps) {
    return createKeyScale1(key, steps);
}
///////////////////////////////////////
///////////////////////////////////////
///////////////////////////////////////
function deltaShlats(shlats) {
    let result = 0;
    if (shlats) {
        let numFlat = shlats.replace(/\^/g, "").length;
        let numSharp = shlats.replace(/_/g, "").length;
        result = numSharp - numFlat;
    }
    return result;
}
function noDur123toAbcScale(note, octaveShifts) {
    let mode = getGCMode();

    let innerNum = noShlatNote(note);
    let noteShlat = shlatOfNote(note);
    let shlatDelta = deltaShlats(noteShlat);

    // inner num's place in mode's scale
    let abcScaleNoteIndex = noteToScaleIndex(innerNum, mode.scale);
    let rawAbcScaleNote = mode.scale[abcScaleNoteIndex];

    // that note, with delta, in the full set of abc notes
    // explicit naturals should here be treated as simply 'white'
    let abcNotesIndex = indexAbc[rawAbcScaleNote.replace("=","")];
    abcNotesIndex += shlatDelta;
    abcNotesIndex = applyAbcIndexOctaveShifts(abcNotesIndex, octaveShifts);

    let group = notesAbc[abcNotesIndex];
    let result = groupToScaleAndAbsolute(group, mode.scale, mode.shlat, noteShlat);
    return result;
}

// ... For mapped number and no-shlat-same: re-apply same delta
//     Cleared at bar-line
//  If scale note has shlat, remember. Next matching white scale note is tilde'd
function groupToScaleAndAbsolute(group, scale, modeShlat, noteShlat) {
    let doErase = false;
    let addEqualsIeNatural = noteShlat == '=';
    let scaleResult;
    let reinstatedScaleShlat = false;

    // try for candidate in the desired scale
    // no candidate says '=', need to add the = if requested
    // tweak n for comma, b/c scale may extend into the commas
    let absoluteResult = group.find(n => scale.includes(n.replace(",","")));
    if (absoluteResult) {
        let whiteNote = noShlatNote(absoluteResult);
        let trackedShlatNote = state.recentShlatMap.get(whiteNote);
        if (trackedShlatNote) {
            let trackedShlat = shlatOfNote(trackedShlatNote)
            doErase = false; // still (in case other logic creeps in above)
            if (absoluteResult != whiteNote || trackedShlat != '=') {
                addEqualsIeNatural = true;
            }
            state.recentShlatMap.set(whiteNote, null);
            reinstatedScaleShlat = true;
        }
        else if ( ! addEqualsIeNatural) {
            doErase = true;
        }
    }

    // not in scale, maybe respect shlat indications
    // eg, any 'white' note not in scale should add the =
    if (!absoluteResult) {
        addEqualsIeNatural = true;

        if (noteShlat) {
            if (noteShlat == '=') {
                absoluteResult = group.find(n => ! n.match(/[_^]/));
            }
            else {
                // preference to white note (actually black note ruling over white background?)
                    absoluteResult = group.find(n => ! n.match(/[_^]/));
                if (!absoluteResult) {
                    // need to fool the '^' if present
                    let xShlat = '\\' + noteShlat;
                    absoluteResult = group.find((n) => {
                        return n.match(xShlat);
                    });
                }
            }
        }
        else if (modeShlat) {
            // need to fool the '^' if present
            absoluteResult = group.find((n) => {
                    let xShlat = '\\' + modeShlat;
                    return n.match(xShlat);
                });
        }
        else { // no shlats at all in the neighborhood
            absoluteResult = group.find(n => ! n.match(/[_^]/));
        }
    }
    if (!absoluteResult) {
        absoluteResult = group[0];
    }
    // result should be something at this point,
    //    scaleResult is fallback even if not directly in scale
    scaleResult = absoluteResult;

    if (absoluteResult) {
        let noShlat = noShlatNote(absoluteResult);
        if (noteShlat == '=' || (noShlat == absoluteResult && addEqualsIeNatural)) {
            absoluteResult = '=' + noShlat;
            scaleResult = absoluteResult; //fall-back if not diatonic
        }
        if (doErase) {
            scaleResult = noShlat;
        }
    }
    if (shlatOfNote(scaleResult) && ! reinstatedScaleShlat) {
        // remember this shlat for 'scale-note cancellation' later
        state.recentShlatMap.set(noShlatNote(scaleResult), scaleResult);
    }
    return [scaleResult, absoluteResult];
}

