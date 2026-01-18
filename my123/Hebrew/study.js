function setup() {
    let target = $('#mainDiv');
    common_setup();
    let i=0;
    let headerRow = $(`    
          <div class="ms-4 header row solution">
            <div class="bord header col-3">   ${columns[i++]}</div>
            <div class="bord header col-3">   ${columns[i++]}</div>
            <div class="bord header col-3">   ${columns[i++]}</div>
            <div class="bord header col-3">   ${columns[i++]}</div>
          </div>`);
    target.append(headerRow);

    i=1;
    for (let record of data) {
        unMissify(record);

        let dataRow = $(`    
          <div class="ms-4 data row solution">
            <div class="bord data col-3 word"><span class="black">[${i++}]</span> 
                                                                        ${record.word}</div>
            <div class="bord data col-3 meaning">                       ${record.meaning}</div>
            <div class="noto-rashi-hebrew-600 bord data col-3 phrase">  ${record.phrase}</div>
            <div class="bord data col-3 phraseMeaning">                 ${record.phraseMeaning}</div>
          </div>`);
         target.append(dataRow);
    }
}