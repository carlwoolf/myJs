let lonelyLetter = 'b';
let bigLonely = 'c/b';
let smallLonely = '/'

function condenseWhite(input) {
    let result = input.replace(/ +/g, " ").trim();
    return result;
}

let mush        = {name: "mush     ", val: "0c 1  .1o2.1   1.23.45o67o8989         ^5'    4'    (c123 1<2>3     4<2>3 1-82-9    +18+29"};
let exp_mush    = {name: "exp_mush ", val: "0c 1b  1/21/  12/3/4//5//6/7/1'2'1'2' ^5'b   4'b   (c123 1/2a3/     4/2a3/ 1122      1'1'2'2'"};
let mush2       = {name: "mush2    ", val: "123 @+  1b2    21b     1-1 @-  8+1 @+    123 @-"};
let exp_mush2   = {name: "exp_mush2", val: " 123    1'b2'   2'1'b    1'1     1'1'      1'2'3'"};
let mush3       = {name: "mush3    ", val: "     (123 @+   1)-1 @-  1>2 1<2           8(+1 @+     123)"};
let exp_mush3   = {name: "exp_mush3", val: " (123          1')1     1c/b2/  1/2c/b    1'(1'       1'2'3')"};
let mush4       = {name: "mush4    ", val: "1d --2b ++1d 1 '   1.11   [a 123 [b 456  1b2'b 3d ||   1  '2 '  "};
let exp_mush4   = {name: "exp_mush4", val: "1d 2,b   1''d (1b 1b) 11/1/  [a 123 [b 456  1b2'b 3d ||  (1b 1)(2 2b) "};
let mush5       = {name: "mush5    ", val: "@+123    @-089  !bang-word!   01    !bang-word!01"};
let exp_mush5   = {name: "exp_mush5", val: "1'2'3'   01'2'    !bang-word!   01    !bang-word! 01"};
let mush6       = {name: "mush6    ", val: "S-1-2'---3'  .8     @+ -1-2'---3' !D.S.!1 @-"};
let exp_mush6   = {name: "exp_mush6", val: "S1,23,        1'a       12'3, !D.S.! 1'b"};
let mush7       = {name: "mush7    ", val: `1 '' '    '2  'c     "27" " ii" "ii"   "iI" `};
let exp_mush7   = {name: "exp_mush7", val: `(1b 1)1 1b  1(2  2c) "27" ":2m" ":2m"   ":2m" `};

let noteNoDurationStNg = "(?:[-+]*[_^]*[0-9z][']*)";
let durationStNg = "[a-hp-w\\/]*";
let noteStNg = `${noteNoDurationStNg}${durationStNg}`;
let endStNg = "(?::?[|]*[[][a-b]|:[|]*|[|]*:|[|]+|K:.*)";

let noteStGp = `(${noteStNg})`;
let noteOrEndStGp = `(K:\\w+(?:\\s+\\w+)|${noteStNg}|${endStNg})`;

let noteReGpG = new RegExp(noteStGp, "g");
let noteOrEndReGpG = new RegExp(noteOrEndStGp, "g");

function adjustForChord(num) {
    let result = num;
    result = result.replace(/_(\w)/, "$1♭")
    result = result.replace(/\^(\w)/, "$1#");
    result = result.replace(/\=(\w)/, "$1");
    result = result.replace(/[,']/g, "");
    result = result.toUpperCase();

    return result;
}

function adjustToMeterDirective(top, bottom) {
    if (Number(top) % 3 == 0) {
        lonelyLetter = 'c';
        bigLonely = 'b';
        smallLonely = 'a';
    }
    // what other permutations do we care about?
    else  {
        lonelyLetter = 'b';
        bigLonely = 'c/b';
        smallLonely = '/';
    }
}

function tryKeyAdjust(displayKeyName) {
    displayKeyName = canonicalKeyDisplay(displayKeyName);

    let previousMode = getGCMode();
    globalCurrentMode = nameToModeMap.get(displayKeyName.trim()); // trim should be unnecesary!
    if ( ! globalCurrentMode) {
        console.log("Could not find named GCMode for <" + displayKeyName + ">");
        globalCurrentMode = previousMode;
    }
    adjustTonicModeDropdowns();
    return globalCurrentMode;
}
function adjustToKeyDirective(kline) {
    let displayKeyName = condenseWhite(kline.replace(/\s*%.*/, "").replace(/K:\s*/, ""));

    tryKeyAdjust(displayKeyName);
}

async function parse123(doStarLines) {
    if (deferParse) return; // we'll get to it later

    resetGlobalNotes();

    showProgress(true, "parse 123");

    // head start for above
    await waitableTimeout(100);
    pushCurrentMode();
    let resultsString = await parseToAbc.parse123(doStarLines);

    //console.log('abc content? ', resultsString);
    $('#abc').val(resultsString);
    $('#abc').change();

    if ($('#audio').length) {
        setTune(true);

        popCurrentMode();

        showProgress(false, "parse 123");
    }
}
