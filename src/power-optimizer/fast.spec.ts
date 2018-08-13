import { expect } from 'chai';
import { readFileSync } from 'fs';
import 'mocha';
import { join } from 'path';
import {
  calculate, IStatistic, NoDecisionError,
} from './fast';
import { normalizeInput } from './normalizer';

describe('fast', () => {
  describe('calculate()', () => {
    const input = JSON.parse(readFileSync(join(__dirname, '..', '..', 'test', 'input.json'), 'utf-8'));
    const normalizedInput = normalizeInput(input);

    it('should throw error', () => {
      expect(() => calculate(normalizedInput)).to.throw(NoDecisionError);
    });

    const validInput = JSON.parse(readFileSync(join(__dirname, '..', '..', 'test', 'fast-input.json'), 'utf-8'));
    const validNormalizedInput = normalizeInput(validInput);
    const output = JSON.parse(readFileSync(join(__dirname, '..', '..', 'test', 'output.json'), 'utf-8'));

    it('should return result without statistic', () => {
      const resultWithoutStatistic = calculate(validNormalizedInput);
      expect(resultWithoutStatistic.output).to.be.eql(output);
      expect(resultWithoutStatistic.statistic).to.be.undefined;
    });

    it('should return result with statistic', () => {
      const resultWithStatistic = calculate(validNormalizedInput, true);
      const statistic = resultWithStatistic.statistic as IStatistic;
      expect(statistic.leadTime).to.be.not.undefined;
    });
  });
});
