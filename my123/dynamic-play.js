let numColor = {};
let myInfiniteTone;
let hoverPlay = false;

numToColors = [
    'lightgrey',
    'red',
    '#ed9121',
    '#f4ca16',
    'green',
    'blue',
    '#483D8B',
    '#9400D3'];

function getColor(num) {
    num = Number(num);
    let result = numToColors[num];
    return result;
}

async function displayRainbow() {
    let tuples = util123.tuples;
    if (!tuples || tuples.length == 0 || bogusNoteTuple(tuples[0])) {
        return false;
    }

    let lowAndHighIndex = await makeRainbowHolder(tuples);

    await loadRainbowColors(tuples, lowAndHighIndex);

    return true;
}

function loadRestRow(table, notes) {
    let tr = $('<tr></tr>');
    table.append(tr);

    tr.append($('<td class="rainbowBlock">Z</td>'));
    for (let j = 0; j < notes.length; j++) {
        let td = $(`<td class="rainbowBlock r_rainbowRest c_${j}"></td>`);
        tr.append(td);
    }
}

function load123LegendRow(table, notes) {
    let tr = $('<tr></tr>');
    table.append(tr);

    tr.append($('<td></td>'));
    for (let j = 0; j < notes.length; j++) {
        let note = notes[j].num;
        if (note.match("K:")) {
            note = note.replace(/%.*/, "");
        }
        let td = $(`<td class="bottom-line top-line rainbowBlock _123 legend c_${j}">${note}</td>`);
        tr.append(td);
    }
}

function resetGlobalNotes() {
    util123.tuples = [];
    $('#rainbowTable').html('');
}

function loadAbcLegendRow(table, notes) {
    let tr = $('<tr></tr>');
    table.append(tr);

    tr.append($('<td id="randomFocus"></td>'));
    for (let j = 0; j < notes.length; j++) {
        let letter = notes[j].letterForRainbowLegendRow.replace(/!courtesy!/, ""); // keep just the '=' for naturals

        let td = $(`<td class="top-line bottom-line rainbowBlock abc legend c_${j} abcCol_${j}">${letter}</td>`);
        tr.append(td);
    }

}

async function makeRainbowHolder(notes) {
    let table = $('#rainbowTable');
    table.html("");

    showProgress(true, `setting up rainbow container (${notes.length} notes)`);
    await waitableTimeout(100);

    let maxVerticalIndex = maxNoteIndex(notes) + 2; // 1 'rest' row, 1 'extra neighbor'
    let leastNoteVerticalIndex = leastNoteIndex(notes, maxVerticalIndex);

    for (let i = maxVerticalIndex - 1; i >= 0; i--) {
        if (i < leastNoteVerticalIndex) {
            continue; // cut off unused lower part of table
        }

        let tr = $('<tr></tr>');
        table.append(tr);

        let maybeTopOfTable = (i == maxVerticalIndex - 1) ? "top-line" : "";

        tr.append($(`<td class="rainbowBlock">${(i % notesPerOctave) + 1}</td>`));
        for (let j = 0; j < notes.length; j++) {
            let td = $(`<td class="rainbowBlock ${maybeTopOfTable} r_${i} c_${j}"> </td>`);
            tr.append(td);
        }
    }
    loadRestRow(table, notes);
    load123LegendRow(table, notes);
    loadAbcLegendRow(table, notes);

    showProgress(false, `setting up rainbow container (${notes.length} notes)`);

    return {low: leastNoteVerticalIndex, high: maxVerticalIndex};
}

function separatorColumn(j, color) {
    $(`.c_${j}`).css('background-color', color);
}

async function loadRainbowColors(tuples, lowAndHighIndex) {
    let lowRowIndex = lowAndHighIndex.low;
    let highRowIndex = lowAndHighIndex.high;

    let numTuples = tuples.length;
    let progressNums = $('#progressNums');

    showProgress(true, `loading rainbow `);

    for (let j = 0; j < numTuples; j++) {
        if (j > 0 && j % 100 == 0) {
            progressNums.html(`(${j} of ${numTuples} notes loaded)`);
            //console.log(`(${j} of ${numTuples} notes loaded)`);
            await waitableTimeout(100);
        }
        let tuple = tuples[j];

        // handle partial input
        if (bogusNoteTuple(tuple)) {
            break;
        }

        let note = tuple.num;

        if (note.match(/[|]/)) {
            separatorColumn(j, 'lightgrey');
        } else if (note.match(/K:/)) {
            separatorColumn(j, '#e8f48c');
        } else {
            $(`.c_${j}`).on('click', function (e) {
                if (e.shiftKey) {
                    let slice = tuples.slice(j);
                    playNotes(slice, 0, ++globalPlayCount, "", j);
                } else {
                    let notePart = get123NotePart(note);
                    playThisNote(tuple, j);
                }
            })

            let noteNoShlatOrDuration = noShlatNoDurationNote(note);
            let noteIndex = note.includes('0')
                ? 'rainbowRest'
                : noteToScaleIndex(noteNoShlatOrDuration, globalCurrentMode.scale);

            let color = noteColor(note);
            let unShlatdNote = tuple.absoluteAbc;
            $(`.r_${noteIndex}.c_${j}`).css('background-color', color);

            let textColor = adjustTextColor(color);
            $(`.r_${noteIndex}.c_${j}`).html(unShlatdNote);
            $(`.r_${noteIndex}.c_${j}`).css('color', textColor);

            $(`.rainbowBlock.c_${j}`).attr('title', 'Click to play note. Shift-click to play song from here');

            $(`.c_${j}`).on('mouseenter', function () {
                if (hoverPlay) {
                    myInfiniteTone = msc.makeToneFrom123(tuple, 0, j);
                    myInfiniteTone.on();
                }
            });
            $(`.c_${j}`).on('mouseleave', function () {
                if (hoverPlay && myInfiniteTone) {
                    myInfiniteTone.off();
                }
            });

            setupNeighbors(j, noteIndex, lowRowIndex, highRowIndex);
        }
    }
    showProgress(false, `loading rainbow `);
}

function setupNeighbors(j, noteIndex, lowRowIndex, highRowIndex) {
    $(`.r_rainbowRest.c_${j}`).removeClass('neighbor');
    if (parseToAbc.bounceColors == "full" ||
        (noteIndex == lowRowIndex && parseToAbc.bounceColors == "some")) {
        $(`.r_rainbowRest.c_${j}`).addClass('neighbor');
    }

    for (let i = lowRowIndex; i < highRowIndex; i++) {
        if (i != noteIndex) {
            if (parseToAbc.bounceColors == "full") {
                $(`.r_${i}.c_${j}`).addClass('neighbor');
            } else {
                $(`.r_${i}.c_${j}`).removeClass('neighbor');
            }
        }
    }
    if (parseToAbc.bounceColors == "some") {
        $(`.r_${noteIndex + 1}.c_${j}`).addClass('neighbor');
        $(`.r_${noteIndex - 1}.c_${j}`).addClass('neighbor');
    }
}

function noteColor(note) {
    let noteJustDigit = innerMostNote(note);
    let color = getColor(noteJustDigit);

    return color;
}