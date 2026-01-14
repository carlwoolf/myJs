
let testFails = false;
let doLog = false;

function testAllScales() {
	//log("Testing testAllScales", "big");
	let _123result = "";

	let numModes = keysModes.length;
	let numScaleSets = scaleNumSets.length;

	for (let j=0; j<numScaleSets; j++) {
		let scaleNumSet = scaleNumSets[j];
		//log ("Checking: --------------------------- " + scaleNumSet.name + " scales");
		for (let k=0; k<numModes; k++) {
			let keysMode = keysModes[k];
			let keys = keysMode.keys;
			let flavor = keysMode.flavor;
			if (   (flavor == 'freygish' || flavor == 'misheberakh')
				&& ( scaleNumSet.name.includes("chromatic"))) {
				continue;
			}

			// https://stackoverflow.com/questions/1723168/what-is-the-fastest-or-most-elegant-way-to-compute-a-set-difference-using-javasc
			let ourSkippedNums = chrSkippedNums[flavor];
			//log ("Checking: --- " + flavor);
			for (let i = 0; i < keys.length; i++) {
				let key = keys[i];
				globalCurrentMode = scalesMap[key][flavor];
				let keyDisplay = globalCurrentMode._123DisplayName;
				_123result += `K:${keyDisplay}\n`;
				_123result += `P: K:${keyDisplay} ${scaleNumSet.name}\n`;
				_123result += allScaleHelper(scaleNumSet, ourSkippedNums);
			}
		}
	}
	$('#_123Entry').val(_123result);
	//log("+++++++++++Done testing testAllScales", "big");
}

function alertIfFail() {
	if (testFails) {
		alert('Test Failures: Maybe "Clear 123" and try again? \nOtherwise, search for Blast');
	}
}
function addClearButton() {
	resultDiv.append($('<br/>%<button class="dynamicClear">Clear Tests</button>'));
	$('.dynamicClear').on('click', testClear);
}

function dynamicTest() {
	clear123();

	shuffleTest();
	addClearButton();

	testSubsets();
	addClearButton();

	testScales();
	addClearButton();

	testAllScales();
	addClearButton();

	testParse();
	addClearButton();

	alertIfFail();

	return false; // somehow 'bubble up' reloads the page :(
}

function shuffleTest() {
	log("Testing shuffle", "big");
	let myString = "K:A\n" +
		" 1\n" +
		"K:_B\n" +
		" 1\n" +
		"K:B\n" +
		" 1\n" +
		"K:C\n" +
		" 1\n" +
		"K:_D\n" +
		" 1\n" +
		"K:D\n" +
		" 1\n" +
		"K:_E\n" +
		" 1\n" +
		"K:E\n" +
		" 1\n" +
		"K:F\n" +
		" 1\n" +
		"K:_G\n" +
		" 1\n" +
		"K:G\n" +
		" 1\n" +
		"K:_A\n" +
		" 1\n";
	myString = myString.replace(/\\n/g, " ").replace(/\s+/g, " ").trim();
	//console.log(myString);
	let myArray = myString.split(/\s+/);
	//console.log(myArray);

	let next;
	let expectedLength = myArray.length;
	let actualLength;

	for (let i=0; i<1000; i++) {
		next = shuffle(myArray);
		actualLength = next.length;
		assertEqual(expectedLength, actualLength, actualLength + " vs " + expectedLength);
		if (expectedLength != actualLength) {
			break;
		}
		//else console.log(next.join(' '));
	}
	log("+++++++++++Done testing shuffle", "big");

}

function dynamicTest1() {
	clear123();
	//doLog = true;

	testAllScales();

	//alertIfFail();
	//addClearButton();

	return false; // somehow 'bubble up' reloads the page :(
}
function testClear() {
	resultDiv.empty();
	testFails = false;
}
function testSubsets() {
	log("Testing subsets and matching pair of major - minor", "big");
	let set1 = [1, 2, 3];
	let set2 = [1, 2];
	let set3 = [1, 4, 3];

	assertTrue(isOneSubsetOfOther(set1, set2));
	assertTrue(isOneSubsetOfOther(set2, set1));
	assertFalse(isOneSubsetOfOther(set1, set3));
	assertFalse(isOneSubsetOfOther(set3, set2));

	for (let i=0; i<allKeysMajorArray; i++) {
		let key = allKeysMajorArray[i];
		let major = scalesMap[key].major.scale;
		let minorKey = relativeMinor[key];
		let minor = scalesMap[minorKey].minor.scale;

		assertTrue(isOneSubsetOfOther(major, minor));
		assertTrue(isOneSubsetOfOther(minor, major));
	}
	log("+++++++++++Done testing subsets in general, and for each matching pair of scales: major - minor", "big");
}

function testScales() {
	let scaleParamPairs = [
		{keys: allKeysMajorArray, steps: majorSteps},
		{keys: allKeysMinorArray, steps: minorSteps},
		{keys: allKeysFreygishArray, steps: freygishSteps},
		{keys: allKeysMisheberakhArray, steps: misheberakhSteps}
	];
	log("Testing scales", "big");
	let result;

	for (let j=0; j<scaleParamPairs.length; j++) {
		let keys = scaleParamPairs[j].keys;
		let steps = scaleParamPairs[j].steps;

		for (let i = 0; i < keys.length; i++) {
			let key = keys[i];

			{
				let mode = steps;
				result = createKeyScale1(key, mode);

				log(`--------------${key} ${mode.name}--- ${joinList(result)}`);

			}
		}
	}

	log("+++++++++++Done testing scales", "big");
}

let numsDiatonic = 	{list: "1,2,3,4,5,6,7,1'", 							name: '--------diatonic'};
let numsChrFlats = 	{list: "1,_2,2,__3,_3,3,__4,_4,4,_5,5,_6,6,_7,7,_1',1'", 	name: 'chromatic--flats'};
let numsChrSharps = {list: "1,^1,2,^2,^^2,3,^3,^^3,4,^4,5,^5,6,^6,7,^7,1'", 	name: 'chromatic-sharps'};
let doubles = 		{list: "^^1,__2,^^2,__3", 							name: 'chromatic-double'};
let scaleNumSets = [numsDiatonic, numsChrFlats, numsChrSharps, doubles];

let chrSkippedNums = {
		major: 			['_4', "__4", "^3", "_1'", "^7", "__3", "^^2","^^3"],
		minor: 			['_3', "^2", "_6", "^5", "__3", "__4", "^^2","^^3"],
		misheberakh: 	[],
		freygish: 		[]
	};

let keysModes = [
	{keys: allKeysMajorArray, mode: majorSteps, flavor: "major"},
	{keys: allKeysMinorArray, mode: minorSteps, flavor: "minor"},
	{keys: allKeysFreygishArray, mode: freygishSteps, flavor: "freygish"},
	{keys: allKeysMisheberakhArray, mode: misheberakhSteps, flavor: "misheberakh"},
];

function allScaleHelper(scaleNumSet, ourSkippedNums) {
	let nums = scaleNumSet.list.split(',');
	let flavorTrimmedNums = nums.filter(e => ourSkippedNums.indexOf(e) < 0);

	let numsWithChords = flavorTrimmedNums.map(num => {
		let [abcNote, absoluteNote] = noDur123toAbcScale(num);
		abcNote = unPrimeAndPostPosShlat(abcNote);
		absoluteNote = unPrimeAndPostPosShlat(absoluteNote);
		let absoluteDifference = abcNote == absoluteNote ? "" : absoluteNote;
		return`"${abcNote}(${num})" "${absoluteDifference}" ${num}`
		});
	let _123result = '| ' + numsWithChords.join(' ') + ' ||';

	return _123result + '\n';
}

function joinList(scale, sep) {
	if (sep === undefined) sep = ':';
	return scale.join( sep);
}

////////////
function testParse() {
	doLog = true;
	log("Testing Parsing ========== ========", "big");
	let inputs = [mush7, mush6, mush4, mush5, mush2, mush3, mush];
	let expects = [exp_mush7, exp_mush6, exp_mush4, exp_mush5, exp_mush2, exp_mush3, exp_mush];

	for (let i = 0; i < inputs.length; i++) {
		let input = inputs[i];

		let msg = `-------->>> testing: ${input.name} [${input.val}]`;
		log(msg);

		//assertEqual(expects[i].val, cooked123Line, input.name);
	}

	log("+++++++++++Done testing Parse");
}
