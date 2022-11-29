const express = require('express');
const { map } = require('..');
const integrate = require('../models/integrate');
const router = express.Router()

const map_constructs = new Map();
const map_types = new Map();
var specialSymbols = []

const processUploadedFile = (upData) => {

    for (var i = 0; i < upData.constructs.length; ++i) {
        map_constructs.set(upData.constructs[i].name, upData.constructs[i]);
    }

    for (var i = 0; i < upData.types.length; ++i) {
        map_types.set(upData.types[i].type, upData.types[i]);
    }

    specialSymbols = upData.specialSymbols;

    var responseJson = new Object();
    responseJson.statements = [];

    map_constructs.forEach((value, key) => {
        var constructResponse = new Object();
        constructResponse.title = key;
        code = "";
        code += key;
        type = value.type;
        typeDetails = map_types.get(type);
        // console.log('value: ', value)
        // console.log('key: ', key)

        // console.log('type: ', type)
        // console.log('typeDetails: ', typeDetails)
        var cond_delimit_str;
        var cons_st;
        var cons_ed;
        var scope_end;
        var scope_start;


        for (var j = 0; j < typeDetails.order.length; ++j) {
            // console.log('typeDetails.order[j].length: ', typeDetails.order[j].length)
            for (var k = 0; k < typeDetails.order[j].length; ++k) {
                // console.log('typeDetails.order[j][k]:  ', typeDetails.order[j][k])
                // console.log('typeDetails.order[j][k].length: ', typeDetails.order[j][k].length);
                if (typeDetails.order[j][k] == 'condition') {
                    cond_delimit_str = "<cond>"
                    if (map_constructs.get(key)['conditionStart'] != 'undefined') {
                        cons_st = map_constructs.get(key)['conditionStart']
                    }
                    if (map_constructs.get(key)['conditionEnd'] != 'undefined') {
                        cons_ed = map_constructs.get(key)['conditionEnd']
                    }
                } else if (typeDetails.order[j][k] == 'scope') {
                    if (map_constructs.get(key)['scopeStart'] != undefined) {
                        scope_start = map_constructs.get(key)['scopeStart'];
                    }
                    if (map_constructs.get(key)['scopeEnd'] != undefined) {
                        scope_end = map_constructs.get(key)['scopeEnd'];
                    }
                } else if (typeDetails.order[j][k] == 'Case') {
                    if (map_constructs.get(key)['scopeStart'] != undefined) {
                        scope_start = map_constructs.get(key)['scopeStart'];
                    }
                    if (map_constructs.get(key)['scopeEnd'] != undefined) {
                        scope_end = map_constructs.get(key)['scopeEnd'];
                    }
                } else if (typeDetails.order[j][k] == 'Default') {
                    if (map_constructs.get(key)['scopeStart'] != undefined) {
                        scope_start = map_constructs.get(key)['scopeStart'];
                    }
                    if (map_constructs.get(key)['scopeEnd'] != undefined) {
                        scope_end = map_constructs.get(key)['scopeEnd'];
                    }
                } else if (typeDetails.order[j][k].length > 1) {
                    console.log('typeDetails.order[j][k].length: ', typeDetails.order[j][k].length);
                    for (var l = 0; l < typeDetails.order[j][k].length; ++l) {
                        cond_delimit_str = cond_delimit_str + map_constructs.get(key)['conditionSeparator'] + '<cond>';
                    }
                }
            }
        }

        code = (code + cons_st + cond_delimit_str + cons_ed + scope_start + '<code here>' + scope_end).replaceAll('undefined', '');

        var obj = new Object();
        obj.title = key;
        obj.code = code;

        responseJson.statements.push(obj);

    })
    // console.log('responseJson: ', responseJson);
    return responseJson;

}

const tokenizeCode = (code) => {
    var n = code.length;
    var lineNumber = 1;
    var tokens = [];
    var tokensAndLine = [];
    currWord = "";
    for (var i = 0; i < n; i++) {
        var specialChar = false;
        if (code[i] == " " || code[i] == "\n") {
            if (code[i] == "\n") lineNumber++;
            continue;
        }
        for (const j in specialSymbols) {
            var c = specialSymbols[j];
            if (code[i] == c) {
                tokensAndLine.push([code[i], lineNumber]);
                tokens.push(code[i]);
                specialChar = true;
                break;
            }
        }

        if (!specialChar) {
            currWord += code[i];
            if (map_constructs.has(currWord)) {
                if (i + 1 == n) {
                    tokensAndLine.push([currWord, lineNumber]);
                    tokens.push(currWord);
                } else {
                    if (code[i + 1] == " " || code[i + 1] == "\n") {
                        tokens.push(currWord);
                        tokensAndLine.push([currWord, lineNumber]);
                    }
                    else {
                        for (const j in specialSymbols) {
                            var c = specialSymbols[j];
                            if (code[i + 1] == c) {
                                tokensAndLine.push([currWord, lineNumber]);
                                tokens.push(currWord);
                                currWord = "";
                                break;
                            }
                        }
                    }
                }
            } else {
                if (i + 1 < n) {
                    if (code[i + 1] == " " || code[i + 1] == "\n") {
                        currWord = "";
                    }
                    else {
                        for (const j in specialSymbols) {
                            var c = specialSymbols[j];
                            if (code[i + 1] == c) {
                                currWord = "";
                                break;
                            }
                        }
                    }
                }
            }
        }

    }
    console.log(tokensAndLine);
    // return tokens;
    return tokensAndLine;
}

function evaluate(order, construct, tokens, index) {
    var typeToEvaluate = order[0];
    if (typeToEvaluate == "condition") {
        var children = [];
        if (order.length == 2) {
            children = order[1];
        }
        var condSt = construct.conditionStart;
        var condEnd = construct.conditionEnd;
        var expect = []
        expect.push(condSt);
        for (var i = 0; i < children.length; i++) {
            expect.push(construct[children[i]]);
        }
        expect.push(condEnd);

        var i = index;
        var j = 0;
        var cnt = 0;

        for (; (i < tokens.length && j < expect.length); i++, j++) {
            cnt++;
            if (tokens[i][0] != expect[j]) return [-1, tokens[i][1]];
        }

        if (cnt != expect.length) return [-1, tokens[i][1]];

        return [i, -1];
    } else if (typeToEvaluate == "scope") {

        var children = [];
        if (order.length == 2) {
            children = order[1];
        } else if (order.length == 3) {
            children = [...order[1], ...order[2]];
        }
        var scopeSt = construct.scopeStart;
        var scopeEnd = construct.scopeEnd;
        var st = [];

        if (index >= tokens.length || tokens[index][0] != scopeSt) {
            if (index - 1 < tokens.length) return [-1, tokens[index - 1][1]];
            return [-1, tokens[index][1]];
        }

        st.push(scopeSt);
        var childTokens = [];
        var i = index + 1;

        for (; i < tokens.length; i++) {
            if (tokens[i][0] == scopeEnd) st.pop();
            else if (tokens[i][0] == scopeSt) st.push([scopeSt, tokens[i][1]]);
            if (st.length == 0) break;
            if (tokens[i][0].length > 1) {
                var c = 0;
                for (; c < children.length; c++) {
                    if (children[c] == tokens[i][0]) break;
                }
                if (c < children.length) childTokens.push(tokens[i]);
                else break;
            }
            else childTokens.push(tokens[i]);
        }


        if (st.length > 0) {
            if (i < tokens.length) return [-1, tokens[i][1]];
            return [-1, tokens[tokens.length - 1][1]];
        }


        if (children.length > 0) {
            var k = 0;
            for (var j = 0; j < children.length; j++) {
                var child = children[j];
                for (; k < childTokens.length; k++) {
                    if (child == childTokens[k][0]) {
                        break;
                    }
                }
                if (k == childTokens.length && j < children.length) return [-1, tokens[i][1]];
            }
        }

        if (validateTokens(childTokens)) return [i + 1, -1];
        return [-1, tokens[i][1]];

    }
}

const validateTokens = (tokens) => {

    if (tokens.length == 0) return true;

    var n = tokens.length;
    prevToken = "";
    expectNext = [];
    for (var i = 0; i < n; i++) {
        var currTokenandLine = tokens[i]
        var currToken = currTokenandLine[0];
        if (expectNext.length != 0) {
            var idx = 0;
            for (; idx < expectNext.length; idx++) {
                var tkn;
                if (expectNext[idx] == "Do-While") {
                    tkn = "While";
                }

                if (currToken == tkn) {
                    currToken = expectNext[idx];
                    break;
                }
            }
            if (idx == expectNext.length) return [false, currTokenandLine[1]];
        }

        if (map_constructs.has(currToken)) {
            var construct = map_constructs.get(currToken);
            var type = construct.type;
            var typeDetails = map_types.get(type);

            if (Object.hasOwn(typeDetails, "prev")) {
                prevTokensList = typeDetails.prev;
                var prevPresent = false;
                for (const p in prevTokensList) {
                    var pt = prevTokensList[p];
                    if (prevToken == pt || pt == "none") {
                        prevPresent = true;
                        break;
                    }
                }
                if (!prevPresent) return [false, currTokenandLine[1]];
            }

            var order = typeDetails.order;
            var orderLen = order.length;
            var j = [];

            if (orderLen >= 1) {
                j = evaluate(order[0], construct, tokens, i + 1);

                if (j[0] == -1) return [false, j[1]];
                i = j[0] - 1;
            }

            if (orderLen == 2) {
                var k = evaluate(order[1], construct, tokens, j[0]);
                if (k[0] == -1) return [false, k[1]];
                i = k[0] - 1;
            }

            prevToken = currToken;
            if (Object.hasOwn(typeDetails, "next")) {
                expectNext = typeDetails["next"];
            } else expectNext = [];

            if (i == n - 1 && expectNext.length != 0) return [false, currTokenandLine[1]];


        } else {
            return [false, currTokenandLine[1]];
        }
    }

    return [true, -1];
}

//upload conditional construct
//request body contains json data
router.post('/upload', (req, res, next) => {
    var upData = JSON.parse(req.body);
    var responseJson = processUploadedFile(upData);
    console.log(responseJson)
    res.status(200).json(responseJson);
})

router.post('/save',async (req, res, next) => {
    try {
        var upData = JSON.parse(req.body);
        if(upData["p_name"] == null || upData["base64Array"] == null){
            throw "Threw error"
        }
        console.log(upData)
        var integ = await integrate.findOne({ Projid: upData["p_name"] })
        if (integ) {
            integrate.updateOne(
                { Projid: upData["p_name"] },
                { base_encoded_string: upData["base64Array"] },
                function (err, result) {
                    if (err) {
                        res.status(500).json({

                            "message": "Internal Server Error"
                
                        })
                    } 
                }
            );
        } else {
            const val = new integrate({ "Projid": upData["p_name"], "base_encoded_string": upData["base64Array"] })

            integrate.insertMany(val, (err, result) => {

                if (err) {
                    res.status(500).json({

                        "message": "Internal Server Error"
            
                    })
                } 
            });
        }
        res.status(200).json({

            "message": "Saved to Db"
    
        });
    } catch (err) {
        res.status(500).json({

            "message": "Internal Server Error"

        })
    }
    
})


//validate file
router.post('/process', (req, res, next) => {
    console.log(req.body);
    /* parsing and lexeme logic processing */

    var tokens = tokenizeCode(req.body);
    console.log(tokens);

    var [valid, lineNumber] = validateTokens(tokens);

    res.status(200).json({
        "valid": valid,
        "lineNumber": lineNumber
    })
})

module.exports = router
