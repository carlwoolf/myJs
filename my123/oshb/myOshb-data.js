// AccentInterpretation.js ... circa 2019
function getScope(osisID) {
    let fields = unpackOsisId(osisID);
    switch (fields[0]) {
        case "Ps":
        case "Prov":
            return "poetic";
        case "Job":
            if (fields[1] < 3 || (fields[1] == 42 && fields[2] > 6) || osisID == "Job.3.1") {
                return "prose";
            } else {
                return "poetic";
            }
        default:
            return "prose";
    }
}

myO.booksMetadata = {
"Gen"   :   {chapsPerBook: 50 , sefariaBookname: "Genesis"      , interlinear: "genesis"        ,  hebrewName: "בראשית"      },
"Exod"  :   {chapsPerBook: 40 , sefariaBookname: "Exodus"       , interlinear: "exodus"         ,  hebrewName: "שמות"        },
"Lev"   :   {chapsPerBook: 27 , sefariaBookname: "Leviticus"    , interlinear: "leviticus"      ,  hebrewName: "ויקרא"       },
"Num"   :   {chapsPerBook: 36 , sefariaBookname: "Numbers"      , interlinear: "numbers"        ,  hebrewName: "במדבר"       },
"Deut"  :   {chapsPerBook: 34 , sefariaBookname: "Deuteronomy"  , interlinear: "deuteronomy"    ,  hebrewName: "דברים"       },
"Josh"  :   {chapsPerBook: 24 , sefariaBookname: "Joshua"       , interlinear: "joshua"         ,  hebrewName: "יהושע"       },
"Judg"  :   {chapsPerBook: 21 , sefariaBookname: "Judges"       , interlinear: "judges"         ,  hebrewName: "שופטים"      },
"1Sam"  :   {chapsPerBook: 31 , sefariaBookname: "I_Samuel"     , interlinear: "1_samuel"       ,  hebrewName: "שמואל_א"     },
"2Sam"  :   {chapsPerBook: 24 , sefariaBookname: "II_Samuel"    , interlinear: "2_samuel"       ,  hebrewName: "שמואל_ב"     },
"1Kgs"  :   {chapsPerBook: 22 , sefariaBookname: "I_Kings"      , interlinear: "1_kings"        ,  hebrewName: "מלכים_א"     },
"2Kgs"  :   {chapsPerBook: 25 , sefariaBookname: "II_Kings"     , interlinear: "2_kings"        ,  hebrewName: "מלכים_ב"     },
"Isa"   :   {chapsPerBook: 66 , sefariaBookname: "Isaiah"       , interlinear: "isaiah"         ,  hebrewName: "ישעיהו"      },
"Jer"   :   {chapsPerBook: 52 , sefariaBookname: "Jeremiah"     , interlinear: "jeremiah"       ,  hebrewName: "ירמיהו"      },
"Ezek"  :   {chapsPerBook: 48 , sefariaBookname: "Ezekiel"      , interlinear: "ezekiel"        ,  hebrewName: "יחזקאל"      },
"Hos"   :   {chapsPerBook: 14 , sefariaBookname: "Hosea"        , interlinear: "hosea"          ,  hebrewName: "הושע"        },
"Joel"  :   {chapsPerBook: 4  , sefariaBookname: "Joel"         , interlinear: "joel"           ,  hebrewName: "יואל"        },
"Amos"  :   {chapsPerBook: 9  , sefariaBookname: "Amos"         , interlinear: "amos"           ,  hebrewName: "עמוס"        },
"Obad"  :   {chapsPerBook: 1  , sefariaBookname: "Obadiah"      , interlinear: "obadiah"        ,  hebrewName: "עֹבדיה"       },
"Jonah" :   {chapsPerBook: 4  , sefariaBookname: "Jonah"        , interlinear: "jonah"          ,  hebrewName: "יונה"        },
"Mic"   :   {chapsPerBook: 7  , sefariaBookname: "Micah"        , interlinear: "micah"          ,  hebrewName: "מיכה"        },
"Nah"   :   {chapsPerBook: 3  , sefariaBookname: "Nahum"        , interlinear: "nahum"          ,  hebrewName: "נחום"        },
"Hab"   :   {chapsPerBook: 3  , sefariaBookname: "Habakkuk"     , interlinear: "habakkuk"       ,  hebrewName: "חבקוק"       },
"Zeph"  :   {chapsPerBook: 3  , sefariaBookname: "Zephaniah"    , interlinear: "zephaniah"      ,  hebrewName: "צפניה"       },
"Hag"   :   {chapsPerBook: 2  , sefariaBookname: "Haggai"       , interlinear: "haggai"         ,  hebrewName: "חגי"         },
"Zech"  :   {chapsPerBook: 14 , sefariaBookname: "Zechariah"    , interlinear: "zechariah"      ,  hebrewName: "זכריה"       },
"Mal"   :   {chapsPerBook: 3  , sefariaBookname: "Malachi"      , interlinear: "malachi"        ,  hebrewName: "מלאכי"       },
"Ps"    :   {chapsPerBook: 150, sefariaBookname: "Psalms"       , interlinear: "psalms"         ,  hebrewName: "תהלים"       },
"Prov"  :   {chapsPerBook: 31 , sefariaBookname: "Proverbs"     , interlinear: "proverbs"       ,  hebrewName: "משלי"        },
"Job"   :   {chapsPerBook: 42 , sefariaBookname: "Job"          , interlinear: "job"            ,  hebrewName: "איוב"        },
"Song"  :   {chapsPerBook: 8  , sefariaBookname: "Song_of_Songs", interlinear: "songs"          ,  hebrewName: "שירהשירים"   },
"Ruth"  :   {chapsPerBook: 4  , sefariaBookname: "Ruth"         , interlinear: "ruth"           ,  hebrewName: "רות"         },
"Lam"   :   {chapsPerBook: 5  , sefariaBookname: "Lamentations" , interlinear: "lamentations"   ,  hebrewName: "איכה"        },
"Eccl"  :   {chapsPerBook: 12 , sefariaBookname: "Ecclesiastes" , interlinear: "ecclesiastes"   ,  hebrewName: "קֹהלת"        },
"Esth"  :   {chapsPerBook: 10 , sefariaBookname: "Esther"       , interlinear: "esther"         ,  hebrewName: "אסתר"        },
"Dan"   :   {chapsPerBook: 12 , sefariaBookname: "Daniel"       , interlinear: "daniel"         ,  hebrewName: "דניאל"       },
"Ezra"  :   {chapsPerBook: 10 , sefariaBookname: "Ezra"         , interlinear: "ezra"           ,  hebrewName: "עזרא"        },
"Neh"   :   {chapsPerBook: 13 , sefariaBookname: "Nehemiah"     , interlinear: "nehemiah"       ,  hebrewName: "נחמיה"       },
"1Chr"  :   {chapsPerBook: 29 , sefariaBookname: "I_Chronicles" , interlinear: "1_chronicles"   ,  hebrewName: "דבריהימים_א" },
"2Chr"  :   {chapsPerBook: 36 , sefariaBookname: "II_Chronicles", interlinear: "2_chronicles"   ,  hebrewName: "דבריהימים_ב" }
};


// AccentCatalog.js v. 1.2
// circa 2019

let accentCatalog = {
    "prose": {
        "disjunctive": {
            "\u05C3": {"name": "Sof Pasuq", "rank": "0", "final": "true"},
            "\u0596\u05C3": {"name": "Mëayla with Sof Pasuq", "rank": "0", "final": "true"},
            "\u05A5\u05C3": {"name": "Merkha with Sof Pasuq", "rank": "0", "final": "true"},
            "\u0591": {"name": "Atnach", "rank": "0"},
            "\u0596\u0591": {"name": "Mëayla with Atnach", "rank": "0"},
            "\u05A3\u0591": {"name": "Munnach with Atnach", "rank": "0"},
            "\u05A5\u0591": {"name": "Merkha with Atnach", "rank": "0"},
            "\u0591\u0599": {"name": "Atnach with Pashta", "rank": "0"},
            "\u0592": {"name": "Segol", "rank": "1"},
            "\u0593\u05C0": {"name": "Shalshelet", "rank": "1"},
            "\u0594": {"name": "Zaqef Qatan", "rank": "1"},
            "\u05A3\u0594": {"name": "Munnach with Zaqef Qatan", "rank": "1"},
            "\u05A8\u0594": {"name": "Qadma with Zaqef Qatan", "rank": "1"},
            "\u0595": {"name": "Zaqef Gadol", "rank": "1"},
            "\u0596": {"name": "Tipcha", "rank": "1", "final": "true"},
            "\u05A5\u0596": {"name": "Merkha with Tipcha", "rank": "1", "final": "true"},
            "\u0597": {"name": "Revia", "rank": "2"},
            "\u05A0\u0597": {"name": "Telisha Gedola with Revia", "rank": "2"},
            "\u05A3\u0597": {"name": "Munnach with Revia", "rank": "2"},
            "\u05AE": {"name": "Zarqa", "rank": "2", "final": "true"},
            "\u0598\u05AE": {"name": "Zarqa", "rank": "2", "final": "true"},
            "\u0599": {"name": "Pashta", "rank": "2", "final": "true"},
            "\u0599\u0599": {"name": "Pashta", "rank": "2", "final": "true"},
            "\u05A8\u0599": {"name": "Pashta", "rank": "2", "final": "true"},
            "\u05A4\u0599": {"name": "Mahpakh with Pashta", "rank": "2", "final": "true"},
            "\u05A4\u0599\u0599": {"name": "Mahpakh with Pashta", "rank": "2", "final": "true"},
            "\u05A4\u05A8\u0599": {"name": "Mahpakh with Pashta", "rank": "2", "final": "true"},
            "\u059A": {"name": "Yetiv", "rank": "2", "final": "true"},
            "\u059B": {"name": "Tevir", "rank": "2", "final": "true"},
            "\u05A5\u059B": {"name": "Merkha with Tevir", "rank": "2", "final": "true"},
            "\u05A1": {"name": "Pazer", "rank": "3"},
            "\u05A3\u05A1": {"name": "Munnach with Pazer", "rank": "3"},
            "\u059F": {"name": "Qarney Para", "rank": "3"},
            "\u05A0": {"name": "Telisha Gedola", "rank": "3"},
            "\u05A0\u05A0": {"name": "Telisha Gedola", "rank": "3"},
            "\u059D\u05A0": {"name": "Geresh Muqdam with Telisha Gedola", "rank": "3", "final": "true"},
            "\u059C": {"name": "Geresh", "rank": "3", "final": "true"},
            "\u05A0\u059C": {"name": "Telisha Gedola with Geresh", "rank": "3", "final": "true"},
            "\u05A8\u059C": {"name": "Qadma with Geresh", "rank": "3", "final": "true"},
            "\u059D": {"name": "Geresh Muqdam", "rank": "3", "final": "true"},
            "\u059E": {"name": "Gershayim", "rank": "3", "final": "true"},
            "\u05A0\u059E": {"name": "Telisha Gedola with Gershayim", "rank": "3", "final": "true"},
            "\u059E\u05A0": {"name": "Gershayim with Telisha Gedola", "rank": "3", "final": "true"},
            "\u05A3\u05C0": {"name": "Legarmeh", "rank": "3", "final": "true"},
            "": {"name": "None", "rank": "5"}
        },
        "conjunctive": {
            "\u05C0": {"name": "Paseq", "rank": "4"},
            "\u05A5\u05A3\u05C0": {"name": "Merkha and Munnach with Paseq", "rank": "4"},
            "\u05A4\u05C0": {"name": "Mahpakh with Paseq", "rank": "4"},
            "\u05A5\u05C0": {"name": "Merkha with Paseq", "rank": "4"},
            "\u05A7\u05C0": {"name": "Darga with Paseq", "rank": "4"},
            "\u05A8\u05C0": {"name": "Qadma with Paseq", "rank": "4"},
            "\u05A8\u05A5\u05C0": {"name": "Qadma and Merkha with Paseq", "rank": "4"},
            "\u05A9\u05C0": {"name": "Telisha Qetana with Paseq", "rank": "4"},
            "\u05A3": {"name": "Munnach", "rank": "4"},
            "\u05A3\u05A3": {"name": "Munnach with Munnach", "rank": "4"},
            "\u05AA": {"name": "Galgal", "rank": "4"},
            "\u05A5": {"name": "Merkha", "rank": "4"},
            "\u05A8\u05A5": {"name": "Qadma with Merkha", "rank": "4"},
            "\u05A9": {"name": "Telisha Qetana", "rank": "4"},
            "\u05A9\u05A9": {"name": "Telisha Qetana", "rank": "4"},
            "\u05A8": {"name": "Qadma", "rank": "4"},
            "\u05A4": {"name": "Mahpakh", "rank": "4"},
            "\u05A3\u05A4": {"name": "Munnach with Mahpakh", "rank": "4"},
            "\u05A8\u05A4": {"name": "Qadma with Mahpakh", "rank": "4"},
            "\u05A6": {"name": "Merkha Khefula", "rank": "4"},
            "\u05A7": {"name": "Darga", "rank": "4"},
            "\u05A8\u05A7": {"name": "Qadma with Darga", "rank": "4"},
            "\u05BE": {"name": "Maqqef", "rank": "4"},
            "\u05BD": {"name": "Meteg", "rank": "4"},
            "": {"name": "None", "rank": "5"}
        }
    },
    "poetic": {
        "disjunctive": {
            "\u05C3": {"name": "Sof Pasuq", "rank": "0", "final": "true"},
            "\u05A5\u05C3": {"name": "Merkha with Sof Pasuq", "rank": "0", "final": "true"},
            "\u0591": {"name": "Atnach", "rank": "1", "final": "true"},
            "\u05A3\u0591": {"name": "Munnach with Atnach", "rank": "1", "final": "true"},
            "\u05A5\u0591": {"name": "Merkha with Atnach", "rank": "1", "final": "true"},
            "\u0592": {"name": "Segol", "rank": "1"},
            "\u0593\u05C0": {"name": "Shalshelet Gedola", "rank": "1", "final": "true"},
            "\u0594": {"name": "Zaqef Qatan", "rank": "1"},
            "\u05A3\u0594": {"name": "Munnach with Zaqef Qatan", "rank": "1"},
            "\u0595": {"name": "Zaqef Gadol", "rank": "1"},
            "\u0597": {"name": "Revia", "rank": "1", "final": "true"},
            "\u059D\u0597": {"name": "Revia Mugrash", "rank": "1", "final": "true"},
            "\u05A5\u0597": {"name": "Merkha with Revia", "rank": "1", "final": "true"},
            "\u059D\u05A5\u0597": {"name": "Merkha with Revia Mugrash", "rank": "1", "final": "true"},
            "\u0598\u05A4\u0597": {"name": "Mahpakh Metsunnar with Revia", "rank": "1", "final": "true"},
            "\u05AD\u0597": {"name": "Dechi with Revia", "rank": "1", "final": "true"},
            "\u05A1": {"name": "Pazer", "rank": "1", "final": "true"},
            "\u05A1\u05C0": {"name": "Pazer with Paseq", "rank": "1", "final": "true"},
            "\u05AA\u05A1": {"name": "Galgal with Pazer", "rank": "1", "final": "true"},
            "\u05A4\u05C0": {"name": "Mahpakh Legarmeh", "rank": "1", "final": "true"},
            "\u05AB": {"name": "Ole", "rank": "1"},
            "\u05A4\u05AB": {"name": "Mahpakh with Ole", "rank": "1"},
            "\u05AB\u05A5": {"name": "Ole We Yored", "rank": "1"},
            "\u05AA\u05AB\u05A5": {"name": "Galgal with Ole We Yored", "rank": "1"},
            "\u05A5": {"name": "Yored", "rank": "1"},
            "\u05A8\u05C0": {"name": "Azla Legarmeh", "rank": "1"},
            "\u05A4\u05A8\u05C0": {"name": "Mahpakh with Azla Legarmeh", "rank": "1"},
            "\u0599": {"name": "Pashta", "rank": "2", "final": "true"},
            "\u0599\u0599": {"name": "Pashta", "rank": "2", "final": "true"},
            "\u05A8\u0599": {"name": "Pashta", "rank": "2", "final": "true"},
            "\u059A": {"name": "Yetiv", "rank": "2", "final": "true"},
            "\u059B": {"name": "Tevir", "rank": "2", "final": "true"},
            "\u05AD": {"name": "Dechi", "rank": "2", "final": "true"},
            "\u05AE": {"name": "Tsinnor", "rank": "2", "final": "true"},
            "\u05A0": {"name": "Telisha Gedola", "rank": "3"},
            "\u059C": {"name": "Geresh", "rank": "3", "final": "true"},
            "\u059D": {"name": "Geresh Muqdam", "rank": "3", "final": "true"},
            "\u059E": {"name": "Gershayim", "rank": "3", "final": "true"}
        },
        "conjunctive": {
            "\u05AB": {"name": "Ole", "rank": "1"},
            "\u05A4\u05AB": {"name": "Mahpakh with Ole", "rank": "1"},
            "\u05C0": {"name": "Paseq", "rank": "4"},
            "\u05A3": {"name": "Munnach", "rank": "4"},
            "\u0596\u05A3": {"name": "Tarcha with Munnach", "rank": "4"},
            "\u05A3\u05A3": {"name": "Munnach", "rank": "4"},
            "\u05A4\u05A3": {"name": "Mahpakh with Munnach", "rank": "4"},
            "\u05A3\u05A5": {"name": "Munnach with Merkha", "rank": "4"},
            "\u05A3\u05C0": {"name": "Munnach with Paseq", "rank": "4"},
            "\u05A4\u05A3\u05C0": {"name": "Mahpakh and Munnach with Paseq", "rank": "4"},
            "\u05AD\u05A3": {"name": "Dechi with Munnach", "rank": "4"},
            "\u05A3\u05AD": {"name": "Dechi with Munnach", "rank": "4"},
            "\u05A5\u05A8": {"name": "Merkha with Qadma", "rank": "4"},
            "\u05A7": {"name": "Darga", "rank": "4"},
            "\u05A8\u05A7": {"name": "Qadma with Darga", "rank": "4"},
            "\u05A9": {"name": "Telisha Qetana", "rank": "4"},
            "\u05AA": {"name": "Atnach Hafukh", "rank": "4"},
            "\u05AA\u05AB": {"name": "Galgal with Ole", "rank": "4"},
            "\u05AA\u05C0": {"name": "Galgal with Paseq", "rank": "4"},
            "\u05A5": {"name": "Merkha", "rank": "4"},
            "\u05A5\u05A5": {"name": "Merkha", "rank": "4"},
            "\u05A5\u05C0": {"name": "Merkha with Paseq", "rank": "4"},
            "\u0598\u05A5": {"name": "Merkha Metsunneret", "rank": "4"},
            "\u0598\u05A5\u05C0": {"name": "Tsinnorit and Merkha with Paseq", "rank": "4"},
            "\u05A5\u05A8\u05C0": {"name": "Merkha and Qadma with Paseq", "rank": "4"},
            "\u05AD\u05A5": {"name": "Dechi with Merkha", "rank": "4"},
            "\u0598": {"name": "Tsinnorit", "rank": "4"},
            "\u0593": {"name": "Shalshelet Qetana", "rank": "4"},
            "\u0596": {"name": "Tarcha", "rank": "4"},
            "\u05A8": {"name": "Qadma", "rank": "4"},
            "\u05AC": {"name": "Illuy", "rank": "4"},
            "\u05AC\u05C0": {"name": "Illuy with Paseq", "rank": "4"},
            "\u05AC\u05A8\u05C0": {"name": "Illuy and Qadma with Paseq", "rank": "4"},
            "\u05A4": {"name": "Mahpakh", "rank": "4"},
            "\u0598\u05A4": {"name": "Mahpakh Metsunnar", "rank": "4"},
            "\u05A4\u05A5": {"name": "Mahpakh with Merkha", "rank": "4"},
            "\u05BE": {"name": "Maqqef", "rank": "4"},
            "\u05BD": {"name": "Meteg", "rank": "4"},
            "": {"name": "None", "rank": "5"}
        }
    }
};
///////////////////////////////////
///////////////////////////////////

function getOshbNameInfo(symbolKey, scope, canFlipTwo, comments, osisID, word, nValue) {
    if (nValue == undefined && myO.aggressive) {
        // mapm should try (brittle if verses do not align) to get from oshb
        nValue = nValueInCorrespondingOshb(osisID, word);
    }
    let mainCatalog = accentCatalog[scope];
    let result = {};
    let name;
    let shortScope = scope == "poetic" ? "3" : "21";

    let entryNameC = mainCatalog[misc.conjunctive][symbolKey];
    let entryNameD = mainCatalog[misc.disjunctive][symbolKey];

    if (entryNameD && entryNameC) {
        comments.push(myO.comment.dupKeys);

        // special deprecation of two-faced unicodes / names
        if (entryNameD.name != entryNameC.name) {
            name = `${entryNameC.name}-${shortScope}c-or-${entryNameD.name}-${shortScope}d`;
        }
        else if (nValue != undefined) {
            if (nValue) name = `${entryNameD.name}-${shortScope}d`;
            else name = `${entryNameC.name}-${shortScope}c`;
        }
        else {
            name = `${entryNameC.name}-${shortScope}cd`;
        }
    }
    else if (entryNameD) {
        name = `${entryNameD.name}-${shortScope}d`;
    }
    else if (entryNameC) {
        name = `${entryNameC.name}-${shortScope}c`;
    }
    else {
        name = "";
    }

    result.name = name;
    if (name == "") {
        if (symbolKey.length > 1 && myO.aggressive) {
            // divide and conquer -- molecules from atoms
            result.name = molecularName(symbolKey, scope, canFlipTwo, comments, osisID, word, nValue);
            let index = comments.indexOf(myO.comment.pairFlip);
            if (index == -1) {
                comments.push(myO.comment.synthName);
            }
        }
        else {
            comments.push(myO.comment.noName);
        }
    }

    return result;
}
function nValueInCorrespondingOshb(osisID, word) {
    // very brittle
    // fasten seat-belts
    // out of luck if verses are outta sync

    let result;
    let matchingTuples = findOsisIdVerseTuples(osisID, "oshb");
    let matchingWords;

    if (matchingTuples && matchingTuples.length > 0) {
        // https://codingforseo.com/blog/remove-hebrew-vowels/
        // using includes() to try to cover case in Ps.1.1, where words not eq b/c one version has maqqef
        // and remove all but consonants since mapm and oshb may use diff unicode for qamats
        matchingWords = matchingTuples.filter(t => {
            let punctRegex = /[\u0590-\u05c7]|\u200d/g;
            let strippedT = t.word.replace(punctRegex, "");
            let strippedWord = word.replace(punctRegex, "");

            let tArray = strippedT.split('').map(c => c.codePointAt(0).toString(16));
            let wordArray = strippedWord.split('').map(c => c.codePointAt(0).toString(16));

            return (t.word.match(punctRegex) && word.match(punctRegex))
                && (strippedT.includes(strippedWord) || strippedWord.includes(strippedT) ||
                        arrayOneSubsetOfTwo(tArray, wordArray) || arrayOneSubsetOfTwo(wordArray, tArray)
                    )
        });
        if (matchingWords.length > 0) {
            result = matchingWords[0].n;
        }
    }
    return result;
}
function findOsisIdVerseTuples(osisID, oshbOrMapm) {
    let result;

    let fields = unpackOsisId(osisID);
    let book = fields[0];
    let chapter = Number(fields[1]) - 1;
    let verse = Number(fields[2]) - 1;
    let source = myO.loadedTexts[oshbOrMapm][`${book}`];

    let targetVerse = source.chapters[chapter].verses[verse];
    if (targetVerse) {
        result = targetVerse.wordTuples;
    }

    return result;
}
function analyzeCatalogs(target) {
    let naughtyDiv = $('<div class="commentKey naughtyTrup"></div>');
    if (target) target.prepend(naughtyDiv);

    logAndSpan(naughtyDiv,
            "Checking OSHB catalogues for naughty t'amim, irrespective of whether they are present in selected verses",
            'checkForTitle');

    myO.ac_21KeysC = Object.keys(accentCatalog.prose[misc.conjunctive]);
    myO.ac_21KeysD = Object.keys(accentCatalog.prose[misc.disjunctive]);

    myO.ac_3KeysC = Object.keys(accentCatalog.poetic[misc.conjunctive]);
    myO.ac_3KeysD = Object.keys(accentCatalog.poetic[misc.disjunctive]);

    let result = "";
    arraysIntersection(myO.ac_21KeysC, myO.ac_21KeysD).forEach(o21 => {
        let symbol = literalUnicodeCharsToSymbols(o21);
        if (accentCatalog.prose[misc.conjunctive][symbol]) {
            let cName = accentCatalog.prose[misc.conjunctive][symbol].name;
            let dName = accentCatalog.prose[misc.disjunctive][symbol].name;
            if (cName != 'None') {
                result +=`<div dir="rtl"><span dir="ltr"><b> Prose scope: 
                    <span class="naughtyTrupName">[${o21}]</span> --> both 
                    <span class="naughtyTrupUnicode">[${cName}](c)</span> and 
                    <span class="naughtyTrupUnicode">[${dName}](d)</span></b></span></div>`;
            }
        }
    });
    arraysIntersection(myO.ac_3KeysC, myO.ac_3KeysD).forEach(o3 => {
        let symbol = literalUnicodeCharsToSymbols(o3);
        if (accentCatalog.poetic[misc.conjunctive][symbol]) {
            let cName = accentCatalog.poetic[misc.conjunctive][symbol].name;
            let dName = accentCatalog.poetic[misc.disjunctive][symbol].name;
            result +=`<div dir="rtl"><span dir="ltr"><b> Poetic scope: 
                    <span class="naughtyTrupName">[${o3}]</span> --> both 
                    <span class="naughtyTrupUnicode">[${cName}](c)</span> and 
                    <span class="naughtyTrupUnicode">[${dName}](d)</span></b></span></div>`;
        }
    });

    if (target) {
        logAndSpan(naughtyDiv, result);
    }
}

function intersection(first, second) {
    let difference = first.filter(x => !second.includes(x));
    return difference;
}
function arrayOneSubsetOfTwo(first, second) {
    return first.every(x => second.includes(x));
}
function molecularName(multiSymbolKey, scope, canFLipTwo, comments, osisID, word, nValue) {
    let candidateNames = [];
    let result = "";

    let keyParts = String(multiSymbolKey).split('');

    if (keyParts.length == 2 && canFLipTwo) {
        let pairSubSymbol = keyParts[1] + keyParts[0];

        let twoPartResult = getOshbNameInfo(pairSubSymbol, scope, false, comments, osisID, word, nValue).name;
        if (twoPartResult && ! (twoPartResult.match(/ with /))) {
            candidateNames.push(twoPartResult);
            comments.push(myO.comment.pairFlip);
            let index = comments.indexOf(myO.comment.synthName);
            if (index !== -1) {
                comments.splice(index, 1);
            }
        }
    }

    else if (keyParts.length == 3) {
        // 1 + 2
        let unitSubSymbol = keyParts[0];
        let pairSubSymbol = keyParts[1] + keyParts[2];
        let onePartResult = getOshbNameInfo(unitSubSymbol, scope, true, comments, osisID, word, nValue).name;
        let twoPartResult = getOshbNameInfo(pairSubSymbol, scope, true, comments, osisID, word, nValue).name;

        if (twoPartResult) {
            candidateNames.push(onePartResult);
            candidateNames.push(twoPartResult);
        }
        else {
            // 2 + 1
            let unitSubSymbol = keyParts[2];
            let pairSubSymbol = keyParts[0] + keyParts[1];

            twoPartResult = getOshbNameInfo(pairSubSymbol, scope, true, comments, osisID, word, nValue).name;
            onePartResult = getOshbNameInfo(unitSubSymbol, scope, true, comments, osisID, word, nValue).name;

            if (onePartResult) {
                candidateNames.push(twoPartResult);
                candidateNames.push(onePartResult);
            }
        }
    }

    if (candidateNames.length == 0) { // not happy yet!
        for (let i = 0; i < keyParts.length; i++) {
            let symbol = keyParts[i];
            let oneName = getOshbNameInfo(symbol, scope, false, comments, osisID, word, nValue).name;
            candidateNames.push(oneName);
        }
    }
    candidateNames = candidateNames.map(n => n ? `\{${n}\}` : "{NA}");
    result = `${candidateNames.join(' with ')}`;

    return result;
}

// eliminate dups. https://stackoverflow.com/questions/9229645/remove-duplicate-values-from-js-array
function uniq(array) {
    let result = array; // maybe undefined?
    if (result && result.length > 0) {
        result = [...new Set(array)];
    }
    return result;
}
function arraysIntersection(one, two) {
    let intersectionSymbols = ( one.filter(x => two.includes(x)));

    let result = intersectionSymbols.map(s => symbolWordToTaamUnicodes(s));
    return result;
}

/// from oshb site, helps determine 'division'
function verseLines(verse) {
    var lines = [],
        currentLine = document.createElement('div'),
        setLine = false,
        type,
        child = verse.firstChild;

    while (child) {
        if (child.nodeType === 3 && currentLine.hasChildNodes()) {
            currentLine.appendChild(segElement("punctuation", "\u00A0"));
        }
        switch (child.nodeName) {
            case 'w':
                if (setLine) {
                    wordData.setHandlers(true);
                    lines.push({"code": setLine, "line": currentLine});
                    currentLine = document.createElement('div');
                    setLine = false;
                }
                currentLine.appendChild(wordData.element(child));
                if (child.hasAttribute('n')) {
                    setLine = child.getAttribute('n');
                } else {
                    wordData.setHandlers();
                }
                break;
            case 'seg':
                type = child.getAttribute('type');
                if (type === 'x-pe' || type === 'x-samekh') {
                    currentLine.appendChild(segElement("mark", child.firstChild.nodeValue));
                } else {
                    currentLine.appendChild(segElement("punctuation", child.firstChild.nodeValue));
                    if (setLine) {
                        wordData.addAccent(child.firstChild.nodeValue);
                    }
                }
                break;
            case 'note':
                if (child.hasAttribute('n')) {
                    currentLine.appendChild(supElement("note", child.firstChild.nodeValue, child.getAttribute('n')));
                } else if (child.hasAttribute('type')) {
                    type = child.getAttribute('type');
                    if (type === 'variant') {
                        currentLine.appendChild(segElement("punctuation", " "));
                        var qereOutput = qereElement(child);
                        currentLine.appendChild(qereOutput.span);
                        setLine = qereOutput.setLine ? qereOutput.setLine : setLine;
                    } else if (type === 'alternative') {
                        currentLine.appendChild(supElement("note", "alternative: " + child.getElementsByTagName('rdg')[0].firstChild.nodeValue, "*"));
                    }
                } else {
                    currentLine.appendChild(supElement("note", "alternative: " + child.firstChild.nodeValue, "*"));
                }
        }
        child = child.nextSibling;
    }
    wordData.setHandlers(true);
    lines.push({"code": setLine, "line": currentLine});
    return lines;
}

