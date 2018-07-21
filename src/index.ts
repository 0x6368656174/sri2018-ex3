import { calculate } from './branch-and-bound';

export interface IDevice {
  id: string;
  name: string;
  power: number;
  duration: number;
  mode?: 'day' | 'night';
}

export interface IRate {
  from: number;
  to: number;
  value: number;
}

export interface IInput {
  devices: IDevice[];
  rates: IRate[];
  maxPower: number;
}

export interface IOutput {
  schedule: string[];
  consumedEnergy: {
    value: number;
    devices: {
      [id: string]: number;
    };
  };
}

export function normalizeInputRates(rates: IRate[]): IRate[] {
  // Переведем киловатт-часы rates в ватт-часы
  return rates.map(rate => {
    rate.value = rate.value / 1000;
    return rate;
  });
}

const input: IInput = require(`${process.cwd()}/input.json`);
input.rates = normalizeInputRates(input.rates);

const result = calculate(input, true);

if (result.statistic) {
  let statisticMessage = '';
  statisticMessage += 'Statistic:\n';
  statisticMessage += `\tThe lead time:\t\t\t\t ${result.statistic.leadTime.toFixed(3)} ms\n`;
  statisticMessage += `\tNumber of equally optimal solutions:\t ${result.statistic.equallyDecisionCount}\n`;
  statisticMessage += `\tVertexes in the last row of the tree:\t ${result.statistic.verticesInLastRow}\n`;

  process.stdout.write(statisticMessage);
}

console.log(result.result);
