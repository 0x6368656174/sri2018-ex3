import { performance } from 'perf_hooks';
import { IDevice, IInput, IRate } from './index';
import { sortDevices } from './sort-devices';
import { deviceAvailableStartHours, deviceWorkHours, findRateForHour } from './time';

export interface IVertex {
  parent: IVertex | null; // Родитель
  device: IDevice; // Устройство
  startHour: number; // Час начала работы
  coast: number; // Цена работы устройства
  totalCoast: number; // Текущая общая цена
  powerByHours: number[]; // Мощность по часам
  maxPower: number; // Максимальная мощность
}

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

export function calculateDeviceRunCoast(device: IDevice, startHour: number, normalizedRates: IRate[]): number {
  return deviceWorkHours(device, startHour).reduce((previous, hour) => {
    // Чтоб не искать повторно rate, проверим, не удовлетворяет ли стрый нашим условиям
    const rate = findRateForHour(normalizedRates, hour);

    return previous + device.power * rate.value;
  }, 0);
}

/**
 * Создает вершину для устройства device, запущенного в startHour, в сетке нормализованных тарифов normalizedRates,
 * с необязательным родителем parent.
 *
 * Рассчитает стоимость работы устройства device, запущенного в startHour, в сетки нормализованных тарифов
 * normalizedRates, сложит эту стоимость со стоимость работы устройств, которые идут до parent вершины, включительно
 * parent вершину и сохранит ее в свойство coast результирующей вершины.
 *
 * Возьмет график загруженности сети по часам из parent вершины, добавит к нему нагрузку, которую создаст устройство
 * device, запущенное в startHour, и сохранит полученный график загруженности сети в свойстве powerByHours
 * результирующей вершины.
 *
 * Так же сохранит в maxPower результирующей вершины максимальную мощность из графика мощности по часам.
 *
 * @param parent Родительская вершина
 * @param device Устройство
 * @param startHour Время начала работы
 * @param normalizedRates Нормализованные тарифы
 *
 * @returns Дочерняя вершина
 */
export function createDeviceVertex(
  parent: IVertex | null,
  device: IDevice,
  startHour: number,
  normalizedRates: IRate[],
): IVertex {
  const parentTotalCoast = parent ? parent.totalCoast : 0;
  const powerByHours = parent ? [...parent.powerByHours] : new Array(24).fill(0);
  const runHours = deviceWorkHours(device, startHour);
  let maxPower = 0;
  for (const hour of runHours) {
    const power = powerByHours[hour] + device.power;
    maxPower = Math.max(maxPower, power);
    powerByHours[hour] = power;
  }

  const coast = calculateDeviceRunCoast(device, startHour, normalizedRates);

  return {
    coast,
    device,
    maxPower,
    parent,
    powerByHours,
    startHour,
    totalCoast: parentTotalCoast + coast,
  };
}

/**
 * Для каждого из доступных времен старта устройства device создаст вершину графа с учетом нормализованной тарифной
 * сетки normalizedRates и общей стоимости работы и графиком загруженности сети из вершины parent.
 *
 * Вернет массив созданных вершин.
 *
 * @param parent Родительская вершина
 * @param device Устройство
 * @param normalizedRates нормализованные тарифы
 *
 * @returns Массив дочерних вершин
 */
export function createDeviceVertices(parent: IVertex | null, device: IDevice, normalizedRates: IRate[]): IVertex[] {
  return deviceAvailableStartHours(device).map(hour => createDeviceVertex(parent, device, hour, normalizedRates));
}

/**
 * Фильтрует вершины по максимально допустимой мощности
 *
 * Проверяет все вершины и удаляет те, в которых в любом из часов работы мощность, потребляемая за этот час больше
 * максимально допустимой.
 *
 * @param vertices Вершины
 * @param maxPower Максимальная мощность
 *
 * @returns Отфильтрованные вершины
 */
export function filterDeviceVertices(vertices: IVertex[], maxPower: number): IVertex[] {
  return vertices.filter(vertex => vertex.maxPower <= maxPower);
}

export class NoDecisionError extends Error {
  constructor() {
    super('Sorry, but you can not find a solution=(');
  }
}

export function calculate(normalizedInput: IInput, statistic = false, precision = 4) {
  const start = performance.now();
  // Отсортируем устройства
  const sortedDevices = sortDevices(normalizedInput.devices);

  // Хранить все дерево не будем, для работы нам нужна лишь последняя строка дерева
  let lastTreeRow: Array<IVertex | null> = [null];

  for (const device of sortedDevices) {
    const nextTreeRow: IVertex[] = [];

    // Для каждого элемента последней строки
    for (const parent of lastTreeRow) {
      // Создадим ветви
      const unfilteredChildVertices = createDeviceVertices(parent, device, normalizedInput.rates);
      // Отфильтруем ветви
      const filteredChildVertices = filterDeviceVertices(unfilteredChildVertices, normalizedInput.maxPower);
      // Сохраним в следующую строку
      nextTreeRow.push(...filteredChildVertices);
    }

    // Проверим, что у нас есть хоть одна удовлетворяющая вершина в следующей строке
    if (nextTreeRow.length === 0) {
      // Если нет, значит беда=(
      // Решения нет
      throw new NoDecisionError();
    }

    // Сохраним последнюю строку
    lastTreeRow = nextTreeRow;
  }

  // Пойдем по последней строке и найдем самое "дешевое" решение
  let decisionVertex: IVertex | null = null;
  // И для статистики сохраним, сколько одинаково "дешевых решений"
  let equallyDecisionCount = 0;
  for (const vertex of lastTreeRow) {
    if (!decisionVertex || (vertex as IVertex).totalCoast < decisionVertex.totalCoast) {
      decisionVertex = vertex;
      equallyDecisionCount = 1;
    } else if (statistic && decisionVertex && (vertex as IVertex).totalCoast === decisionVertex.totalCoast) {
      equallyDecisionCount++;
    }
  }

  // Сделаем проверку, но в теории мы никогда в нее не попадем
  if (!decisionVertex) {
    throw new Error('Something the programmer got it wrong. The best vertex can not be found.');
  }

  let statisticObject: any;
  if (statistic) {
    const end = performance.now();
    statisticObject = {
      equallyDecisionCount,
      leadTime: end - start,
      verticesInLastRow: lastTreeRow.length,
    };
  }

  const value: any = decisionVertex.totalCoast.toFixed(precision);
  const devices: any = {};
  const schedule: any = {};
  for (let i = 0; i < 24; ++i) {
    schedule[i] = [];
  }

  let currentVertex: IVertex | null = decisionVertex;
  while (currentVertex) {
    const hours = deviceWorkHours(currentVertex.device, currentVertex.startHour);
    for (const hour of hours) {
      schedule[hour].push(currentVertex.device.id).toFixed(precision);
    }
    devices[currentVertex.device.id] = currentVertex.coast.toFixed(precision);

    currentVertex = currentVertex.parent;
  }

  return {
    result: {
      consumedEnergy: {
        devices,
        value,
      },
      schedule,
    },
    statistic: statisticObject,
  };
}
