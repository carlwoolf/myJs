// Simple Arithmetics Grammar
// ==========================
//
///// % nvm install node;   npm install peggy
///// % npx peggy --format es grammar.pegjs ## 'es' for ecmascript of which v8 (on browsers) is an implementor
///// import {parse, SyntaxError} from "grammar.js";
//
//ç
// Accepts expressions like "2 * (3 + 4)" and computes their value.

{{
    const g = { numParses: 0 };
}}
{
    console.log("Parse-run number: " + ++g.numParses);
}

Expression
  = head:Term tail:(_ ("+" / "-") _ Term)* {
      return tail.reduce(function(result, element) {
        if (element[1] === "+") { return result + element[3]; }
        if (element[1] === "-") { return result - element[3]; }
      }, head);
    }

Term
  = head:Factor tail:(_ ("*" / "/") _ Factor)* {
      return tail.reduce(function(result, element) {
        if (element[1] === "*") { return result * element[3]; }
        if (element[1] === "/") { return result / element[3]; }
      }, head);
    }

Factor
  = "(" _ expr:Expression _ ")" { return expr; }
  / Integer

Integer "integer"
  = _ [0-9]+ { return parseInt(text(), 10); }

_ "whitespace"
  = [ \t\n\r]*