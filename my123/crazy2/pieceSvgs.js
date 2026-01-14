function processProps(obj, target, fn) {
    let result = [];
    Object.keys(obj).forEach(function(key,index) {
        console.log(key, ' ----> ', obj[key]);
        result.push(fn(key, obj[key], target));
    });
    return result;
}

function cloneElement(obj, type) {
    let clone = obj.clone();
    clone.attr('id', type + Number(ck.cloneNum++));
    clone.removeClass('d-none');
    return $(clone);
}
function makeCloneSvg(target, nickname) {
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
function makeClonePieceForSvg(svg, r,c, code, scale) {
    let x = ck.wheight * c;
    let y = ck.wheight * r;

    if (code == '') return $('<span> </span>');

    let archtypeId = code.piece;
    let colors = code.colors;
    let effectiveColors = Array.from(colors);

    // switch some colors
    if (['Cgo', 'Cbw'].includes(code.veryShort)) {
        effectiveColors = effectiveColors.reverse();
    }
    if (['Kbrw', 'Kgoy'].includes(code.veryShort)) {
        effectiveColors = [effectiveColors[0], effectiveColors[2], effectiveColors[1]];
    }
    let rotate = code.rotate;

    let archtypePiece = $(`#${archtypeId}`);
    let clonePiece = cloneElement(archtypePiece, archtypeId);
    archtypePiece = null; // garbage collection;

    let transformRhs = `scale(${scale}) translate(${x},${y})`;
    let initRotate = clonePiece.attr('init_rotate');
    initRotate = initRotate ? initRotate : 0; // zero if it was undefined

    if (rotate || initRotate) {
        rotate += ((Number(initRotate) + 360) % 360);
        transformRhs += ` rotate(${rotate}, 16, 16)`;
    }
    clonePiece.attr('transform', transformRhs);
    clonePiece.attr('r', r);
    clonePiece.attr('c', c);

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
function setElementFill(elt, color) {
    if (color) elt.attr('fill', color);
}
function initialBorders() {
    $('svg').find('ellipse').attr('stroke', 'white');
    $('svg').find('ellipse').attr('stroke-width', '0');

    $('svg').find('g[control]').find('ellipse').attr('stroke', 'violet');
    $('svg').find('g[control]').find('ellipse').attr('stroke-width', ck.someBorder);

    $('svg').find('g[ghost]').find('ellipse').attr("stroke", 'grey');
    $('svg').find('g[ghost]').find('ellipse').attr("stroke-width", '1');
}

function appendDeltaR(target, piece, delta) {
    let item = {piece: piece};
    item.deltaR = delta;
    target.deltaR.push(item);
}
function deltaRhelper(deltas, pieceProp, deltaRprop) {
    let items = {};
    for (let i=0; i<deltas.length; i++) {
        let r = deltas[i];
        if (!items[r[deltaRprop]]) {
            items[r[deltaRprop]] = [];
        }
        items[r[deltaRprop]].push(r[pieceProp]);
    }
    Object.keys(items).forEach(function(key) {
        items[key] = items[key].sort();
    });

    return items;
}
