async function emitSvgs2(setup) {
    for (let flavor of ck.flavors) {
        if (setup) {
            await emitOneSvg2(flavor, true);
        }
        await emitOneSvg2(flavor, false);
    }
    await showSvgDiffs2();
}
function emitTracking() {
    initialBorders();

    let gSvgs = $('svg').find('g');
    gSvgs.removeAttr('tracking');
    if (ck.currentTrackingPieces && ck.currentTrackingPieces.length) {
        for (let trackingPiece of ck.currentTrackingPieces) {
            let piece = $('svg').find(`g[n="${trackingPiece}"]`);
            piece.attr('tracking', 1);
        }
        let trackers = $('svg').find('g[tracking]');
        trackers.find('ellipse').each((index,elt) => {
            let eltJ = $(elt);
            eltJ.attr('stroke', ck.trackBorderColor);
            eltJ.attr('stroke-width', ck.boldBorder);
        });
    }
}
function getCanPosCoords(key) {
    return ck.canPos[key.toLowerCase()];
}
function setupGhosts(svg) {
    for (let ghostKey of Object.keys(ck.ghost)) {
        let hauntedPieceCoords = getCanPosCoords(ghostKey);
        let ghostInfo = ck.ghost[ghostKey];
        let ghostCoords = ghostInfo.coords;
        let ghostRotate = ghostInfo.rotate;

        let hauntedSvg = svg.find(`g[r=${hauntedPieceCoords[0]}][c=${hauntedPieceCoords[1]}]`);
        //console.log(`${hauntedSvg.attr('piece')}, the piece from ${hauntedPieceCoords.join(',')} should have ghost at ${ghostCoords.join(',')}`);

        let rowsGhostCoord = ghostCoords[0];
        let colsGhostCoord = ck.cols = ghostCoords[1];
        let ghostScale = .57;
        let rowsGhostTrans = ck.wheight * rowsGhostCoord;
        let colsGhostTrans = ck.wheight * colsGhostCoord;
        let scaleDeltaCoord = (ck.wheight * ghostScale / 2);

        let ghostG = cloneElement(hauntedSvg, 'ghostOuterG');
        let currentRotate = getSvgRotate(ghostG);
        let netRotation = addRotationByAngle(currentRotate, ghostRotate);

        ghostG.attr("transform", `scale(${ck.scale}) translate(${colsGhostTrans},${rowsGhostTrans}) rotate(${netRotation}, 16, 16)`);
        ghostG.attr("opacity", "1");
        ghostG.attr("r", `${rowsGhostCoord}`);
        ghostG.attr("c", `${colsGhostCoord}`);
        ghostG.attr("ghost", true);
        ghostG.attr('title', 'ghost-copy');
        ghostG.find('ellipse').attr('fill', 'rgb(219,219,219)');

        svg.append(ghostG);

        ghostG.children().each((index,elt) => {
            //if ('ellipse' != elt.tagName) {
                $(elt).attr('transform', `scale(${ghostScale}) translate(${scaleDeltaCoord},${scaleDeltaCoord})`);
            //}
        });
    }

}
function makeCloneSvg2(target, nickname) {
    target.empty();
    let archtypeSvg = $('#archtypeSvg');
    let cloneSvg = cloneElement(archtypeSvg, 'svg');
    if (nickname) {
        cloneSvg.attr('nickname', nickname);
    }
    target.append(cloneSvg);
    archtypeSvg = null; // garbage collection;

    return cloneSvg;
}
function prettyPieceName(name) {
    let result = name.replace('TT', 'T').replace('JJ','J');
    if (nb4ToColors(name).length == 3) {
        result = 'K' + result;
    }
    return result;
}
function displayInfoForG(gElt) {
    let r = Number(gElt.attr('r'));
    let c = Number(gElt.attr('c'));
    let n = prettyPieceName(gElt.attr('n'));
    let b4 = prettyPieceName(gElt.attr('b4'));
    let dr = gElt.attr('dr');
    let pos = gElt.attr('pos');

    let info = `Pos:${pos} . ${n}(${b4}) . [${r},${c}] Dr:${dr}`;
    return info;
}
async function emitOneSvg2(flavor, solved) {
    let scale = ck.scale;
    let svgArray = solved ? ck.solvedSvg : ck.svg;
    let targetSvg = svgArray[flavor];
    targetSvg.empty();

    for (let posKey of Object.keys(ck.grPos)) {
        let coords = ck.grPos[posKey];
        let arrayCode = coordsToArrayItem(flavor, coords);
        let svgPiece = makeClonePieceForSvg2(targetSvg, coords, arrayCode, scale, solved);

        svgPiece.attr('n', arrayCode.n);
        svgPiece.attr('b4', arrayCode.b4);
        svgPiece.attr('dr', arrayCode.dr);
        svgPiece.attr('drCode', arrayCode.drCode);
        svgPiece.attr('r4', arrayCode.r4);
        svgPiece.attr('pos', posKey);
        let netRotation = addRotationByAngle(arrayCode.r4, arrayCode.dr);
        setSvgXformRotate(svgPiece, netRotation);

        addTooltip(svgPiece);

        //svgPiece.on('click', svgClickControl);

        let isControl = false;
        if (svgPiece.hasClass('Cx')) {
            isControl = true;
            svgPiece.addClass('moveControlPiece');
            svgPiece.attr('control', 'true');

            svgPiece.on('click', async function (e) {
                let flavorC = svgPiece.attr('n').replace('C','');
                flavor = ck.stdTwin.get(flavorC);
                let minus = e.which == 16 || e.shiftKey;

                if (!e.altKey) { // alt-clicks do not move pieces
                    if (e.metaKey) {
                        let movePrettyName = (minus ? '-' : '') + flavorC;
                        appendInput(movePrettyName);
                    }
                    else {
                        if (frozen()) return;
                        freeze();

                        await movePiece2(flavor, minus, true, true);

                        unfreeze();
                    }
                }
            });
        }
        svgPiece.on('click', async function(e) {
            if (e.altKey) {
                await updateTrackingPieces(svgPiece, isControl);
            }
        })
    }
    setupGhosts(targetSvg);
    emitTracking();
}

function addTooltip(gElt) {
    let generalInfo = displayInfoForG(gElt);
    let title = generalInfo;

    if (!! gElt.attr('ghost')) {
        title = `ghost ${title}`;
    }
    else if (gElt.hasClass('Cx')) {
        let piece = gElt.attr('n');
        let rawColors = onlyColors(piece);
        let stdColors = ck.stdTwin.get(rawColors);
        let oppositeColors = ck.rawTwin.get(rawColors);

        let colors = `${rawColors} (${oppositeColors})`;
        let ruf = hue2ruf2(stdColors);
        let rufs = `${ruf} (${ck.antiRuf[ruf]})`;
        if (rawColors != stdColors) {
            rufs = `${ck.antiRuf[ruf]} (${ruf})`;
        }
        title = `</br>${colors.toUpperCase()} - ${rufs}</br>Click for move, shift-click for minus-move, meta-click to just display move</br>${title}`;
    }
    gElt.attr('title', title);
    gElt.attr('data-toggle', "tooltip");
    gElt.attr('data-placement', "above");
    gElt.attr('data-bs-html', "true");
    gElt.attr('customClass', "tooltip");
}
//async function svgClickControl(e) {
//     console.log('CLICK!');
//     let g = $(e.target).closest('g');
//     let ellipse = g.find('ellipse');
//     let n = g.attr('n');
//     if (e.altKey) {
//         await updateTrackingPiece(n, true);
//     }
// }
function updateTrackingPieces(svgG) {
    let n = svgG.attr('n');
    if (ck.currentTrackingPieces.includes(n)) {
        ck.currentTrackingPieces =
            ck.currentTrackingPieces.filter(p => p != n);
        emitTracking();
    } else {
        ck.currentTrackingPieces.push(n);
        emitTracking();
    }
}
function n2arch(piece) {
    let result = piece.replace(/[a-z]/g, "");
    if (!result) {
        result = 'K'; // K only uses the LC color letters
    }
    result = result.split('')[0]; // eliminate dup UC letters, there for readability

    return result;
}
function nb4ToColors(piece) {
    let result = piece.replace(/[A-Z]/g, "").split('');
    return result;
}
function makeClonePieceForSvg2(svg, coords, code, scale, solved) {
    let [r,c] = coords;
    // cf svgDisplay2 in css for making origin be top left

    // console.log('numCols: ', ck.numCols, ' numRows: ', ck.numRows);
    // console.log('Piece ', code.n, ' says col ', c);

    let x = ck.wheight * c;
    let y = ck.wheight * r;

    let codePiece = solved ? code.b4 : code.n;

    let archtypeId = n2arch(codePiece) + 'x';
    let colors = code.colors;
    let effectiveColors = Array.from(colors);

    // switch some colors
    if (['Cgo', 'Cbw'].includes(codePiece)) {
        effectiveColors = effectiveColors.reverse();
    }
    if ('brw' == codePiece) {
        effectiveColors = [effectiveColors[0], effectiveColors[2], effectiveColors[1]];
    }
    let rotate = addRotationByAngle(code.r4, code.dr);

    let archtypePiece = $(`#${archtypeId}`);
    let clonePiece = cloneElement(archtypePiece, archtypeId);
    archtypePiece = null; // garbage collection?

    let transformRhs = `scale(${scale}) translate(${x},${y})`;
    let initRotate = clonePiece.attr('init_rotate');
    initRotate = initRotate ? Number(initRotate) : 0; // zero if it was undefined

    if (rotate || initRotate) {
        rotate += ((Number(initRotate) + 360) % 360);
        transformRhs += ` rotate(${rotate}, 16, 16)`;
    }
    clonePiece.attr('transform', transformRhs);
    clonePiece.attr('c', c);
    clonePiece.attr('r', r);

    let [firstColor, secondColor, thirdColor] = effectiveColors;
    setElementFill(clonePiece.find('.c1'), firstColor);
    if (secondColor) {
        setElementFill(clonePiece.find('.c2'), secondColor);
    }
    if (thirdColor) {
        setElementFill(clonePiece.find('.c3'), thirdColor);
    }

    svg.append(clonePiece);

    if (r == 2 && c == 0) {
        clonePiece.closest('g').addClass("bord");
    }

    return clonePiece;
}
async function toggleTurnDiffs2() {
    ck.showTurnsDiffs = ! ck.showTurnsDiffs;
    showBoolsStatus();
    await emitSvgs2();
}
async function toggleBothDiffs2() {
    ck.showBothDiffs = ! ck.showBothDiffs;
    showBoolsStatus();
    await emitSvgs2();
}
async function toggleMoveDiffs2() {
    ck.showMovesDiffs = ! ck.showMovesDiffs;
    showBoolsStatus();
    await emitSvgs2();
}
