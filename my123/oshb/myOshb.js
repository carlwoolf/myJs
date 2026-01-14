var myO = {}; // opened children can see globals declared with var, not let

myO.bookUrlPrefix = 'https://hb.openscriptures.org/wlc/';
myO.showUnicode = true;
myO.ohbUrlTemplate = "https://hb.openscriptures.org/structure/OshbVerse/index.html?b=bbb&c=ccc&v=vvv";
myO.chosenChapters = {};
myO.chosenChapterVerses = {};
myO.openedWindows = [];
myO.showEndings = true;

function setupTo123() {
    myO.shortNameToFullName = new Map();
    // myO.fullNameToShortName = new Map();
    //myO.allShortNames = [];
    $('#book').find(`option`).each(function(ind,opt) {
        let short = $(opt).attr('value');
        let full = $(opt).html();
        myO.shortNameToFullName.set(short, full);
        //myO.fullNameToShortName.set(full, short);
        //myO.allShortNames.push(short);
    });

    $("#emit-123"  ).on("click", function(e) {
        emit123Lyrics();
    });
    $("#emit-trup"  ).on("click", function(e) {
        emitTrup(true);
    });
    $("#coords"  ).on("change", function(e) {
        myO.showOutputCoords =  ($('#coords').is(':checked'));
        $('#lyrics').empty();
    });
    $("#endings"  ).on("change", function(e) {
        myO.showEndings =  ($('#endings').is(':checked'));
    });
    $("#table"  ).on("change", function(e) {
        myO.showOutputSource = ($('#table').is(':checked'));
        $('#lyrics').empty();
    });
    $("#coords"  ).change(); // take it into account
    $("#table"  ).change(); // take it into account

    $("#download"  ).on("click", function(e) {
        let value = gabi_content('lyrics');
        if (!value) {
            alert("First click button to load either Trup-name or 123 Output");
            return;
        }
        download(value, "trupOutput.txt");
    });

    $("#to123").on("click", sendTo123Page);

    $("#wpl"  ).on("change", function(e) {
        $("#wplVal"  ).html($("#wpl").val());
    });
    $("#wpl"  ).change();

    $("input:radio[name ='RadioGroupOshbVsMapm']").on("change", function () {
        $('#lyrics').empty();
    });
}

function myTabClick(e) {
    $('.tab-pane').hide();
    let button = $(e.target);
    let buttonId = button.attr('id');
    let panelId = buttonId.replace("-tab", "");
    $(`#${panelId}`).show();
}
function setup() {

    $('.nav-link').on('click', myTabClick);

    tryForOption();

    let bookSelect = $('#book');
    let shortNames;

    bookSelect.on("change", function() {
        shortNames = bookSelect.val();
        if (shortNames.length == 0) {
            bookSelect.val(["Gen"]); // must have at least 1
            bookSelect.change();
        }

        shortNames.forEach(shortName => setupChapterSelect(shortName));

        // $("#one-books-chapters").attr("disabled", false);
        $("#chapter-select").attr("disabled", false);

        myO.loadedBookNames = shortNames;
        console.log("*** selected books: " + JSON.stringify(shortNames));
        loadSelectedBooksOrChapter(shortNames);
    });
    bookSelect.change(); // digest initial val

    setupOptionCheckboxes(shortNames);

    respondToAggression();

    focusTop();

    window.onscroll = function () { scrollFunction() };
    $('#rtnBtn').on("click", focusTop);

    setupTo123();
}
function tryForOption() {
    let option = "";
    let wSearch = window.location.search;
    if (wSearch.match(/.*o=(\w+).*/)) {
        option = wSearch.replace(/.*o=(\w+).*/, "$1");
    }

    myO.eagerAnalyze = false;
    if (option == 'a1') {
        myO.eagerAnalyze = true;
    }
    return option;
}


function setupOptionCheckboxes(shortNames) {
    let chapterSelectStuff = $(".chapter-select");
    shortNames.forEach(name => myO.chosenChapters[name] = ['1']);
    setupChapterSelect(shortNames[0]);
    chapterSelectStuff.show();

    $("#show-strong"  ).on("change", function(e) {
        myO.showStrong   = $(e.target).is(':checked');
        loadSelectedBooksOrChapter(myO.loadedBookNames);
    });
    $("#show-unicode" ).on("change", function(e) {
        myO.showUnicode  = $(e.target).is(':checked');
        loadSelectedBooksOrChapter(myO.loadedBookNames);
    });
    $("#show-comments" ).on("change", function(e) {
        myO.showComments = $(e.target).is(':checked');
        loadSelectedBooksOrChapter(myO.loadedBookNames);
    });
    $("#accent-names" ).on("change", function(e) {
        myO.showTrup  = $(e.target).is(':checked');
        loadSelectedBooksOrChapter(myO.loadedBookNames);
    });

    $("#useMapm"  ).on("change", function(e) {
        myO.useMapm = $(e.target).is(':checked');
        loadSelectedBooksOrChapter(myO.loadedBookNames);
    });

    $("#useOshb"  ).on("change", function(e) {
        myO.useOshb = $(e.target).is(':checked');
        loadSelectedBooksOrChapter(myO.loadedBookNames);
    });

    $("#aggressive"  ).on("change", function(e) {
        myO.aggressive = $(e.target).is(':checked');
        respondToAggression();
        loadSelectedBooksOrChapter(myO.loadedBookNames, true);
    });

    myO.showStrong   = $("#show-strong").is(':checked');
    myO.showUnicode  = $("#show-unicode").is(':checked');

    myO.showTrup  = $("#accent-names").is(':checked');
    myO.useMapm  = $("#useMapm").is(':checked');
    myO.useOshb  = $("#useOshb").is(':checked');

    myO.showComments  = $("#show-comments").is(':checked');
    myO.aggressive = $('#aggressive').is(':checked');

    $("#analyze").on("click", function(e) {
        ////////////// for same-page analyze! /////////////  analyze.js:1, index.html:106
        analyzeBoth();
    });
}
function respondToAggression() {
    if (myO.aggressive) {
        accentCatalog["poetic"]["conjunctive"]['\u05A2'] = { name: "Atnach Hafukh"};
        accentCatalog["prose"]["disjunctive"]['\u0598'] = { name: "Zarqa"};
    }
    else { // undo back to OSHB version
        accentCatalog["poetic"]["conjunctive"]['\u05A2'] = undefined;
        accentCatalog["prose"]["conjunctive"]['\u0598'] = undefined;
    }
}
function showProgress(doIt, context) {
    let tooLong = $('#tooLong');
    let loading = $('#loading');
    console.log(`=== in-progress ${doIt ? 'T...' : 'F (done)'} ${context}`);

    if (doIt) {
        tooLong.addClass('biggg');
        loading.show();
        $('#mainDisplay').css('opacity', '0.4');
        $('#mainDisplay').css('background-color', 'lightblue');
    }
    else {
        tooLong.removeClass('biggg');
        loading.hide();
        $('#mainDisplay').css('opacity', '1');
        $('#mainDisplay').css('background-color', 'transparent');
    }
}


