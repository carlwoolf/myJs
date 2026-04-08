// for rubiks related rotational matrices (use +/- 1 or 0 for vals)
// '9' encodes -1
// '8' encodes 0

let m = { rows:3, cols:3};

function m_test() {
    let m1 = m.rID;

    for (let m2 of [
            m.r120.dbo,
            m.r90.gy,
            m.r120.dow,
            m.r90.br,
            m.r120.to,
            m.r90.rw
        ]) {
        m1 = m_mult(m2, m1);
        console.log(`next: rotation ${m2.name} and get ${m_toAngle(m1)}`);
    }

    console.log('result: ', m_toAngle(m1));
}
function m_demo() {
    console.log('matrix demo');

    console.log('from 1,2,3,4,5,6,7,8,9: ', m_fromCode('1,2,3,4,5,6,7,8,9'));
    console.log('back to 1,2,3,4,5,6,7,8,9: ', m_toCode([[1,2,3],[4,5,6],[7,8,9]]));

    console.log('angles, m.rIDx (expect 0), xyz90 (expect 90s): ', m_toAngle(m.rID), m_toAngle(m.r90.gy), m_toAngle(m.r90.go), m_toAngle(m.r90.oy));
    console.log('angles,  m.rIDxy (0), x90*y90, y90*x90: ', m_toAngle(m.rID), m_toAngle(m_mult(m.r90.gy,m.r90.go)),
        m_toAngle(m_mult(m.r90.go,m.r90.gy)));

    console.log('x,y,yx: ', m_toCode(m.r90.gy), '----', m_toCode(m.r90.go), '----', m_toCode(m_mult(m.r90.go,m.r90.gy)));

    console.log('m.rx, m._rx, ie 90x, -90x, 90y, -90y, 90z, -90z',
        m_toAngle(m.r90.gy, 'X'), m_toAngle(m_minusRot(m.r90.gy)), m_toAngle(m.r90.go), m_toAngle(m_minusRot(m.r90.go)),
        m_toAngle(m.r90.oy), m_toAngle(m_minusRot(m.r90.oy)));
    console.log('m.r90.gy * m._rx, m._rx * m.r90.gy, angle', m_mult(m.r90.gy, m_minusRot(m.r90.gy)), m_mult(m_minusRot(m.r90.gy), m.r90.gy),
        m_toAngle(m_mult(m.r90.gy, m_minusRot(m.r90.gy))));

    console.log('120 on three axes: ', m_toAngle(m.r120.X.H3), m_toAngle(m.r120.Y.H3), m_toAngle(m.r120.Z.H3));
    console.log('-120 on three axes: ', m_toAngle(m_minusRot(m.r120.X.H3)), m_toAngle(m_minusRot(m.r120.Y.H3)), m_toAngle(m_minusRot(m.r120.Z.H3)));

    let mm = m.rID;
    for (let i=0; i<2; i++) {
        for (let m2 of [m.r90.gy, m.r90.go, m.r90.oy, m.r120.X.H3, m.r120.Y.H3, m.r120.Z.H3,
                m_minusRot(m.r90.gy), m_minusRot(m.r90.go), m_minusRot(m.r90.oy), m_minusRot(m.r120.X.H3), m_minusRot(m.r120.Y.H3), m_minusRot(m.r120.Z.H3)]) {
            mm = m_mult(m2, mm);
            console.log(m_toAngle(mm));
        }
    }
}
async function addRotationByMatrix(piece, matrix, flavor) {

    //console.log(`Rotate ${piece.n} by ${matrix.name}`);
    let axis;
    let nameProp = 'n';

    if (flavor) {
        // the turn is on one of the xyz axes, ie, 'gy', 'oy' or 'go'
        axis = m.axis[flavor];
    }
    else {
        // the turn is on original 'side' piece in that position
        let fur = pieceNameToFur(piece.b4);
        axis = m.axis[fur];
        nameProp = 'b4';
    }
    await logIfSurveiling('dbo', piece.n, `${piece.n}: addRotation. b4: ${Number(piece.dr)}. Rotating ${m_toAngle(matrix, axis)} (rotName: ${matrix.name})`);

    let currentMatrix = m_fromCode(piece.drCode);
    let rotated = m_mult(matrix, currentMatrix);
    piece.dr = await m_toAngle(rotated, axis);
    piece.drCode = m_toCode(rotated);

    await logIfSurveiling('dbo', piece[nameProp], `addRotation f2: ${Number(piece.dr)}`);
}

function m_rotateOrInit(piece, matrix) {
    if (!piece.drCode) {
        piece.dr = 0;
        piece.drCode = m_toCode(m.rID);
    }
}
function m_fromCode(str) {
    let codes = str.split(',').map(c=>Number(c));
    let row0 = codes.slice(0,3);
    let row1 = codes.slice(3,6);
    let row2 = codes.slice(6,9);

    let result = [row0, row1, row2];
    return result;
}
function m_toCode(matrix) {
    let flat = matrix[0].concat(matrix[1]).concat(matrix[2]);
    return flat.join(',');
}
function m_toAngle(matrix, referenceAxis = null) {
    let info = myAnalyzeRotationMatrix(matrix, true);
    let result = 0;

    if (referenceAxis) {
        // Dot product of extracted axis with reference axis
        // If they point the same way, rotation is positive; opposite = negative
        const dot = info.axis[0] * referenceAxis[0]
            + info.axis[1] * referenceAxis[1]
            + info.axis[2] * referenceAxis[2];
        result = info.angleDegrees * Math.sign(dot);
    }

    result = info.angleDegrees * info.angleValence;
    return (result + 360) % 360;
}
function m_minusRot(matrix) {
    let result = [];
    for (let c=0; c<m.cols; c++) {
        let srow = [];
        for (let r=0; r<m.rows; r++) {
            srow.push(matrix[r][c]);
        }
        result.push(srow);
    }
    if (matrix.name) {
        result.name = '-' + matrix.name;
    }
    return result;
}
function m_mult(m1, m2, verbose){
    let result = [];
    for (let r=0; r<m.rows; r++) {
        let m1Row = m1[r];
        let prodRow = [];
        for (let c=0; c<m.cols; c++) {
            let m2Col = getCol(c, m2);
            prodRow.push(dotP(m1Row, m2Col));
        }
        result.push(prodRow);
    }

    let simpleMult = multiply3x3(m1,m2);
    if (verbose) {
        console.log(`M1:${JSON.stringify(m1)} M2:${JSON.stringify(m2)} \nRESULT:${JSON.stringify(result)}`);
    }
    if (pretty3x3(result) != pretty3x3(simpleMult)) {
        alert(`=====HEY! my mult ${result} differs from simple mult ${simpleMult}`)
    }
    return result;
}
function multiply3x3(a, b) {
    let result = [
        [0, 0, 0],
        [0, 0, 0],
        [0, 0, 0]
    ];
    for (let i = 0; i < 3; i++) {
        for (let j = 0; j < 3; j++) {
            for (let k = 0; k < 3; k++) {
                result[i][j] += a[i][k] * b[k][j];
            }
        }
    }
    return result;
}
function pretty3x3(m) {
    let result = '';
    for (let i = 0; i < 3; i++) {
        for (let j = 0; j < 3; j++) {
            result += ' ' + m[i][j];
        }
    }
    return result;
}
function getCol(index, matrix) {
    let result = [];
    for (let i=0; i<m.rows; i++) {
        result.push(matrix[i][index]);
    }
    return result;
}
function dotP(row, col) {
    let result = row[0] * col[0] +
                 row[1] * col[1] +
                 row[2] * col[2];
    return result;
    //return +result.toFixed(3);
}

function setupM() {
    m.r90 = {};
    m.r120 = {};
    m.axis = {};

    m.axis.gy = [1,0,0];
    m.axis.go = [0,1,0];
    m.axis.oy = [0,0,1];

    m.axis.bw = [-1,0,0];
    m.axis.br = [0,-1,0];
    m.axis.rw = [0,0,-1];

    // zero rotation. identity matrix
    m.rID = [[1, 0, 0],
        [0, 1, 0],
        [0, 0, 1]];

    m.r90.gy = [[1, 0, 0],
            [0, 0, -1],
            [0, 1, 0]];
    m.r90.go = [[0, 0, 1],
            [0, 1, 0],
            [-1, 0, 0]];
    m.r90.oy = [[0, -1, 0],
            [1, 0, 0],
            [0, 0, 1]];
    m.r90.gy.name = 'gy90';
    m.r90.go.name = 'go90';
    m.r90.oy.name = 'oy90';

    m.r90.bw = m_minusRot(m.r90.gy);
    m.r90.br = m_minusRot(m.r90.go);
    m.r90.rw = m_minusRot(m.r90.oy);

    // for (let key of ['gy', 'go', 'oy', 'bw', 'br', 'rw']) {
    //     let axis = m.axis[key];
    //     console.log('piece: ', key, '. axis:', axis.join(','), ' --> angle: ', m_toAngle(m.r90[key], axis));
    // }

    setupHighwayRotations();

}
function rotationMatrixViaAxisAndAngle(axis, angleRad, piece) {
    let [x, y, z] = axis;

    // Normalize the axis (important!)
    const len = Math.hypot(x, y, z);
    if (len === 0) {
        throw new Error("Axis vector cannot be zero");
    }
    x /= len;
    y /= len;
    z /= len;

    const c = Math.cos(angleRad);
    const s = Math.sin(angleRad);
    const t = 1 - c;

    let result = [
        [
            t*x*x + c,
            t*x*y - s*z,
            t*x*z + s*y
        ],
        [
            t*x*y + s*z,
            t*y*y + c,
            t*y*z - s*x
        ],
        [
            t*x*z - s*y,
            t*y*z + s*x,
            t*z*z + c
        ]
    ];
    m.r120[piece] = result;
    m.r120[piece].name = piece+'120';
    m.axis[piece] = axis;
    //console.log('piece: ', piece, '. axis:', axis.join(','), ' --> angle: ', m_toAngle(result, axis));
}
function setupHighwayRotations() {
    let angle = 2 * Math.PI / 3;
    let recipRt2 = 1/Math.sqrt(2);

     // chatGpt:
     // x == gy. y == go. z == oy
     rotationMatrixViaAxisAndAngle([recipRt2, recipRt2, 0]  , angle, 'tg' );
     rotationMatrixViaAxisAndAngle([-recipRt2, recipRt2, 0] , angle, 'dow');
     rotationMatrixViaAxisAndAngle([-recipRt2, -recipRt2, 0], angle, 'tb' );
     rotationMatrixViaAxisAndAngle([recipRt2, -recipRt2, 0] , angle, 'dry');

     rotationMatrixViaAxisAndAngle([recipRt2, 0, recipRt2]  , angle, 'ty' );
     rotationMatrixViaAxisAndAngle([-recipRt2, 0, recipRt2] , angle, 'dbo');
     rotationMatrixViaAxisAndAngle([-recipRt2, 0, -recipRt2], angle, 'tw' );
     rotationMatrixViaAxisAndAngle([recipRt2, 0, -recipRt2] , angle, 'dgr');

     rotationMatrixViaAxisAndAngle([0, recipRt2, recipRt2]  , angle, 'to' );
     rotationMatrixViaAxisAndAngle([0, -recipRt2, recipRt2] , angle, 'dby');
     rotationMatrixViaAxisAndAngle([0, -recipRt2, -recipRt2], angle, 'tr' );
     rotationMatrixViaAxisAndAngle([0, recipRt2, -recipRt2] , angle, 'dgw');


     rotationMatrixViaAxisAndAngle([1, 0, 0] , angle, 'gy' );
     rotationMatrixViaAxisAndAngle([0, 1, 0] , angle, 'go' );
     rotationMatrixViaAxisAndAngle([0, 0, 1] , angle, 'oy' );
}
