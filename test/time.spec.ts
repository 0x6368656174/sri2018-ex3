import { expect } from 'chai';
import 'mocha';
import { IDevice, IRate } from '../src/index';
import {
  canDeviceStartAt,
  deviceAvailableStartHours,
  deviceWorkHours,
  findRateForHour,
  isDay,
  isNight,
} from '../src/time';

describe('time', () => {
  describe('isDay()', () => {
    it('should return true', () => {
      expect(isDay(10)).to.be.true;
      expect(isDay(20)).to.be.true;
    });
    it('should return false', () => {
      expect(isDay(6)).to.be.false;
      expect(isDay(21)).to.be.false;
    });
  });

  describe('isNight()', () => {
    it('should return true', () => {
      expect(isNight(21)).to.be.true;
      expect(isNight(6)).to.be.true;
    });
    it('should return false', () => {
      expect(isNight(7)).to.be.false;
      expect(isNight(14)).to.be.false;
      expect(isNight(20)).to.be.false;
    });
  });

  describe('deviceAvailableHours()', () => {
    const device: IDevice = {
      duration: 4,
      id: 'test-device-id',
      name: 'Test device',
      power: 100,
    };

    it('should return dayArray', () => {
      const result = [7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17];
      device.mode = 'day';
      expect(deviceAvailableStartHours(device)).to.be.eql(result);
    });
    it('should return nightArray', () => {
      const result = [21, 22, 23, 0, 1, 2, 3];
      device.mode = 'night';
      expect(deviceAvailableStartHours(device)).to.be.eql(result);
    });
    it('should return allDayArray', () => {
      const result = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23];
      device.mode = undefined;
      expect(deviceAvailableStartHours(device)).to.be.eql(result);
    });
    it('should return only [0] for 24-hours device', () => {
      const result = [0];
      device.duration = 24;
      expect(deviceAvailableStartHours(device)).to.be.eql(result);
    });
  });

  describe('deviceWorkHours()', () => {
    it('should return hours in current day', () => {
      const device: IDevice = {
        duration: 4,
        id: '',
        name: '',
        power: 0,
      };

      expect(deviceWorkHours(device, 10)).to.be.eql([10, 11, 12, 13]);
    });

    it('should return hours in current and next day', () => {
      const device: IDevice = {
        duration: 6,
        id: '',
        name: '',
        power: 0,
      };

      expect(deviceWorkHours(device, 22)).to.be.eql([22, 23, 0, 1, 2, 3]);
      expect(deviceWorkHours(device, 19)).to.be.eql([19, 20, 21, 22, 23, 0]);
    });
  });

  describe('canDeviceStartAt()', () => {
    it('should return true for device without mode', () => {
      const device: IDevice = {
        duration: 4,
        id: '',
        name: '',
        power: 0,
      };

      expect(canDeviceStartAt(device, 0)).to.be.true;
      expect(canDeviceStartAt(device, 12)).to.be.true;
      expect(canDeviceStartAt(device, 23)).to.be.true;
    });

    it('should return true for device with day mode', () => {
      const device: IDevice = {
        duration: 4,
        id: '',
        mode: 'day',
        name: '',
        power: 0,
      };

      expect(canDeviceStartAt(device, 7)).to.be.true;
      expect(canDeviceStartAt(device, 12)).to.be.true;
      expect(canDeviceStartAt(device, 16)).to.be.true;
    });

    it('should return false for device with day mode', () => {
      const device: IDevice = {
        duration: 4,
        id: '',
        mode: 'day',
        name: '',
        power: 0,
      };

      expect(canDeviceStartAt(device, 0)).to.be.false;
      expect(canDeviceStartAt(device, 6)).to.be.false;
      expect(canDeviceStartAt(device, 18)).to.be.false;

      device.duration = 23;
      expect(canDeviceStartAt(device, 12)).to.be.false;
    });

    it('should return true for device with night mode', () => {
      const device: IDevice = {
        duration: 4,
        id: '',
        mode: 'night',
        name: '',
        power: 0,
      };

      expect(canDeviceStartAt(device, 21)).to.be.true;
      expect(canDeviceStartAt(device, 0)).to.be.true;
      expect(canDeviceStartAt(device, 3)).to.be.true;
    });

    it('should return false for device with night mode', () => {
      const device: IDevice = {
        duration: 4,
        id: '',
        mode: 'night',
        name: '',
        power: 0,
      };

      expect(canDeviceStartAt(device, 20)).to.be.false;
      expect(canDeviceStartAt(device, 12)).to.be.false;
      expect(canDeviceStartAt(device, 4)).to.be.false;

      device.duration = 23;
      expect(canDeviceStartAt(device, 1)).to.be.false;
    });
  });

  describe('findRateForHour()', () => {
    it('must fund rate', () => {
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
        {
          from: 17,
          to: 21,
          value: 6.46,
        },
        {
          from: 21,
          to: 23,
          value: 5.38,
        },
        {
          from: 23,
          to: 7,
          value: 1.79,
        },
      ];

      expect(findRateForHour(rates, 10)).to.be.eql({
        from: 10,
        to: 17,
        value: 5.38,
      });

      expect(findRateForHour(rates, 23)).to.be.eql({
        from: 23,
        to: 7,
        value: 1.79,
      });

      expect(findRateForHour(rates, 4)).to.be.eql({
        from: 23,
        to: 7,
        value: 1.79,
      });

      expect(findRateForHour(rates, 7)).to.be.eql({
        from: 7,
        to: 10,
        value: 6.46,
      });
    });

    it('should throw error if not find rate', () => {
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
        {
          from: 17,
          to: 21,
          value: 6.46,
        },
        {
          from: 21,
          to: 23,
          value: 5.38,
        },
      ];

      expect(() => findRateForHour(rates, 4)).to.throw('Not found rate for hour = 4');
    });
  });
});
