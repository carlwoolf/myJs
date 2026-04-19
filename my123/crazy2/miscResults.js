/**
 *
 *  try in misc.js  collectMacroCandidates('-1')
 *                  filterAllCandidates('-1')
 *
 *   then here      applyFilters(filters, customFields)
 *                  eg      applyFilters([f_kf])
 *
 *   can debug-try sequence using
 *                  debugTrySequence()
 *
 */

msc.sample = {};

function collectMacros() {
    ck.macs = ck.priorMacs;
    // if using ck.priorMacs instead of winners
        /****
        [
        { "x": 1, "seq": "R,-F,-F,-R,-F,-F",         "label": "_sf_ks180_hs120" },
        { "x": 1, "seq": "R,-U,-U,-R,-U,-U",         "label": "_sw_ks180_hs120" },
        { "x": 2, "seq": "F,R,U",                    "label": "__s90_6c180" },
        { "x": 4, "seq": "F,R,U",                    "label": "__s180" },
        // ??? // { "x": 1, "seq": "R,U,F,F,U,-R,-F,-U,-U,-F", "label": "f2_h15_vp" },
        // ??? // { "x": 1, "seq": "R,F,U,U,F,-R,-U,-F,-F,-U", "label": "f2_h15_zp" },
        // ??? // { "x": 1, "seq": "R,R,U,R,R,-F,-F,-U,-F,-F", "label": "f2_h17_vw" },
        // ??? // { "x": 1, "seq": "R,U,R,R,-F,-F,-U,-F,-F,R", "label": "f2_h17_zw" },
        //{ "x": 2, "seq": "R,-U,-R,U",                "label": "f0_8c180" },
        //{ "x": 1, "seq": "R,U,R,-U,-R,-R,-U,-R,U,R", "label": "f2_h13_vf" },
        //{ "x": 1, "seq": "R,R,U,R,-U,-R,-R,-U,-R,U", "label": "f2_h13_zf" },
        // { "x": 1, "seq": "R,-F,-F,-F,R,F",           "label": "f2_4hoc12s088" },
        // { "x": 1, "seq": "R,F,-U,F,-U,-R",           "label": "f2_4hc12s088" },
        // { "x": 1, "seq": "R,U,U,U,R,-U",             "label": "f2_4hoc12s880" },
        //{ "x": 1, "seq": "R,R,R,U,R,R,R,-F",         "label": "f1_hc180" },
        //{ "x": 1, "seq": "R,-U,R,-U,R,-U,-F,-U,R,F", "label": "f2_h4s_RL_vz" },
    ];
    areInitialsAlsoWinners();
         *****/
    windowizeWinnerQueries(ck.macs);
}

msc.applies2 = [
    function __c0(w) {
        return w._05_ncR == 0;
    },
    function __c4(w) {
        return w._05_ncR <= 4;
    },
    function __scoreM120_le32(w) {
        return w._00_score120 <= 32 && w._00_score120 > 28;
    },
    function __scoreM120_le28(w) {
        return w._00_score120 <= 28 && w._00_score120 > 22;
    },
    function __scoreM120_le22(w) {
        return w._00_score120 <= 22 && w._00_score120 > 8;
    },
    function __scoreM120_le8(w) {
        return w._00_score120 <= 8;
    },
];
msc.applies = [
    function __scoreM120_le8(w) {
        return w._00_score <= 24;
    },


    function __c2_180(w) {
        return w._00_score120 < 38 && w.rBreakdown[180]
            && w.rBreakdown[180].filter(p => p[0] == 'C').length == 2;
    },
    function __c4_180(w) {
        return w._00_score120 < 40 && w.rBreakdown[180]
            && w.rBreakdown[180].filter(p => p[0] == 'C').length == 4;
    },
    function __c6_180(w) {
        return w._00_score120 < 42 && w.rBreakdown[180]
            && w.rBreakdown[180].filter(p => p[0] == 'C').length == 6;
    },
    function _kw(w) {
        return (
                w._01_deltaP.filter(p => p.b4 === 'JJw' && p.n === 'goy').length
            &&  w._01_deltaP.filter(p => p.b4 === 'JJo' && p.n === 'JJg').length
            &&  w._01_deltaP.filter(p => p.b4 === 'JJb' && p.n === 'JJr').length
            &&  w._01_deltaP.filter(p => p.b4 === 'brw' && p.n === 'JJy').length
        )
    },
    function _kf(w) {
        return (
                w._01_deltaP.filter(p => p.b4 === 'JJw' && p.n === 'JJr').length
            &&  w._01_deltaP.filter(p => p.b4 === 'JJo' && p.n === 'JJy').length
            &&  w._01_deltaP.filter(p => p.b4 === 'JJb' && p.n === 'goy').length
            &&  w._01_deltaP.filter(p => p.b4 === 'brw' && p.n === 'JJg').length
        )
    },
    function _kp(w) {
        return (
                w._01_deltaP.filter(p => p.b4 === 'JJw'   && p.n === 'JJb'  ).length
            &&  w._01_deltaP.filter(p => p.b4 === 'JJo'   && p.n === 'brw').length
            &&  w._01_deltaP.filter(p => p.b4 === 'goy'   && p.n === 'JJr'  ).length
            &&  w._01_deltaP.filter(p => p.b4 === 'JJg'   && p.n === 'JJy'  ).length
        );
    },
    function _sp(w) {
        return (
                w._01_deltaP.filter(p => p.b4 === 'TTw'   && p.n === 'Dbo').length
            &&  w._01_deltaP.filter(p => p.b4 === 'TTb'   && p.n === 'Dow').length
            &&  w._01_deltaP.filter(p => p.b4 === 'TTy'   && p.n === 'Dgr').length
            &&  w._01_deltaP.filter(p => p.b4 === 'Dry'   && p.n === 'TTg' ).length
        );
    },
    function _sw(w) {
        return (
                w._01_deltaP.filter(p => p.b4 === 'TTw'   && p.n === 'TTy').length
            &&  w._01_deltaP.filter(p => p.b4 === 'TTb'   && p.n === 'Dry').length
            &&  w._01_deltaP.filter(p => p.b4 === 'Dbo'   && p.n === 'Dgr').length
            &&  w._01_deltaP.filter(p => p.b4 === 'Dow'   && p.n === 'TTg' ).length
        );
    },
    function _sf(w) {
        return (
                w._01_deltaP.filter(p => p.b4 === 'TTw'   && p.n === 'Dgr').length
            &&  w._01_deltaP.filter(p => p.b4 === 'TTb'   && p.n === 'TTg').length
            &&  w._01_deltaP.filter(p => p.b4 === 'Dbo'   && p.n === 'TTy').length
            &&  w._01_deltaP.filter(p => p.b4 === 'Dow'   && p.n === 'Dry' ).length
           );
    },
    // no hits
    function __k4_180(w) {
        return w._07_nkR==4 && w.rBreakdown[180]
            && (w.rBreakdown[180].filter(p => p[0] == 'T' || p == 'goy' || p == 'brw').length == 4);
    },
    function __k8_180(w) {
        return w._07_nkR==8 && w.rBreakdown[180]
            && (w.rBreakdown[180].filter(p => p[0] == 'T' || p == 'goy' || p == 'brw').length == 8);
    },
    function __kxyz_120(w) {
        return w.rBreakdown[120]
            && (w.rBreakdown[120].filter(p => p == 'goy' || p == 'brw').length == 2);
    },
    function __kxyz_240(w) {
        return w.rBreakdown[240]
            && (w.rBreakdown[240].filter(p => p == 'goy' || p == 'brw').length == 2);
    },
].sort((a,b) => a.name.localeCompare(b.name));

function getS120plusMinus(w) {
    // svg diff does not have breakdown!?
    if (! w.rBreakdown) {
        return 0;
    }

    let num120 = w.rBreakdown[120] ?
        w.rBreakdown[120].filter(p => p[0] == 'T' || p[0] == 'D').length : 0;
    let num240 = w.rBreakdown[240] ?
        w.rBreakdown[240].filter(p => p[0] == 'T' || p[0] == 'D').length : 0;
    return num120 + num240;
}
const matchDeltaP = (w, deltaPsub) => {
    let result = deltaPsub.length == w.r._01_deltaP.length;

    if (result) { // so far so good
        for (let sub of deltaPsub) {
            result = result && w.r._01_deltaP.filter(p => p.b4 == sub.b4 && p.n == sub.n).length;
            if (!result) break;
        }
    }
    return result;
};

function f_ac(array, val) {
    let strVal = JSON.stringify(val);
    return (w) => w.r[array].filter(p=>JSON.stringify(p) == strVal).length
}
function f_as(array, val) {
    return (w) => w.r[array].size == val
}
function f_at(w)  { return (w.r._02_deltaR.length); }
function f_nst(w) { return (w.r._09_nsR === 0); }
function f_nkt(w) { return (w.r._07_nkR === 0); }
function f_nct(w) { return (w.r._05_ncR === 0); }
function f_oct(w) { return (w.r._05_ncR > 0         && w.r._07_nkR === 0 && w.r._09_nsR === 0); }
function f_ost(w) { return (w.r._09_nsR > 0         && w.r._07_nkR === 0 && w.r._05_ncR === 0); }
function f_okt(w) { return (w.r._07_nkR > 0         && w.r._05_ncR === 0 && w.r._09_nsR === 0); }

function f_not(f) { return (w) => !f(w) }

function f_eq  (a, b) { return (w) => w.r[a] == b }
function f_neq (a, b) { return (w) => w.r[a] !=    b }
function f_lt  (a, b) { return (w) => w.r[a] <     b }
function f_le  (a, b) { return (w) => w.r[a] <=     b }
function f_gt  (a, b) { return (w) => w.r[a] >     b }
function f_ge  (a, b) { return (w) => w.r[a] >=     b }

// spelled out result returns to facilitate breakpoints
// a piece did or did not move (to X)
function f_noP(a) {
    return (w) => {
        let result = !(w.r._01_deltaP.filter(p=> p.b4 == a).length);
        return result;
     }}
function f_yesP(a) {
    return (w) => {
        let result = w.r._01_deltaP.filter(p=> p.b4 == a).length;
        return result;
     }}
function f_b4Is (a, b) {
    return (w) => {
        let result = w.r._01_deltaP.filter(p=>p.b4 == a &&  p.n==b).length;
        return result;
    }}
function f_b4IsNot (a, b) {
    return (w) => {
        let result = w.r._01_deltaP.filter(p=> p.b4 == a).length &&
                    !(w.r._01_deltaP.filter(p=> p.b4==a && p.n == b).length)
    }}

// a piece did (or did not) rotate (by x)
function f_noR(a) {
    return (w) => {
        let result = !(w.r._02_deltaR.filter(p=> p.n == a).length);
        return result;
     }}
function f_yesR(a) {
    return (w) => {
        let result = w.r._02_deltaR.filter(p=> p.n == a).length;
        return result;
    }}
function f_drIs (a, b) {
    return (w) => {
        let result = w.r._02_deltaR.filter(p=>p.n==a && p.dr == b).length;
        return result;
    }}
function f_drIsNot (a, b) {
    return (w) => {
        let result = w.r._02_deltaR.filter(p=>p.n==a).length &&
                    !(w.r._02_deltaR.filter(p=> p.n==a && p.dr == b).length);
        return result;
    }}

function tldr(winners) {
    if (!Array.isArray(winners)) { //oops
        winners = [winners];
    }
    let result = winners.map(w=>{
        let totalMoves = w.x * w.seq.split(',').length;
        return {
            s:`${pad(w._00_score120,3)}sc ${pad(totalMoves,3)}tm ${w.r._33_turns}t.${w.r._33_turns}m.${w.r._35_trNmv}b ${w.x}${hue2ruf2(w.seq)}`,
            r:w.r
        }
    });
    result = result.sort(sortTldr);
    return result;
}
function windowizeWinnerQueries(collector) {
    msc.f = {};
    for (f of msc.applies) {
        let name = f.name;
        window[name] = f;
        msc.f[name] = f;
    }
    for (f of msc.applies2) {
        let name = f.name;
        window[name] = f;
        msc.f[name] = f;
    }
}

function areInitialsAlsoWinners() {
    setupMscWinners();
    if (msc.winners) {
        for (let initial of ck.macs) {
            if (msc.winners.filter(w => w.x == initial.x && w.seq == ruf2hue(initial.seq)).length) {
                console.log('----------- Dup of a winner. Attempted cheater? ', JSON.stringify(initial));
            } else {
                console.log('+++++++++++ Legitimate pseudo-winner: ', JSON.stringify(initial));
            }
        }
    }
}
function setupMscWinners() {
    if (!msc.winners) {
        msc.winners =           _winsGo
                        .concat(_winsGy)
                        .concat(_winsOy)
                        .concat(_wins_Oy)
                        .concat(_wins_Go);
    }
}
function indirectFilter(candidates, directFilter) {
    let result = candidates.filter(c => {
        if (c.x) {
            return directFilter(c.r);
        }
        else {
            return directFilter(c);
        }
    });
    return result;
}
function applyFilters(options) {
    if (typeof options === 'function') {
        options = {filters: [options]};
    }
    else if (Array.isArray(options)) {
        options = {filters: options};
    }
    if (!options.collector) {
        options.collector = [];
    }

    let filters = options.filters;
    if (!Array.isArray(filters)) { //oops
        filters = [ filters ];
    }

    let customFields = options.customFields;
    let label = options.label ? options.label : '';
    let mySort = options.sort ? options.sort : tldr;

    let filterResult = [];
    setupMscWinners();
    if (filters && filters.length && msc.winners) {
        filterResult = msc.winners;
        for (let myFilter of filters) {
            filterResult = indirectFilter(filterResult, myFilter);
        }
        if (customFields && customFields.length) {
            filterResult = sortByWR_MovesFieldList(filterResult, customFields);
        }
        if (mySort == tldr) {
            filterResult = mySort(filterResult);
        }
        else {
            filterResult = filterResult.sort(mySort);
        }
    }
    if (! filterResult.length) {
        console.log('--- no results for filter(s) starting with : ', filters[0].name);
    }

    // add first result to collection to be offered as macros
    let collector = options.collector;
    let index = !options.index ? 0 : options.index;
    if (collector && filterResult.length >= index+1) {
        let chosen = filterResult[index];

        if (msc.noDups && msc.noDups.includes(chosen.seq)) {
            chosen = null; // can't use the above choice
            for (let i = index+1; i < filterResult.length; i++) {
                let candidate = filterResult[i];
                if (msc.noDups.includes(candidate.seq)) {
                    continue;
                }
                chosen = candidate;
                break;
            }
        }
        if (chosen) {
            if (msc.noDups) {
                if (msc.noDups.includes(chosen.seq)) {
                    alert ('wtf');
                }
                else {
                    //console.log(msc.noDups);
                }
                msc.noDups.push(chosen.seq);
            }
            if (mySort == tldr) {
                let x = chosen.s.replace(/.* /, "").replace(/[-,a-zA-Z]+/, "");
                let seq = chosen.s.replace(/.* /, "").replace(/\d+/, "");

                collector.push({x: x, seq: seq, label: label});
            } else {
                collector.push({x: chosen.x, seq: chosen.seq, label: label});
            }
        }
    }
    return filterResult;
}
function sortNumMoves(a,b) {
    let aMoves = a.x * a.seq.split(',').length;
    let bMoves = b.x * b.seq.split(',').length;

    return aMoves - bMoves;
}
function sortTldr(a,b) {
    return a.s.localeCompare(b.s);
}
function sortByWR_MovesFieldList(array, fields) {
    let sortFn = (a, b) => {
        let aMoves = numMoves(a);
        let bMoves = numMoves(b);
        for (let i = 0; i < fields.length; i++) {
            let field = fields[i];
            if (a.r[field] != b.r[field]) {
                return a.r[field] - b.r[field];
            }
        }
        if (aMoves != bMoves) {
            return aMoves - bMoves;
        }
    }
    return array.sort(sortFn);
}

function numMoves(w) {
    return w.x * w.seq.split(',').length;
}
function sortAndPresentMacros() {
    ck.macs = ck.macs.sort((a,b) => {
        return a.label.localeCompare(b.label)
    });
    ck.macroByLabel = {};

    let select = $('#macro');
    select.empty();

    let selectXtra = $('#macroXtra');
    selectXtra.empty();

    for (let i=0; i<ck.macs.length; i++) {
        let macro = ck.macs[i];
        if (typeof macro === 'string') {
            select.append($(`<option disabled="true">${macro}</option>`));
            continue;
        }

        let [optDisplay, optVal, label] = macroToOptValAndMap(macro);
        let whichSelect = $('#macro');
        if (!macro.hide) {
            addOption(whichSelect, optDisplay, optVal);
        }
        ck.macroByLabel[label] = optVal;
        ck.macroByLabel['-' + label] = minusifySeqStr(optVal);
    }
    select.prepend($('<option class="placeholder" disabled="true">macro</option>'));
    select.find('.placeholder').attr('selected', true);
    // select.on('change', function(e) {
    //     let displayDiv = $('#whichMacro');
    //     displayDiv.html($(e.target).find('option:selected').html().replace(/].*/, "]"));
    // });
}
function addOption(target, display, val) {
    let option = $(`<option value="${val}">${display}</option>`);
    target.append(option);
}
function macroToOptValAndMap(macro) {
    let seqStr = macro.seq;
    if (!macro.displaySubMacros) {
        seqStr = expandMacrosInSeqStr(seqStr);
    }
    let seqArray = seqStr
        .replace(/\[.*?\]/g, '')
        .trim()
        .replace(/ +/g, ',')
        .split(',');

    let numMoves = `${macro.x * seqArray.length}m`;
    let numReps = `${macro.x}x`;

    let label = macro.label;
    let optDisplay = `[${label}.${numMoves}] ${numReps}:${hue2ruf2(seqStr)}`;

    let fullSequence = (seqStr + ' [] ')
        .repeat(macro.x)
        .replace(/\[\]\s*$/, "[$]") // remove last marker
        .trim();
    let optVal = `[${label}] ${fullSequence}`;
    return [optDisplay, optVal, label];
}
