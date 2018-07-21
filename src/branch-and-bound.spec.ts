import { expect } from 'chai';
import 'mocha';
import { calculateDeviceRunCoast, createDeviceVertices, IVertex } from './branch-and-bound';
import { IDevice, IRate } from './index';

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
    function compareVertex(result: IVertex, expected: IVertex) {
      expect(result.device).to.be.equal(expected.device);
      expect(result.parent).to.be.equal(expected.parent);
      expect(result.startHour).to.be.equal(expected.startHour);
      expect(result.coast).to.be.closeTo(expected.coast, 0.00000001);
      expect(result.powerByHours).to.be.eql(expected.powerByHours);
    }

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
          maxPower: 100,
          parent: null,
          powerByHours: new Array(24).fill(100),
          startHour: 0,
          totalCoast: 10.796,
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
          maxPower: 100,
          parent: null,
          powerByHours: [0, 0, 0, 0, 0, 0, 0, 100, 100, 100, 100, 100, 100, 100, 100, 0, 0, 0, 0, 0, 0, 0, 0, 0],
          startHour: 7,
          totalCoast: 4.628,
        },
        {
          coast: 4.52,
          device,
          maxPower: 100,
          parent: null,
          powerByHours: [0, 0, 0, 0, 0, 0, 0, 0, 100, 100, 100, 100, 100, 100, 100, 100, 0, 0, 0, 0, 0, 0, 0, 0],
          startHour: 8,
          totalCoast: 4.52,
        },
        {
          coast: 4.412,
          device,
          maxPower: 100,
          parent: null,
          powerByHours: [0, 0, 0, 0, 0, 0, 0, 0, 0, 100, 100, 100, 100, 100, 100, 100, 100, 0, 0, 0, 0, 0, 0, 0],
          startHour: 9,
          totalCoast: 4.412,
        },
        {
          coast: 4.412,
          device,
          maxPower: 100,
          parent: null,
          powerByHours: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 100, 100, 100, 100, 100, 100, 100, 100, 0, 0, 0, 0, 0, 0],
          startHour: 10,
          totalCoast: 4.412,
        },
        {
          coast: 4.52,
          device,
          maxPower: 100,
          parent: null,
          powerByHours: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 100, 100, 100, 100, 100, 100, 100, 100, 0, 0, 0, 0, 0],
          startHour: 11,
          totalCoast: 4.52,
        },
        {
          coast: 4.628,
          device,
          maxPower: 100,
          parent: null,
          powerByHours: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 100, 100, 100, 100, 100, 100, 100, 100, 0, 0, 0, 0],
          startHour: 12,
          totalCoast: 4.628,
        },
        {
          coast: 4.736,
          device,
          maxPower: 100,
          parent: null,
          powerByHours: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 100, 100, 100, 100, 100, 100, 100, 100, 0, 0, 0],
          startHour: 13,
          totalCoast: 4.736,
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
        maxPower: 24000,
        parent: null,
        powerByHours: [
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
        startHour: 7,
        totalCoast: 10,
      };

      const result: IVertex[] = [
        {
          coast: 4.628,
          device,
          maxPower: 24000,
          parent,
          powerByHours: [
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
          startHour: 7,
          totalCoast: 14.628,
        },
        {
          coast: 4.52,
          device,
          maxPower: 24000,
          parent,
          powerByHours: [
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
          startHour: 8,
          totalCoast: 14.52,
        },
        {
          coast: 4.412,
          device,
          maxPower: 24000,
          parent,
          powerByHours: [
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
          startHour: 9,
          totalCoast: 14.412,
        },
        {
          coast: 4.412,
          device,
          maxPower: 24000,
          parent,
          powerByHours: [
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
          startHour: 10,
          totalCoast: 14.412,
        },
        {
          coast: 4.52,
          device,
          maxPower: 24000,
          parent,
          powerByHours: [
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
          startHour: 11,
          totalCoast: 14.52,
        },
        {
          coast: 4.628,
          device,
          maxPower: 24000,
          parent,
          powerByHours: [
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
          startHour: 12,
          totalCoast: 14.628,
        },
        {
          coast: 4.736,
          device,
          maxPower: 24000,
          parent,
          powerByHours: [
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
          startHour: 13,
          totalCoast: 14.736,
        },
      ];

      const funcResult = createDeviceVertices(parent, device, normalizedRates);
      expect(funcResult.length).to.be.equal(result.length);
      for (let i = 0; i < funcResult.length; ++i) {
        compareVertex(funcResult[i], result[i]);
      }
    });
  });
});
