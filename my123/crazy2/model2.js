let ck = {};
ck.array = {};

function setupModel2() {
    ck.canPos = {};
    ck.grPos = {};
    ck.canPos.ttr = ck.grPos.H1 = [0,4];
    ck.canPos.crw = ck.grPos.H2 = [1,4];
    ck.canPos.dgw = ck.grPos.H3 = [2,4];
    ck.canPos.cgo = ck.grPos.H4 = [3,4];
    ck.canPos.tto = ck.grPos.H5 = [4,4];
    ck.canPos.coy = ck.grPos.H6 = [5,4];
    ck.canPos.dby = ck.grPos.H7 = [6,4];
    ck.canPos.cbr = ck.grPos.H8 = [7,4];

    ck.canPos.jjw = ck.grPos.L5 = [4,1];
    ck.canPos.dow = ck.grPos.L6 = [4,2];
    ck.canPos.jjo = ck.grPos.L7 = [4,3];
    ck.canPos.ttw = ck.grPos.L3 = [5,1];
    ck.canPos.cbw = ck.grPos.LM = [5,2];
    ck.canPos.dbo = ck.grPos.L9 = [5,3];
    ck.canPos.brw = ck.grPos.L2 = [6,1];
    ck.canPos.ttb = ck.grPos.Lc = [6,2];
    ck.canPos.jjb = ck.grPos.La = [6,3];

    ck.canPos.goy = ck.grPos.Ra = [4,5];
    ck.canPos.ttg = ck.grPos.Rc = [4,6];
    ck.canPos.jjg = ck.grPos.R2 = [4,7];
    ck.canPos.tty = ck.grPos.R9 = [5,5];
    ck.canPos.cgy = ck.grPos.RM = [5,6];
    ck.canPos.dgr = ck.grPos.R3 = [5,7];
    ck.canPos.jjy = ck.grPos.R7 = [6,5];
    ck.canPos.dry = ck.grPos.R6 = [6,6];
    ck.canPos.jjr = ck.grPos.R5 = [6,7];
    
    // extra positions for ghosts
    ck.canPos.dgwl = ck.canPos.dgw;
    ck.canPos.dgwr = ck.canPos.dgw;

    ck.canPos.crwl = ck.canPos.crw;
    ck.canPos.crwr = ck.canPos.crw;             //    0   1   2   3   4   5   6   7   8
                                                // 0             BRW TTr jjr
    ck.canPos.ttrl = ck.canPos.ttr;             // 1             ttw Crw dgr
    ck.canPos.ttrr = ck.canPos.ttr;             // 2             jjw Dgw jjg
    ck.canPos.ttrd = ck.canPos.ttr;             // 3             dow Cgo ttg
                                                // 4 dgw JJw Dow JJo TTo goy TTg JJg dgw
    ck.canPos.jjru = ck.canPos.jjr;             // 5 crw TTw Cbw Dbo Coy TTy Cgy Dgr crw
    ck.canPos.jjrd = ck.canPos.jjr;             // 6 ttr brw TTb JJb Dby JJy Dry JJr ttr
                                                // 7             ttb Cbr dry
    ck.canPos.brwu = ck.canPos.brw;             // 8             BRW ttr jjr
    ck.canPos.brwd = ck.canPos.brw;

    ck.array.gy = [
        //   0        1                    2                    3                     4                         5                   6                    7
        [{},      {},                  {},                  {},                  {b4:'TTr',r4:'090'}, {},                  {},                  {},                  {}],
        [{},      {},                  {},                  {},                  {b4:'Crw',r4:'135'}, {},                  {},                  {},                  {}],
        [{},      {},                  {},                  {},                  {b4:'Dgw',r4:'180'}, {},                  {},                  {},                  {}],
        [{},      {},                  {},                  {},                  {b4:'Cgo',r4:'315'}, {},                  {},                  {},                  {}],
        [{},      {b4:'JJw',r4:'045'},{b4:'Dow',r4:'135'},{b4:'JJo',r4:'270'},{b4:'TTo',r4:'270'}, {b4:'goy',r4:'345'},{b4:'TTg',r4:'000'},{b4:'JJg',r4:'000'},{}],
        [{},      {b4:'TTw',r4:'000'},{b4:'Cbw',r4:'045'},{b4:'Dbo',r4:'315'},{b4:'Coy',r4:'045'}, {b4:'TTy',r4:'180'},{b4:'Cgy',r4:'135'},{b4:'Dgr',r4:'045'},{}],
        [{},      {b4:'brw',r4:'060'},{b4:'TTb',r4:'045'},{b4:'JJb',r4:'045'},{b4:'Dby',r4:'315'}, {b4:'JJy',r4:'225'},{b4:'Dry',r4:'225'},{b4:'JJr',r4:'315'},{}],
        [{},      {},                  {},                  {},                  {b4:'Cbr',r4:'045'}, {},                  {},                  {},                  {}],
        [{},      {},                  {},                  {},                  {},                   {},                  {},                  {},                  {}]
    ];
    ck.r4Delta = [
        [{},      {},                  {},                  {},                  {oy:'090',go:'135'}, {},                  {},                  {},                  {}],
        [{},      {},                  {},                  {},                  {oy:'135',go:'135'}, {},                  {},                  {},                  {}],
        [{},      {},                  {},                  {},                  {oy:'045',go:'045'}, {},                  {},                  {},                  {}],
        [{},      {},                  {},                  {},                  {oy:'315',go:'135'}, {},                  {},                  {},                  {}],
        [{},      {oy:'045',go:'045'}, {oy:'135',go:'315'}, {oy:'280',go:'260'}, {oy:'270',go:'270'}, {oy:'225',go:'135'}, {oy:'000',go:'000'}, {oy:'000',go:'000'}, {}],
        [{},      {oy:'000',go:'000'}, {oy:'045',go:'045'}, {oy:'135',go:'315'}, {oy:'225',go:'225'}, {oy:'180',go:'180'}, {oy:'315',go:'135'}, {oy:'225',go:'045'}, {}],
        [{},      {oy:'180',go:'300'}, {oy:'045',go:'045'}, {oy:'045',go:'045'}, {oy:'135',go:'135'}, {oy:'225',go:'215'}, {oy:'225',go:'045'}, {oy:'000',go:'315'}, {}],
        [{},      {},                  {},                  {},                  {oy:'045',go:'045'}, {},                  {},                  {},                  {}],
        [{},      {},                  {},                  {},                  {},                  {},                  {},                  {},                  {}]
    ];
    ck.ghost = {};

    ck.ghost.dgwl = {coords: [4,0], rotate: '225'};
    ck.ghost.dgwr = {coords: [4,8], rotate: '225'};

    ck.ghost.crwl = {coords: [5,0], rotate: '180'};
    ck.ghost.crwr = {coords: [5,8], rotate: '180'};

    ck.ghost.ttrl =  {coords: [6,0], rotate: '225'};
    ck.ghost.ttrr =  {coords: [6,8], rotate: '225'};
    ck.ghost.ttrd =  {coords: [8,4], rotate: '315'};

    ck.ghost.jjru =  {coords: [0,5], rotate: '000'};
    ck.ghost.jjrd =  {coords: [8,5], rotate: '000'};

    ck.ghost.brwu =  {coords: [0,3], rotate: '225'};
    ck.ghost.brwd =  {coords: [8,3], rotate: '225'};

    ck.ghost.ttw =  {coords: [1,3], rotate: '000'};
    ck.ghost.jjw =  {coords: [2,3], rotate: '000'};
    ck.ghost.dow =  {coords: [3,3], rotate: '090'};

    ck.ghost.ttb =  {coords: [7,3], rotate: '000'};
    ck.ghost.dgr =  {coords: [1,5], rotate: '180'};
    ck.ghost.jjg =  {coords: [2,5], rotate: '000'};
    ck.ghost.ttg =  {coords: [3,5], rotate: '000'};
    ck.ghost.dry =  {coords: [7,5], rotate: '000'};

    ck.numRows = ck.array.gy.length;
    ck.numCols = ck.array.gy[0].length;
}
function initArray(b,r,w,g,o,y,flavor) {
    ck.array[flavor] = jsClone(ck.array.gy);
    let gy = ck.array.gy;
    for (let i=0; i<gy.length; i++) {
        let row = gy[i];
        for (let j=0; j<row.length; j++) {
            let gyElt = gy[i][j];
            if ( ! gyElt.b4) continue; // some items are empty

            let newElt = gy[i][j];
            newElt = {r4:gyElt.r4};
            m_rotateOrInit(newElt);
            let newN = gyElt.b4
                .replace(/b(?!x)/, b + "x")
                .replace(/r(?!x)/, r + "x")
                .replace(/w(?!x)/, w + "x")
                .replace(/g(?!x)/, g + "x")
                .replace(/o(?!x)/, o + "x")
                .replace(/y(?!x)/, y + "x")
                .replace(/(\w)x/g, "$1");

            // re-establish alpha order
            newN = newN.replace(/([a-z]+)/, (whole, group) => group.split('').sort().join(''));
            newElt.b4 = newN;
            newElt.n = newN;

            ck.array[flavor][i][j] = newElt;
        }
    }
}
async function initArrays() {
    initArray('b','r','w','g','o','y','gy');
    //oyRw: b->r  r->w  w->b   g->o   o->y   y->g
    initArray('r','w','b','o','y','g','go');
    //gyBw: b->w  r->b  w->r  g->y  o->g  y->o
    initArray('w','b','r','y','g','o','oy');

    refineArrays();
    makeGy2othersMaps();
    await propagateGy();
}
ck.flavors = ['gy', 'oy', 'go'];
ck.flavors2 = ['oy', 'go'];
ck.rotRegex = /(.*rotate\()(\d+)(,.*)/;

ck.legalMoves = ['gy', 'go', 'oy'];
ck.legalMoves = ck.legalMoves.concat(ck.legalMoves.map(m => '-' + m));

function getSvgRotate(svgG) {
    let transform = svgG.attr('transform');

    let rotate = 0; // default
    if (transform.match(/rotate/)) {
        rotate = transform.replace(ck.rotRegex, "$2");
    }
    return rotate;
}
function setSvgXformRotate(svgG, rotate) {
    let transform = svgG.attr('transform');

    if (!transform.match(/rotate/)) {
        transform += " rotate(0, 16, 16)"
    }
    transform = transform.replace(ck.rotRegex, `$1${rotate}$3`);
    svgG.attr('transform', transform);
}
function addRotationByAngle(current, delta) {
    let result = (Number(current) + 360 + Number(delta)) % 360;
    return result;
}
function addRotationByMatrix(piece, matrix) {
    let currentMatrix = m_fromCode(piece.drCode);
    let rotated = m_mult(currentMatrix, matrix);
    piece.drCode = m_toCode(rotated);
    piece.dr = m_toAngle(rotated);
}
function coordsToArrayItem(flavor, coords) {
    let array = ck.array[flavor];
    return array[coords[0]][coords[1]]
}
function printArrays(header) {
    if (header) {
        console.log(`============================ ${header} ==========================`);
    }
    for (let flavor of ck.flavors) {
        printArraysHelper(flavor);
    }
}
function printArraysHelper(flavor) {
    let array = ck.array[flavor];
    let coordsArray = ck.grPos;
    console.log(`----------- array for ${flavor} -----------`);
    for (let p of Object.keys(coordsArray)) {
        let coords = coordsArray[p];
        let row = coords[0];
        let col = coords[1];
        let item = array[row][col];
        console.log(`key, gy, now, rxyz, drx, dry, drz ==== : ${p}, ${item.b4}, ${item.n}, 
        ${item.r4}, ${item.dr}, ${item.drCode}`);
    }
}

ck.pGyTo = {};
ck.pGfrom = {};

ck.pGyTo.oy = {};
ck.pGfrom.oy = {};
ck.pGyTo.go = {};
ck.pGfrom.go = {};

function refineArrays() {
    for (let flavor of ck.flavors) {
        refineArraysHelper(flavor);
    }
}
function refineArraysHelper(flavor) {
    let clrsExpand = {};
    clrsExpand.g = ck.green;
    clrsExpand.b = ck.blue;
    clrsExpand.o = ck.orange;
    clrsExpand.r = ck.red;
    clrsExpand.w = ck.white;
    clrsExpand.y = ck.yellow;

    for (let gpKey of Object.keys(ck.grPos)) {
        let grPair = ck.grPos[gpKey];
        let item = coordsToArrayItem(flavor, grPair);

        let clrs = nb4ToColors(item.b4);
        let colors = clrs.map(c => clrsExpand[c]);

        item.colors = colors;
        item.pos = gpKey;
        m_rotateOrInit(item);
    }
}
function makeGy2othersMaps() {
    for (let flavor of ck.flavors2) {
        gy2othersMapsHelper(flavor);
    }
}
function gy2othersMapsHelper(flavor) {
    let toMap = ck.pGyTo[flavor];
    let fromMap = ck.pGfrom[flavor];
    for (let gpKey of Object.keys(ck.grPos)) {
        let grPair = ck.grPos[gpKey];
        let item = coordsToArrayItem(flavor, grPair);
        let pKey = item.b4;
        let pPair = getCanPosCoords(pKey);

        toMap[pPair] = grPair;
        fromMap[grPair] = pPair;
    }
}

async function propagateGy() {
    await helperPropagateGy2('oy');
    await helperPropagateGy2('go');
}

// Per JS, the 'constant' [1,2], used eg for ck.canPos
//    will not == a later-mentioned literal [1,2] or constructed [x,y]
// So we retrieve the constant via the values of its parts / coords
// WLOG use the constant pairs from ck.grPos
async function helperPropagateGy2(flavor) {
    //console.log('propagate array to ', flavor);
    let mapTo = ck.pGyTo[flavor];
    for (let gpKey of Object.keys(ck.grPos)) {
        let grPair = ck.grPos[gpKey];
        let item = coordsToArrayItem('gy', grPair);

        let flavorCoords = mapTo[grPair];
        let flavorItem = coordsToArrayItem(flavor, flavorCoords);

        copyAllButB4(item, flavorItem);
        if (flavor != 'gy') {
             flavorItem.r4 = Number(ck.r4Delta[flavorCoords[0]][flavorCoords[1]][flavor]);
        }
    }
}









