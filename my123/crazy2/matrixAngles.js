/**
 * Analyzes a 3x3 rotation matrix and returns complete rotation information
 * @param {Array<Array<number>>} matrix - 3x3 rotation matrix
 * @returns {Object} Complete rotation analysis
 */
function analyzeRotationMatrix(matrix, verbose) {
    // Validate input
    if (!matrix || matrix.length !== 3 || matrix[0].length !== 3) {
        throw new Error('Invalid matrix: must be 3x3');
    }

    // Calculate determinant
    const [[a, b, c], [d, e, f], [g, h, i]] = matrix;
    const det = a * (e * i - f * h) - b * (d * i - f * g) + c * (d * h - e * g);

    // Calculate trace to get angle magnitude
    const trace = matrix[0][0] + matrix[1][1] + matrix[2][2];
    const cosTheta = (trace - 1) / 2;

    // Clamp to valid range for acos
    const cosThetaClamped = Math.max(-1, Math.min(1, cosTheta));
    const thetaRad = Math.acos(cosThetaClamped);
    const thetaDeg = thetaRad * (180 / Math.PI);

    // Extract rotation axis from skew-symmetric part
    const axisRaw = [
        matrix[2][1] - matrix[1][2],  // (R[2][1] - R[1][2])
        matrix[0][2] - matrix[2][0],  // (R[0][2] - R[2][0])
        matrix[1][0] - matrix[0][1]   // (R[1][0] - R[0][1])
    ];

    const axisLength = Math.sqrt(
        axisRaw[0] * axisRaw[0] +
        axisRaw[1] * axisRaw[1] +
        axisRaw[2] * axisRaw[2]
    );

    // Handle special cases
    if (axisLength < 0.0001) {
        if (Math.abs(thetaDeg) < 0.1) {
            // Identity matrix (no rotation)
            return {
                angleValence: 1,
                angleDegrees: 0,
                isValid: Math.abs(det - 1) < 0.001,
                determinant: det,
                angle: 0,
                angleRadians: 0,
                axis: [0, 0, 1],  // arbitrary axis
                axisNormalized: [0, 0, 1],
                rotationType: 'identity',
                isProperRotation: Math.abs(det - 1) < 0.001
            };
        } else {
            // 180° rotation - axis extraction is ambiguous
            // Use alternative method to find axis
            const axis180 = extract180DegreeAxis(matrix);
            return {
                angleValence: 1,
                angleDegrees: 180,
                isValid: Math.abs(det - 1) < 0.001,
                determinant: det,
                angle: 180,
                angleDegrees: 180,
                angleRadians: Math.PI,
                axis: axis180,
                axisNormalized: axis180,
                rotationType: '180-degree',
                isProperRotation: Math.abs(det - 1) < 0.001
            };
        }
    }

    // Normalize axis
    const axisNorm = axisRaw.map(a => a / axisLength);

    // Determine sign of rotation
    // The skew-symmetric part gives us 2*sin(theta)*axis
    // For angles in [0, π], sin(theta) >= 0
    // The axis direction tells us if we use +theta or -theta
    // We extract the axis pointing in the direction that makes sin positive
    // So the angle is always positive relative to the extracted axis

    // However, to distinguish +θ from -θ rotations:
    // We keep the axis as extracted (pointing towards positive sin)
    // The angle magnitude from acos is always [0, π]
    // This represents a positive rotation around the extracted axis

    let signedAngleDeg = thetaDeg;
    let signedAngleRad = thetaRad;

    // Check if it's axis-aligned
    const axisType = getAxisType(axisNorm);
    const axisValence = getAxisValence(axisNorm);

    let isValid = Math.abs(det - 1) < 0.001 || Math.abs(det + 1) < 0.001;
    if (! isValid) {
        console.log('Not a valid rotation matrix: ', JSON.stringify(matrix))
        alert('Not a valid rotation matrix: ' + JSON.stringify(matrix));
    }
    let result = {
        angleDegrees: Math.round(signedAngleDeg / 10) * 10, // round to nearest 10 ,
        angleValence: axisValence,
    };
    if (verbose) {
        result.determinant = det;
        result.angle = signedAngleDeg;
        result.angleRadians = signedAngleRad;
        result.angleMagnitude = thetaDeg;
        result.axis = axisNorm;
        result.axisNormalized = axisNorm;
        result.axisType = axisType;
        result.rotationType = 'general';
        result.isProperRotation = Math.abs(det - 1) < 0.001;
        result.isImproperRotation = Math.abs(det + 1) < 0.001;
    }
    return result;
}

/**
 * Extract axis for 180° rotation using eigenvector method
 */
function extract180DegreeAxis(matrix) {
    // For 180° rotation, axis is eigenvector with eigenvalue 1
    // R*v = v means (R - I)*v = 0
    // Find the column with largest diagonal element + 1
    const diag = [
        matrix[0][0] + 1,
        matrix[1][1] + 1,
        matrix[2][2] + 1
    ];

    let maxIdx = 0;
    if (diag[1] > diag[0]) maxIdx = 1;
    if (diag[2] > diag[maxIdx]) maxIdx = 2;

    // Extract that column from R + I
    const axis = [
        matrix[0][maxIdx] + (maxIdx === 0 ? 1 : 0),
        matrix[1][maxIdx] + (maxIdx === 1 ? 1 : 0),
        matrix[2][maxIdx] + (maxIdx === 2 ? 1 : 0)
    ];

    // Normalize
    const len = Math.sqrt(axis[0]*axis[0] + axis[1]*axis[1] + axis[2]*axis[2]);
    return axis.map(a => a / len);
}

/**
 * Determine if axis is aligned with x, y, or z
 */
function getAxisType(axis) {
    const threshold = 0.99;

    if (Math.abs(axis[0]) > threshold && Math.abs(axis[1]) < 0.01 && Math.abs(axis[2]) < 0.01) {
        return axis[0] > 0 ? '+x' : '-x';
    }
    if (Math.abs(axis[1]) > threshold && Math.abs(axis[0]) < 0.01 && Math.abs(axis[2]) < 0.01) {
        return axis[1] > 0 ? '+y' : '-y';
    }
    if (Math.abs(axis[2]) > threshold && Math.abs(axis[0]) < 0.01 && Math.abs(axis[1]) < 0.01) {
        return axis[2] > 0 ? '+z' : '-z';
    }

    return 'general';
}
function getAxisValence(axis) {
    let numNegs = axis.filter(a => a < 0).length;
    let numNonZero = axis.filter(a=> a != 0).length;
    return (numNegs > 0 && numNegs > numNonZero/2) ? -1 : 1;
}

// Example usage:
// const testMatrix = [
//     [1, 0, 0],
//     [0, 0, -1],
//     [0, 1, 0]
// ];
//
// const analysis = analyzeRotationMatrix(testMatrix);
// console.log(analysis);
/////////////////////////////////
/**
 * Apply Gram-Schmidt orthogonalization to restore a rotation matrix
 * This removes accumulated numerical errors while preserving the rotation
 */
function gramSchmidtOrthogonalize(matrix) {
    // Extract the three column vectors
    let v1 = [matrix[0][0], matrix[1][0], matrix[2][0]];
    let v2 = [matrix[0][1], matrix[1][1], matrix[2][1]];
    let v3 = [matrix[0][2], matrix[1][2], matrix[2][2]];

    // Normalize v1
    let u1 = normalize(v1);

    // Make v2 orthogonal to u1, then normalize
    let v2_proj = subtract(v2, scale(u1, dot(v2, u1)));
    let u2 = normalize(v2_proj);

    // Make v3 orthogonal to u1 and u2, then normalize
    // For rotation matrices, we can use cross product for perfect orthogonality
    let u3 = cross(u1, u2);

    // Reconstruct matrix from orthonormal columns
    return [
        [u1[0], u2[0], u3[0]],
        [u1[1], u2[1], u3[1]],
        [u1[2], u2[2], u3[2]]
    ];
}

/**
 * Convert axis-angle representation to rotation matrix
 * Uses Rodrigues' rotation formula
 * @param {Array} axis - [x, y, z] rotation axis (will be normalized)
 * @param {number} angleDeg - rotation angle in degrees
 */
function axisAngleToMatrix(axis, angleDeg) {
    // Normalize the axis
    const [x, y, z] = normalize(axis);

    // Convert angle to radians
    const theta = angleDeg * Math.PI / 180;
    const c = Math.cos(theta);
    const s = Math.sin(theta);
    const t = 1 - c;

    // Rodrigues' rotation formula
    return [
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
}

// Helper functions
function dot(v1, v2) {
    return v1[0]*v2[0] + v1[1]*v2[1] + v1[2]*v2[2];
}

function normalize(v) {
    const len = Math.sqrt(v[0]*v[0] + v[1]*v[1] + v[2]*v[2]);
    if (len < 1e-10) return [0, 0, 1]; // Avoid division by zero
    return [v[0]/len, v[1]/len, v[2]/len];
}

function scale(v, s) {
    return [v[0]*s, v[1]*s, v[2]*s];
}

function subtract(v1, v2) {
    return [v1[0]-v2[0], v1[1]-v2[1], v1[2]-v2[2]];
}

function cross(v1, v2) {
    return [
        v1[1]*v2[2] - v1[2]*v2[1],
        v1[2]*v2[0] - v1[0]*v2[2],
        v1[0]*v2[1] - v1[1]*v2[0]
    ];
}
//////////////////////

// Positive 120° rotations around X-axis edges
// BY edge (angle: 45°)
const sqrt6_over_4 = Math.sqrt(6) / 4;  // This is the exact value for 0.612
m.r120.by = [
    [-1/2, sqrt6_over_4, -sqrt6_over_4],
    [-sqrt6_over_4, 1/4, 3/4],
    [sqrt6_over_4, 3/4, 1/4]
];

// O edge (angle: 135°)
m.r120.o = [
    [-1/2, sqrt6_over_4, sqrt6_over_4],
    [-sqrt6_over_4, 1/4, -3/4],
    [-sqrt6_over_4, -3/4, 1/4]
];

// GW edge (angle: 225°)
m.r120.gw = [
    [-1/2, -sqrt6_over_4, sqrt6_over_4],
    [sqrt6_over_4, 1/4, 3/4],
    [-sqrt6_over_4, 3/4, 1/4]
];

// R edge (angle: 315°)
m.r120.r = [
    [-1/2, -sqrt6_over_4, -sqrt6_over_4],
    [sqrt6_over_4, 1/4, -3/4],
    [sqrt6_over_4, -3/4, 1/4]
];

// Positive 120° rotations around Y-axis edges
// Y edge (angle: 45°)
m.r120.y = [
    [1/4, sqrt6_over_4, 3/4],
    [-sqrt6_over_4, -1/2, sqrt6_over_4],
    [3/4, -sqrt6_over_4, 1/4]
];

// BO edge (angle: 135°)
m.r120.bo = [
    [1/4, sqrt6_over_4, -3/4],
    [-sqrt6_over_4, -1/2, -sqrt6_over_4],
    [-3/4, sqrt6_over_4, 1/4]
];

// W edge (angle: 225°)
m.r120.w = [
    [1/4, -sqrt6_over_4, 3/4],
    [sqrt6_over_4, -1/2, -sqrt6_over_4],
    [3/4, sqrt6_over_4, 1/4]
];

// GR edge (angle: 315°)
m.r120.gr = [
    [1/4, -sqrt6_over_4, -3/4],
    [sqrt6_over_4, -1/2, sqrt6_over_4],
    [-3/4, -sqrt6_over_4, 1/4]
];

// Positive 120° rotations around Z-axis edges
// G edge (angle: 45°)
m.r120.g = [
    [1/4, 3/4, -sqrt6_over_4],
    [3/4, 1/4, sqrt6_over_4],
    [sqrt6_over_4, -sqrt6_over_4, -1/2]
];

// RY edge (angle: 135°)
m.r120.ry = [
    [1/4, -3/4, -sqrt6_over_4],
    [-3/4, 1/4, -sqrt6_over_4],
    [sqrt6_over_4, sqrt6_over_4, -1/2]
];

// B edge (angle: 225°)
m.r120.b = [
    [1/4, 3/4, sqrt6_over_4],
    [3/4, 1/4, -sqrt6_over_4],
    [-sqrt6_over_4, sqrt6_over_4, -1/2]
];

// OW edge (angle: 315°)
m.r120.ow = [
    [1/4, -3/4, sqrt6_over_4],
    [-3/4, 1/4, sqrt6_over_4],
    [-sqrt6_over_4, -sqrt6_over_4, -1/2]
];