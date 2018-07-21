import { expect } from 'chai';
import 'mocha';
import { IRate, normalizeInputRates } from './index';

describe('index', () => {
  describe('normalizeInputRates()', () => {
    it('should return normalized input object', () => {
      const inputRates: IRate[] = [
        {
          from: 7,
          to: 10,
          value: 6.46,
        },
        {
          from: 10,
          to: 17,
          value: 5.38,
        },
      ];
      const normalizedRates: IRate[] = [
        {
          from: 7,
          to: 10,
          value: 0.00646,
        },
        {
          from: 10,
          to: 17,
          value: 0.00538,
        },
      ];

      expect(normalizeInputRates(inputRates)).to.be.eql(normalizedRates);
    });
  });
});
