
function grPosToArrayItem(flavor, grPos) {
    let coords = ck.grPos[grPos];
    let item = coordsToArrayItem(flavor, coords)
    return item;
}

function canPosKeyToArrayItem(flavor, posKey) {
    let coords = getCanPosCoords(posKey);
    let item = coordsToArrayItem(flavor, coords)
    return item;
}

async function moveOnePiece(controlColors, minus, fromClick, alsoHistorize) {
    let flavor = ck.stdTwin.get(controlColors);
    let flavor2 = ck.rawTwin.get(flavor);

    // rotate the 2 controls, and remember axis
    for (let grPos of ['LM', 'RM']) {
        let flavorTwin = (grPos == 'RM') ? flavor : flavor2;

        let canItem = grPosKeyToCanonItemFromFlavor(flavorTwin, grPos);

        let rotationMatrix = minus ? m_minusRot(m.r90[flavorTwin]) : m.r90[flavorTwin];
        await addRotationByMatrix(canItem, rotationMatrix, flavorTwin);
        //updateOffsets(canItem, flavorTwin, minus);
    }
    await highwayMove(flavor, minus);

    // permute/rotate cohort around controls
    let cohortGrPositionsLeftS = ['L2','L6', 'L8','L4'];
    let cohortGrPositionsLeftK = ['L1', 'L3', 'L9', 'L7'];

    let cohortGrPositionsRightS = ['R2','R6', 'R8','R4'];
    let cohortGrPositionsRightK = ['R1', 'R3', 'R9', 'R7'];

    await rotateAndCycleThru(flavor, cohortGrPositionsRightS, minus);
    await rotateAndCycleThru(flavor, cohortGrPositionsRightK, minus);

    await rotateAndCycleThru(flavor2, cohortGrPositionsLeftS, minus);
    await rotateAndCycleThru(flavor2, cohortGrPositionsLeftK, minus);

    await propagateGy();

    if (fromClick) {
        await emitSvgs2();
        await showSvgDiffs2();

        let movePrettyName = (minus ? '-' : '') + flavor;
        if (alsoHistorize) {
            appendInput(movePrettyName);
            historizeMoves(useHueVsRuf(movePrettyName));
        }
    }
}
function findCanonArrayItemFromFlavorGrArray(flavor, grKey) {
    let grCoords = ck.grPos[grKey];
    return findCanonArrayItemFromFlavorCoords(flavor, grCoords);
}
function findCanonArrayItemFromFlavorPos(flavor, posKey) {
    let posCoords = ck.canPos[posKey];
    return findCanonArrayItemFromFlavorCoords(flavor, posCoords);
}

function findCanonArrayItemFromFlavorCoords(flavor, coords) {
    let item = coordsToArrayItem(flavor, coords);

    let canonKey = item.b4;
    let canonCoords = getCanPosCoords(canonKey);

    let canItem = coordsToArrayItem('gy', canonCoords);
    return canItem;
}

async function highwayMove(flavor, minus) {
    let highwayKeysK = [
        'H1',
        'H3',
        'H5',
        'H7',
    ];

    for (let grKey of highwayKeysK) {
        //console.log('hiKey', key);
        let canonItem = findCanonArrayItemFromFlavorGrArray(flavor, grKey);
        let priorDr = Number(canonItem.dr);
        let itemN = pieceNameToFur(canonItem.b4);
        let rotationMatrix = m.r120[itemN];
        if (minus) {
            rotationMatrix = m_minusRot(rotationMatrix);
        }
        //updateOffsets(canonItem,  '', minus);
        await addRotationByMatrix(canonItem, rotationMatrix);

        // let prettyRotationName = minus ? `-120[${itemN}]` : `120[${itemN}]`;
        // await logIfSurveiling('dbo', itemN, microPieceReport(itemN, priorDr, prettyRotationName, Number(canonItem.dr)));
    }
}

function copyAllButB4(fromItem, toItem) {
    toItem.n = fromItem.n;
    toItem.r4 = fromItem.r4;
    toItem.dr = fromItem.dr;
    toItem.drCode = fromItem.drCode;
    toItem.colors = fromItem.colors;
    //toItem.offsets = fromItem.offsets;
}
////////////////
function grPosKeyToCanonItemFromFlavor(flavor, key) {
    let flavorItem = grPosKeyToFlavorItem(flavor, key);
    let b4 = flavorItem.b4;
    let canonItem = canPosKeyToArrayItem('gy', b4);
    return canonItem;
function grPosKeyToFlavorItem(flavor, key) {
    let coords = ck.grPos[key];
    let item = coordsToArrayItem(flavor, coords);
    return item;
}
}
function moveAndRotateItem(fromItem, toItem, minus, flavor) {

    copyAllButB4(fromItem, toItem); // toItem now looks a lot like fromItem

    let priorDr = Number(toItem.dr);

    let rotationMatrix = minus ? m_minusRot(m.r90[flavor]) : m.r90[flavor];
    addRotationByMatrix(toItem, rotationMatrix, flavor);
    //updateOffsets(toItem, flavor, minus);

    let prettyRotationName = minus ? `-90[${flavor}]` : `90[${flavor}]`;
    let itemN = pieceNameToFur(toItem.n);
    // logIfSurveiling(itemN, microPieceReport(itemN, priorDr, prettyRotationName, toItem.dr));
}
function rotateAndCycleThru(flavor, grPosArray, minus) {
    let numCoords = grPosArray.length;
    if (minus) {
        grPosArray = grPosArray.reverse();
    }
    let finalGrKey = grPosArray[numCoords-1];
    let finalItem = jsClone(grPosKeyToCanonItemFromFlavor(flavor, finalGrKey));

    for (let i=numCoords-1; i>0; i--) {
        let fromGrPosKey = grPosArray[(numCoords + i-1) % numCoords];
        let toGrPosKey = grPosArray[i];

        let fromItem = grPosKeyToCanonItemFromFlavor(flavor, fromGrPosKey);
        let toItem = grPosKeyToCanonItemFromFlavor(flavor, toGrPosKey);
        moveAndRotateItem(fromItem, toItem, minus, flavor);
    }
    let initialKey = grPosArray[0];
    let initialItem = grPosKeyToCanonItemFromFlavor(flavor, initialKey);

    moveAndRotateItem(finalItem, initialItem, minus, flavor);
}
async function showSvgDiffs2() {
    for (let flavor of ['go','gy','oy']) {
        determineSvgDiffs(flavor);
        if (flavor == 'gy') {
            await emitDiffs();
        }
    }
}
function determineSvgDiffs(flavor) {
    let candidate = ck.svg[flavor];
    let diffReport = { _33_turns: 0, _33_turns: 0, _35_trNmv: 0, _02_deltaR: []};
    candidate.find('g').each((index,candidateG) => {
        candidateG = $(candidateG);
        let isGhost = !!candidateG.attr('ghost'); // !! makes undefined same as false
        let attrN = candidateG.attr('n');
        //let attrOffsets = candidateG.attr('offsets') != prettyOffsets(getInitialOffsets());
        let dr = candidateG.attr('dr');

        let ellipse = candidateG.find('ellipse');

        let positionDiff = (attrN != candidateG.attr('b4'));
        let rotationDiff = (Number(dr) > 0) /*|| ! offsetIsTrivial(attrOffsets)*/ ;

        if (! isGhost) {
            if (positionDiff && !rotationDiff) {
                if (ck.showMovesDiffs) {
                    setElementFill(ellipse, ck.moveTrack);
                }
                diffReport._33_turns++;
            }
            else if (rotationDiff && !positionDiff) {
                if (ck.showTurnsDiffs) {
                    setElementFill(ellipse, ck.turnTrack);
                }
                appendDeltaRHelper(diffReport, attrN, dr);
                diffReport._33_turns++;
            }
            else if (rotationDiff && positionDiff) {
                if (ck.showBothDiffs) {
                    setElementFill(ellipse, ck.bothTrack);
                }
                appendDeltaRHelper(diffReport, attrN, dr);
                diffReport._35_trNmv++;
            }
        }
    });
    diffReport._00_score = (2 * diffReport._35_trNmv) + diffReport._33_turns + diffReport._33_turns;
    return diffReport;
}
function appendDeltaRHelper(diffReport, piece, attrDXr) {
    appendDeltaR(diffReport, piece, attrDXr);
}
function checkSatisfaction(report, doLog) {
    if (doLog) console.log(report);
    let numSatisfies = 0;
    for (f of msc.applies) {
        if (f(report)) {
            if (doLog) console.log(`** Satisfies ${f.name}`);
            numSatisfies++;
        }
    }
    if (!numSatisfies) {
        if (doLog) console.log('Oh well, unsatisfactory!');
    }
    return numSatisfies > 0;
}
async function emitDiffs() {
    let report = await diffArray();
    let reportSpan = $('#reportDiffs');
    if (report) {
        reportSpan.off('click');
        reportSpan.on('click', function() {
            ck.dReports.push(report);
            //console.log("ck.dReports", ck.dReports);
            console.log('ck.dReports has report list');
            checkSatisfaction(report, true);
        });
    }
    let result = "";

    if (report._33_turns) {
        result += `<span class="reportMoved">${report._33_turns} turns</span> `;
    }
    if (report._34_moves) {
        result += `<span class="reportTurned">${report._34_moves} moves</span> `;
    }
    if (report._35_trNmv)      {
        result += `<span class="reportBoth">${report._35_trNmv} move+turn</span> `;
    }
    if (! result) {
        result = 'Solved';
    }
    else {
        result = `Diffs: ${result} (Score: ${Number(report._00_score)} [${Number(report._00_score120)}])`;
    }

    reportSpan.html(result);
    $('.reportMoved').css('background-color',  ck.moveTrack);
    $('.reportTurned').css('background-color', ck.turnTrack);
    $('.reportBoth').css('background-color',   ck.bothTrack);

    return report;
}

/////////////////////////////
async function performMoveHelper2(moves, fromClick, alsoHistorize) {
    alsoHistorize = !!alsoHistorize; // in case it was undefined
    moves = moves.filter(m => m); // eliminate empties, not sure how got there
    moves = moves.filter(m => ! m.match(/\[.*\]/)); // ignore embedded labels/comments
    if (fromClick) { // ie, we are not during misc's filtering
        console.log("Performing: " + moves);
    }
    let numMoves = moves.length;
    for (let i=0; i<numMoves; i++) {
        let move = moves[i];
        move = move.replace('C', '');
        move = ruf2hue(move);
        if (! ck.legalMoves.includes(move)) {
            alert(`Sorry, <${move}> in the sequence <${moves.join(' ')}>is not a possible move. Pick moves from ${ck.legalMoves.join(', ')}`);
        }
        else {
            //console.log(`Performing move: ${move}`);
            let minus = false;
            if (move.includes("-")) {
                minus = true;
                move = move.replace('-', '');
            }
            await movePieceHelper2(move, minus, fromClick, alsoHistorize);
        }
    }
}
async function movePieceHelper2(flavor, minus, fromClick, alsoHistorize) {
    await moveOnePiece(flavor, minus, fromClick, alsoHistorize);
}
async function performAndHistorizeSequence(moveSeqIn, minus, alsoHistorize) {
    let movesArrayIn = getSequenceMoves(moveSeqIn, minus).filter(m=>!m.match(/\[\d*?m\]/));

    let movesArray = movesArrayIn;
    if (minus) {
        movesArray = minusifySeq(movesArrayIn);
    }
    await performMoveHelper2(movesArray, true, alsoHistorize);
    let numMoves = movesArray.filter(m=>m[0] != '[').length;

    let moveSeqOut = `[${numMoves}m] ` + useHueVsRuf(movesArray.join(' '));

    //$('#moveSequence').val(moveSeqOut);
    historizeMoves(moveSeqOut);

    // encourage garbage collection
    movesArray = movesArrayIn = [];
    moveSeqOut = null;
    moveSeqIn = null;
}
function minusifyAtom(atom) {
    atom = atom.trim();
    let result = atom[0] == '-' ?
                    atom.substring(1) :
                    '-' + atom;
    return result;
}
function minusifyMove(moveIn) {
    let macLabelsPos = Object.keys(ck.macroByLabel);
    let macLabelsNeg = macLabelsPos.map(l => '-' + l);
    let macLabels = macLabelsNeg.concat(macLabelsPos);

    let move = moveIn.trim();
    if (move[0] != '[') {
        move = minusifyAtom(move);
    }
    // known macros should percolate through
    else {
        if (move.match(/\[\[/)){
            let strippedMove = move.substring(2).replace(/\]\]\s*$/, "")
            if (macLabels.includes(strippedMove)) {
                move = '[[' + minusifyAtom(strippedMove) + ']]';
            }
        }
        else if (move.match(/\[/)) {
            let strippedMove = move.substring(1).replace(/\]\s*$/, "")
            if (macLabels.includes(strippedMove)) {
                move = '[' + minusifyAtom(strippedMove) + ']';
            }
        }
    }
    return move;
}
function minusifySeq(seq) {
    let qes = seq.reverse();
    let result = qes.map(mvOrMcr => minusifyMove(mvOrMcr));

    let lastIndex = result.length - 1;
    let endMarker = '[]';

    if (result[0] == endMarker) {
        // switch macro comment-brackets
        result[0] = result[lastIndex];
        result[lastIndex] = endMarker;
    }
    return result;
}
function minusifySeqStr(seqStr) {
    let seq = seqStr.trim().split(/[, ]/);
    // split does not do right thing with ' '
    seq = seq.filter(m => m);

    let result = minusifySeq(seq).join(',');
    return result;
}
function historizeMoves(moveSeq) {
    if (moveSeq && moveSeq != ck.priorMoves) {
        moveSeq = hue2ruf2(moveSeq);
        let option = $(`<option class="historyOption" value="${moveSeq}">${moveSeq}</option>`);
        $('#history').find('[disabled]').after(option);
        ck.priorMoves = moveSeq;
    }
}
function reduceMaybeNegifyLabel(moveSeq, minus) {
    let result = "";
    let minusString = minus ? '-' : "";

    if (moveSeq.match("]")) {
        result = moveSeq.replace(/\].*/, ']');
    }
    result = result.replace(/\[/, '[' + minusString);
    return result;
}
async function loadPerformMoves(e) {
    return loadAndMightPerformMoves(e, true)
}
async function performMovesNoLoad(e) {
    return loadAndMightPerformMoves(e, false)
}
async function loadAndMightPerformMoves(e, alsoHistorize) {
    if (frozen()) return;
    freeze();

    let sourceId = $(e.target).attr('for');
    let source = $(`#${sourceId}`);

    let alt = e.altKey;
    let minus = e.shiftKey;
    let meta = e.metaKey;
    let label = "";
    let newSeqStr = source.val();
    if (newSeqStr) {
        newSeqStr = minus ? minusifySeqStr(newSeqStr) : newSeqStr;
        if (alt) {
            if (sourceId == 'macro' || sourceId == 'macroXtra' || sourceId == 'history') {
                label = reduceMaybeNegifyLabel(newSeqStr, minus);
                appendInput(newSeqStr);
            }
            // double up the brackets when adding -- label already has one set
        }
        else if (meta) {
            // reduce to macro-as-move
            newSeqStr = newSeqStr.replace(/.*\[(?![\]$])/,'[[').replace(/\[\[(.*?)].*/,'[[$1]]');
        }
        else {
            await loadAndDoMovesIfThere(newSeqStr, minus, alsoHistorize);
        }

        if (alsoHistorize) {
            appendInput(newSeqStr);
            moveSequenceChanged();
        }
        //historizeMoves($('#moveSequence').val());
    }

    unfreeze();
}
function showHueVariants() {
    let result = $('#moveSequence').val();
    if (result) {
        result = result
            .replace(/\.\d+m/, '');
        //     .replace(/.*? /, '')
        //     .replace(/(\d+x):/, "[$1] ")
        //     .replace(/,/g, ' ');

        showHueVariantsHelper(result);
    }
}
function showHueVariantsHelper(moveSequence) {
    let ruf = hue2ruf2(moveSequence);

    rufSeqToAllHues(ruf);
}
function getSequenceMoves(moveSequence, minus) {
    moveSequence = expandMacrosInSeqStr(moveSequence);

    let moves = parseMoveSequence(moveSequence, minus);

    // garbage collection
    moveSequence = null;

    return moves;
}
function expandMacrosInSeqStr(seqStrIn) {
    let seqStr = seqStrIn;
    if (seqStr) {
        while (seqStr.match(/\[\[/)) {
            seqStr = seqStr.replace(/\[\[(.*?)]]/g, (input, label) => {
                let macroExpansion = ck.macroByLabel[label];
                if (!macroExpansion) {
                    let complaint = "Sorry, illegal macro: <" + label + ">";
                    alert(complaint);
                    throw complaint;
                    return "";
                }
                else {
                    return macroExpansion;
                }
            });
        }
    }
    return seqStr.trim();
}
function parseMoveSequence(moveSequence, minus) {
    let result = [];

    // shift-click asks for inverse
    moveSequence = minus ? minusifySeqStr(moveSequence)
                         : moveSequence;

    moveSequence = moveSequence.trim().replace(/[ ,]+/g, ",");
    moveSequence = moveSequence.replace(/^,+/, "");
    result = moveSequence.split(",");

    return result;
}
