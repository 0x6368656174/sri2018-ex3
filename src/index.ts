import * as fs from 'fs';
import * as path from 'path';
import * as yargs from 'yargs';
import { Algorithm, calculate } from './power-optimizer';

const argv = yargs
  .usage('Usage: $0 -i <inputFile> -o <outputFile>')
  .option('input', {
    alias: 'i',
    demandOption: true,
    describe: 'Input JSON file',
    type: 'string',
  })
  .option('output', {
    alias: 'o',
    demandOption: true,
    describe: 'Output JSON file',
    type: 'string',
  })
  .option('algorithm', {
    choices: ['auto', 'both', 'fast', 'bnb'],
    default: 'auto',
    describe: 'Used algorithm',
    type: 'string',
  })
  .option('print-statistic', {
    alias: 's',
    default: true,
    describe: 'Print calculate statistic',
    type: 'boolean',
  })
  .version('1.0.0')
  .locale('en')
  .epilog('(c) 2018 Pavel Puchkov <0x6368656174@gmail.com> https://github.com/0x6368656174/sri2018-ex3')
  .help('help')
  .argv;

const inputFilePath = path.resolve(process.cwd(), argv.input);
if (!fs.existsSync(inputFilePath)) {
  throw new Error(`Not found ${inputFilePath}`);
}
try {
  fs.accessSync(inputFilePath, fs.constants.R_OK);
} catch (err) {
  throw new Error(`No access for ${inputFilePath}`);
}

const outputFilePath = path.resolve(process.cwd(), argv.output);
try {
  fs.accessSync(outputFilePath, fs.constants.W_OK);
} catch (err) {
  throw new Error(`No access for ${outputFilePath}`);
}

const file = fs.readFileSync(inputFilePath, 'utf-8');
const input = JSON.parse(file);

let algorithm = Algorithm.Auto;
switch (argv.algorithm) {
  case 'auto': algorithm = Algorithm.Auto; break;
  case 'both': algorithm = Algorithm.Both; break;
  case 'fast': algorithm = Algorithm.Fast; break;
  case 'bnb': algorithm = Algorithm.BnB; break;
}

const result = calculate(input, algorithm, argv['print-statistic']);

fs.writeFileSync(outputFilePath, JSON.stringify(result, null, 2 ));
