import { IDevice } from './index';

/**
 * Сортирует устройства
 *
 * Общая логика такая: для того, чтобы максимально сразу же ограничить количество ветвей, при переборе
 * устройств, мы будем брать устройства в следующем порядке:
 *
 * 1) Устройства, которые работают 24 часа и имеют всего одну ветвь
 *
 * 2) Устройства, которые работают только днем или ночью и имеют количество ветвей равное количеству часов в дне или
 * ночи
 *
 * 3) Устройства, которые будут за день потреблять больше всего мощности, что позволит максимально быстро заполнить
 * общую мощность дня и сократить количество возможных ветвей для следующих устройств
 *
 * 4) Устройства, отсортированные по ID, просто так, чтоб результат работы этой функции был полностью предсказуем и
 * удобнее ее было тестировать
 *
 * Возвращает отсортированный массив устройств.
 *
 * @param devices Устройства
 */
export function sortDevices(devices: IDevice[]): IDevice[] {
  return devices.sort((left: IDevice, right: IDevice) => {
    // Проверим частный случай, когда один из двух устройств работают 24 часа.
    // Устройства, которые работают 24 часа должны быть вначале
    if (left.duration !== 24 && right.duration === 24) {
      return 1;
    } else if (left.duration === 24 && right.duration !== 24) {
      return -1;
    }

    // Сортируем по признаку mode, чтоб устройства с ограничениями по времени работы были вначале
    if (!left.mode && right.mode) {
      return 1;
    } else if (left.mode && !right.mode) {
      return -1;
    }

    // Сортируем по суммарной мощности, чтоб устройства с большей суммарной мощностью были вначале
    const leftPower = left.power * left.duration;
    const rightPower = right.power * right.duration;
    if (leftPower < rightPower) {
      return 1;
    } else if (leftPower > rightPower) {
      return -1;
    }

    // Сортируем по ID
    if (left.id > right.id) {
      return 1;
    } else if (left.id < right.id) {
      return -1;
    } else {
      throw new Error(`Two device contain equals ID=${left.id}`);
    }
  });
}
