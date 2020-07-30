const { program } = require('commander');
const fs = require('fs');

const input_encoding = 'utf8';
const output_encoding = 'utf16le';

program
  .option('-i, --input <type>', 'file to read as utf8')
  .option('-o, --output <type>', 'file to write as utf16le');
program.parse(process.argv);

const fileContent = fs.readFileSync(program.input, input_encoding);

// because we're going -> utf16le, apparently we have to manually place the
//  btye order mark / BOM at the begining of the string...
//  see https://gist.github.com/zoellner/4af04a5a8b51f04ad653e26d3b7181ec
const outputBuffer = Buffer.from(`\ufeff${fileContent}`, output_encoding);

fs.writeFileSync(program.output, outputBuffer, {encoding:output_encoding});
