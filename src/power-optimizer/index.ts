import { normalizeInput } from './normalizer';

/**
 * Алгоритм обработки
 */
export enum Algorithm {
  /** Автоматический */
  Auto,
  /** Быстрый */
  Fast,
  /** Ветвей и границ */
  BnB,
  /** Одновременно и "Быстрый", и "Ветвей и границ" */
  Both,
}

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
 * Возвращает оптимальный график работы электроприборов
 *
 * @param input Входные данные
 * @param algorithm Алгоритм оптимизации
 * @param printStatistic Признак того, что необходимо напечатать статистику
 *
 * @returns Результат оптимизации
 */
export function calculate(input: IInput, algorithm: Algorithm = Algorithm.Auto, printStatistic = false): IOutput {
  const normalizedInput = normalizeInput(input);

  function fastCalculate() {
    // Импортируем тут, а не вверху при помощи import, для увеличения скорости запуска приложения и потребляемой
    // памяти, т.к. возможно нужен будет только этот алгоритм, а 2 алгоритм использоваться не будет
    const algorithmCalculate = require('./fast').calculate;
    const result = algorithmCalculate(normalizedInput, printStatistic);
    if (result.statistic) {
      let statisticMessage = '';
      statisticMessage += 'Statistic:\n';
      statisticMessage += '\tUsed algorithm: Fast\n';
      statisticMessage += `\tThe lead time:\t\t\t\t ${result.statistic.leadTime.toFixed(3)} ms\n`;

      process.stdout.write(statisticMessage);
    }

    return result.output;
  }

  function bnbCalculate() {
    // Импортируем тут, а не вверху при помощи import, для увеличения скорости запуска приложения и потребляемой
    // памяти, т.к. возможно нужен будет только этот алгоритм, а 2 алгоритм использоваться не будет
    const algorithmCalculate = require('./branch-and-bound').calculate;
    const result = algorithmCalculate(normalizedInput, printStatistic);
    if (result.statistic) {
      let statisticMessage = '';
      statisticMessage += 'Statistic:\n';
      statisticMessage += `\tUsed algorithm:\t BnB\n`;
      statisticMessage += `\tThe lead time:\t\t\t\t ${result.statistic.leadTime.toFixed(3)} ms\n`;
      statisticMessage += `\tNumber of equally optimal solutions:\t ${result.statistic.equallyDecisionCount}\n`;
      statisticMessage += `\tVertexes in the last row of the tree:\t ${result.statistic.verticesInLastRow}\n`;

      process.stdout.write(statisticMessage);
    }

    return result.output;
  }

  switch (algorithm) {
    case Algorithm.Auto: {
      try {
        return fastCalculate();
      } catch (error) {
        // Импортируем тут, а не вверху при помощи import, для увеличения скорости запуска приложения и потребляемой
        // памяти, т.к. возможно нужен будет только этот алгоритм, а 2 алгоритм использоваться не будет
        const fast = require('./fast');

        if (error instanceof fast.NoDecisionError) {
          process.stdout.write('No found decision with Fast algorithm. Try use BnB algorithm...\n');
          return bnbCalculate();
        }
        throw error;
      }
    }
    case Algorithm.Fast: {
      return fastCalculate();
    }
    case Algorithm.BnB: {
      return bnbCalculate();
    }
    case Algorithm.Both: {
      process.stdout.write('WARNING: Use algorithm Algorithm.Auto for place Algorithm.Both\n\n');
      try {
        fastCalculate();
      } catch (error) {
        // Импортируем тут, а не вверху при помощи import, для увеличения скорости запуска приложения и потребляемой
        // памяти, т.к. возможно нужен будет только этот алгоритм, а 2 алгоритм использоваться не будет
        const fast = require('./fast');

        if (error instanceof fast.NoDecisionError) {
          process.stdout.write('No found decision with Fast algorithm.\n');
        } else {
          throw error;
        }
      }

      process.stdout.write('\n');

      return bnbCalculate();
    }
  }

  return null as any;
}
