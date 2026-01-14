
/** misc ====================================================**/
let globalChordsOff = true;
let globalOneSvgPerLine = false;

function printElem(elem) // https://stackoverflow.com/questions/2255291/print-the-contents-of-a-div
{
    var mywindow = window.open('', 'PRINT', 'height=400,width=600');

    mywindow.document.write('<html><head><title>' + document.title  + '</title>');
    mywindow.document.write('</head><body >');
    //mywindow.document.write('<h1>' + document.title  + '</h1>');
    mywindow.document.write(document.getElementById(elem).innerHTML);
    mywindow.document.write('</body></html>');

    mywindow.document.close(); // necessary for IE >= 10
    mywindow.focus(); // necessary for IE >= 10*/

    mywindow.print();
    mywindow.close();

    return true;
}


/** from from-full-synth.html ==================================**/

function CursorControl() {
    var self = this;

    self.onReady = function() {
        let playbackSpeedWidget = document.querySelector(".abcjs-midi-tempo");
        playbackSpeedWidget.setAttribute("max", "700");
        var downloadLink = document.querySelector(".download");
        downloadLink.addEventListener("click", download);
        downloadLink.setAttribute("style", "");
        var clickEl = document.querySelector(".click-explanation")
        clickEl.setAttribute("style", "");
    };
    self.onStart = function() {
        var svg = document.querySelector("#paper svg");
        var cursor = document.createElementNS("http://www.w3.org/2000/svg", "line");
        cursor.setAttribute("class", "abcjs-cursor");
        cursor.setAttributeNS(null, 'x1', 0);
        cursor.setAttributeNS(null, 'y1', 0);
        cursor.setAttributeNS(null, 'x2', 0);
        cursor.setAttributeNS(null, 'y2', 0);
        svg.appendChild(cursor);
    };
    self.onBeat = function(beatNumber, totalBeats, totalTime) {
        // console.log("Beat: " + beatNumber + " Total: " +
        //     totalBeats + " StartBeat: " + song_firstRepeatSecond
        //     + " totalTime: " + totalTime);
        if (beatNumber >= totalBeats && song_doRepeat) {
            stopIfPlaying();
            playRepeat();
        }
    };
    self.onEvent = async function(ev) {
        if (ev) {
            //console.log(`ev time: ${ev.milliseconds}`);
        }
        if (ev && ev.measureStart && ev.left === null)
            return; // this was the second part of a tie across a measure line. Just ignore it.

        var lastSelection = document.querySelectorAll("#paper svg .highlight");
        for (var k = 0; k < lastSelection.length; k++)
            lastSelection[k].classList.remove("highlight");

        var cursor = document.querySelector("#paper svg .abcjs-cursor");
        if (cursor && ev) {
            cursor.setAttribute("x1", ev.left - 2);
            cursor.setAttribute("x2", ev.left - 2);
            cursor.setAttribute("y1", ev.top + 23);
            cursor.setAttribute("y2", ev.top + ev.height - 13);

            await adjustSvgInViewport();
        }
        let epsilon = 3; // millis
        if (song_doRepeat && ev &&
            (ev.milliseconds - epsilon > song_lastRepeatSecond*1000)) {
                //console.log(`ev: ${ev.milliseconds}. bound: ${song_lastRepeatSecond}`);
                mySynth.seek(song_firstRepeatSecond, "seconds");

                timingCallbacks.setProgress(song_firstRepeatSecond, "seconds");
        }

    };
    self.onFinished = function() {
        var els = document.querySelectorAll("svg .highlight");
        for (var i = 0; i < els.length; i++ ) {
            els[i].classList.remove("highlight");
        }
        var cursor = document.querySelector("#paper svg .abcjs-cursor");
        if (cursor) {
            cursor.setAttribute("x1", 0);
            cursor.setAttribute("x2", 0);
            cursor.setAttribute("y1", 0);
            cursor.setAttribute("y2", 0);
        }
    };
}

let cursorControl;
let synthControl;
let song_firstRepeatSecond;
let song_lastRepeatSecond;
let song_doRepeat = false;
let mySynth;
let mrMillis = 0;

function clickListener(abcElem, tuneNumber, classes, analysis, drag, mouseEvent) {
    var output = "currentTrackMilliseconds: " + abcElem.currentTrackMilliseconds + "<br>" +
        "currentTrackWholeNotes: " + abcElem.currentTrackWholeNotes + "<br>" +
        "midiPitches: " + JSON.stringify(abcElem.midiPitches, null, 4) + "<br>" +
        "gracenotes: " + JSON.stringify(abcElem.gracenotes, null, 4) + "<br>" +
        "midiGraceNotePitches: " + JSON.stringify(abcElem.midiGraceNotePitches, null, 4) + "<br>";
    //document.querySelector(".clicked-info").innerHTML = "<div class='label'>Clicked info:</div>" +output;
    mrMillis = abcElem.currentTrackMilliseconds;

    var lastClicked = abcElem.midiPitches;
    if (!lastClicked)
        return;

    ABCJS.synth.playEvent(lastClicked, abcElem.midiGraceNotePitches, synthControl.visualObj.millisecondsPerMeasure()).then(function (response) {
        //console.log("note played");
    }).catch(function (error) {
        console.log("error playing note", error);
    });
}

function getAbcOptions() {
    let abcOptions = {
        oneSvgPerLine: globalOneSvgPerLine,
        add_classes: true,
        clickListener: self.clickListener,
        responsive: "resize"
    }
    return abcOptions;
};

let instrument = 60;
function stopIfPlaying() {
    if ($('.abcjs-pause-svg').is(":visible")) {
        $('.abcjs-midi-start').click();
    }
    else if ($('.stop-audio').is(":visible")) {
        $('.stop-audio').click();
    }
}
function loadAbcjs() {
    // trade-off: oneSvg bug disables bouncing blue-line cursor
    $('#printButton').on("click", function() {
        globalOneSvgPerLine = true;
        setTune(true);

        printElem("paper");
        globalOneSvgPerLine = false;
        setTune(true);
    });
    $('#extractLyrics').on("click", parseToAbc.extractLyrics);

    $('#abc').on("change", function() {
        stopIfPlaying();
        setTune(true);
    });
    $('#instrument-picker').val(instrument);
    $('#instrument-picker').on("change", function() {
        stopIfPlaying();
        instrument = $('#instrument-picker').val();
        setTune(true);
    });
    $('.radio-input-repeat').on('click', function(e) {
        song_doRepeat = $(e.target).val() === "true";
        stopIfPlaying();
        if (song_doRepeat) {
            $("#audioPlusExplanation").hide();
            $("#repeatPlayPlusExplanation").show();
        }
        else {
            $("#repeatPlayPlusExplanation").hide();
            $("#audioPlusExplanation").show();
            setTune(true);
        }
    });
    $('#no-repeat-radio').click();
    $('.activate-audio').on("click", playRepeat);
    $('.stop-audio').on("click", stopRepeat);
    $('.begin-millis').on("click", function() {
        song_firstRepeatSecond = mrMillis;
    });
    $('.end-millis').on("click", function() {
        song_lastRepeatSecond = mrMillis;
    });
}

function startSynth() {
    if (ABCJS.synth.supportsAudio()) {
        cursorControl = new CursorControl();
        synthControl = new ABCJS.synth.SynthController();
        synthControl.load("#audio",
                        cursorControl,
                        {
                            displayLoop: true,
                            displayRestart: true,
                            displayPlay: true,
                            displayProgress: true,
                            displayWarp: true
                        });
        let progressBar = $(".abcjs-midi-progress-background");
        progressBar.prop('disabled', song_doRepeat);

        let loopButton = $(".abcjs-midi-loop");
        if (song_doRepeat) {
            loopButton.hide();
        }
        else {
            loopButton.show();
        }
    } else {
        document.querySelector("#audio").innerHTML = "<div class='audio-error'>Audio is not supported in this browser.</div>";
    }
}
function download() {
    if (synthControl)
        synthControl.download("Tune-from-123-to-pdf" + ".wav");
}
function setVisualObj() {
    let currentAbc = $('#abc').val()
        .replace(/\\u{1d10b}/g, '\u{1d10b}') // segno
        .replace(/\\u{1d10c}/g, '\u{1d10c}') // coda
    ;
    let visualObj = ABCJS.renderAbc("paper", currentAbc, getAbcOptions())[0];
    return visualObj;
}
function setTune(userAction) {
    song_firstRepeatSecond = 0;
    song_lastRepeatSecond = 0;

    mySynth = new ABCJS.synth.CreateSynth();
    startSynth();

    synthControl.disable(true);
    let visualObj = setVisualObj();

    // TODO-PER: This will allow the callback function to have access to timing info - this should be incorporated into the render at some point.
    mySynth.init({visualObj: visualObj}).then(
        function (response) {
            if (synthControl) {
                synthControl.setTune(visualObj, userAction, {program: instrument, chordsOff: globalChordsOff}
                ).then(function (response) {
                    console.log("Audio successfully loaded.")
                }).catch(function (error) {
                    console.warn("Audio problem:", error);
                });
            }
            timingCallbacks = new ABCJS.TimingCallbacks(visualObj, {
                beatCallback: cursorControl.onBeat,
                eventCallback: cursorControl.onEvent
            });
        }).catch(function (error) {
            console.warn("Audio problem:", error);
        });
}
function arrayOrToArray(input) {
    let result = (typeof input === 'number') ? [ input ] : input;
    return result;
}
function chooseRepeatStartEnd(firstRepeatSecond, lastRepeatSecond) {
    let first = arrayOrToArray(firstRepeatSecond);
    let last = arrayOrToArray(lastRepeatSecond);

    let intervalCandidates = [];
    intervalCandidates.push(firstEltBiggerThan(first.slice(-1), last));
    intervalCandidates.push(firstEltBiggerThan(first[0], last));

    intervalCandidates = intervalCandidates.filter(e => e.diff).sort((a,b) => a.diff - b.diff);
    if (intervalCandidates.length > 0) {
        return intervalCandidates[0];
    }
    else {
        return undefined;
    }
}
function firstEltBiggerThan(input, elements) {
    let result = elements.sort((a,b) => a-b).find(e => e > input);
    let diff = result ? result - input : undefined;
    return { first: input, last: result - .001, diff: diff};
}
function playRepeat() {
    let bounds = chooseRepeatStartEnd(song_firstRepeatSecond, song_lastRepeatSecond);
    if (!bounds) {
        bounds = chooseRepeatStartEnd(song_lastRepeatSecond, song_firstRepeatSecond);
    }
    if (!bounds) {
        return; // something is very wrong
    }

    song_firstRepeatSecond = bounds.first / 1000;
    song_lastRepeatSecond = bounds.last / 1000;

    if (song_lastRepeatSecond == song_firstRepeatSecond) return;

    $('.activate-audio').hide();
    $('.stop-audio').show();

    var audioContext = new window.AudioContext();
    audioContext.resume().then(function () {
        // In theory the AC shouldn't start suspended because it is being initialized in a click handler, but iOS seems to anyway.

        let visualObj = setVisualObj();

        mySynth.init({
            audioContext: audioContext,
            visualObj: visualObj
        }).then(function () {
            timingCallbacks = new ABCJS.TimingCallbacks(visualObj, {
                beatCallback: cursorControl.onBeat,
                eventCallback: cursorControl.onEvent
            });
            cursorControl.onStart();
            mySynth.prime().then(function () {
                mySynth.seek(song_firstRepeatSecond, "seconds");

                timingCallbacks.setProgress(song_firstRepeatSecond, "seconds");
                mySynth.start();
                timingCallbacks.start();
            });
        }).catch(function (error) {
            console.log("Audio Failed", error);
        });
    });
}
function stopRepeat() {
    mySynth.stop();
    timingCallbacks.stop();
    song_firstRepeatSecond = 0;
    song_lastRepeatSecond = 0;

    $('.activate-audio').show();
    $('.stop-audio').hide();
}