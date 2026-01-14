async function setupCrazy2() {
    setupUtilData();
    setupButtons();

    await reset(null);
    await emitSvgs2(true);

    storageKeys();
    clearStorage();

    setupWinners();
    resetTooltips();

    collectMacros();
    sortAndPresentMacros();
    checkMacs();

    $('body').on('click', resetTooltips);
    $('body').on("contextmenu", resetTooltips);
}
function setupWinners() {
    msc.winnersBySecond = {};
    if (_winsGy ) msc.winnersBySecond['gy']  = _winsGy ;
    if (_winsGo ) msc.winnersBySecond['go']  = _winsGo ;
    if (_wins_Go) msc.winnersBySecond['-go'] = _wins_Go;
    if (_winsOy ) msc.winnersBySecond['oy']  = _winsOy ;
    if (_wins_Oy) msc.winnersBySecond['-oy'] = _wins_Oy;
}
function deriveUnderWinners() {
   _winsGy  = msc.winnersBySecond['gy'] ;
   _winsGo  = msc.winnersBySecond['go'] ;
   _wins_Go = msc.winnersBySecond['-go'];
   _winsOy  = msc.winnersBySecond['oy'] ;
   _wins_Oy = msc.winnersBySecond['-oy'];
}
function resetBooleans() {
    ck.showMovesDiffs = true;
    ck.showTurnsDiffs = true;
    ck.showBothDiffs = true;

    showBoolsStatus();
}
function showBoolsStatus() {
    let status = ck.showTurnsDiffs ? '(on)' : '(off)';
    $('#turnDiffsBool').html(status);

    status = ck.showMovesDiffs ? '(on)' : '(off)';
    $('#moveDiffsBool').html(status);

    status = ck.showBothDiffs ? '(on)' : '(off)';
    $('#bothDiffsBool').html(status);

}
async function reset(e) {
    resetRuf();
    clearRuf2hues();

    resetBooleans()

    await initArrays();
    resetTracking();
    await clearCurrentInput(null,true);
    resetHistory();

    await emitSvgs2();
}
function setsAreEqual(setA, setB) {
    return setA.size === setB.size && [...setA].every(value => setB.has(value));
}
function checkMacs() {
    let setPriorMacs = new Set(ck.priorMacs.map(m => JSON.stringify(m)));
    let setDerivedMacs = new Set(ck.macs.map(m => JSON.stringify(m)));
    if ( ! setsAreEqual(setPriorMacs, setDerivedMacs)) {
        let newDerived = setDerivedMacs.difference(setPriorMacs);
        let missingDerived = setPriorMacs.difference(setDerivedMacs);

        let newLabelsList = [...newDerived];
        let newLabels = newLabelsList.map(d => JSON.parse(d).label).filter(d=>d).sort();
        let newLabelsPretty = newLabels.length ? `new macros:\n<${newLabels.join('>\n<')}>` : '';

        let missingLabelsList = [...missingDerived];
        let missingLabels = missingLabelsList.map(d => JSON.parse(d).label).filter(d=>d).sort();
        let missingLabelsPretty = missingLabels.length ? `missing macros:\n<${missingLabels.join('>\n<')}>` : '';

        if (newLabelsPretty) {
            alert(`${newLabels.length} ${newLabelsPretty}`);
        }
        if (missingLabelsPretty) {
            alert(`${missingLabels.length} ${missingLabelsPretty}`);
        }
    }
}
function resetTracking() {
    ck.currentTrackingPieces = [];
    emitTracking();
}
function resetTooltips() {
    // tooltips
    $('.tooltip').tooltip('hide');
    $('[data-toggle="tooltip"]').tooltip();
    //$('[data-toggle="tooltip"]').on('click', resetTooltips);
    $('.tooltip').on('mouseleave', resetTooltips);
}
function setupButtons() {
    $('#resetButton').on('click', function(e) {reset(e, true);});
    $('#resetTrackingButton').on('click', resetTracking);

    $('#toggleMovesDiffBtn').on('click', toggleMoveDiffs2);
    $('#toggleTurnsDiffBtn').on('click', toggleTurnDiffs2);
    $('#toggleBothDiffBtn').on('click', toggleBothDiffs2);

    $('#lSequence').on('click', performMovesNoLoad);
    $('#lMacro').on('click', performMovesNoLoad);
    $('#lMacroXtra').on('click', performMovesNoLoad);
    $('#lHistory').on('click', performMovesNoLoad);
    $('#clearMoves').on('click', clearCurrentInput);
    $('#clearHistory').on('click', resetHistory);
    $('#clearArrays').on('click', async function() { await initArrays(); await emitSvgs2(); });
    $('#hueVariantsButton').on('click', showHueVariants);
    $('#toggleRufInput').on('click', toggleRuf);

    $('#whichRuf').on('change', adjustRuf);
    $('#moveSequence').on('click', handleMoveSequenceClick);

    $('#moveSequence').on('change, keyup', moveSequenceChanged);
    $('#history').off('change').on('change', async function(e) {

        let val = $(e.target).val();

        let minus = false; // cannot detect shift during onChange()
        if ($('#eagerHistory').is(':checked')) {
            if (frozen()) return;
            freeze();
            await loadAndDoMovesIfThere(val, minus);
            unfreeze();
        }
    });
    $('#macro, #macroXtra').on('change', async function(e) {

        let val = $(e.target).val();
        let minus = false; // cannot detect shift during onChange()

        if ($('#eagerMacro').is(':checked')) {
            if (frozen()) return;
            freeze();
            //appendInput(val);
            //let label = reduceMaybeNegifyLabel(val, minus);
            await loadAndDoMovesIfThere(val, minus);
            unfreeze();
        }
        else {
            appendInput(val);
        }
    });

    boldHfToggle();
}
function moveSequenceChanged(e) {
   let newVal = $('#moveSequence').val();
   loadInput(newVal);
   showHueVariants();
}
function clearRuf2hues() {
    $('#ruf2hues').empty();
}

async function loadAndDoMovesIfThere(val, minus, alsoHistorize) {
    if (val) {
        await performAndHistorizeSequence(val, minus, alsoHistorize);
    }
}
async function clearCurrentInput(e, skipCopy) {
    if (!skipCopy) {
        // let moveSeq = $('#moveSequence');
        // await moveSeq.focus();
        //let val = moveSeq.val();
        //await clipboardValue(val);
        //historizeMoves(useHueVsRuf(val));
        //$('#moveSequence').empty();
    }
    loadInput('');
    //clearRuf2hues();
}
function resetHistory() {
    let history = $('#history');
    history.val('placeholder');
    history.find('option.historyOption').remove();
}
function handleMoveSequenceClick(e) {
    let target = $(e.target);
    let val = target.val();
    if (e.altKey) alert(`<${val}>`);
}
function resetRuf() {
    let rufFlavor = 'GyGoOy';
    $(`#whichRuf option[value="${rufFlavor}"]`).prop('selected', true);
    adjustRufHelper(rufFlavor);
}
