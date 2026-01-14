
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

function other2Axes(axis) {
    let result;
    switch(axis) {
        case 'gy':
            result = ['go','oy'];
            break;
        case 'go':
            result = ['gy','oy'];
            break;
        case 'oy':
            result = ['go','gy'];
            break;
    }

}
async function movePiece2(controlColors, minus, fromClick, alsoHistorize) {
    let flavor = ck.stdTwin.get(controlColors);
    let axis = ck.axis.get(flavor);
    //console.log('flavor is ' + flavor);

    // rotate the 2 controls, and remember axis
    for (let grPos of ['LM', 'RM']) {
        let canItem = grPosKeyToCanonItemFromFlavor(flavor, grPos);

        let rotationMatrix = minus ? m_minusRot(m.r90[axis]) : m.r90[axis];
        addRotationByMatrix(canItem, rotationMatrix);
    }
    await highwayMove2(flavor, minus, axis);

    // permute/rotate cohort around controls
    let cohortGrPositionsUpS = ['L3','L6', 'L9','Lc'];
    let cohortGrPositionsUpK = ['L2', 'L5', 'L7', 'La'];

    let cohortGrPositionsDownS = ['R3','R6', 'R9','Rc'];
    let cohortGrPositionsDownK = ['R2', 'R5', 'R7', 'Ra'];

    await rotateAndCycleThru2(flavor, cohortGrPositionsUpS, minus, axis);
    await rotateAndCycleThru2(flavor, cohortGrPositionsUpK, minus, axis);

    await rotateAndCycleThru2(flavor, cohortGrPositionsDownS, minus, axis);
    await rotateAndCycleThru2(flavor, cohortGrPositionsDownK, minus, axis);

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

function highwayMove2(flavor, minus, axis) {
    let highwayKeysC = [
        'H2',
        'H4',
        'H6',
        'H8',
    ];
    let highwayKeysK = [
        'H1',
        'H3',
        'H5',
        'H7',
    ];

    let rotationMatrix = minus ? m_minusRot(m.r120[axis]) : m.r120[axis];
    for (let key of highwayKeysK) {
        let canonItem = findCanonArrayItemFromFlavorGrArray(flavor, key);

        /** oops, degradation of values via multiple compositions may raise errors **/
        /** oops, proliferation of angles suggests (and Claude, perhaps lying, agrees)
         *  to use the 'same' axis, not separate ones **/
        let itemColors = canonItem.n.replace(/[TD]+/,'');
        //let rotationMatrix = minus ? m.r120[itemColors] : m_minusRot(m.r120[itemColors]);
        addRotationByMatrix(canonItem, rotationMatrix);
    }
}

function copyAllButB4(fromItem, toItem) {
    toItem.n = fromItem.n;
    toItem.r4 = fromItem.r4;
    toItem.dr = fromItem.dr;
    toItem.drCode = fromItem.drCode;
    toItem.colors = fromItem.colors;
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
function moveAndRotateItem(fromItem, toItem, minus, axis) {

    copyAllButB4(fromItem, toItem);

    let rotationMatrix = minus ? m_minusRot(m.r90[axis]) : m.r90[axis];
    addRotationByMatrix(toItem, rotationMatrix);
}
function rotateAndCycleThru2(flavor, grPosArray, minus, axis) {
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
        moveAndRotateItem(fromItem, toItem, minus, axis);
    }
    let initialKey = grPosArray[0];
    let initialItem = grPosKeyToCanonItemFromFlavor(flavor, initialKey);

    moveAndRotateItem(finalItem, initialItem, minus, axis);
}
async function showSvgDiffs2() {
    for (let flavor of ['go','gy','oy']) {
        let diffReport = await determineSvgDiffs(flavor);
        if (flavor == 'gy') {
            await emitSvgDiffs(diffReport);
        }
    }
}
function determineSvgDiffs(flavor) {
    let candidate = ck.svg[flavor];
    let diffReport = { moves: 0, turns: 0, both: 0, deltaR: []};
    candidate.find('g').each((index,candidateG) => {
        candidateG = $(candidateG);
        let isGhost = !!candidateG.attr('ghost'); // !! makes undefined same as false
        let attrN = candidateG.attr('n');
        let attrDr = Number(candidateG.attr('dr')); // Number() just to be double sure

        let ellipse = candidateG.find('ellipse');

        let positionDiff = (attrN != candidateG.attr('b4'));
        let rotationDiff = attrDr != 0;

        if (! isGhost) {
            if (positionDiff && !rotationDiff) {
                if (ck.showMovesDiffs) {
                    setElementFill(ellipse, ck.moveTrack);
                }
                diffReport.moves++;
            }
            else if (rotationDiff && !positionDiff) {
                if (ck.showTurnsDiffs) {
                    setElementFill(ellipse, ck.turnTrack);
                }
                appendDeltaRHelper(diffReport, attrN, attrDr);
                diffReport.turns++;
            }
            else if (rotationDiff && positionDiff) {
                if (ck.showBothDiffs) {
                    setElementFill(ellipse, ck.bothTrack);
                }
                appendDeltaRHelper(diffReport, attrN, attrDr);
                diffReport.both++;
            }
        }
    });
    diffReport.score = (2 * diffReport.both) + diffReport.moves + diffReport.turns;
    return diffReport;
}
function appendDeltaRHelper(diffReport, piece, attrDXr) {
    appendDeltaR(diffReport, piece, attrDXr);
}
async function emitSvgDiffs(report) {
    let result = "";

    if (report.moves) {
        result += `<span class="reportMoved">${report.moves} moved</span> `;
    }
    if (report.turns) {
        result += `<span class="reportTurned">${report.turns} turned</span> `;
    }
    if (report.both)      {
        result += `<span class="reportBoth">${report.both} both move/turn</span> `;
    }
    if (! result) {
        result = 'Solved';
    }
    else {
        result = "Diffs: " + result + '(Score: ' + Number(report.score) + ')';
    }

    let reportSpan = $('#reportDiffs');
    reportSpan.html(result);
    $('.reportMoved').css('background-color',  ck.moveTrack);
    $('.reportTurned').css('background-color', ck.turnTrack);
    $('.reportBoth').css('background-color',   ck.bothTrack);

    ck.dReports0.push(report);
    reportSpan.off('click');
    let diffArrayReport = await diffArray();
    if (diffArrayReport) {
        reportSpan.on('click', function() {
            ck.dReports.push(diffArrayReport);
            console.log("Diff Reports", ck.dReports);
        });
    }

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
    await movePiece2(flavor, minus, fromClick, alsoHistorize);
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
            .replace(/.*? /, '')
            .replace(/(\d+x):/, "[$1] ")
            .replace(/,/g, ' ');

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
