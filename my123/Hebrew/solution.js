function setup() {
    let target = $('#mainDiv');
    let i=0;
    let headerRow = $(`    
         <div class="header row solution">
            <div class="bord header col-3">   ${columns[i++]}</div>
            <div class="bord header col-3">   ${columns[i++]}</div>
            <div class="bord header col-3">   ${columns[i++]}</div>
            <div class="bord header col-3">   ${columns[i++]}</div>
          </div>`);
    target.append(headerRow);

    i=1;
    let missingPhrase = [];
    for (let record of data) {
        unMissify(record);

        let dataRow = $(`    
          <div class="data row solution">
            <div class="bord data col-3 word"><span class="black">[${i++}]</span> 
                                                            ${record.word}</div>
            <div class="bord data col-3 meaning">           ${record.meaning}</div>
            <div class="bord data col-3 phrase">            ${record.phrase}</div>
            <div class="bord data col-3 phraseMeaning">     ${record.phraseMeaning}</div>
          </div>`);
         target.append(dataRow);

         if (record.word == record.phrase) {
             missingPhrase.push(record.word);
         }

         // let csvOutput = $('#csv');
         // csvOutput.append($(`<div>"${record.word}","${record.meaning}","${record.phrase}","${record.phraseMeaning}"</div>`))
    }
    if (missingPhrase.length) {
        target.append('<hr/><hr/><h3>Words without context phrase</h3>');
        let noPhraseUl = $('<ul></ul>');
        target.append(noPhraseUl);

        for (let word of (missingPhrase)) {
            noPhraseUl.append($("<li>" + word + "</li>"));
        }
    }
}