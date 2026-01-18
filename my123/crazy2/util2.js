//https://www.google.com/search?q=js+sleep+inside+try+block+never+wakes&rlz=1C5GCCM_en&oq=js+sleep+inside+try+block+never+wakes&gs_lcrp=EgZjaHJvbWUyBggAEEUYOTIHCAEQIRigATIHCAIQIRiPAjIHCAMQIRiPAtIBCDk3MzBqMGo3qAIIsAIB8QU5tQmc6MOm7A&sourceid=chrome&ie=UTF-8
function mySleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

function setupUtilData()
{
    setupModel2();
    ck.showXsSmMdHideOthers = "d-block d-sm-block d-md-block d-lg-none d-xl-none d-xxl-none";
    ck.hideXsSmMdShowOthers = "d-none d-sm-none d-md-none d-lg-block d-xl-block d-xxl-block";

    ck.scale = .65;
    ck.hueVsRuf = false;

    ck.boldBorder = 5;
    ck.someBorder = 3;

    ck.red = "rgb(237,  86, 127)";
    ck.white = "rgb(255, 255, 255)";
    ck.blue = "rgb(077, 105, 207)";
    ck.green = "rgb(39, 204, 6)";
    ck.orange = "rgb(252, 140, 3)";
    ck.yellow = "rgb(255, 255, 0)";

    ck.trackBorderColor = "rgb(113, 52, 234)";

    ck.turnTrack = "rgb(128, 143, 224)";
    ck.moveTrack = "rgb(45, 237, 77)";
    ck.bothTrack = "rgb(242, 187, 116)";

    ck.cloneNum = 0;
    ck.wheight = 32;

    ck.antiRuf = {
        F: 'B',
        U: 'D',
        R: 'L'
    }
    ck.axis = new Map([
            ['gy', 'X'],
            ['go', 'Y'],
            ['oy', 'Z']
        ]
    );
    ck.stdTwin = new Map([
            ['gy', 'gy'],
            ['go', 'go'],
            ['rw', 'oy'],
            ['bw', 'gy'],
            ['br', 'go'],
            ['oy', 'oy']
        ]
    );
    ck.rawTwin = new Map([
            ['gy', 'bw'],
            ['bw', 'gy'],
            ['go', 'br'],
            ['br', 'go'],
            ['rw', 'oy'],
            ['oy', 'rw']
        ]
    );

    // may not need last 3?
    ck.rufSeq = ['R', 'U', 'F',  'R', 'U', 'F'];

    // may not need last 3?
    ck.GoOyGy = ['go', 'oy', 'gy', 'go', 'oy', 'gy'];
    ck.GoGyOy = ['go', 'gy', 'oy', 'go', 'gy', 'oy'];
    ck.OyGyGo = ['oy', 'gy', 'go', 'oy', 'gy', 'go'];
    ck.OyGoGy = ['oy', 'go', 'gy', 'oy', 'go', 'gy'];
    ck.GyGoOy = ['gy', 'go', 'oy', 'gy', 'go', 'oy'];
    ck.GyOyGo = ['gy', 'oy', 'go', 'gy', 'oy', 'go'];

    ck.rufRL = {};
    ck.rufRL['GoOyGy'] = 'R:go/br . U:oy/rw . F:gy/bw';
    ck.rufRL['GoGyOy'] = 'R:go/br . U:gy/bw . F:oy/rw';
    ck.rufRL['OyGyGo'] = 'R:oy/rw . U:gy/bw . F:go/br';
    ck.rufRL['OyGoGy'] = 'R:oy/rw . U:go/br . F:gy/bw';
    ck.rufRL['GyGoOy'] = 'R:gy/bw . U:go/br . F:oy/rw';
    ck.rufRL['GyOyGo'] = 'R:gy/bw . U:oy/rw . F:go/br';

    ck.hueSeq = ck.GyOyGo;

    ck.svg = {};
    ck.solvedSvg = {};

    for (let flavor of ck.flavors) {
        let svg = makeCloneSvg2($(`#svg_${flavor}`), flavor);
        let solvedSvg = makeCloneSvg2($(`#svg_${flavor}Solved`), flavor);
        ck.svg[flavor] = svg;
        ck.solvedSvg[flavor] = solvedSvg;
    }

    ck.dReports0 = [];
    ck.dReports = [];
}

async function adjustRuf(e) {
    let inputField = $('#moveSequence');
    let currentInput = inputField.val();
    currentInput = expandMacrosInSeqStr(currentInput); // in case we wanna log it

    await clearCurrentInput();

    let rufFlavor = $(e.target).val();
    adjustRufHelper(rufFlavor);

    await emitSvgs2(true);
}
function adjustRufHelper(rufFlavor) {
    ck.hueSeq = ck[rufFlavor];
    $('#rufRLcurrent').html(ck.rufRL[rufFlavor]);
}
function hue2ruf2(input) {
    let rufSeq = ck.rufSeq;
    let hueSeq = ck.hueSeq;
    let result = input.replace(/\b(gy|oy|go|bw|rw|br)\b/g, (m) => {
        let index = hueSeq.indexOf(m);
        return rufSeq[index];
    });
    return result;
}
function ruf2hue(input) {
    let result = input.replace(/\b(R|U|F|L|D|B)\b/ig, (m) => {
        let index = ck.rufSeq.indexOf(m.toUpperCase());
        return ck.hueSeq[index];
    });
    return result;
}
function appendInput(val) {
    val = useHueVsRuf(val);
    setInput($('#moveSequence').val() + ' ' + val);
    //showHueVariants();
}
function loadInput(val) {
    val = useHueVsRuf(val);
    setInput(val);
    showHueVariants();
}
function boldHfToggle() {
    $('.tFH').removeClass('hfBold');
    let targetSpan = ck.hueVsRuf ? 'tHue' : 'tRuf';
    $(`#${targetSpan}`).addClass('hfBold');
}
function useHueVsRuf(val) {
    let result;
    if (ck.hueVsRuf) {
        result = ruf2hue(val);
    }
    else {
        result = hue2ruf2(val);
    }
    boldHfToggle();
    return result;
}
function toggleRuf() {
    let target = $('#moveSequence');
    let val = target.val();
    ck.hueVsRuf = !ck.hueVsRuf;

    val = useHueVsRuf(val);

    target.val(val);
}
function onlyColors(piece) {
    return piece.substring(1);
}
function forEachArrayItem(array2d, fn) {
    let keepGoing = true;
    let numRows = array2d.length;
    for (let r=0; r<numRows && keepGoing; r++) {
        let numCols = array2d[r].length;
        for (let c=0; c<numCols && keepGoing; c++) {
            keepGoing = fn(r,c,array2d);
        }
    }
}
function jsClone(input) {
    return JSON.parse(JSON.stringify(input));
}

function assertTrue(expr) {
    if (! expr) {
        alert('oops');
    }
}
function diffDeltaRs(deltas) {
    let result = "";
    if (deltas.length) {
        let items = deltaRhelper(deltas, 'piece', 'deltaR');
        result = `deltaRs (via 'piece'):\n`;
        Object.keys(items).sort().forEach(function(key) {
            result += `${key}: ${items[key].sort().join(' ')}\n`;
        });
    }
    return result;
}
function frozen() {
    //console.log('check if frozen????????');
    let result = ck.freeze == 1;
    if (result) {
        //console.log("FROZEN******************************************");
    }
    return result;
}
function freeze() {
    ck.freeze = 1;
    //console.log('freeze==================================================');
}
function unfreeze() {
    ck.freeze = 0;
    //console.log('unfreeze---------------------------------------------------');
}
function pad(num, size) {
    var s = "000000000" + num;
    return s.substr(s.length-size);
}
function showNow() {
    let now = new Date();
    let days = ['Sunday', 'Monday', 'Tuesday',
        'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    let day = days[now.getDay()];
    let dateTime = day + " "
        + now.getDate() + "/"
        + (now.getMonth() + 1) + "/"
        + now.getFullYear() + " @ "
        + now.getHours() + ":"
        + now.getMinutes() + ":"
        + now.getSeconds();
    return dateTime;
}
function clearStorage() {
    localStorage.clear();
}
function storageKeys() {
    console.log("localstorage keys: <" + Object.keys(localStorage).join(',') + ">");
}