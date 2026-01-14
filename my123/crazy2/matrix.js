// for rubiks related rotational matrices (use +/- 1 or 0 for vals)
// '9' encodes -1
// '8' encodes 0

let m = { rows:3, cols:3};

function m_demo() {
    console.log('matrix demo');

    console.log('from 1,2,3,4,5,6,7,8,9: ', m_fromCode('1,2,3,4,5,6,7,8,9'));
    console.log('back to 1,2,3,4,5,6,7,8,9: ', m_toCode([[1,2,3],[4,5,6],[7,8,9]]));

    console.log('angles, m.rIDx, xyz: ', m_toAngle(m.rID), m_toAngle(m.r90.X), m_toAngle(m.r90.Y), m_toAngle(m.r90.Z));
    console.log('angles,  m.rIDxy, x*y, y*x: ', m_toAngle(m.rID), m_toAngle(m_mult(m.r90.X,m.r90.Y)),
        m_toAngle(m_mult(m.r90.Y,m.r90.X)));
    console.log('x,y,yx: ', m_toCode(m.r90.X), m_toCode(m.r90.Y), m_toCode(m_mult(m.r90.Y,m.r90.X)));

    console.log('m.rx, m._rx, ie 90x, -90x, 90y, -90y, 90z, -90z',
        m_toAngle(m.r90.X, 'X'), m_toAngle(m_minusRot(m.r90.X)), m_toAngle(m.r90.Y), m_toAngle(m_minusRot(m.r90.Y)),
        m_toAngle(m.r90.Z), m_toAngle(m_minusRot(m.r90.Z)));
    console.log('m.r90.X*m._rx, m._rx*m.r90.X, angle', m_mult(m.r90.X, m_minusRot(m.r90.X)), m_mult(m_minusRot(m.r90.X), m.r90.X),
        m_toAngle(m_mult(m.r90.X, m_minusRot(m.r90.X))));

    console.log('120 on three axes: ', m_toAngle(m.r120.X), m_toAngle(m.r120.Y), m_toAngle(m.r120.Z));
    console.log('-120 on three axes: ', m_toAngle(m_minusRot(m.r120.X)), m_toAngle(m_minusRot(m.r120.Y)), m_toAngle(m_minusRot(m.r120.Z)));

    for (let key of Object.keys(m.r120)) {
        let matrix = m.r120[key];
        let repeat = m.r120[key];
        console.log(`m.r120[${key}]`, m_toAngle(matrix));

        for (let i=0; i<20; i++) {
            repeat = m_mult(repeat, matrix);
            console.log(`after 20x: m.r120[${key}]`, m_toAngle(matrix));
        }
    }
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
function m_toAngle(matrix) {
    let info = analyzeRotationMatrix(matrix)

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
    if (verbose) {
        console.log(`M1:${JSON.stringify(m1)} M2:${JSON.stringify(m2)} RESULT:${JSON.stringify(result)}`);
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

(function setupM() {
    m.r90 = {};
    m.r120 = {};

    m.temp = [[0.250 ,   0.612 ,  -0.750],
        [-0.612 , -1/2   ,   -0.612],
        [-0.750 ,   0.612 ,   0.250]];

    m.rID = [[1, 0, 0],
        [0, 1, 0],
        [0, 0, 1]];

    m.r90.X = [[1, 0, 0],
            [0, 0, -1],
            [0, 1, 0]];

    m.r90.Y = [[0, 0, 1],
            [0, 1, 0],
            [-1, 0, 0]];

    m.r90.Z = [[0, -1, 0],
            [1, 0, 0],
            [0, 0, 1]];

    const sqrt6_over_4 = Math.sqrt(3) / 2;
    m.r120.X =  [   [1,    0,      0  ],
                    [0,  -1/2,   sqrt6_over_4 ],
                    [0,  -sqrt6_over_4,  -1/2 ]
    ];
    m.r120.Y =  [   [-1/2,   0,  -sqrt6_over_4  ],
                    [0,      1,   0 ],
                    [ sqrt6_over_4,  0,  -1/2 ]
    ];
    m.r120.Z =  [   [-1/2,    sqrt6_over_4,  0  ],
                    [ -sqrt6_over_4,   -1/2,  0 ],
                    [0,         0,   1]
    ];

})();
