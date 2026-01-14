
let globalPlayCount = 0;

let frequenciesUpperCaseOctave = [
    262 - 15,
    277 - 15,
    294 - 15,
    311 - 15,
    330 - 15,
    349 - 15,
    370 - 15,
    392 - 15,
    415 - 15,
    440 - 15,
    466 - 15,
    494 - 15
];
let frequenciesCommaOctave = frequenciesUpperCaseOctave.map(function(f) { return f/2; });
let frequenciesLowercaseOctave = frequenciesUpperCaseOctave.map(function(f) { return f*2; });
let frequenciesTickOctave = frequenciesUpperCaseOctave.map(function(f) { return f*4; });
let frequenciesTwoTickOctave = frequenciesUpperCaseOctave.map(function(f) { return f*8; });
let threeTickC = [frequenciesUpperCaseOctave[0] * 8];
let frequencies = frequenciesCommaOctave
    .concat(frequenciesUpperCaseOctave)
    .concat(frequenciesLowercaseOctave)
    .concat(frequenciesTickOctave)
    .concat(frequenciesTwoTickOctave)
    .concat(threeTickC);

function adjustTextColor(color) {
    let result = 'black';
    if (color == 'blue' || color == '#483D8B'
        || color == 'green' || color == '#9400D3') {
        result = 'white';
    }
    return result;
}
function clearPlayColors() {
    // clear legend colors

    $('.legend').css('color', 'black');
    $('.legend').css('background-color', 'white');

    $('.neighbor').css('background-color', 'transparent');
}
function highlightLegend(notePart, rainColumn) {
    clearPlayColors();

    let color = noteColor(notePart);
    let textColor = adjustTextColor(color);

    let legendBlock = $(`.legend.c_${rainColumn}`);
    legendBlock.css('background-color', color);
    legendBlock.css('color', textColor);

    ensureElementInViewport(legendBlock);

    $(`.neighbor`).css('background-color', 'transparent');

    if (parseToAbc.bounceColors != "none") {
        $(`.neighbor.c_${rainColumn}`).css('background-color', color);
    }

    // oh well, do whole column??
    // $(`.c_${rainColumn}`).css('background-color', color);
    // $(`.c_${rainColumn}`).css('color', textColor);
}

let Tone = function (frequency, duration, silent) {

    this.frequency = frequency;
    this.type = Tone.sine;
    this.duration = duration;

    this.sounding = false;
    this.inited = false;

    let that = this;

    this.initContext = function () {
        that.audioCtx = Tone.audioCtx;

        that.gainNode = that.oscillator = {};
        that.gainNode = that.audioCtx.createGain();
        that.gainNode.gain.value = silent ? 0 : Tone.volume;

        that.oscillator = that.audioCtx.createOscillator();
        that.oscillator.detune.value = 100; // value in cents
        that.oscillator.frequency.value = that.frequency;
        that.oscillator.type = that.type;
        that.oscillator.start(0);
        that.oscillator.connect(that.gainNode);
    };

    this.on = function () {
        if (!that.inited) {
            that.initContext();
            that.inited = true;
        }
        if (!this.sounding) {
            that.gainNode.connect(that.audioCtx.destination);
            that.sounding = true;
        }
    };

    this.off = function () {
        if (that.sounding) {
            //that.oscillator.stop();
            that.gainNode.disconnect(that.audioCtx.destination);
            that.sounding = false;
        }
    };
};

Tone.audioContext = function () {
    let result;
    window.AudioContext = window.AudioContext ||
        window.webkitAudioContext ||
        navigator.mozAudioContext ||
        navigator.msAudioContext;
    if (window.AudioContext) {
        result = new window.AudioContext();
    } else if (window.webkitAudioContext) {
        result = new window.webkitAudioContext();
    }
    return result;
}

Tone.millisPerSecond = 1000;
Tone.durationSeconds = 1;

Tone.audioCtx = Tone.audioContext();
Tone.volume = .2;
Tone.square = 'square';
Tone.sine = 'sine';

Tone.noTone = new Tone(1,0,true);

function playThisNote(tuple, rainIndex) {
    if (tuple.num.match("K:")) {
        adjustToKeyDirective(tuple);
        playNotes([], 0, ++globalPlayCount, "", rainIndex);
    }
    else {
        playNotes([tuple], 0, ++globalPlayCount, "", rainIndex);
    }
}

function playNotes(tuplesArrayIn, myNoteIndex, checkNum, myTone, rainColumn, metaContinue) {

    if (myNoteIndex == 0) { // i.e., zeroth level of recursion
        let tuplesArray = tuplesArray ? myClone(tuplesArrayIn) : [];
        tuplesArrayIn = null; // garbage collection
        pushCurrentMode();
    }

    // done -- base case: used up array
    if (!tuplesArray || tuplesArray.length == 0 || checkNum != globalPlayCount
        || bogusNoteTuple(tuplesArray[0])) {
        if (myTone) myTone.off();
        clearPlayColors(); // for the case of stopping in middle

        popCurrentMode();
        return;
    }

    let nextTuplay = tuplesArray.shift();
    let nextNote = nextTuplay.num;

    //  special separators treated
    if (!nextNote.match(noteReGpG)) {
        myTone = Tone.noTone;
        if (nextNote.match("K:")) {
            adjustToKeyDirective(nextNote);
        }
    }
    else {
        //myTone = makeToneFrom123(nextNote, myNoteIndex, rainColumn);
        myTone = msc.makeToneFrom123(nextTuplay, myNoteIndex, rainColumn);
    }

    myTone.on();

    let continuation;
    if (tuplesArray.length == 0 && metaContinue) {
        continuation = metaContinue;
    }
    else {
        continuation = function () {
            playNotes(tuplesArray, Number(myNoteIndex)+1, checkNum, myTone, Number(rainColumn)+1, metaContinue);
        };
    }

    setTimeout(function () {
            myTone.off();
            continuation();
        },
        myTone.duration * Tone.durationSeconds * Tone.millisPerSecond * globalSpeedRatio);
}

