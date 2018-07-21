import { IDevice, IRate } from './index';

const DAY_START = 7;
const DAY_END = 21;

// Часы, в которые может работать устройство, работающее только днем
const DAY_DEVICE_AVAILABLE_HOURS: number[] = [];
// Часы, в которые может работать устройство, работающее только ночью
const NIGHT_DEVICE_AVAILABLE_HOURS: number[] = [];
// Часы, в которые может работать устройство, работающее круглые сутки
const ALL_DAY_DEVICE_AVAILABLE_HOURS: number[] = [];

// Заполним массивы временных промежутков
for (let i = 0; i <= 23; ++i) {
  if (i >= DAY_START && i < DAY_END) {
    DAY_DEVICE_AVAILABLE_HOURS.push(i);
  }
  ALL_DAY_DEVICE_AVAILABLE_HOURS.push(i);
}
for (let i = DAY_END; i <= 23; ++i) {
  NIGHT_DEVICE_AVAILABLE_HOURS.push(i);
}
for (let i = 0; i < DAY_START; ++i) {
  NIGHT_DEVICE_AVAILABLE_HOURS.push(i);
}

/**
 * Проверяет, что час hour принадлежит дню
 *
 * @param hour Час
 *
 * @returns Признак того, что это день
 */
export function isDay(hour: number): boolean {
  // Исходим из того, что день не переваливает за полночь
  return hour >= DAY_START && hour < DAY_END;
}

/**
 * Проверят, что час hour принадлежит ночи
 *
 * @param hour Час
 *
 * @returns Признак того, что это ночь
 */
export function isNight(hour: number): boolean {
  return !isDay(hour);
}

/**
 * Возвращает массив часов, в которые устройство может быть запущено
 *
 * @param device Устройство
 *
 * @returns Массив часов
 */
export function deviceAvailableStartHours(device: IDevice): number[] {
  // Если устройство работает круглые сутки, то запускать можно его только в 0,
  // т.к. не важно во сколько его запустить, оно все-равно работает круглые сутки
  if (device.duration === 24) {
    return [0];
  }

  switch (device.mode) {
    case 'day':
      return DAY_DEVICE_AVAILABLE_HOURS.slice(0, DAY_DEVICE_AVAILABLE_HOURS.length - device.duration + 1);
    case 'night':
      return NIGHT_DEVICE_AVAILABLE_HOURS.slice(0, NIGHT_DEVICE_AVAILABLE_HOURS.length - device.duration + 1);
  }

  return ALL_DAY_DEVICE_AVAILABLE_HOURS;
}

/**
 * Проверяет, может ли устройство device быть запущено в startHour
 *
 * @param device Устройство
 * @param startHour Время запуска
 *
 * @returns Признак того, что устройство может быть запущено
 */
export function canDeviceStartAt(device: IDevice, startHour: number): boolean {
  if (!device.mode) {
    return true;
  }

  // Т.к. может быть случай, что при переваливании через сутки, время начала работы и конца работы
  // могут оказаться в допустимом диапазоне, то проверим все часы работы.
  // TODO: придумать как избавиться от цикла
  const runHours = deviceWorkHours(device, startHour);

  for (const hour of runHours) {
    if (device.mode === 'day' && !isDay(hour)) {
      return false;
    }
    if (device.mode === 'night' && !isNight(hour)) {
      return false;
    }
  }

  return true;
}

/**
 * Возвращает часы, в которых будет работать устройство device, запущенное в startHour
 *
 * @param device Устройство
 * @param startHour Время запуска
 *
 * @returns Массив часов
 */
export function deviceWorkHours(device: IDevice, startHour: number): number[] {
  const lastHour = startHour + device.duration - 1;

  const result = [];
  let hour = startHour;
  for (; hour <= lastHour; ++hour) {
    if (hour < 24) {
      result.push(hour);
    } else {
      result.push(hour - 24);
    }
  }

  return result;
}

/**
 * Находит тариф для заданного часа
 *
 * @param rates Тарифы
 * @param hour Час
 *
 * @returns Найденный тариф
 *
 * @throws Если не найдет тариф
 */
export function findRateForHour(rates: IRate[], hour: number): IRate {
  const result = rates.find(rate => {
    // Тариф не переваливает через сутки
    if (rate.from < rate.to) {
      return rate.from <= hour && hour < rate.to;
    } else {
      return rate.from <= hour || hour < rate.to;
    }
  });

  if (!result) {
    throw new Error(`Not found rate for hour = ${hour}`);
  }

  return result;
}
