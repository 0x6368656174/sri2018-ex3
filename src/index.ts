import { Algorithm, calculate, IInput } from './power-optimizer';

const input: IInput = require(`${process.cwd()}/test/input.json`);
calculate(input, Algorithm.Both, true);
