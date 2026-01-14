function setup() {
    let target = $('#mainDiv');
    let i=0;
    let headerRow = $(`    
          <div class="header row solution">
            <div class="bord header col-3" class="">   ${columns[i++]}</div>
            <div class="bord header col-3" class="">   ${columns[i++]}</div>
            <div class="bord header col-2 ps-1" class="">   Term(English)</div>
            <div class="bord header col-4" class="">   PhraseContext(English)</div>
          </div>`);
    target.append(headerRow);

    //data = fisherYatesShuffle(data);
    for (let i=0; i<data.length; i++) {
        let rashi = (i%2 == 0) ? '' : 'noto-rashi-hebrew-600';
        let record = data[i];
        unMissify(record);

        let dataRow = $(`    
          <div class="data row solution">
            <div class="bord data col-3 word">                         ${record.word}</div>
            <div class="${rashi} bord data col-3 phrase"> ${record.phrase}</div>
            <div class="bord data col-2"> </div>
            <div class="bord data col-4 tall"> </div>
          </div>`);
         target.append(dataRow);
    }
}