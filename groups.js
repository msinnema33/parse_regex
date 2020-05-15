const handleQuantifiers = require("./quantifiers.js");

function handleGroup(regex, startingIndex) {
  let group = [];
  let i = startingIndex;
  while (regex[i] !== "]") {
    if (regex[i] === "-") {
      group[group.length - 1] = `"any of ${group[group.length - 1]} through ${
        regex[++i]
      }"`;
    } else {
      group.push(regex[i]);
    }
    i++;
  }
  let [quantifiers, index] = handleQuantifiers(regex, i + 1);
  if (quantifiers.startsWith("Invalid")) {
    return [quantifiers, -1];
  }
  console.log("index", index);
  return [`'${group.join(`' or '`)}'${quantifiers}`, index];
}

module.exports = handleGroup;