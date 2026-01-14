let macros = {};

macros.tonicSelectMap = new Map();

function expandMacros(sweet) {
    let keys = macroKeys();
    keys.forEach((key) => {
        if (sweet.match(key)) {
            let regex1 = new RegExp(`${lx.reNoSlashB4Re.source}::${key}::`, "gi");
            let regex2 = new RegExp(`${lx.reNoSlashB4Re.source}:${key}:`, "gi");

            // brackets
            let resolvedMacro = macros.macroMap[key];

            sweet = sweet.replace(regex1, `"[${key}]" ${resolvedMacro}`);
            sweet = sweet.replace(regex2, `${resolvedMacro}`);
        }
    });
    // non-macros become quotes (but forgive one letter ones from demo
    let result = sweet  .replace(/::([-_\w]+)::/g, '"' + " $1" + '"') // double :
                        .replace(/:([-_\w]+):/g, '"' + " $1" + '"');  // single :
    return result;
}
async function initMacroMap(prefix) {
    if (! prefix) {
        prefix = "";
    }
    if (typeof skipMacros !== 'undefined') return;

    macros.macroMap = {};
    macros.macroProvenance = {};
    macros.latestLoadedMacros = []; // not currently affecting anything, could be displayed?
    macros.prefixToDefaultPrettyTonic = {};
    macros.prefixToModifier = {};
    

    let macrosDiv = $('#macrosDisplayDiv');

    await importMacrosFromFile(macrosDiv, prefix +"macro-system.json");
    await importMacrosFromFile(macrosDiv, prefix +"macro-penta.json");
    await importMacrosFromFile(macrosDiv, prefix +"macro-haft.json");
    await importMacrosFromFile(macrosDiv, prefix +"macro-ps.json");
    await importMacrosFromFile(macrosDiv, prefix +"macro-job.json");
    await importMacrosFromFile(macrosDiv, prefix +"macro-prov.json");

    //updateMacroTitlesIn123();
}
function digestMacroPackage(macroPackage, target, doChange, extraPairs) {
    let prefix = macroPackage.prefix;
    let name = macroPackage.name;
    let pairs = macroPackage.pairs;
    if (extraPairs) {
        pairs = pairs.concat(extraPairs);
    }
    let tonic = $(`#${prefix}_select`).val();
    if (! tonic) {
        tonic = macroPackage.tonic;
    }
    let mode = macroPackage.mode;

    // sys does not give tonic or mode
    if (!tonic && !mode) {
        tonic = globalCurrentMode.tonic;
        mode = globalCurrentMode.mode;
    }
    else { // expect all or nothing, both or none
        globalCurrentMode.tonic = tonic;
        globalCurrentMode.mode = mode;
    }
    if (prefix == 'sys') {
        macros.prefixToModifier[prefix] = '';
        macros.prefixToDefaultPrettyTonic[prefix] = 'C';
    }
    else {
        let tonic_select = populateTonicSelect(
            prefix + '_select',
            tonic,
            mode);
        macros.tonicSelectMap.set(prefix, tonic_select);
        
        let modifier = modeNameToModifier.get(macroPackage.mode);
        macros.prefixToModifier[prefix] = modifier;
        macros.prefixToDefaultPrettyTonic[prefix] = prettyKey(tonic_select.val());
    }

    if (prefix && name && pairs && $.isArray(pairs)) {
        //console.log(`${name} is a kosher Macro Package`);
        pairs = sortArrayOfPairsBy1st(pairs);

        macros.macroProvenance[prefix] = name;
        for (let i = 0; i < pairs.length; i++) {
            let pair = pairs[i];
            macros.macroMap[prefix + '-' + pair[0]] = pair[1];
        }
        if ( ! macros.latestLoadedMacros.includes(name)) {
            macros.latestLoadedMacros.push(name);
        }

        presentMacros(target);

        if (doChange) $('#_123Entry').change();
    }
    else {
        complainAboutMacroPackage(macroPackage);
    }
}
function complainAboutMacroPackage(macroPackage) {
    console.log("Invalid Macro Package:", macroPackage);
    alert ("Invalid Macro Package, see console");
}
async function importMacrosFromFile(target, file, doChange, extraPairs) {
    await $.getJSON(file, function(data) {
        digestMacroPackage(data, target, doChange, extraPairs);
    });
}
async function importMacrosFromClipboard(target, doChange) {
    let data = await window.navigator.clipboard.readText();
    try {
        let extraPairs = JSON.parse(data);
        await importMacrosFromFile(target, "macro-system.json", doChange, extraPairs);
    }
    catch (err) {
        complainAboutMacroPackage(data);
    }
}
function presentMacros(target) {
    let numMacroCharsPerLine = 150;
    if (! target || ! target.length) {
        return; // probably on parser page
    }
    let currentPrefix = "";

    let keys = Object.keys(macros.macroMap);
    //keys.sort();
    if (keys && keys.length > 0) {
        target.empty();
        let numMacroCharsEmitted = 0;
        let innerDiv;
        for (let i = 0; i < keys.length; i++) {
            let key = keys[i];
            let prefix = key.replace(/-.*/, "");
            if (prefix && prefix != currentPrefix) {
                currentPrefix = prefix;
                innerDiv = $(`#${currentPrefix}Inner`);
                if ( ! innerDiv.length) {
                    let macroDivTitle = $(`<div id="${currentPrefix}">
                    ---- Macros from ${macros.macroProvenance[currentPrefix]}----------------------------
                    </div>`);
                    let select = macros.tonicSelectMap.get(currentPrefix);
                    if (select) {
                        macroDivTitle.prepend(select);
                        select.on('change', function(e) {
                            let newDefaultPrettyTonic = prettyKey($(e.target).val());
                            macros.prefixToDefaultPrettyTonic[prefix] = newDefaultPrettyTonic;
                        });

                    }
                    else {
                        macroDivTitle.prepend($('<span class="ms-4 me-4"> </span>'));
                    }
                    target.append(macroDivTitle);
                    innerDiv = $(`<div class="innerDiv" id="${currentPrefix}Inner"></div>`);
                    macroDivTitle.append(innerDiv);
                    innerDiv.hide();
                    $(`#${currentPrefix}`).on("click", function (e) {
                        let currentInnerDiv = $(e.target).find(".innerDiv");
                        toggleVisibility(currentInnerDiv);
                    });
                }

                numMacroCharsEmitted = 0;
            }
            pastyMacroKey(innerDiv, key);
            numMacroCharsEmitted+= key.length;

            if (numMacroCharsEmitted >= numMacroCharsPerLine) {
                innerDiv.append('<br/>');
                numMacroCharsEmitted = 0;
            }

        }
    }
}
function pastyMacroKey(target, key) {
    let buttonId = `mac_${key}`;
    if ($(`#${buttonId}`).length) { // add only if it's not there already!
    }

    let button = `<button id="${buttonId}" class="macroKey">${key}</button>`;
    target.append(button);
    target.append(" ");
    $(`#mac_${key}`).on('click', function(e) {
        handleMacroButton(e, key);
    });
    $(`#mac_${key}`).attr('title','Adjust the effect of click in "Macro Display" section above');
}
function macroKeys() {
    let result = Object.keys(macros.macroMap);
    return result;
}
function get123caretPosAndVal() {
    let _123textEntry = $('#_123Entry');
    let textEntry0 = _123textEntry[0];
    let caretPos = textEntry0.selectionStart;
    let current123text = _123textEntry.val();

    return [_123textEntry, textEntry0, caretPos, current123text];
}
function update123atCaret(_123textEntry, textEntry0, caretPos,
                          current123text, stuffToInsert) {

    current123text = current123text.substring(0, caretPos) + stuffToInsert
        + current123text.substring(caretPos);
    let newCaretPos = caretPos + stuffToInsert.length;

    _123textEntry.val(current123text);
    setCaretToPos(textEntry0, newCaretPos);
    parse123();
}

function handleMacroButton (e, macroKey) {
    let [_123textEntry, textEntry0, caretPos, current123text] = get123caretPosAndVal();

    let stuffToInsert = '';
    let scopePrefix = macroKey.replace(/-.*/, "");

    let useBar = $('#check-bar').is(':checked');
    let useLabel = $('#check-label').is(':checked');
    let directVsAbbrev = $("input:radio[name ='RadioGroupDirectAbbr']:checked").val() == "direct";

    let optionalBar = useBar ? "| " : "";

    let possibleInlineKeyMod = '';
    let newMode = handleKeyMod(scopePrefix);
    if (newMode) {
        let possibleKeyMod = `K:${newMode._123DisplayName}`;
        tryKeyAdjust(possibleKeyMod);
        possibleInlineKeyMod = `[${possibleKeyMod}]`;
    }
    if (!directVsAbbrev && !useLabel) {
        stuffToInsert += ' ' + possibleInlineKeyMod + ' :' + macroKey +  ': ' + optionalBar;
    } else if (!directVsAbbrev && useLabel) {
        stuffToInsert += ' ' + possibleInlineKeyMod + ' ::' + macroKey + ':: ' + optionalBar;
    } else if (directVsAbbrev && !useLabel) {
        stuffToInsert += ' ' + possibleInlineKeyMod + ` ${macros.macroMap[macroKey]} ` + optionalBar;
    } else if (directVsAbbrev && useLabel) {
        stuffToInsert += ' ' + possibleInlineKeyMod + ` \"[${macroKey}]\"  ${macros.macroMap[macroKey]} ` + optionalBar;
    }

    update123atCaret(_123textEntry, textEntry0, caretPos, current123text,
        stuffToInsert);
}
function handleKeyMod(scopePrefix) {
    let result = null;

    let modifier = macros.prefixToModifier[scopePrefix];
    let incomingMode = globalCurrentMode;
    let outgoingMode = globalCurrentMode;
    let incomingKey123display = globalCurrentMode._123DisplayName;
    let outgoingKey123display = incomingKey123display;

    // sys just uses current key
    if (scopePrefix != "sys") {
        let incomingTonic = incomingKey123display.replace(/(.[#b]?)[a-z ]*/, "$1");

        let incomingModifier = incomingKey123display.replace(incomingTonic, "");
        if (incomingModifier != modifier) {
            // if current mode lacks desired modifier, maybe using its tonic
            //    with the desired one makes a kosher key?
            outgoingKey123display = incomingTonic + modifier;
            outgoingMode = nameToModeMap.get(outgoingKey123display);
            // use initial default or latest chosen on macro tonic select
            if ( ! outgoingMode) {
                // the tonic from our macro-key-select should work with our desired modifier
                outgoingKey123display = macros.prefixToDefaultPrettyTonic[scopePrefix] + modifier;
                outgoingMode = nameToModeMap.get(outgoingKey123display);           }
        }
        if (outgoingKey123display != incomingKey123display) {
            result = outgoingMode;
            console.log(`handleKeyMod: ${incomingMode._123DisplayName} --> ${outgoingMode._123DisplayName}`)
        }
    }
    return result;
}