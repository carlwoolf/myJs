function setup() {
    let target = $('#mainDiv');
    common_setup();
    let i=0;
    let headerRow = $(`    
          <div class="header row solution">
            <div class="bord header col-4" class="">   ${columns[i++]} (and your translation)</div>
            <div class="bord header col-8" class="">   ${columns[i++]} (and your translation)</div>
          </div>`);
    target.append(headerRow);
    let sampleRow = $(`    
          <div class="data row solution bord pt-0 taller">
            <div class=" header col-4" class="">E.G.:  גָּ֥ד &nbsp;&nbsp; Gad (a tribe)</div>
            <div class=" header col-8" class="">  דן וְנַפְתָּלִ֖י גָּ֥ד וְאָשֵֽׁר &nbsp;&nbsp; The tribes Dan, Naphtali, Gad and Asher</div>
          </div>`);
    target.append(sampleRow);

    //data = fisherYatesShuffle(data);
    for (let i=0; i<data.length; i++) {
        let rashi = (i%2 == 0) ? '' : 'noto-rashi-hebrew-600';
        let record = data[i];
        unMissify(record);

        let dataRow = $(`    
          <div class="data row solution bord pt-0 taller">
            <div class=" data col-4 word">[${i+1}] ${record.word}</div>
            <div class="${rashi}  data col-8 phrase"> ${record.phrase}</div>
          </div>`);
         target.append(dataRow);
    }
}