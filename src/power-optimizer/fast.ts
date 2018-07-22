import { performance } from 'perf_hooks';
import { calculateDeviceRunCoast } from './coast';
import { IDevice, IOutput, IOutputDeviceValues, IOutputSchedule } from './index';
import { INormalizedInput } from './normalizer';
import { deviceAvailableStartHours, deviceWorkHours } from './time';

/**
 * Статистика
 */
export interface IStatistic {
  /** Время выполнения в, мс */
  leadTime: number;
}

/**
 * Результат расчета
 */
export interface ICalculateResult {
  /** Выходные данные */
  output: IOutput;
  statistic?: IStatistic;
}

interface IDeviceResult {
  device: IDevice;
  startHour: number;
  coast: number;
}

/**
 * Не найдено не одного решения
 */
export class NoDecisionError extends Error {
  constructor() {
    super('Sorry, but you can not find a solution=(');
  }
}

/**
 * Рассчитывает оптимальный график работы устройств по "быстрому" алгоритму
 *
 * В обычной жизни электрику в домах проектируют так, чтоб, даже если включить все приборы дома одновременно, то
 * общая мощность всех приборов не должна превышать максимально допустимой мощности. Исходя из этого предположения,
 * алгоритм находит оптимальный график решений по специальному "быстрому" способу.
 *
 * Если не удалось найти не одного варианта, при котором устройства, в принципе смогут работать вместе при заданной
 * максимальной мощности по данному алгоритму, выкинет ошибку NoDecisionError(). Данная ошибка не значит, что решений
 * нет совсем. Решение может быть, но его следует искать по другому алгоритму, например, алгоритму "ветвей и границ".
 *
 * @param normalizedInput Нормализованные входные данные
 * @param statistic Признак того, что нужно вести статистику
 * @param precision Точность, для округления дробных чисел
 *
 * @returns Оптимальный график работы устройств и статистику работы
 */
export function calculate(input: INormalizedInput, statistic = false, precision = 8): ICalculateResult {
  // Запустим таймер расчета времени работы
  const start = statistic ? performance.now() : undefined;

  // Проверим, что мы можем в принципе рассчитать работу по данному алгоритму
  const allPower = input.devices.reduce((power, device) => power + device.power, 0);
  if (allPower > input.maxPower) {
    throw new NoDecisionError();
  }

  // В данном массиве будем хранить результат поиска лучшего времени запуска для продолжительности
  const dayDurationResult: { [duration: number]: number } = {};
  const nightDurationResult: { [duration: number]: number } = {};
  const durationResult: { [duration: number]: number } = {};

  const deviceResult: IDeviceResult[] = [];

  for (const device of input.devices) {
    // Если уже находили оптимальное время старта для продолжительности работы
    let startHour: number;

    switch (device.mode) {
      case 'day':
        startHour = dayDurationResult[device.duration];
        break;
      case 'night':
        startHour = nightDurationResult[device.duration];
        break;
      default:
        startHour = durationResult[device.duration];
        break;
    }

    // Если времени нет, то найдем его
    if (!startHour) {
      // Пройдем по всем доступным временам запуска для устройства
      // И найдем то время, в котором цена будет минимальной
      let minCoast: number | undefined;
      for (const hour of deviceAvailableStartHours(device)) {
        const coast = calculateDeviceRunCoast(device, hour, input.normalizedRates);
        if (!minCoast || coast < minCoast) {
          startHour = hour;
          minCoast = coast;
        }
      }

      // Сохраним найдено время запуска для дальнейшего использования
      switch (device.mode) {
        case 'day':
          dayDurationResult[device.duration] = startHour;
          break;
        case 'night':
          nightDurationResult[device.duration] = startHour;
          break;
        default:
          durationResult[device.duration] = startHour;
          break;
      }
    }

    deviceResult.push({
      coast: calculateDeviceRunCoast(device, startHour, input.normalizedRates),
      device,
      startHour,
    });
  }

  // Сохраним результат
  let value = 0;
  const devices: IOutputDeviceValues = {};
  const schedule: IOutputSchedule = {};
  // Заполним расписание пустыми массивами
  for (let i = 0; i < 24; ++i) {
    schedule[i] = [];
  }

  // Пройдемся по результатам поиска всех устройств
  for (const oneDeviceResult of deviceResult) {
    const hours = deviceWorkHours(oneDeviceResult.device, oneDeviceResult.startHour);
    // Добавим устройство в расписание
    for (const hour of hours) {
      schedule[hour].push(oneDeviceResult.device.id);
    }
    // Сохраним стоимость работы устройства
    devices[oneDeviceResult.device.id] = parseFloat(oneDeviceResult.coast.toFixed(precision));
    // Добавим стоимость работы в общую стоимость
    value += oneDeviceResult.coast;
  }

  // Округлим общую стоимость
  value = parseFloat(value.toFixed(precision));

  // Отсортируем график, чтоб получать всегда ожидаемый результат
  for (let i = 0; i < 24; ++i) {
    schedule[i] = schedule[i].sort();
  }

  let statisticObject: any;
  // Сохраним статистику
  if (statistic) {
    // Рассчитаем время окончания работы алгоритма
    const end = performance.now();
    statisticObject = {
      leadTime: end - (start as number),
    };
  }

  return {
    output: {
      consumedEnergy: {
        devices,
        value,
      },
      schedule,
    },
    statistic: statisticObject,
  };
}
