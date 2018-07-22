import { expect } from 'chai';
import { readFileSync } from 'fs';
import 'mocha';
import { join } from 'path';
import {
  calculate,
  calculateDeviceRunCoast,
  createDeviceVertex,
  createDeviceVertices,
  filterDeviceVertices,
  IStatistic,
  IVertex,
  NoDecisionError,
} from '../src/branch-and-bound';
import { IDevice, INormalizedRate, normalizeInput } from '../src/index';

function compareVertex(result: IVertex, expected: IVertex) {
  expect(result.device).to.be.equal(expected.device);
  expect(result.parent).to.be.equal(expected.parent);
  expect(result.startHour).to.be.equal(expected.startHour);
  expect(result.coast).to.be.closeTo(expected.coast, 0.00000001);
  expect(result.totalPowerByHours).to.be.eql(expected.totalPowerByHours);
}

describe('branch-and-bound', () => {
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

  describe('createDeviceVertices()', () => {
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
      {
        from: 17,
        to: 21,
        value: 0.00646,
      },
      {
        from: 21,
        to: 23,
        value: 0.00538,
      },
      {
        from: 23,
        to: 7,
        value: 0.00179,
      },
    ];

    it('should return array of vertices [vertex] for device with duration 24', () => {
      const device: IDevice = {
        duration: 24,
        id: '',
        name: '',
        power: 100,
      };

      const result: IVertex[] = [
        {
          coast: 10.796,
          device,
          parent: null,
          startHour: 0,
          totalCoast: 10.796,
          totalMaxPower: 100,
          totalPowerByHours: new Array(24).fill(100),
        },
      ];

      const funcResult = createDeviceVertices(null, device, normalizedRates);
      expect(funcResult.length).to.be.equal(1);
      compareVertex(funcResult[0], result[0]);
    });

    it('should return array of vertices for device with duration - 8, mode - day', () => {
      const device: IDevice = {
        duration: 8,
        id: '',
        mode: 'day',
        name: '',
        power: 100,
      };

      const result: IVertex[] = [
        {
          coast: 4.628,
          device,
          parent: null,
          startHour: 7,
          totalCoast: 4.628,
          totalMaxPower: 100,
          totalPowerByHours: [0, 0, 0, 0, 0, 0, 0, 100, 100, 100, 100, 100, 100, 100, 100, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        },
        {
          coast: 4.52,
          device,
          parent: null,
          startHour: 8,
          totalCoast: 4.52,
          totalMaxPower: 100,
          totalPowerByHours: [0, 0, 0, 0, 0, 0, 0, 0, 100, 100, 100, 100, 100, 100, 100, 100, 0, 0, 0, 0, 0, 0, 0, 0],
        },
        {
          coast: 4.412,
          device,
          parent: null,
          startHour: 9,
          totalCoast: 4.412,
          totalMaxPower: 100,
          totalPowerByHours: [0, 0, 0, 0, 0, 0, 0, 0, 0, 100, 100, 100, 100, 100, 100, 100, 100, 0, 0, 0, 0, 0, 0, 0],
        },
        {
          coast: 4.412,
          device,
          parent: null,
          startHour: 10,
          totalCoast: 4.412,
          totalMaxPower: 100,
          totalPowerByHours: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 100, 100, 100, 100, 100, 100, 100, 100, 0, 0, 0, 0, 0, 0],
        },
        {
          coast: 4.52,
          device,
          parent: null,
          startHour: 11,
          totalCoast: 4.52,
          totalMaxPower: 100,
          totalPowerByHours: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 100, 100, 100, 100, 100, 100, 100, 100, 0, 0, 0, 0, 0],
        },
        {
          coast: 4.628,
          device,
          parent: null,
          startHour: 12,
          totalCoast: 4.628,
          totalMaxPower: 100,
          totalPowerByHours: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 100, 100, 100, 100, 100, 100, 100, 100, 0, 0, 0, 0],
        },
        {
          coast: 4.736,
          device,
          parent: null,
          startHour: 13,
          totalCoast: 4.736,
          totalMaxPower: 100,
          totalPowerByHours: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 100, 100, 100, 100, 100, 100, 100, 100, 0, 0, 0],
        },
      ];

      const funcResult = createDeviceVertices(null, device, normalizedRates);
      expect(funcResult.length).to.be.equal(result.length);
      for (let i = 0; i < funcResult.length; ++i) {
        compareVertex(funcResult[i], result[i]);
      }
    });

    it('should return array of vertices for device with parent, duration - 8, mode - day', () => {
      const device: IDevice = {
        duration: 8,
        id: '',
        mode: 'day',
        name: '',
        power: 100,
      };

      const parentDevice: IDevice = {
        duration: 24,
        id: '',
        name: '',
        power: 0,
      };

      const parent: IVertex = {
        coast: 10,
        device: parentDevice,
        parent: null,
        startHour: 7,
        totalCoast: 10,
        totalMaxPower: 24000,
        totalPowerByHours: [
          1000,
          2000,
          3000,
          4000,
          5000,
          6000,
          7000,
          8000,
          9000,
          1000,
          11000,
          12000,
          13000,
          14000,
          15000,
          16000,
          17000,
          18000,
          19000,
          20000,
          21000,
          22000,
          23000,
          24000,
        ],
      };

      const result: IVertex[] = [
        {
          coast: 4.628,
          device,
          parent,
          startHour: 7,
          totalCoast: 14.628,
          totalMaxPower: 24000,
          totalPowerByHours: [
            1000,
            2000,
            3000,
            4000,
            5000,
            6000,
            7000,
            8100,
            9100,
            1100,
            11100,
            12100,
            13100,
            14100,
            15100,
            16000,
            17000,
            18000,
            19000,
            20000,
            21000,
            22000,
            23000,
            24000,
          ],
        },
        {
          coast: 4.52,
          device,
          parent,
          startHour: 8,
          totalCoast: 14.52,
          totalMaxPower: 24000,
          totalPowerByHours: [
            1000,
            2000,
            3000,
            4000,
            5000,
            6000,
            7000,
            8000,
            9100,
            1100,
            11100,
            12100,
            13100,
            14100,
            15100,
            16100,
            17000,
            18000,
            19000,
            20000,
            21000,
            22000,
            23000,
            24000,
          ],
        },
        {
          coast: 4.412,
          device,
          parent,
          startHour: 9,
          totalCoast: 14.412,
          totalMaxPower: 24000,
          totalPowerByHours: [
            1000,
            2000,
            3000,
            4000,
            5000,
            6000,
            7000,
            8000,
            9000,
            1100,
            11100,
            12100,
            13100,
            14100,
            15100,
            16100,
            17100,
            18000,
            19000,
            20000,
            21000,
            22000,
            23000,
            24000,
          ],
        },
        {
          coast: 4.412,
          device,
          parent,
          startHour: 10,
          totalCoast: 14.412,
          totalMaxPower: 24000,
          totalPowerByHours: [
            1000,
            2000,
            3000,
            4000,
            5000,
            6000,
            7000,
            8000,
            9000,
            1000,
            11100,
            12100,
            13100,
            14100,
            15100,
            16100,
            17100,
            18100,
            19000,
            20000,
            21000,
            22000,
            23000,
            24000,
          ],
        },
        {
          coast: 4.52,
          device,
          parent,
          startHour: 11,
          totalCoast: 14.52,
          totalMaxPower: 24000,
          totalPowerByHours: [
            1000,
            2000,
            3000,
            4000,
            5000,
            6000,
            7000,
            8000,
            9000,
            1000,
            11000,
            12100,
            13100,
            14100,
            15100,
            16100,
            17100,
            18100,
            19100,
            20000,
            21000,
            22000,
            23000,
            24000,
          ],
        },
        {
          coast: 4.628,
          device,
          parent,
          startHour: 12,
          totalCoast: 14.628,
          totalMaxPower: 24000,
          totalPowerByHours: [
            1000,
            2000,
            3000,
            4000,
            5000,
            6000,
            7000,
            8000,
            9000,
            1000,
            11000,
            12000,
            13100,
            14100,
            15100,
            16100,
            17100,
            18100,
            19100,
            20100,
            21000,
            22000,
            23000,
            24000,
          ],
        },
        {
          coast: 4.736,
          device,
          parent,
          startHour: 13,
          totalCoast: 14.736,
          totalMaxPower: 24000,
          totalPowerByHours: [
            1000,
            2000,
            3000,
            4000,
            5000,
            6000,
            7000,
            8000,
            9000,
            1000,
            11000,
            12000,
            13000,
            14100,
            15100,
            16100,
            17100,
            18100,
            19100,
            20100,
            21100,
            22000,
            23000,
            24000,
          ],
        },
      ];

      const funcResult = createDeviceVertices(parent, device, normalizedRates);
      expect(funcResult.length).to.be.equal(result.length);
      for (let i = 0; i < funcResult.length; ++i) {
        compareVertex(funcResult[i], result[i]);
      }
    });
  });

  describe('class NoDecisionError', () => {
    it('should created', () => {
      const result = new NoDecisionError();
      expect(result).to.be.not.null;
    });
    it('should contain message', () => {
      const result = new NoDecisionError();
      expect(result.message).to.be.equal('Sorry, but you can not find a solution=(');
    });
  });

  describe('createDeviceVertex()', () => {
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
      {
        from: 17,
        to: 21,
        value: 0.00646,
      },
      {
        from: 21,
        to: 23,
        value: 0.00538,
      },
      {
        from: 23,
        to: 7,
        value: 0.00179,
      },
    ];

    const device: IDevice = {
      duration: 2,
      id: '',
      name: '',
      power: 100,
    };

    it('should return vertex', () => {
      const expectedResult: IVertex = {
        coast: 1.076,
        device,
        parent: null,
        startHour: 10,
        totalCoast: 1.076,
        totalMaxPower: 100,
        totalPowerByHours: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 100, 100, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      };

      const result = createDeviceVertex(null, device, 10, normalizedRates);
      compareVertex(result, expectedResult);
    });

    it('should return vertex with parent', () => {
      const parent: IVertex = {
        coast: 10,
        device,
        parent: null,
        startHour: 1,
        totalCoast: 10,
        totalMaxPower: 200,
        totalPowerByHours: [0, 0, 0, 0, 0, 0, 0, 0, 0, 200, 200, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      };

      const expectedResult: IVertex = {
        coast: 1.076,
        device,
        parent,
        startHour: 10,
        totalCoast: 10.076,
        totalMaxPower: 100,
        totalPowerByHours: [0, 0, 0, 0, 0, 0, 0, 0, 0, 200, 300, 100, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      };

      const result = createDeviceVertex(parent, device, 10, normalizedRates);
      compareVertex(result, expectedResult);
    });
  });

  describe('filterDeviceVertices()', () => {
    it('should return filtered vertices', () => {
      const device: IDevice = {
        duration: 2,
        id: '',
        name: '',
        power: 100,
      };

      const vertices: IVertex[] = [
        {
          coast: 1,
          device,
          parent: null,
          startHour: 1,
          totalCoast: 1,
          totalMaxPower: 100,
          totalPowerByHours: [],
        },
        {
          coast: 2,
          device,
          parent: null,
          startHour: 2,
          totalCoast: 2,
          totalMaxPower: 200,
          totalPowerByHours: [],
        },
        {
          coast: 3,
          device,
          parent: null,
          startHour: 3,
          totalCoast: 3,
          totalMaxPower: 500,
          totalPowerByHours: [],
        },
        {
          coast: 4,
          device,
          parent: null,
          startHour: 4,
          totalCoast: 4,
          totalMaxPower: 200,
          totalPowerByHours: [],
        },
      ];

      const expectedResult: IVertex[] = [
        {
          coast: 1,
          device,
          parent: null,
          startHour: 1,
          totalCoast: 1,
          totalMaxPower: 100,
          totalPowerByHours: [],
        },
        {
          coast: 2,
          device,
          parent: null,
          startHour: 2,
          totalCoast: 2,
          totalMaxPower: 200,
          totalPowerByHours: [],
        },
        {
          coast: 4,
          device,
          parent: null,
          startHour: 4,
          totalCoast: 4,
          totalMaxPower: 200,
          totalPowerByHours: [],
        },
      ];

      expect(filterDeviceVertices(vertices, 400)).to.be.eql(expectedResult);
    });
  });

  describe('calculate()', () => {
    const input = JSON.parse(readFileSync(join(__dirname, 'input.json'), 'utf-8'));
    const output = JSON.parse(readFileSync(join(__dirname, 'output.json'), 'utf-8'));
    const normalizedInput = normalizeInput(input);

    it('should return result without statistic', () => {
      const resultWithoutStatistic = calculate(normalizedInput);
      expect(resultWithoutStatistic.output).to.be.eql(output);
      expect(resultWithoutStatistic.statistic).to.be.undefined;
    });

    it('should return result with statistic', () => {
      const resultWithStatistic = calculate(normalizedInput, true);
      const statistic = resultWithStatistic.statistic as IStatistic;
      expect(statistic.equallyDecisionCount).to.be.equal(288);
      expect(statistic.verticesInLastRow).to.be.equal(2288);
      expect(statistic.leadTime).to.be.not.undefined;
    });

    it('should throw error', () => {
      normalizedInput.devices.push({
        duration: 1,
        id: '',
        name: '',
        power: 2050,
      });
      expect(() => calculate(normalizedInput)).to.throw(NoDecisionError);
    });
  });
});
