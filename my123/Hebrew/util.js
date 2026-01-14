function unmissing(word) {
    let result = null;
    let data = un_data.filter(d => d.word.replace(/[*][*]/g,"") == `${word}`);
    if (data && data.length) {
        result = data[0];
    }
    return result;
}
function unMissify(record) {
    let phrase =        record.phrase;
    let phraseMeaning = record.phraseMeaning;

    if (record.word == record.phrase) {
        let unmissingData = unmissing(record.word);
        if (unmissingData) {
            phrase =         unmissingData.phrase;
            phraseMeaning =  unmissingData.phraseMeaning
                .trim().replace(/^"/,"")
                .replace(/"$/,"");
        }
    }
    record.phrase = phrase;
    record.phraseMeaning = phraseMeaning;
}

// https://en.wikipedia.org/wiki/Fisher%E2%80%93Yates_shuffle
function fisherYatesShuffle(array) {
    let currentIndex = array.length, randomIndex;

    // While there remain elements to shuffle.
    while (currentIndex !== 0) {

        // Pick a remaining element.
        randomIndex = Math.floor(Math.random() * currentIndex);
        currentIndex--;

        // And swap it with the current element.
        [array[currentIndex], array[randomIndex]] = [array[randomIndex], array[currentIndex]];
    }

    return array;
}
