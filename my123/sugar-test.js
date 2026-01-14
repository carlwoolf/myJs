
////////// tests //////////////

let tst = {};

tst.suite = () => {
    unhappy = false;

    let tests = [
        testP1
        // testP3,
        // test0,
        // test1,
        // testP0,
        // testP2
    ];
    for (let i=0; i<tests.length && !tst.unhappy; i++) {
        let test = tests[i];
        tst.doTest(test);

    }
    if (tst.unhappy) {
        alert("Oops, some tests failed");
    }
}

///////////////////////////////////////////////// test general functions

testP1 = {testId: 'testP1'};
testP1.go = () => {
    let sweetLines = [
        "@-@-@-@-@- 1'' @@  1,    1>2   .1o2.1     1<2     1<2>1",
        'M:4/4',
        'K:C',
        ` +^1b @+ "viii-blah1" "vii should be 7m/Bm, not vii" ||[c |a,b  2 @- 2 ------+2 2'''' 3()@@3 8 9 '>' `,
        'M:6/8',
        'K:C frey',
        "1''d 0 (1>2)   1<2>1 @+@+@+@+@+ 12 @@ !courtesy!=3",
        'w:lyrics ',
        'W:LYRICS'
    ];

    let expectedLines = [
        `1,b  1,b 1c/b2/ 1/21/ 1/2c/b 1/2a1/`,
        `M:4/4`,
        'K:C',
        `^1'b "viii-blah1" ":7m should be 7m/Bm, not vii" ||[c |a,b   2'b 2b 2,b 2''''b 3()3 1'b (2'b 2'c/b)2'/`,
        'M:6/8',
        'K:C frey',
        `1''d 0c (1b2a) 121 1'''''2''''' !courtesy! =3c`,
        `w:lyrics`,
        `W:LYRICS`
    ];

    return result; // for initial page sanity display
}
testP3 = {testId: 'testP3'};
testP3.go = () => {
    result = "<br/>";
    for (let i=0; i<notes123.length; i++) {
        let note123 = notes123[i][0];
        let noteAbc = noteToAbc({num:note123, nShlat: '', nPrimes:'', nDur:''});

        result += `<br/> N123:${note123}.Nabc:${noteAbc.num}`;
    }
    result += `<br/> ----------------------------------------`;
    for (let i=0; i<6; i++) {
        let note123 = "1" + "'".repeat(i);
        let noteAbc = noteToAbc({num:note123, nShlat: '', nPrimes:'', nDur:''});

        result += `<br/> N123:${note123}.Nabc:${noteAbc.num}`;
    }

    return result;
}

//////////////////////////////////////////////////////////////////////////// misc tests //////////////
test0 = {testId: 'test0'};
test0.go = () => {
    let result = "";
    result += "<br/>" + "stateReSt: " +  re.oneGroup(lx.octStateReSt);
    result += "<br/>" + "ONE noteReSt: " +  re.oneGroup(lx.noteReSt);
    result += "<br/>" + "MANY noteReSt: " +  re.separateGroups(lx.noteReSt);
    result += "<br/>" + "ZERO noteReSt: " +  re.noGroups(lx.noteReSt);

    result += "<br/>" + "quoteReSt: " +  re.oneGroup(lx.quoteReSt);
    result += "<br/>" + "nonMiscReSt: " +  re.oneGroup(lx.nonMiscReSt);

    return result;
}
test1 = {testId: 'test1'};
test1.go = () => {
    let result = "";
    let testN = "2 ^2 +2 2' -^2''c ";
    let testN2 = "@@ @- @+ -^2''c -2 '' .o";
    let testN3 = "@-@+-^2''c-2.''.o";
    result += "<br/>" + "N: " + testN.split(lx.noteRe);
    console.log("N: ", testN.split(lx.noteRe))

    result += "<br/>" + "Few N: " +  [...testN2.matchAll(lx.notesWithParts)];
    console.log("Few N: ", [...testN2.matchAll(lx.notesWithParts)]);
    result += "<br/>" + "One N: " +  [...'^2'.matchAll(lx.notesWithParts)];
    console.log("One N: ", [...'^2'.matchAll(lx.notesWithParts)]);
    result += "<br/>" + "Few N+ticks: " +  [...testN2.matchAll(lx.noteOrTicksOrStateRe)];
    console.log("Few N+ticks: ", [...testN2.matchAll(lx.noteOrTicksOrStateRe)]);
    result += "<br/>" + "Word N+ticks+state: " +  [...testN3.matchAll(lx.noteOrTicksOrStateRe)];
    console.log("Word N+ticks: ", [...testN3.matchAll(lx.noteOrTicksOrStateRe)]);
    result += "<br/>" + "Few N+ticks separate: " +  [...testN2.matchAll(lx.noteOrTicksOrStateReWithParts)];
    console.log("Few N+ticks separate: ", [...testN2.matchAll(lx.noteOrTicksOrStateReWithParts)]);

    let testQ = '"blah" "foo" "bar" ';
    result += "<br/>" + "Q" +  testQ.split(lx.quoteReG).join(':');

    let testS = '@+ bar @- @== @@';
    result += "<br/>" + "S" +  testS.split(lx.octStateRe).join(':');

    let testNM = `1,2, @- 12'' ^2 _2 =2 .12o3 1// 1<2>3 !D.S.! 1 "!segno!" 2 || [5+3] |[a [58]d `;
    result += "<br/>" + "NM:" +  testNM.split(lx.nonMiscRe).join(':');

    let testNM2 = `1,2, dd @- dd 1'' dd ^2 dd _2 dd =2 dd .1o3 dd 1// dd 1<2>3 dd !D.S.! dd 1 dd "!segno!" dd 2 dd || dd [5+3] dd |[a dd [58]d  dd`;
    result += "<br/>" + "NM2:" +  testNM2.split(lx.nonMiscRe).join(':');

    return result;
}

tst.doTest = (test) => {
    let result = "<br/> =====================Hello from test: " + test.testId;
    result += test.go();
    tst.showResult(result, test.testId);
}

tst.showResult = (result) => {
    $('#output').append(result);
}
tst.clearTheClass = (theClass) => {
    $(`.${theClass}`).html("");
}
tst.oops = (msg, context) => {
    context = context ? ` (${context})` : "";

    if (msg) {
        msg = ': ' + msg;
    } else {
        msg = "";
    }
    let complaint = `<br/><span class='error'>Oops${context}${msg}</span>`;

    $('#oops').append(complaint);

    tst.unhappy = true;
}
tst.assertEqual = (expected, received, context, separate) => {
    if (!separate) separate = "";

    expected = String(expected).replace(/\s+/g, " ").trim();
    received = String(received).replace(/\s+/g, " ").trim();

    if (expected !== received) {
        oops(`Expected <br/>${separate}[${expected}] &lt;---------&gt; <br/>${separate}[${received}] received`, context);
    }
}


