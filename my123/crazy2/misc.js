/**
 *
 *  try             collectMacroCandidates(maxLen)
 *                  filterAllCandidates()
 *
 *                  then look at msc.winners
 *
 */

function defaultScoreChecker(r) {
    return r._00_score <= 10 && r.tm <= 25;
}

let msc = {};
msc.moves = ['gy', '-gy',  'go', '-go', 'oy', '-oy'];
msc.movesDebug = ['gy', 'oy'];
msc.defaultMaxLen = 10 ; // 10
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
async function narrowAllCandidates2() {
    resetWinners();

    let chunk = -1;
    msc.winnerStrings2 = new Map();
    msc.winners2 = [];
    for (let i=0; i<msc.candidates.length; i++) {
        if (i % 10000 == 0) {
            chunk++;
            msc.winnerStrings2[chunk] = new Map();
            //msc.winners2[chunk] = [];
        }
        let candidate = msc.candidates[i];
        if (candidate.length == 1) {
            continue; // don't bother with initial ['gy']
        }
        let seqStr = candidate.join(','); // trySequence expects string, not array
        await trySequence(seqStr, msc.winnerStrings2[chunk]);
        //winnifyStrings(msc.winnerStrings2[chunk], msc.winners2[chunk]);
    }
    winnifyStrings(msc.winnerStrings2[chunk], msc.winners2);
    console.log(tldr(msc.winners2));
    msc.stringSet1 = new Set(msc.winners2.map(w=>JSON.stringify(w)));
}
async function narrowAllCandidates(options) {
    if (options == '-n') {
        console.log(`suppressDownload: [true]], downloadLabel: ''`)
        return;
    }
    let suppressDownload = options && options.suppressDownload ? options.suppressDownload : true;
    let downloadLabel = options && options.downloadLabel ? options.downloadLabel : '';
    console.log(`suppressDownload: ${suppressDownload}, downloadLabel: ${downloadLabel}`)

    let download = !suppressDownload;
    console.log("Begin finding winners at ", showNow());

    resetWinners();
    let sizeKeys = Object.keys(msc.candidatesByLength).sort((a, b) => Number(a) - Number(b));
    for (let sizeKey of sizeKeys) {
        console.log('Trying these candidates of size ' + sizeKey, msc.candidatesByLength[sizeKey]);
        try {
            await narrowCandidates(sizeKey);
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
    winnifyStrings(msc.winnerStrings, msc.winners);

    console.log(tldr(msc.winners));
    msc.stringSet0 = new Set(msc.winners.map(w=>JSON.stringify(w)));

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
function winnerRedaction(winner) {

}
function winnifyStrings(winnerStrings, winners) {
    winnerStrings.forEach((statsObj, reportStr) => {
        statsObj.r = JSON.parse(String(reportStr));
        statsObj._00_score = statsObj.r._00_score;
        statsObj._00_score120 = statsObj.r._00_score120;
        winners.push(statsObj);
    });
}
async function narrowCandidates(sizeKey) {
    let startTime = performance.now(); // Get a high-resolution timestamp

    let candidates = msc.candidatesByLength[sizeKey];
    for (let i=0; i<candidates.length; i++) {
        let seqStr = candidates[i].join(',');
        console.log('working...');
        unfreeze(); // just in case
        await trySequence(seqStr, msc.winnerStrings);
    }

    let endTime = performance.now(); // Get a high-resolution timestamp after execution
    let timeTaken = endTime - startTime; // Calculate the difference
    console.log(`Size ${sizeKey} took: ${timeTaken / 1000} seconds, ${timeTaken / 1000 / 60} minutes`);
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
    msc.winnerStrings2 = [];
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
    if (! seqStr.match(/,/)) {
        seqStr = seqStr.split(' ').join(',');
    }
    console.log('Try: ', seqStr);
    await trySequence(seqStr, msc.winnerStrings, true); // will setup winners
    console.log(msc.winners);
}
function rufSeqToAllHues(rufSeq) {
    let targetList = $('#ruf2hues');
    targetList.empty();

    let headerTarget = $('#hueVariantHeader');
    headerTarget.empty();

    let currentRuf = $('#whichRuf').val();
    let currentRufSpan = $(`<span>RUF: <br/>${rufSeq}</span>`);
    let clearCurrentRufsButton = $('<button class="ms-1" id="currentRufHues">X</button>');
    headerTarget.append(currentRufSpan);
    headerTarget.append(clearCurrentRufsButton);
    clearCurrentRufsButton.on('click', function() {
        targetList.empty();
        headerTarget.empty();
    })

    for (let hue of [
        "GyGoOy",
        "GoOyGy",
        "OyGyGo",
        "GyOyGo",
        "GoGyOy",
        "OyGoGy",
    ]) {
        adjustRufHelper(hue);
        let hueSeq = ruf2hue(rufSeq);
        let hs1 = hueSeq.replace(/(.*])(.*)/, "$1 || $2");

        // chunk for reading
        let chunkSeqArray = hs1.split(',');
        let chunkSeq = '';
        let i = 0;
        for (; i<chunkSeqArray.length; i++) {
            chunkSeq += chunkSeqArray[i] + ' ';
            if (i%3 == 2) {
                chunkSeq += '|| ';
            }
        }
        if (i%3 != 0) {
            chunkSeq += '|| ';
        }
        hs1 = chunkSeq.replace(/\|\|\s+\|\|/, "||");
        // (end) chunk for reading

        let oneRufVariant = $(`<div class="hueVariant"
            data-toggle="tooltip" data-placement="left"
            title="Click to display a given sequence. Shift for inverse sequence. Alt to append to input field"
            custom-class="tooltip">${hue}:${hs1}</div>`);
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
        targetList.append(oneRufVariant);
    }

    adjustRufHelper(currentRuf);
}
async function trySequence(seqStr, winnerStrings, debug) {
    if (frozen()) return;
    freeze();

    let winner = await trySequenceHelper(seqStr,1, debug, winnerStrings);

    unfreeze();

    return winner;
}
function stringyWinner(winner) {
    let result = JSON.stringify(winner.r._01_deltaP) + '.' + JSON.stringify(winner.r._02_deltaR);
    return result;
}
async function trySequenceHelper(seqStr, innerReps, debug, winnerStrings) {
    let winner = null;

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

        if (diffReport._00_score == 0) { // we've traversed the whole sub-group back to initial
            break;
        }
        else {
            if (debug) {
                console.log(seq.join(','), ' x==', i + 1);
            }
            diffReport.tm = tm;
            diffReport.seq = seqStr;

            let goodReport = checkSatisfaction(diffReport, debug) > 0;

            if (diffReport && goodReport) {
                won = true;
                winner = {x: i + 1, seq: seqStr, _00_score120: diffReport._00_score120, r: diffReport, _00_score: diffReport._00_score};

                envelopeArray(winner, winnerStrings);
            }
        }
    }
    return winner;
}
function envelopeArray(winner, winnerStrings) {
    let report = JSON.stringify(winner.r);

    let reportStats = winnerStrings.get(report);
    // keep min total moves alternate if >1
    if (!reportStats || (winner.x * winner.seq.length) < (reportStats.x * reportStats.seq.length)) {
        winnerStrings.set(report, {x: winner.x, seq: winner.seq, s:winner._00_score});
    }
}
function diffPiece(a) {
    let pieceDiffReport = {};
    if (a.n != a.b4) {
        pieceDiffReport.n = a.n;
        pieceDiffReport.b4 = a.b4;
    }
    pieceDiffReport.dr = a.dr;

    //pieceDiffReport.offsets = a.offsets;

    return pieceDiffReport;
}
async function diffArray() {
    let arrayReport = {
        _00_score: 0,
        _00_score120: 0,
        _01_deltaP: [],
        _02_deltaR: [],
        _03_nP:0,
        _04_nR: 0,
        _05_ncR: 0,
        _06_nchR: 0,
        _07_nkR: 0,
        _08_nkP: 0,
        _09_nsR: 0,
        _10_nshR: 0,
        _11_nshR: 0,
        _12_nshP: 0,
        _33_turns: 0,
        _34_moves: 0,
        _35_trNmv: 0
    };

    let fn = (r,c,array) => {
        let item = array[r][c];
        let n = item.n;
        if (n) {
            let pieceReport = diffPiece(item);
            if (pieceReport) {
                let pieceInitial = n[0];

                if (pieceReport.n) {
                    arrayReport._34_moves++;
                    arrayReport._03_nP++;
                    arrayReport._01_deltaP.push({
                        b4: pieceReport.b4,
                        n: pieceReport.n
                    })
                    if (pieceInitial.match(/C/)) {
                        // not possible, C-s do not move in this simulation
                    }
                    else if (pieceInitial.match(/[KJgb]/)) {
                        arrayReport._08_nkP ++;
                    }
                    else if (pieceInitial.match(/[TD]/)) {
                        arrayReport._11_nshR ++;
                        if (['TTo','Dgw','TTr','Dby',].includes(n)) {
                            arrayReport._12_nshP++;
                        }
                    }
                }
                //let nonTrivialOffsets = ! codesOffsetIsTrivial(pieceReport);
                if (/*nonTrivialOffsets || */ pieceReport.dr != 0) {
                    //let offsets = prettyOffsets(pieceReport.offsets);
                    arrayReport._04_nR++;
                    arrayReport._33_turns++;
                    let dr = item.dr;
                    let deltaRcandidate = {
                        n:          n,
                        //offsets:    offsets,
                        dr:         dr
                    };
                    if (item.dr > 0 /*||
                            prettyOffsets(getXyzOffsets(offsets))
                        !=  prettyOffsets(getXyzOffsets(getInitialOffsets()))*/
                     ) {
                        arrayReport._02_deltaR.push(deltaRcandidate);
                    }

                    if (pieceInitial.match(/C/)) {
                        arrayReport._05_ncR ++;
                        if (['Crw','Cgo','Coy','Cbr',].includes(n)) {
                            arrayReport._06_nchR++;
                        }
                    }
                    else if (pieceInitial.match(/[KJbg]/)) {
                        arrayReport._07_nkR ++;
                    }
                    else if (pieceInitial.match(/[TD]/)) {
                        arrayReport._09_nsR ++;
                        if (['TTo','Dgw','TTr','Dby',].includes(n)) {
                            arrayReport._10_nshR++;
                        }
                    }
                }
                if (pieceReport.n && pieceReport.dr != 0 /*&& nonTrivialOffsets*/ ) {
                    arrayReport._35_trNmv++;
                    arrayReport._33_turns--;
                    arrayReport._34_moves--;
                }
            }
        }
        return true; // keep iteratino
    }
    forEachArrayItem(ck.array.gy, fn);
    arrayReport._00_score = (2 * arrayReport._35_trNmv) + arrayReport._34_moves + arrayReport._33_turns;

    arrayReport._01_deltaP = arrayReport._01_deltaP.sort(sortByN);
    arrayReport._02_deltaR = arrayReport._02_deltaR.sort(sortByN);

    // rotations
    arrayReport.rBreakdown = deltaRhelper(arrayReport._02_deltaR, 'n', 'dr');
    // positions
    arrayReport.pBreakdown = deltaPhelper(arrayReport._01_deltaP);

    arrayReport._00_score120 = arrayReport._00_score - getS120plusMinus(arrayReport);

    return arrayReport;
}
function prettyOffsets(o) {
    let result;
    if (o) {
        result = `${o.x},${o.y},${o.z}`;
        if (o.s) {
            result += `,${o.s}`;
        }
    }
    else {
        result = 'error';
    }
    return result;
}
function codesOffsetIsTrivial(code) {
    let result = true; // cynical
    if (code && code.offsets)
    result = offsetIsTrivial(code.offsets);
    return result;
}
function offsetIsTrivial(o) {
    let result = ! o
                || (o.s && prettyOffsets(o) == prettyOffsets(getInitialOffsets()))
                || (! o.s && prettyOffsets(o) == prettyOffsets(getInitialXyzOffsets()))
    return result;
}
function sortByN(a,b) {
    return a.n.localeCompare(b.n);
}
function deltaPhelper(deltas) {
    let items = deltas.map(item => `${item.b4} => ${item.n}`);
    return items.sort();
}
function microPieceReport(pieceN, priorDr, prettyRotationName, currentDr) {
    return `${pieceN} was: ${Number(priorDr)}, rotates: ${prettyRotationName}. now: ${Number(currentDr)}`;
}
function amSurveiling(candidateN) {
    return      ck.surveilAll
            || (ck.surveilPiece && ck.surveilPiece.length &&
                ck.surveilPiece.filter(p => p.toLowerCase() == candidateN.toLowerCase()).length);
}
function logIfSurveiling(candidateN, msg) {
    if (amSurveiling(candidateN)) {
        console.log(`------------ ${msg}`);
    }
}