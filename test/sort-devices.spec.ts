import { expect } from 'chai';
import 'mocha';
import { IDevice } from '../src/index';
import { sortDevices } from '../src/sort-devices';

describe('sort-device', () => {
  describe('sortDevices()', () => {
    it('should return sorted array', () => {
      const devices: IDevice[] = [
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
          duration: 1,
          id: '1D9DC84AD110500D284B33C82FE6E85E',
          name: 'Кондиционер Спальня',
          power: 850,
        },
        {
          duration: 4,
          id: '789DC84AD110500D284B33C82FE6E85E',
          name: 'Теплый пол',
          power: 1850,
        },
      ];

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
          id: '1D9DC84AD110500D284B33C82FE6E85E',
          name: 'Кондиционер Спальня',
          power: 850,
        },
        {
          duration: 1,
          id: '7D9DC84AD110500D284B33C82FE6E85E',
          name: 'Кондиционер',
          power: 850,
        },
      ];

      expect(sortDevices(devices)).to.be.eql(expectedResult);
    });

    it('should throw error', () => {
      const devices: IDevice[] = [
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
          id: '1D9DC84AD110500D284B33C82FE6E85E',
          name: 'Кондиционер',
          power: 850,
        },
        {
          duration: 1,
          id: '1D9DC84AD110500D284B33C82FE6E85E',
          name: 'Кондиционер Спальня',
          power: 850,
        },
        {
          duration: 4,
          id: '789DC84AD110500D284B33C82FE6E85E',
          name: 'Теплый пол',
          power: 1850,
        },
      ];

      expect(() => sortDevices(devices)).to.throw('Two device contain equals ID = 1D9DC84AD110500D284B33C82FE6E85E');
    });
  });
});
