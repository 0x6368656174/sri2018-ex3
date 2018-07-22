import { IDevice } from './index';
import { INormalizedRate } from './normalizer';
import { deviceWorkHours, findRateForHour } from './time';

/**
 * Рассчитывает стоимость работы устройства device, запущенного в час startHour, используя тарифы
 * normalizedRates.
 *
 * @param device Устройство
 * @param startHour Время начала работы
 * @param normalizedRates Нормализованные тарифы
 *
 * @returns Стоимость работы
 *
 * @throws Если не найдет тариф
 */

export function calculateDeviceRunCoast(
  device: IDevice,
  startHour: number,
  normalizedRates: INormalizedRate[],
): number {
  return deviceWorkHours(device, startHour).reduce((previous, hour) => {
    // Чтоб не искать повторно rate, проверим, не удовлетворяет ли стрый нашим условиям
    const rate = findRateForHour(normalizedRates, hour);

    return previous + device.power * rate.value;
  }, 0);
}
