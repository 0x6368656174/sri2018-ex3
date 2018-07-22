/**
 * Устройство
 */
export interface IDevice {
  /** Уникальный идентификатор */
  id: string;
  /** Название */
  name: string;
  /** Мощность, Вт */
  power: number;
  /** Длительность работы, час */
  duration: number;
  /** Режим */
  mode?: 'day' | 'night';
}

/**
 * Тариф
 */
export interface IRate {
  /** Время наала, час */
  from: number;
  /** Время конца, час */
  to: number;
  /** Цена, условные единицы за кВт/час */
  value: number;
}

/**
 * Нормализованные тариф
 */
export interface INormalizedRate extends IRate {
  /** Цена, условные единицы за Вт/час */
  value: number;
}

/**
 * Входные данные
 */
export interface IInput {
  /** Устройства */
  devices: IDevice[];
  /** Тарифы */
  rates: IRate[];
  /** Максимальная мощность, Вт */
  maxPower: number;
}

/**
 * Нормализованные входные данные
 */
export interface INormalizedInput extends IInput {
  /** Нормализованные тарифы */
  normalizedRates: INormalizedRate[];
}

/**
 * Общая стоимость работы по устройствам, условные единицы
 */
export interface IOutputDeviceValues {
  /** Ключ - ID устройства, Значение - общая стоимость работы */
  [id: string]: number;
}

/**
 * Расписание работы по часам
 */
export interface IOutputSchedule {
  /** Ключ - час, Значение - список ID устройств, работающих в этот час */
  [hour: string]: string[];
}

/**
 * Выходные данные
 */
export interface IOutput {
  /** Расписание работы */
  schedule: IOutputSchedule;
  /** Затраченные стоимость */
  consumedEnergy: {
    /** Общая стоимость, условные единицы */
    value: number;
    /** Стоимость по каждому устройству, условные единицы */
    devices: IOutputDeviceValues;
  };
}

/**
 * Переводит тарифы из условны единицы за кВт/час в условные единицы за Вт/час
 * 
 * @param rates Тарифы
 * 
 * @returns Нормализованные тарифы
 */
export function normalizeInputRates(rates: IRate[]): IRate[] {
  // Переведем киловатт-часы rates в ватт-часы
  return rates.map(rate => {
    rate.value = rate.value / 1000;
    return rate;
  });
}

/**
 * Возвращает нормализованные входные данные, где все параметры приведены к ваттам
 * 
 * @param input Не нормализованные входные данные
 * 
 * @returns Нормализованные входные данные
 */
export function normalizeInput(input: IInput): INormalizedInput {
  return { ...input, normalizedRates: normalizeInputRates(input.rates) };
}

// const input: IInput = require(`${process.cwd()}/input.json`);
// input.rates = normalizeInputRates(input.rates);

// const result = calculate(input, true);

// if (result.statistic) {
//   let statisticMessage = '';
//   statisticMessage += 'Statistic:\n';
//   statisticMessage += `\tThe lead time:\t\t\t\t ${result.statistic.leadTime.toFixed(3)} ms\n`;
//   statisticMessage += `\tNumber of equally optimal solutions:\t ${result.statistic.equallyDecisionCount}\n`;
//   statisticMessage += `\tVertexes in the last row of the tree:\t ${result.statistic.verticesInLastRow}\n`;

//   process.stdout.write(statisticMessage);
// }

// console.log(result.output);
