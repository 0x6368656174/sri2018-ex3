import { expect } from 'chai';
import 'mocha';
import { calculateDeviceRunCoast } from './coast';
import { IDevice } from './index';

describe('coast', () => {
  describe('calculateDeviceRunCoast()', () => {
    it('should return result', () => {
      const rates = [
        {
          from: 9,
          to: 12,
          value: 0.001,
        },
        {
          from: 12,
          to: 0,
          value: 0.002,
        },
        {
          from: 0,
          to: 8,
          value: 0.001,
        },
      ];

      const testDevice: IDevice = {
        duration: 1,
        id: '',
        name: '',
        power: 100,
      };

      expect(calculateDeviceRunCoast(testDevice, 10, rates)).is.equal(0.1);

      testDevice.duration = 2;
      expect(calculateDeviceRunCoast(testDevice, 10, rates)).is.equal(0.2);

      testDevice.duration = 3;
      expect(calculateDeviceRunCoast(testDevice, 10, rates)).is.equal(0.4);

      testDevice.power = 150;
      expect(calculateDeviceRunCoast(testDevice, 10, rates)).is.equal(0.6);

      expect(calculateDeviceRunCoast(testDevice, 22, rates)).is.equal(0.75);
    });

    it('should throw error, if not found rate', () => {
      const rates = [
        {
          from: 9,
          to: 12,
          value: 0.001,
        },
      ];

      const testDevice: IDevice = {
        duration: 1,
        id: '',
        name: '',
        power: 100,
      };
      expect(() => calculateDeviceRunCoast(testDevice, 8, rates)).to.throw('Not found rate for hour = 8');
    });
  });
});
