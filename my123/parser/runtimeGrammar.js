let songInput0 = `3>2  12  33 3 | 22 2 35 5` ;

/*
SONG = lines:(INPUT_LINE*) { return {lines}}
       INPUT_LINE 'INPUT_LINE' =
            $[ ]* meta:META                               $[ \n]*     { return {line: {meta, rawInput:text()}}} /
            $[ ]* wordsOrMultis:WORD_OR_MULTI|1.., [ \t]| $[ \n]*     { return {line: {wordsOrMultis, rawInput:text()}}}

       WORD_OR_MULTI =
            KEY_DIRECTIVE /
            WORD

        KEY_DIRECTIVE =
           "[K:" $[ ]* key:$[A-Z]+ rest:($.*) "]" $[ ]* { return {keyDirective: {key}}}

        WORD = $[0-9]+
        META = "K:" key:$([^ \t\n]+) rest:$[^\n]*    { return {meta: {key, rest}}}
=============
    0000
        [K:Fm Phr]
K:Cm ljlkjljljl
==============
*/

let songGram = `
       SONG = lines:(INPUT_LINE*) { return {lines}}
       INPUT_LINE 'INPUT_LINE' =
            $[ \\n]* meta:META                                 $[ \\t\\n]*     { return {line: {meta, rawInput:text()}}} /
            $[ \\n]* wordsOrMultis:WORD_OR_MULTI|1.., [ \\t]*| $[ \\t\\n]*     { return {line: {wordsOrMultis, rawInput:text()}}}

       WORD_OR_MULTI =
            KEY_DIRECTIVE /
            WORD        
      
       KEY_DIRECTIVE =
           "[" inline:KEY "]" { return {inline}}
           
       KEY = "K:" $[ \t]* content:$[A-Za-z#=^_ \t-]+ { return {keyDirective: {content} }}

       META 'META' = 
            L:      "L:" _* numerator:$NOTE_NUM+ SLASH denominator:$NOTE_NUM+ rest:$(IN_LINE*) { return {L: {numerator, denominator, rest}}}  /
            M:      "M:" _* numerator:$NOTE_NUM+ SLASH denominator:$NOTE_NUM+ rest:$(IN_LINE*) { return {M: {numerator, denominator, rest}}} / 
            metaKey:KEY { return {metaKey}} /
            miscMeta:$(COLONIZED_LETTER IN_LINE*) _*             { return {miscMeta}} / 
            comment:$(PERCENT IN_LINE*)                            { return {comment}}
            
       COLONIZED_LETTER 'COLONIZED_LETTER' = 
            colony: $(SINGLE_LETTER COLON)                       { return {colony}}
       WORD 'WORD' = 
            word:ANY_WORD { return {word}}
            
       ANNOTATED_NOTE 'ANNOTATED_NOTE' =
            Q_PREFIX qpText:QUOTE_PHRASE _* notesWord:NOTE_ISH_WORD { return {qpWord: {qpText, notesWord}}} 
            
       ANY_WORD 'ANY_WORD' = 
            colons:$[:]+ prefix:$LETTER_DIGIT_UNDER+ "-" mkey:$LETTER_DIGIT_UNDER_DASH+ $[:]+ extraNote:SINGLE_NOTE?
                { return {mmacro: {colons, prefix, mkey, extraNote}}} /
            ANNOTATED_NOTE / 
            chordPlusWord: CHORD_PLUS { return {chordPlusWord}} /
            qSharp:Q_SHARP { return {qSharp}} /
            qFlat:Q_FLAT { return {qFlat}} /
            qNatural:Q_NATURAL { return {qNatural}} /
            qWord:QUOTE_PHRASE { return {qWord}} / 
            commentWord:$(PERCENT+ IN_LINE*) { return {commentWord}} /
            barBoundary: BAR_BOUND { return {barBoundary}} /
            UNQUOTE_WORD 
    // ^^^^^^^^.lines-words
        BAR_BOUND 'BAR_BOUND' =
            "|:" /
            ":|" /
            "||" /
            "|]" / 
            "|" 
    
    // vvvvvvvv.quotes
        CHORD_PLUS 'CHORD_PLUS' = 
            '"' chord:QUOTE_CHORD postChord:$NON_QUOTE_CHAR*  '"' 
                    { return { quoteChord: {chord, postChord}}}   
        QUOTE_CHORD 'QUOTE_CHORD' = 
            _* arabic:[1-7] { return {arabic} } /
            _* roman:$([ivIV]+) { return {roman} }
        QUOTE_PHRASE 'QUOTE_PHRASE' = 
            '"' @$NON_QUOTE_CHAR* '"'
        NON_QUOTE_CHAR 'NON_QUOTE_CHAR' = 
            ESCAPED_QUOTE / 
            SINGLE_NON_QUOTE

        Q_SHARP = "qSS" { return '"<(♯)"' }
        Q_FLAT =  "qFF" { return '"<(♭)"' }
        Q_NATURAL = "qNN" { return '"<(♮)"' }
            
        SINGLE_NON_QUOTE 'SINGLE_NON_QUOTE' = 
            [^"]
        ESCAPED_QUOTE 'ESCAPED_QUOTE' = 
            '\\\\"'    
    // ^^^^^^^.quotes
    
    // vvvvvvvv.unquoted
    WORD_BOUND 'WORD_BOUND' =
       _ / __ / !.

    OCTAVE_WORD 'OCTAVE_WORD' = 
        "@+"      { return 'octUp'} /
        "@-"      { return 'octDown'} /
        "@@"      { return 'octReset'} 

    UNQUOTE_WORD 'UNQUOTE_WORD' = 
        octaveWord: OCTAVE_WORD  { return {octaveWord}} /
        @TUPLE_WORD  &WORD_BOUND /
        noNumsWord:  $NO_SPACE_TICK_OR_NUM+ &WORD_BOUND { return {noNumsWord}} / 
        notesWord:NOTE_ISH_WORD  { return {notesWord}} /
        miscWord:  $NON_SPACE+ &WORD_BOUND { return {miscWord}}
    // ^^^^^^^^.unquoted
    
    TUPLE_WORD 'TUPLE_WORD' = 
        L_PAREN letters1:$LETTER_FOR_DIGIT+ COLON letters2:$LETTER_FOR_DIGIT+ COLON letters3:$LETTER_FOR_DIGIT+
                { return {tuple_word: {letters1, letters2, letters3}}} /
        L_PAREN letters1:$LETTER_FOR_DIGIT+ COLON letters2:$LETTER_FOR_DIGIT+ 
                { return {tuple_word: {letters1, letters2}}} /
        L_PAREN letters1:$LETTER_FOR_DIGIT+ 
                { return {tuple_word: {letters1}}} 

    // vvvvvvvv.note-ish words
    NOTE_ISH_WORD 'NOTE_ISH_WORD' =   
            (intery1:INTERY_NOTE oper:">" intery2:INTERY_NOTE &WORD_BOUND 
              { return {gtNotesWordDyn: {intery1:intery1, oper:">", intery2:intery2}}}) /
            (intery1:INTERY_NOTE oper:"<" intery2:INTERY_NOTE &WORD_BOUND 
              { return {ltNotesWordDyn: {intery1:intery1, oper:"<", intery2:intery2}}}) /
              
            (intery1:INTERY_NOTE oper:">/" intery2:INTERY_NOTE &WORD_BOUND 
              { return {gtNotesWord: {intery1:intery1, oper:">", intery2:intery2}}}) /
            (intery1:INTERY_NOTE oper:"</" intery2:INTERY_NOTE &WORD_BOUND 
              { return {ltNotesWord: {intery1:intery1, oper:"<", intery2:intery2}}}) /
              
            (intery1:INTERY_NOTE oper:">>" intery2:INTERY_NOTE &WORD_BOUND 
              { return {gt2NotesWord: {intery1:intery1, oper:oper, intery2:intery2}}}) /
            (intery1:INTERY_NOTE oper:"<<" intery2:INTERY_NOTE &WORD_BOUND 
              { return {lt2NotesWord: {intery1:intery1, oper:oper, intery2:intery2}}}) /
              
            ( intery1:INTERY_NOTE oper1:"<" intery2:INTERY_NOTE oper2:">" intery3:INTERY_NOTE &WORD_BOUND  
              { return {lgtNotesWord: {intery1:intery1, oper1:oper1, intery2:intery2, oper2:oper2, intery3:intery3}}}) /
                                  
            interyNotesWord:  NOTE_OR_INTER+ &WORD_BOUND { return {interyNotesWord}} 
    // ^^^^^^^^.note-ish words

    // vvvvvvvv.note
      INTERY_NOTE 'INTERY_NOTE' = 
        inter1:INTER_NOTE* note:NOTE inter2:INTER_NOTE* {return { inter1:inter1, interN:note, inter2:inter2}}
      NOTE_OR_INTER 'NOTE_OR_INTER' = 
          NOTE /
          interNote:INTER_NOTE+ {return {interNote}}

      NOTE 'NOTE' = 
          L_BRACK  @SINGLE_NOTE R_BRACK  /
          L_PREFIX INTERY_NOTE /
          P_PREFIX INTERY_NOTE /
         SINGLE_NOTE /
          "[" multi:(SINGLE_NOTE|2..|) "]" extraNote:SINGLE_NOTE? nDur:N_DURATION? 
                    { return { chord: {multi, extraNote, nDur}}}
          
      SINGLE_NOTE 'SINGLE_NOTE' = 
          nOct:N_OCT nShlat:N_SHLAT num:NOTE_NUM nPrimes:N_PRIMES nDur:N_DURATION
            { return {note: {nOct, nShlat, num, nPrimes, nDur}}} /
          TICK nDur:N_DURATION tRparen:[)]? { return { note: {tick: {nDur, tRparen}}}} /
          TOCK nDur:N_DURATION { return { note: {tock: {nDur}}}}
          
      N_OCT 'N_OCT' = 
        $[-+]*      
      N_SHLAT 'N_SHLAT' = 
        courtesy:"!courtesy!"? shlat:$[=^_]*   { return {courtesy, shlat} }
      N_PRIMES 'N_PRIMES' = 
        $[,]    /
        $[']*
      N_DURATION 'N_DURATION' = 
          $($LETTER_DURATION $SLASH+ $LETTER_DURATION) /
          $($LETTER_DURATION $SLASH+) /
          $($SLASH+  $LETTER_DURATION) /
          $SLASH+  /
          $LETTER_DURATION*  
        
      INTER_NOTE 'INTER_NOTE' =  
            misc:INTER_NOTE_MISC { return { misc:misc }} /
            shiftDur: SHIFT_DUR  { return { shiftDur:shiftDur }} 

      INTER_NOTE_MISC 'INTER_NOTE_MISC' = 
        $[)(]+       

      SHIFT_DUR 'SHIFT_DUR' = 
            [.]     {return 1}    /
            [o]     {return -1}   

    // ^^^^^^^^.note
    
    // vvvvvvvv.lexical
       __ 'NEWLINE' = 
            [\\n]
       _ 'SPACE' = 
            [ \\t]
       NON_SPACE 'NON_SPACE' = 
            [^ \\t\\n]
       NO_SPACE_TICK_OR_NUM 'NO_SPACE_TICK_OR_NUM' = 
            [^/ 0-9z'\\t\\n\`,]
       NOTE_NUM 'NOTE_NUM' = 
            [0-9z] 
       TICK 'TICK' = 
            ['] 
       TOCK 'TOCK' = 
            [\`]
       L_BRACK 'L_BRACK' = [{]
       R_BRACK 'R_BRACK' = [}]
       
       L_PAREN 'L_PAREN' = [(]
       
       LETTER_DURATION 'LETTER_DURATION' = [a-h]
       SLASH 'SLASH' = [/]
       COLON 'COLON' = [:]
       PERCENT 'PERCENT' = [%]
       
       LETTER_FOR_DIGIT 'LETTER_FOR_DIGIT' = [A-Ja-j]
       SINGLE_LETTER 'SINGLE_LETTER' = [A-Za-z]
       LETTER_DIGIT_UNDER = ident:[a-zA-Z0-9_] 
       LETTER_DIGIT_UNDER_DASH = ident:[a-zA-Z0-9_-] 
       
       EO_LF = __ / !.
            
       IN_LINE
         = [^\\n]
         
       L_PREFIX 'L_PREFIX' = 
        [L]
       P_PREFIX 'P_PREFIX' = 
        p_prefix:[Pp] { return {p_prefix}}
       Q_PREFIX 'Q_PREFIX' =
         "q"
         
    // ^^^^^^^^.lexical

`;

function quoteHelper(array) {
    let result = `"${array.join(' ')}"`;
    return result;
}

function getSongInputBig() {
    let result = `

                  word 1 "quote 1 \\" embedded quote" 123
                    li2n -+^1'a 2b1a
                    [123]45 1()2)3
                    3>4  (6))>((7)) _2a)<4>+^9
                    3<4  5>>6 7<<8 lkj4*((*9||:
                    (4>5) (.+_7') @@ @- @+   1.o2
                    "57seventh"`;
    return result;
}
