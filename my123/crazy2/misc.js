/**
 *
 *  try             collectMacroCandidates(maxLen)
 *                  filterAllCandidates(reportCheck)
 *
 *                  then look at msc.winners
 *
 */

function defaultScoreChecker(r) {
    return r.score <= 10 && r.tm <= 25;
}

let msc = {};
msc.moves = ['gy', '-gy',  'go', '-go', 'oy', '-oy'];
msc.movesDebug = ['gy', 'oy'];
msc.defaultMaxLen = 10 ; // 6
msc.defaultReps = 12;       // 6
msc.maxMoves = 250;  // 37
msc.progressMarker = 2000;

function collectMacroCandidates(options) {
    if (options == '-n') {
        console.log('options: maxLen, default: ' + msc.defaultMaxLen);
        return;
    }
    else if (typeof options == 'number') {
        options = {maxLen: options};
    }
    let maxLen = options && options.maxLen ? options.maxLen : msc.defaultMaxLen;
    console.log(`maxLen: ${maxLen}`)

    setupForCandidates();

    for (let currentLength=msc.candidates.length+1; currentLength<=maxLen; currentLength++) {
        console.log(`Sequences with size ${Number(currentLength)}`);
        console.log(collectSeqListHelper(currentLength));
    }
    console.log("msc.candidatesByLength", msc.candidatesByLength);
    console.log("Done finding candidates at ", showNow());
}
function collectSeqListHelper(currentLength) {
    console.log("Begin finding candidates at ", showNow());
    let newCandidates = [];
    let count = 0;
    for (let sequence of jsClone(msc.candidates)) {
        if (++count % msc.progressMarker == 0) {
            console.log(`Another ${msc.progressMarker}, candidates for length: ${currentLength}`);
        }
        let seqLen = sequence.length;
        if (seqLen != currentLength-1) { // no point in again augmenting smaller ones. longer RR not PP
            continue;
        }

        let previousMove = seqLen == 0 ? '' : sequence[seqLen-1];
        let candidateMoves = msc.moves; // . concat(['[[f_kf]]', '[[f_kp]]', '[[f_kw]]'])
        for (let move of candidateMoves.filter(m => !previousMove || m != antiMove(previousMove))) {
            if (move.match(/f_/) && move == previousMove) continue; // for m2 = I macros
            let newSeq = Array.from(sequence);
            newSeq.push(move);
            newCandidates.push(newSeq);
            rememberSeqByLength(newSeq);
        }
    }
    msc.candidates = msc.candidates.concat(newCandidates);
    return newCandidates;
}
async function narrowAllCandidates(options) {
    if (options == '-n') {
        console.log(`reps: ${msc.defaultReps}, suppressDownload: true, downloadLabel: '', reportCheck: defaultScoreChecker`)
        return;
    }
    let reps = options && options.reps ? options.reps : msc.defaultReps;
    let suppressDownload = options && options.suppressDownload ? options.suppressDownload : false;
    let downloadLabel = options && options.downloadLabel ? options.downloadLabel : '';
    let reportCheck = options && options.reportCheck ? options.reps : defaultScoreChecker;
    console.log(`reps: ${reps}, suppressDownload: ${suppressDownload}, downloadLabel: ${downloadLabel}, reportCheck: ${reportCheck}`)

    let download = !suppressDownload;
    console.log("Begin finding winners at ", showNow());
    if (!reportCheck) {
        reportCheck = defaultScoreChecker;
    }
    resetWinners();
    let sizeKeys = Object.keys(msc.candidatesByLength).sort((a, b) => Number(a) - Number(b));
    for (let sizeKey of sizeKeys) {
        console.log('Trying these candidates of size ' + sizeKey, msc.candidatesByLength[sizeKey]);
        try {
            await narrowCandidates(sizeKey, reportCheck);
            await mySleep(40); // doe this work under a try?

            let numWinnerStrings = msc.winnerStrings.size;
            let winnerDelta = numWinnerStrings - msc.previousWinnerStringsTotal;
            if (winnerDelta > 0) {
                console.log(`Size ${sizeKey} adds ${winnerDelta} winnerString(s), total: ${numWinnerStrings}`);
                msc.previousWinnerStringsTotal = numWinnerStrings;
            }
            console.log('. . . DONE with candidates of size ' + sizeKey
                + " at ", showNow());
        } catch (err) {
            console.log("Oops... continue after error: ", err);
        }
    }
    console.log(`Yay, Total winnerStrings!`, msc.winnerStrings);

    msc.winners = [];
    msc.winnerStrings.forEach((statsObj, reportStr) => {
        statsObj.r = JSON.parse(String(reportStr));
        statsObj.score = statsObj.r.score;
        msc.winners.push(statsObj);
    });

    console.log(`Done!`);

    msc.winnersBySecond['gy'] = msc.winners.filter(w => w.seq.split(',')[1] == 'gy');
    msc.winnersBySecond['go'] = msc.winners.filter(w => w.seq.split(',')[1] == 'go');
    msc.winnersBySecond['-go'] = msc.winners.filter(w => w.seq.split(',')[1] == '-go');
    msc.winnersBySecond['oy'] = msc.winners.filter(w => w.seq.split(',')[1] == 'oy');
    msc.winnersBySecond['-oy'] = msc.winners.filter(w => w.seq.split(',')[1] == '-oy');

    deriveUnderWinners();

    if (download) {
        downloadWinners(downloadLabel);
    }
    dumpWinners();
}
async function narrowCandidates(sizeKey, reportCheck) {
    let startTime = performance.now(); // Get a high-resolution timestamp

    let candidates = msc.candidatesByLength[sizeKey];
    for (let i=0; i<candidates.length; i++) {
        let seqStr = candidates[i].join(',');
        console.log('working...');
        unfreeze(); // just in case
        await trySequence(seqStr, reportCheck);
    }

    let endTime = performance.now(); // Get a high-resolution timestamp after execution
    let timeTaken = endTime - startTime; // Calculate the difference
    console.log(`Size ${sizeKey} took: ${timeTaken / 1000} seconds, ${timeTaken / 1000 / 60} minutes`);
}

function downloadWinners(label) {
    if (!label) label = '';
    downloadHelper(msc.winnersBySecond['gy'] ,label, 'winsGy');
    downloadHelper(msc.winnersBySecond['go'] ,label, 'winsGo');
    downloadHelper(msc.winnersBySecond['-go'],label, 'wins_Go');
    downloadHelper(msc.winnersBySecond['oy'] ,label, 'winsOy');
    downloadHelper(msc.winnersBySecond['-oy'],label, 'wins_Oy');
}
async function downloadHelper(rawData, label, winFlavor) {
    let stringyData = JSON.stringify(rawData);
    let data = `let _${winFlavor} = \n${stringyData}`;
    await download(data, label + winFlavor + '.js');
    console.log('Look for ' + winFlavor + ' in ...Downloads (unless you cancelled)!');
}
function dumpWinners(fn) {
    if (!fn) fn = (x) => x;
    console.log(fn(msc.winnersBySecond['gy'] ));
    console.log(fn(msc.winnersBySecond['go'] ));
    console.log(fn(msc.winnersBySecond['-go']));
    console.log(fn(msc.winnersBySecond['oy'] ));
    console.log(fn(msc.winnersBySecond['-oy']));
}
function antiMove(move) {
    let result = '';
    if (move.includes('-')) {
        result = move.substring(1);
    }
    else if (move) {
        result = '-' + move;
    }
    return result;
}

function resetWinners() {
    msc.winnerStrings = new Map();
    msc.previousWinnerStringsTotal = 0;
}

msc.winningThreshold = 10;


function setupForCandidates() {
    msc.candidates = [['gy']];
    msc.candidatesByLength = {};
}
function restore(label) {
    let result = JSON.parse(window.localStorage.getItem(label));
    return result;
}
function store(label, obj) {
    window.localStorage.setItem(label, JSON.stringify(obj));
}
function rememberSeqByLength(seq) {
    let len = seq.length;
    if (!msc.candidatesByLength[len]) {
        msc.candidatesByLength[len] = [];
    }
    msc.candidatesByLength[len].push(seq);
}
async function stringyDiffReport() {
    let report = await diffArray();
    console.log(JSON.stringify(report));
}
async function debugTrySequence(seqStr) {
    await trySequence(seqStr, null, true); // will setup winners
    console.log(msc.winners);
}
function rufSeqToAllHues(rufSeq) {
    clearRuf2hues();
    let target = $('#ruf2hues');
    let currentRuf = $('#whichRuf').val();
    let currentRufDiv = $(`<div>Current RUF: ${rufSeq}</div>`);
    let clearCurrentRufs = $('<button id="currentRufHues"> Clear</button>');
    currentRufDiv.append(clearCurrentRufs);
    clearCurrentRufs.on('click', function() {target.empty();})
    target.append(currentRufDiv);
    for (let hue of [
        "GyGoOy",
        "GyOyGo",
        "GoOyGy",
        "GoGyOy",
        "OyGyGo",
        "OyGoGy",
    ]) {
        adjustRufHelper(hue);
        let hueSeq = ruf2hue(rufSeq);
        let hs1 = hueSeq.replace(/(.*]).*/, "$1");
        let hs2 = hueSeq.replace(/.*]\s*/, '');
        let oneRufVariant = $(`<div class="hueVariant"
            data-toggle="tooltip" data-placement="left"
            title="Click to display a given sequence. Shift for inverse sequence. Alt to append to input field"
            custom-class="tooltip">${hue}:${hs1}<br class="hueBreak d-none"/>${hs2}</div>`);
        oneRufVariant.on('click', function(e) {
            let localHueSeq = hueSeq;
            ck.hueVsRuf = true;
            if (e.shiftKey) {
                localHueSeq = minusifySeqStr(localHueSeq);
            }
            if (e.altKey) {
                appendInput(localHueSeq);
            }
            else {
                setInput(localHueSeq);
            }
            $('.hueVariant').removeClass('big');
            oneRufVariant.addClass('big');
            $('.hueBreak').addClass('d-none');
            oneRufVariant.find('.hueBreak').removeClass('d-none');
        })
        target.append(oneRufVariant);
    }

    adjustRufHelper(currentRuf);
}
async function trySequence(seqStr, reportCheck, debug) {
    if (frozen()) return;
    freeze();

    if (! reportCheck) {
        reportCheck = defaultScoreChecker;
    }
    await trySequenceHelper(seqStr,reportCheck,1, debug);

    unfreeze();
}
function stringyWinner(winner) {
    let result = JSON.stringify(winner.r.deltaP) + '.' + JSON.stringify(winner.r.deltaR);
    return result;
}
async function trySequenceHelper(seqStr, reportCheck, innerReps, debug) {
    if (debug) resetWinners();

    await initArrays();
    let seq = seqStr.split(',');
    let won = false;
    for (let i=0; i<msc.defaultReps; i++) {
        let tm = (i+1) * seq.length;
        if (tm > msc.maxMoves) {
            break;
        }
        let innerRepStr = "";
        seq.forEach((m) => {
            for (let ir=0; ir<innerReps; ir++) {
                innerRepStr += m + ' ';
            }
        });
        let seqInnerRep = innerRepStr.trim().split(' ');
        await performMoveHelper2(seqInnerRep, false);
        let diffReport = await diffArray();

        if (debug) {
            console.log(seq.join(','), ' x==', i+1);
            //await emitSvgs2();
            await stringyDiffReport();
        }
        diffReport.tm = tm;
        diffReport.seq = seqStr;

        let goodReport = reportCheck(diffReport);
        if (diffReport && goodReport && diffReport.score) {
            won = true;
            let winner = {score: diffReport.score, x: i+1, seq: seqStr, r: diffReport};

            envelopeArray(winner);
        }
        if (diffReport.score == 0) { // we've traversed the whole sub-group back to initial
            break;
        }
    }
    return won;
}
function envelopeArray(winner) {
    let report = JSON.stringify(winner.r);

    let reportStats = msc.winnerStrings.get(report);
    // keep min total moves alternate if >1
    if (!reportStats || (winner.x * winner.seq.length) < (reportStats.x * reportStats.seq.length)) {
        msc.winnerStrings.set(report, {x: winner.x, seq: winner.seq});
    }
}
function diffPiece(a) {
    let pieceDiffReport = {};
    if (a.n != a.b4) {
        pieceDiffReport.n = a.n;
        pieceDiffReport.b4 = a.b4;
    }
    pieceDiffReport.dr = a.dr;

    return pieceDiffReport;
}
async function diffArray() {
    let arrayReport = {
        score: 0,
        nsR: 0,
        ncR: 0,
        nkR: 0,
        nsP: 0,
        nshP: 0,
        nshR: 0,
        nchR: 0,
        ncP: 0,
        nkP: 0,
        nP:0,
        nR: 0,
        moves: 0,
        turns: 0,
        both: 0,
        deltaP: [],
        deltaR: []};

    let fn = (r,c,array) => {
        let item = array[r][c];
        let n = item.n;
        if (n) {
            let pieceReport = diffPiece(item);
            if (pieceReport) {
                let pieceInitial = n[0];

                if (pieceReport.n) {
                    arrayReport.moves++;
                    arrayReport.nP++;
                    arrayReport.deltaP.push({
                        b4: pieceReport.b4,
                        n: pieceReport.n
                    })
                    if (pieceInitial.match(/C/)) {
                        arrayReport.ncP ++;
                    }
                    else if (pieceInitial.match(/[KJgb]/)) {
                        arrayReport.nkP ++;
                    }
                    else if (pieceInitial.match(/[TD]/)) {
                        arrayReport.nsP ++;
                        if (['TTo','Dgw','TTr','Dby',].includes(n)) {
                            arrayReport.nshP++;
                        }
                    }
                }
                if (pieceReport.dr) {
                    arrayReport.nR++;
                    arrayReport.turns++;
                    arrayReport.deltaR.push({
                        n: n,
                        dr: pieceReport.dr,
                    });

                    if (pieceInitial.match(/C/)) {
                        arrayReport.ncR ++;
                        if (['Crw','Cgo','Coy','Cbr',].includes(n)) {
                            arrayReport.nchR++;
                        }
                    }
                    else if (pieceInitial.match(/[KJbg]/)) {
                        arrayReport.nkR ++;
                    }
                    else if (pieceInitial.match(/[TD]/)) {
                        arrayReport.nsR ++;
                        if (['TTo','Dgw','TTr','Dby',].includes(n)) {
                            arrayReport.nshR++;
                        }
                    }
                }
                if (pieceReport.n && pieceReport.dr) {
                    arrayReport.both++;
                    arrayReport.turns--;
                    arrayReport.moves--;
                }
            }
        }
        return true; // keep iteratino
    }
    forEachArrayItem(ck.array.gy, fn);
    arrayReport.score = (2 * arrayReport.both) + arrayReport.moves + arrayReport.turns;

    arrayReport.deltaP = arrayReport.deltaP.sort(sortByN);
    arrayReport.deltaR = arrayReport.deltaR.sort(sortByN);

    // rotations
    arrayReport.rBreakdown = deltaRhelper(arrayReport.deltaR, 'n', 'dr');
    // positions
    arrayReport.pBreakdown = deltaPhelper(arrayReport.deltaP);

    return arrayReport;
}
function sortByN(a,b) {
    return a.n.localeCompare(b.n);
}
function deltaPhelper(deltas) {
    let items = deltas.map(item => `${item.b4} => ${item.n}`);
    return items.sort();
}
        // https://stackoverflow.com/questions/13405129/create-and-save-a-file-with-javascript
function download(data, filename) {
        let file = new Blob([data], {type: 'text/plain;charset=UTF-8'});
        if (window.navigator.msSaveOrOpenBlob) // IE10+
            window.navigator.msSaveOrOpenBlob(file, filename);
        else { // Others
            let a = document.createElement("a"),
                url = URL.createObjectURL(file);
            a.href = url;
            a.download = filename;
            document.body.appendChild(a);
            a.click();
            setTimeout(function () {
                document.body.removeChild(a);
                window.URL.revokeObjectURL(url);
            }, 10);
    }
}
