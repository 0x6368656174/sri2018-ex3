import { expect } from 'chai';
import 'mocha';
import { IInput, IRate } from './index';
import { INormalizedInput, INormalizedRate, normalizeInput, normalizeInputRates } from './normalizer';

describe('normalizer', () => {
  describe('normalizeInputRates()', () => {
    it('should return normalized rates object', () => {
      const rates: IRate[] = [
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
      const normalizedRates: INormalizedRate[] = [
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

      expect(normalizeInputRates(rates)).to.be.eql(normalizedRates);
    });
  });

  describe('normalizeInput()', () => {
    it('should return normalized input object', () => {
      const rates: IRate[] = [
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

      const input: IInput = {
        devices: [],
        maxPower: 100,
        rates,
      };

      const expectedResult: INormalizedInput = {
        devices: [],
        maxPower: 100,
        normalizedRates,
        rates,
      };

      expect(normalizeInput(input)).to.be.eql(expectedResult);
    });
  });
});
