/////////////////////////////////
// sugar for 123 (not for abc!)
/////////////////////////////////

let parseToAbc = {};

parseToAbc.extractLyrics = () => {
    let wDivided = false;

    let resultArray = [];
    let raw123 = $('#_123Entry').val();
    if (raw123) {
        let lines = raw123.split('\n');

        lines.forEach((l) => {
            if (l.match(/^[PwWT]:/)) {
                if (! wDivided && l.match(/^W:/)) {
                    wDivided = true;
                    resultArray.push("----------------------------------")
                }
                let text = l.replace(/^.:/, "")
                    .replaceAll("*", "")
                    .replace(/\s*-\s*/g, "-")
                    .replace(/\s*\|\s*/g, "  |  ")
                    .replace(/\s+/g, " ");
                if (l.match(/^w:/)) {
                    text = '(lyrics)' + text;
                }
                resultArray.push(text);

            }
        });
    }
    let result = resultArray.join("\n");

    //let wnd = window.open("about:blank", "", "_blank");
    localStorage.setItem("extractedText", result);
    let wnd = window.open("output.html", "", "_blank");
    //wnd.document.write(result);
};
parseToAbc.parse123 = async (doStarLines) => {
    let result = [];
    let raw123 = $('#_123Entry').val();
    if (raw123) {
        result = await parseInput(songGram, raw123, 'lines', doStarLines);
    }
    return result;
}

function explicitMacros() {
    let input = $('#_123Entry').val();
    let output = expandMacros(input);
    $('#_123Entry').val(output);
}


//////////////////////////
let abcFrom123 = {};

abcFrom123.state = {};
abcFrom123.dursAbcTo123 = (input) => {
    let result = {
        'a': '1',
        'b': '2',
        'c': '3',
        'd': '4',
        'e': '5',
        'f': '6',
        'g': '7',
        'h': '8'
    }[input];

    // else, "_", 'default
    if (!result) result = input;

    return result;
}

