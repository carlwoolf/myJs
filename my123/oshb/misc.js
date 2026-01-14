// https://github.com/Scimonster/js-gematriya/blob/master/gematriya.js

let misc = {};

misc.disjunctive = "disjunctive";
misc.conjunctive = "conjunctive";
misc.letters = {};
misc.numbers = {
    '': 0,
    א: 1,
    ב: 2,
    ג: 3,
    ד: 4,
    ה: 5,
    ו: 6,
    ז: 7,
    ח: 8,
    ט: 9,
    י: 10,
    כ: 20,
    ל: 30,
    מ: 40,
    נ: 50,
    ס: 60,
    ע: 70,
    פ: 80,
    צ: 90,
    ק: 100,
    ר: 200,
    ש: 300,
    ת: 400,
    תק: 500,
    תר: 600,
    תש: 700,
    תת: 800,
    תתק: 900,
    תתר: 1000
};
for (let i in misc.numbers) {
    misc.letters[misc.numbers[i]] = i;
}

/***

 Pass it a Number or String. Given a number, it will return the string representation.
 Given a gematriya string, it will return the number it represents.

 When passing a string, by default, it just adds up the numbers, regardless of place.
 By passing {order: true} as a second parameter, it will treat it as being ordered,
 as per the output (see below).

 When passing a number, an optional options object is available as a second parameter.
 Setting a number as a value for the limit key will limit the length of the returned string to a number of digits.
 Setting false as the value for the punctuate key will remove double and single quotation marks in the returned string.
 Setting geresh to false will use ASCII single/double quotes instead of Hebrew geresh/gershayim Unicode characters. Like this:

 gematriya(5774) // התשע״ד - ordinary
 gematriya(5774, {limit: 3}) // תשע״ד - cropped to 774
 gematriya(5774, {limit: 7}) // התשע״ד - kept at 5774
 gematriya(5774, {punctuate: false}) // 'התשעד' - removed quotation marks
 gematriya(5774, {punctuate: true}) // 'התשע״ד' - with quotation marks
 gematriya(5774, {geresh: false}) // 'התשע"ד' - with quotation marks
 gematriya(5774, {punctuate: false, limit: 3}) // 'תשעד' - options can be combined
 gematriya(3) // 'ג׳' - note the geresh is RTL
 gematriya(3, {geresh: false}) // - "ג'" - the apostrophe is not
 gematriya('התשעד', {order: true}) // 5774 - treats the characters as an ordered number
 gematriya('התשעד', {order: false}) // 779 - Adds up all the characters

 */
function gematriya(num, options) {
    if (options === undefined) {
        options = {limit: false, punctuate: false, order: false, geresh: true};
    }

    if (typeof num !== 'number' && typeof num !== 'string') {
        throw new TypeError('non-number or string given to gematriya()');
    }

    if (typeof options !== 'object' || options === null) {
        throw new TypeError('An object was not given as second argument')
    }

    let limit = options.limit;
    let order = options.order;
    let punctuate = typeof options.punctuate === 'undefined' ? true : options.punctuate;
    let geresh = typeof options.geresh === 'undefined' && punctuate ? true : options.geresh;

    let str = typeof num === 'string';

    if (str) {
        num = num.replace(/('|")/g, '');
    }
    num = num.toString().split('').reverse();
    if (!str && limit) {
        num = num.slice(0, limit);
    }

    num = num.map(function g(n, i) {
        if (str) {
            return order && misc.numbers[n] < misc.numbers[num[i - 1]] && misc.numbers[n] < 100 ? misc.numbers[n] * 1000 : misc.numbers[n];
        } else {
            if (parseInt(n, 10) * Math.pow(10, i) > 1000) {
                return g(n, i - 3);
            }
            return misc.letters[parseInt(n, 10) * Math.pow(10, i)];
        }
    });

    if (str) {
        return num.reduce(function (o, t) {
            return o + t;
        }, 0);
    } else {
        num = num.reverse().join('').replace(/יה/g, 'טו').replace(/יו/g, 'טז').split('');

        if (punctuate || geresh) {
            if (num.length === 1) {
                num.push(geresh ? '׳' : "'");
            } else if (num.length > 1) {
                num.splice(-1, 0, geresh ? '״' : '"');
            }
        }

        return num.join('');
    }
}

//////////////////////////////////////////////
//////////////////////////////////////////////


// https://stackoverflow.com/questions/13405129/create-and-save-a-file-with-javascript
function download(data, filename) {
    let file = new Blob([data], {type: 'text/plain;charset=UTF-8'});
    if (window.navigator.msSaveOrOpenBlob) // IE10+
        window.navigator.msSaveOrOpenBlob(file, filename);
    else { // Others
        let a = document.createElement("a"),
            url = URL.createObjectURL(file);
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        setTimeout(function() {
            document.body.removeChild(a);
            window.URL.revokeObjectURL(url);
        }, 0);
    }
}
// break down monlithic mapm, from oshb site, into separate books' worth
function spreadAssetsMapm(startIndex) {
    if (!startIndex) startIndex = 0;

    let beginFile = `<?xml version="1.0" encoding="utf-8"?><books xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" 
        xmlns="http://www.bibletechnologies.net/2003/OSIS/namespace" 
        xsi:schemaLocation="http://www.bibletechnologies.net/2003/OSIS/namespace 
        http://www.bibletechnologies.net/osisCore.2.1.1.xsd">`;
    let endFile = '</books>';

    let elts = $(myO.mapmDoc).find('div[type="book"]');
    for (let i=startIndex; i<elts.length; i++) {
        let elt = elts[i];

        let name = $(elt).attr("osisID");
        let bookHtml = elt.outerHTML;
        let fullHtml = `${beginFile}${bookHtml}${endFile}`;
        console.log(`---------- Index ${i}: Book: ${name}`);

        download(fullHtml, `mapm-${name}.xml`);
    }
}
// original xmls under wlc on oshb site
async function grabAssetsOshb(startIndex) {
    if (!startIndex) startIndex = 0;

    let booksSorted = Object.keys(myO.booksMetadata).sort();
    console.log(booksSorted);

    for (let i=startIndex; i<booksSorted.length; i++) {
        let name = booksSorted[i];

        await loadDataFileAsText(`${myO.bookUrlPrefix}${name}.xml`,
            function() {showProgress(true, `Loading xml-text for OSHB ${name}`);},
            function() {showProgress(false, `Done loading xml-text for OSHB ${name}`);},
            function (text) {
                download(text, `oshb-${name}.xml`);
            });
    }
}
function loadXmlIntoItsDoc(url, before, complete, success) {
    before();
    $.ajax({
        type: "GET",
        url: url,
        dataType: "xml",
        success: function(xml) { console.log(`Loaded url: ${url}`); success(xml); },
        complete: complete
        // https://stackoverflow.com/questions/19220873/how-to-read-xml-file-contents-in-jquery-and-display-in-html-elements
    });
}
function foundAndInRange(num, limit) {
    return num >= 0 && num < limit;
}
function exchange(index1, index2, array) {
    let tmp = array[index1];
    array[index1] = array[index2];
    array[index2] = tmp;
}
function matchOuter(jElt, targetRegex) {
    return jElt.outerHTML.match(targetRegex);
}
function max(one, two) {
    if (one >= two) return one;
    else return two;
}

function abToC(inputArray, start, count, add) {
    let resultArray = inputArray.toSpliced(start,count,add);
    return resultArray;
}
function unicat(inArray, addArray) {
    let result = inArray.concat(addArray);
    result = uniq(result);
    return result;
}
function unipush(inArray, addVal) {
    return unicat(inArray, [ addVal ]);
}
function higherContent(incomingContent, osisID) {
    let result = elyonVerses[osisID];

    if (!result) {
        result = incomingContent;
    }
    result = result.trim().replace(/\s+/, " ").replaceAll( "׀"," ׀ ");

    return result;
}
let elyonVerses = {};
// https://mechon-mamre.org/c/ct/c0135.htm#22
// try mechon:
elyonVerses["Gen.35.22"] = " וַיְהִ֗י בִּשְׁכֹּ֤ן יִשְׂרָאֵל֙ בָּאָ֣רֶץ הַהִ֔וא וַיֵּ֣לֶךְ רְאוּבֵ֗ן וַיִּשְׁכַּב֙ אֶת־בִּלְהָה֙ פִּילֶ֣גֶשׁ אָבִ֔יו וַיִּשְׁמַ֖ע יִשְׂרָאֵ֑ל " +
    " וַיִּֽהְי֥וּ   בְנֵֽי־יַעֲקֹ֖ב שְׁנֵ֥ים עָשָֽׂר׃ ";

/// sefaria: elyonVerses["Gen.35.22"] = "וַיְהִ֗י בִּשְׁכֹּ֤ן יִשְׂרָאֵל֙ בָּאָ֣רֶץ הַהִ֔וא וַיֵּ֣לֶךְ רְאוּבֵ֗֔ן וַיִּשְׁכַּ֕ב֙ אֶת־בִּלְהָ֖ה֙ פִּילֶ֣גֶשׁ אָבִ֑֔יו וַיִּשְׁמַ֖ע יִשְׂרָאֵ֑͏ֽל׃ וַיִּֽהְי֥וּ בְנֵֽי־יַעֲקֹ֖ב שְׁנֵ֥ים עָשָֽׂר׃"; // but need to remove tachtons

// exod.20.2-14
elyonVerses['Exod.20.2'] =    "אָֽנֹכִ֖י יְהֹוָ֣ה אֱלֹהֶ֑יךָ אֲשֶׁ֧ר הוֹצֵאתִ֛יךָ מֵאֶ֥רֶץ מִצְרַ֖יִם מִבֵּ֥ית עֲבָדִֽים׃" ;

elyonVerses['Exod.20.3'] =    " לֹ֣א יִהְיֶֽה־לְךָ֩ אֱלֹהִ֨ים אֲחֵרִ֜ים עַל־פָּנַ֗י" ;
elyonVerses['Exod.20.4'] =    " לֹ֣א תַֽעֲשֶׂה־לְךָ֣ פֶ֣סֶל׀וְכׇל־תְּמוּנָ֡ה אֲשֶׁ֣ר בַּשָּׁמַ֣יִם׀מִמַּ֡עַל וַֽאֲשֶׁר֩ בָּאָ֨רֶץ מִתַּ֜חַת וַאֲשֶׁ֥ר בַּמַּ֣יִם׀ מִתַּ֣חַת לָאָ֗רֶץ" ;
elyonVerses['Exod.20.5'] =    " לֹֽא־תִשְׁתַּחֲוֶ֣ה לָהֶם֮ וְלֹ֣א תׇעׇבְדֵם֒ כִּ֣י אָֽנֹכִ֞י יְהֹוָ֤ה אֱלֹהֶ֙יךָ֙ אֵ֣ל קַנָּ֔א פֹּ֠קֵ֠ד עֲוֺ֨ן אָבֹ֧ת עַל־בָּנִ֛ים עַל־שִׁלֵּשִׁ֥ים וְעַל־רִבֵּעִ֖ים לְשֹׂנְאָ֑י" ;
elyonVerses['Exod.20.6'] =    " וְעֹ֤שֶׂה חֶ֙סֶד֙ לַאֲלָפִ֔ים לְאֹהֲבַ֖י וּלְשֹׁמְרֵ֥י מִצְוֺתָֽי׃" ;

elyonVerses['Exod.20.7'] =    "לֹ֥א תִשָּׂ֛א אֶת־שֵֽׁם־יְהֹוָ֥ה אֱלֹהֶ֖יךָ לַשָּׁ֑וְא כִּ֣י לֹ֤א יְנַקֶּה֙ יְהֹוָ֔ה אֵ֛ת אֲשֶׁר־יִשָּׂ֥א אֶת־שְׁמ֖וֹ לַשָּֽׁוְא׃" ;

elyonVerses['Exod.20.8'] =    "זָכוֹר֩ אֶת־י֨וֹם הַשַּׁבָּ֜ת לְקַדְּשׁ֗ו" ;
elyonVerses['Exod.20.9'] =    "ֹשֵׁ֣שֶׁת יָמִ֣ים תַּֽעֲבֹד֮ וְעָשִׂ֣יתָ כׇל־מְלַאכְתֶּ֒ך" ;
elyonVerses['Exod.20.10'] =    "֒ וְי֨וֹם הַשְּׁבִיעִ֜י שַׁבָּ֣ת׀ לַיהֹוָ֣ה אֱלֹהֶ֗יךָ לֹ֣א תַעֲשֶׂ֣ה כׇל־מְלָאכָ֡ה אַתָּ֣ה וּבִנְךָֽ־וּ֠בִתֶּ֠ךָ עַבְדְּךָ֨ וַאֲמָֽתְךָ֜ וּבְהֶמְתֶּ֗ךָ וְגֵרְךָ֙ אֲשֶׁ֣ר בִּשְׁעָרֶ֔יךָ" ;
elyonVerses['Exod.20.11'] =    " כִּ֣י שֵֽׁשֶׁת־יָמִים֩ עָשָׂ֨ה יְהֹוָ֜ה אֶת־הַשָּׁמַ֣יִם וְאֶת־הָאָ֗רֶץ אֶת־הַיָּם֙ וְאֶת־כׇּל־אֲשֶׁר־בָּ֔ם וַיָּ֖נַח בַּיּ֣וֹם הַשְּׁבִיעִ֑י עַל־כֵּ֗ן בֵּרַ֧ךְ יְהֹוָ֛ה אֶת־י֥וֹם הַשַּׁבָּ֖ת וַֽיְקַדְּשֵֽׁהוּ׃" ;

elyonVerses['Exod.20.12'] =    "כַּבֵּ֥ד אֶת־אָבִ֖יךָ וְאֶת־אִמֶּ֑ךָ לְמַ֙עַן֙ יַאֲרִכ֣וּן יָמֶ֔יךָ עַ֚ל הָאֲדָמָ֔ה אֲשֶׁר־יְהֹוָ֥ה אֱלֹהֶ֖יךָ נֹתֵ֥ן לָֽךְ׃" ;

elyonVerses['Exod.20.13'] =    " לֹ֖א תִּרְצָֽח׃ ";
elyonVerses['Exod.20.14'] =    " לֹ֖א תִּנְאָֽף׃ " ;
elyonVerses['Exod.20.15'] =    " לֹ֖א תִּגְנֹֽב׃ " ;
elyonVerses['Exod.20.16'] =    " לֹֽא־תַעֲנֶ֥ה בְרֵעֲךָ֖ עֵ֥ד שָֽׁקֶר׃ " ;

elyonVerses['Exod.20.17'] =    "לֹ֥א תַחְמֹ֖ד בֵּ֣ית רֵעֶ֑ךָ " + " לֹֽא־תַחְמֹ֞ד אֵ֣שֶׁת רֵעֶ֗ךָ וְעַבְדּ֤וֹ וַאֲמָתוֹ֙ וְשׁוֹר֣וֹ וַחֲמֹר֔וֹ וְכֹ֖ל אֲשֶׁ֥ר לְרֵעֶֽךָ׃ " ;


// deut 5.6-18
elyonVerses['Deut.5.6'] =     "אָֽנֹכִ֖י יְהֹוָ֣ה אֱלֹהֶ֑יךָ אֲשֶׁ֧ר הוֹצֵאתִ֛יךָ מֵאֶ֥רֶץ מִצְרַ֖יִם מִבֵּ֥ית עֲבָדִֽים׃" ;

elyonVerses['Deut.5.7'] =     " לֹ֣א יִהְיֶֽה־לְךָ֩ אֱלֹהִ֨ים אֲחֵרִ֜ים עַל־פָּנַ֗י" ;
elyonVerses['Deut.5.8'] =     " לֹ֣א תַעֲשֶֽׂה־לְךָ֣ פֶ֣סֶל׀כׇּל־תְּמוּנָ֡ה אֲשֶׁ֣ר בַּשָּׁמַ֣יִם׀מִמַּ֡עַל וַאֲשֶׁר֩ בָּאָ֨רֶץ מִתַּ֜חַת וַאֲשֶׁ֥ר בַּמַּ֣יִם׀ מִתַּ֣חַת לָאָ֗רֶץ" ;
elyonVerses['Deut.5.9'] =     " לֹא־תִשְׁתַּחֲוֶ֣ה לָהֶם֮ וְלֹ֣א תׇעׇבְדֵם֒ כִּ֣י אָנֹכִ֞י יְהֹוָ֤ה אֱלֹהֶ֙יךָ֙ אֵ֣ל קַנָּ֔א פֹּ֠קֵ֠ד עֲוֺ֨ן אָב֧וֹת עַל־בָּנִ֛ים וְעַל־שִׁלֵּשִׁ֥ים וְעַל־רִבֵּעִ֖ים לְשֹׂנְאָ֑י" ;
elyonVerses['Deut.5.10'] =     " וְעֹ֤שֶׂה חֶ֙סֶד֙ לַֽאֲלָפִ֔ים לְאֹהֲבַ֖י וּלְשֹׁמְרֵ֥י (ktiv_מצותו) מִצְוֺתָֽי׃" ;

elyonVerses['Deut.5.11'] =     "לֹ֥א תִשָּׂ֛א אֶת־שֵֽׁם־יְהֹוָ֥ה אֱלֹהֶ֖יךָ לַשָּׁ֑וְא כִּ֣י לֹ֤א יְנַקֶּה֙ יְהֹוָ֔ה אֵ֛ת אֲשֶׁר־יִשָּׂ֥א אֶת־שְׁמ֖וֹ לַשָּֽׁוְא׃" ;

elyonVerses['Deut.5.12'] =     "שָׁמ֣וֹר אֶת־יוֹם֩ הַשַּׁבָּ֨ת לְקַדְּשׁ֜וֹ כַּאֲשֶׁ֥ר צִוְּךָ֣׀ יְהֹוָ֣ה אֱלֹהֶ֗יךָ" ;
elyonVerses['Deut.5.13'] =     " שֵׁ֣שֶׁת יָמִ֣ים תַּֽעֲבֹד֮ וְעָשִׂ֣יתָ כׇל־מְלַאכְתֶּ֒ך" ;
elyonVerses['Deut.5.14'] =     "ָ֒ וְי֨וֹם הַשְּׁבִיעִ֜י שַׁבָּ֣ת׀ לַיהֹוָ֣ה אֱלֹהֶ֗יךָ לֹ֣א תַעֲשֶׂ֣ה כׇל־מְלָאכָ֡ה אַתָּ֣ה וּבִנְךָֽ־וּבִתֶּ֣ךָ וְעַבְדְּךָֽ־וַ֠אֲמָתֶ֠ךָ וְשׁוֹרְךָ֨ וַחֲמֹֽרְךָ֜ וְכׇל־בְּהֶמְתֶּ֗ךָ וְגֵֽרְךָ֙ אֲשֶׁ֣ר בִּשְׁעָרֶ֔יךָ לְמַ֗עַן יָנ֛וּחַ עַבְדְּךָ֥ וַאֲמָתְךָ֖ כָּמ֑וֹך" ;
elyonVerses['Deut.5.15'] =     " וְזָכַרְתָּ֞ כִּי־עֶ֥בֶד הָיִ֣יתָ׀ בְּאֶ֣רֶץ מִצְרַ֗יִם וַיֹּצִאֲךָ֩ יְהֹוָ֨ה אֱלֹהֶ֤יךָ מִשָּׁם֙ בְּיָ֤ד חֲזָקָה֙ וּבִזְרֹ֣עַ נְטוּיָ֔ה עַל־כֵּ֗ן צִוְּךָ֙ יְהֹוָ֣ה אֱלֹהֶ֔יךָ לַעֲשׂ֖וֹת אֶת־י֥וֹם הַשַּׁבָּֽת׃" ;

elyonVerses['Deut.5.16'] =     "כַּבֵּ֤ד אֶת־אָבִ֙יךָ֙ וְאֶת־אִמֶּ֔ךָ כַּאֲשֶׁ֥ר צִוְּךָ֖ יְהֹוָ֣ה אֱלֹהֶ֑יךָ לְמַ֣עַן׀ יַאֲרִיכֻ֣ן יָמֶ֗יךָ וּלְמַ֙עַן֙ יִ֣יטַב לָ֔ךְ עַ֚ל הָֽאֲדָמָ֔ה אֲשֶׁר־יְהֹוָ֥ה אֱלֹהֶ֖יךָ נֹתֵ֥ן לָֽךְ׃" ;

elyonVerses['Deut.5.17'] =     "לֹ֖א תִּרְצָֽח׃ " ;
elyonVerses['Deut.5.18'] =     "וְלֹ֖א תִּנְאָֽף׃ " ;
elyonVerses['Deut.5.19'] =     "וְלֹ֖א תִּגְנֹֽב׃ " ;
elyonVerses['Deut.5.20'] =     "וְלֹֽא־תַעֲנֶ֥ה בְרֵֽעֲךָ֖ עֵ֥ד שָֽׁוְא׃ " ;

elyonVerses['Deut.5.21'] =     " וְלֹ֥א תַחְמֹ֖ד אֵ֣שֶׁת רֵעֶ֑ך " + "ָוְלֹ֨א תִתְאַוֶּ֜ה בֵּ֣ית רֵעֶ֗ךָ שָׂדֵ֜הוּ וְעַבְדּ֤וֹ וַאֲמָתוֹ֙ שׁוֹר֣וֹ וַחֲמֹר֔וֹ וְכֹ֖ל אֲשֶׁ֥ר לְרֵעֶֽךָ׃ " ;

