// for rubiks related rotational matrices (use +/- 1 or 0 for vals)
// '9' encodes -1
// '8' encodes 0

let m = { rows:3, cols:3};

function m_demo() {
    console.log('matrix demo');

    console.log('from 1,2,3,4,5,6,7,8,9: ', m_fromCode('1,2,3,4,5,6,7,8,9'));
    console.log('back to 1,2,3,4,5,6,7,8,9: ', m_toCode([[1,2,3],[4,5,6],[7,8,9]]));

    console.log('angles, m.rIDx (expect 0), xyz90 (expect 90s): ', m_toAngle(m.rID), m_toAngle(m.r90.gy), m_toAngle(m.r90.go), m_toAngle(m.r90.oy));
    console.log('angles,  m.rIDxy (0), x90*y90, y90*x90: ', m_toAngle(m.rID), m_toAngle(m_mult(m.r90.gy,m.r90.go)),
        m_toAngle(m_mult(m.r90.go,m.r90.gy)));

    console.log('x,y,yx: ', m_toCode(m.r90.gy), m_toCode(m.r90.go), m_toCode(m_mult(m.r90.go,m.r90.gy)));

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

function m_rotateOrInit(piece, matrix) {
    if (!piece.drCode) {
        piece.dr = 0;
        //piece.drCode = m_toCode(m.rID);
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
function m_toAngle_orig(matrix) {
    let info = myAnalyzeRotationMatrix(matrix);

    return info.angleDegrees * info.angleValence;
}
function m_toAngle(matrix, referenceAxis = null) {
    let info = myAnalyzeRotationMatrix(matrix, true);

    if (referenceAxis) {
        // Dot product of extracted axis with reference axis
        // If they point the same way, rotation is positive; opposite = negative
        const dot = info.axis[0] * referenceAxis[0]
            + info.axis[1] * referenceAxis[1]
            + info.axis[2] * referenceAxis[2];
        return info.angleDegrees * Math.sign(dot);
    }

    return info.angleDegrees * info.angleValence;
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

    m.r90.bw = m_minusRot(m.r90.gy);
    m.r90.br = m_minusRot(m.r90.go);
    m.r90.rw = m_minusRot(m.r90.oy);

    // for (let key of ['gy', 'go', 'oy', 'bw', 'br', 'rw']) {
    //     let axis = m.axis[key];
    //     console.log('piece: ', key, '. axis:', axis.join(','), ' --> angle: ', m_toAngle(m.r90[key], axis));
    // }

    setupHighwayRotations();

}
function rotationMatrixViaPieceAndAngle(axis, angleRad, piece) {
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
    m.axis[piece] = axis;
    //console.log('piece: ', piece, '. axis:', axis.join(','), ' --> angle: ', m_toAngle(result, axis));
}
function setupHighwayRotations() {
    let angle = 2 * Math.PI / 3;
    let recipRt2 = 1/Math.sqrt(2);

     // chatGpt:
     // x == gy. y == oy. z == go
     rotationMatrixViaPieceAndAngle([recipRt2, recipRt2, 0]  , angle, 'dow');  // [1, 0, 0]     //for xz plane starting at x=1
     rotationMatrixViaPieceAndAngle([-recipRt2, recipRt2, 0] , angle, 'tb' );  // [0, 1, 0]
     rotationMatrixViaPieceAndAngle([-recipRt2, -recipRt2, 0], angle, 'dry');  // [0, 0]
     rotationMatrixViaPieceAndAngle([recipRt2, -recipRt2, 0] , angle, 'tg' );  // [-1, 0]
     rotationMatrixViaPieceAndAngle([recipRt2, 0, recipRt2]  , angle, 'to' );  // [1, 0, 0]     //similar for xz plane starting at x=1
     rotationMatrixViaPieceAndAngle([-recipRt2, 0, recipRt2] , angle, 'dby');  // [0, 0, 1]
     rotationMatrixViaPieceAndAngle([-recipRt2, 0, -recipRt2], angle, 'tr' );  // [-1, 0, 0]
     rotationMatrixViaPieceAndAngle([recipRt2, 0, -recipRt2] , angle, 'dgw');  // [0, 0, -1]
     rotationMatrixViaPieceAndAngle([0, recipRt2, recipRt2]  , angle, 'dbo');  // [0, 1, 0]     //and finally the yz plane, starting with y=1
     rotationMatrixViaPieceAndAngle([0, -recipRt2, recipRt2] , angle, 'ty' );  // [0, 0, 1]
     rotationMatrixViaPieceAndAngle([0, -recipRt2, -recipRt2], angle, 'dgr');  // [0, -1, 0]
     rotationMatrixViaPieceAndAngle([0, recipRt2, -recipRt2] , angle, 'tw' );  // [0, 0, -1]

}
