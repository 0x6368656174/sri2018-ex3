import { expect } from 'chai';
import 'mocha';
import { IDevice, IInput } from './index';
import { sortDevices } from './sort-devices';

describe('sort-device', () => {
  describe('sortDevices()', () => {
    it('should return sorted array', () => {
      const testInput: IInput = {
        devices: [
          {
            duration: 24,
            id: '02DDD23A85DADDD71198305330CC386D',
            name: 'Холодильник',
            power: 50,
          },
          {
            duration: 3,
            id: 'F972B82BA56A70CC579945773B6866FF',
            mode: 'night',
            name: 'Стиральная машина',
            power: 950,
          },
          {
            duration: 1,
            id: 'F972B82BA56A70CC579945773B6866FB',
            name: 'Сушилка',
            power: 950,
          },
          {
            duration: 3,
            id: 'F972B82BA56A70CC579945773B6866FB',
            mode: 'day',
            name: 'Посудомоечная машина',
            power: 950,
          },
          {
            duration: 2,
            id: 'C515D887EDBBE669B2FDAC62F571E9E9',
            mode: 'day',
            name: 'Духовка',
            power: 2000,
          },
          {
            duration: 24,
            id: '1E6276CC231716FE8EE8BC908486D41E',
            name: 'Термостат',
            power: 50,
          },
          {
            duration: 1,
            id: '7D9DC84AD110500D284B33C82FE6E85E',
            name: 'Кондиционер',
            power: 850,
          },
          {
            duration: 4,
            id: '789DC84AD110500D284B33C82FE6E85E',
            name: 'Теплый пол',
            power: 1850,
          },
        ],
        maxPower: 2100,
        rates: [
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
        ],
      };
      const expectedResult: IDevice[] = [
        {
          duration: 24,
          id: '02DDD23A85DADDD71198305330CC386D',
          name: 'Холодильник',
          power: 50,
        },
        {
          duration: 24,
          id: '1E6276CC231716FE8EE8BC908486D41E',
          name: 'Термостат',
          power: 50,
        },
        {
          duration: 2,
          id: 'C515D887EDBBE669B2FDAC62F571E9E9',
          mode: 'day',
          name: 'Духовка',
          power: 2000,
        },
        {
          duration: 3,
          id: 'F972B82BA56A70CC579945773B6866FB',
          mode: 'day',
          name: 'Посудомоечная машина',
          power: 950,
        },
        {
          duration: 3,
          id: 'F972B82BA56A70CC579945773B6866FF',
          mode: 'night',
          name: 'Стиральная машина',
          power: 950,
        },
        {
          duration: 4,
          id: '789DC84AD110500D284B33C82FE6E85E',
          name: 'Теплый пол',
          power: 1850,
        },
        {
          duration: 1,
          id: 'F972B82BA56A70CC579945773B6866FB',
          name: 'Сушилка',
          power: 950,
        },
        {
          duration: 1,
          id: '7D9DC84AD110500D284B33C82FE6E85E',
          name: 'Кондиционер',
          power: 850,
        },
      ];

      expect(sortDevices(testInput.devices)).to.be.eql(expectedResult);
    });
  });
});
