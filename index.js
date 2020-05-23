const handleGroup = require("./components/groups.js");
const { anchors } = require("./components/anchors.js");
const handleLooks = require("./components/looks.js");
const InvalidRegularExpression = require("./components/InvalidRegularExpression.js");
const { initialize, getFlags } = require("./components/setup.js");
const { parseBackslash } = require("./components/backSlash.js");
const readline = require("readline");

function parseRegex(regex) {
  let { regexString, flags } = initialize(regex);
  let ending = anchors(regexString);
  if (ending instanceof InvalidRegularExpression) {
    return `${ending.name}: ${ending.message}`;
  }
  let returnString = {
    start: "Match",
    middle: "",
    end: ending || "",
  };
  let i = 0;
  let middle = [];

  while (i < regexString.length) {
    let currentPhrase = [];
    let lastPhrase = middle.length > 0 && middle[middle.length - 1].slice();
    switch (regexString[i]) {
      case "[":
        let [group, index] = handleGroup(regexString, i + 1);
        if (group.startsWith("Invalid")) {
          return group;
        }
        // We only want to start searching after i
        i = index;
        currentPhrase.push(group);
        break;
      case "(":
        if (regexString[i + 1] === "?") {
          const prevPhrase = middle ? middle : regexString.slice(0, i);
          // If we are dealing with lookbehinds or lookaheads
          // we will be replacing the contents of the middle array in the handleLooks function

          let look = handleLooks(regexString, i + 2, prevPhrase);
          if (look instanceof InvalidRegularExpression) {
            return `${look.name}: ${look.message}`;
          }
          // We want to search for the index of the closing character after i
          currentPhrase.push(look);
        }
        break;
      case "\\":
        const charAfterEscape = parseBackslash(regexString[++i]);
        if (charAfterEscape !== undefined) {
          currentPhrase.push(charAfterEscape);
        }
        break;
      case "*":
        middle[middle.length - 1] = lastPhrase += " zero or more times'";
        break;
      case "+":
        middle[middle.length - 1] = lastPhrase += " one or more times'";
        break;
      case "?":
        middle[middle.length - 1] = lastPhrase += " zero or one time'";
        break;
      default:
        currentPhrase.push(`'${regexString[i]}' `);
        break;
    }
    if (currentPhrase.length > 0) {
      middle.push(currentPhrase.join(""));
    }
    i++;
  }
  returnString.middle = middle
    ? middle.length > 1
      ? middle.join(" followed by ")
      : middle
    : "";
  return `${returnString.start} ${returnString.middle} ${returnString.end}`;
}

if (require.main == module) {
  if (process.argv.length >= 3) {
    // Take input from argument
    console.log(parseRegex(process.argv[2]));
  } else {
    // Interactive prompt
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
    });

    function promptRegex() {
      rl.question("> ", (regex) => {
        console.log(parseRegex(regex));
        promptRegex();
      });
    }
    promptRegex();
  }
}

module.exports = parseRegex;
