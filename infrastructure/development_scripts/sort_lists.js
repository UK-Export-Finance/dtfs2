// This script simply sorts the app config export lists so they can be compared more easily.

const fs = require('fs');
const path = require('path');

const files = fs
  .readdirSync(__dirname)
  .filter((fn) => fs.lstatSync(fn).isFile())
  .filter((fn) => fn.endsWith('.json'));
console.log(fs.readdirSync(__dirname));
files.forEach((file) => {
    console.log(`processing ${file}`);
    const new_fn = file.replace('.json', '_sorted.json');

    const data = fs.readFileSync(file)
    const list = JSON.parse(data)

    list.sort((a, b) => (a.name > b.name) ? 1 : -1)
    fs.writeFileSync(new_fn, JSON.stringify(list, null, 2))
})

