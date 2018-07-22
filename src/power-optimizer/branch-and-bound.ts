import { performance } from 'perf_hooks';
import { calculateDeviceRunCoast } from './coast';
import { IDevice, IOutput, IOutputDeviceValues, IOutputSchedule } from './index';
import { INormalizedInput, INormalizedRate } from './normalizer';
import { sortDevices } from './sort-devices';
import { deviceAvailableStartHours, deviceWorkHours } from './time';

/**
 * Вершина дерева
 */
export interface IVertex {
  /** Родитель */
  parent: IVertex | null;
  /** Устройство */
  device: IDevice;
  /** Время начала работы, час */
  startHour: number;
  /** Стоимость работы, условные единицы */
  coast: number;
  /** Общая стоимость работы, включая стоимость работы всех родительских вершин, условные единицы */
  totalCoast: number;
  /** Мощность, включая мощности всех родительских вершин, разбитая по часам, Вт */
  totalPowerByHours: number[];
  /** Максимальная потребляемая мощность, включая мощности всех родительских вершин, Вт */
  totalMaxPower: number;
}

/**
 * Статистика
 */
export interface IStatistic {
  /** Количество решений с одинаковой минимальной стоимостью */
  equallyDecisionCount: number;
  /** Время выполнения в, мс */
  leadTime: number;
  /** Количество вершин в последнем ряде дерева решений */
  verticesInLastRow: number;
}

/**
 * Результат расчета
 */
export interface ICalculateResult {
  /** Выходные данные */
  output: IOutput;
  statistic?: IStatistic;
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
  normalizedRates: INormalizedRate[],
): IVertex {
  const parentTotalCoast = parent ? parent.totalCoast : 0;
  const totalPowerByHours = parent ? parent.totalPowerByHours.slice(0) : new Array(24).fill(0);
  const runHours = deviceWorkHours(device, startHour);
  let totalMaxPower = 0;
  for (const hour of runHours) {
    const parentPower = totalPowerByHours[hour];
    const power = parentPower + device.power;
    // console.log(parentPower, device.power, power);
    totalMaxPower = Math.max(totalMaxPower, power);
    totalPowerByHours[hour] = power;
  }

  const coast = calculateDeviceRunCoast(device, startHour, normalizedRates);

  return {
    coast,
    device,
    parent,
    startHour,
    totalCoast: parentTotalCoast + coast,
    totalMaxPower,
    totalPowerByHours,
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
export function createDeviceVertices(
  parent: IVertex | null,
  device: IDevice,
  normalizedRates: INormalizedRate[],
): IVertex[] {
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
  return vertices.filter(vertex => vertex.totalMaxPower <= maxPower);
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
 * Рассчитывает оптимальный график работы устройств по алгоритму "ветвей и границ"
 *
 * Т.к. задача поиска оптимального графика работы устройств NP-сложная, то сложно написать алгоритм, который
 * позволит найти решение за полиномиальное время. Для поиска решения нужно использовать алгоритм полного перебора.
 * Данный метод рассчитывает решение при помощи оптимизированного алгоритма полного перебора, что позволяет перебрать
 * все допустимые комбинации работы устройств за адекватное время.
 *
 * Если не удалось найти не одного варианта, при котором устройства, в принципе смогут работать вместе при заданной
 * максимальной мощности, выкинет ошибку NoDecisionError().
 *
 * @param normalizedInput Нормализованные входные данные
 * @param statistic Признак того, что нужно вести статистику
 * @param precision Точность, для округления дробных чисел
 *
 * @returns Оптимальный график работы устройств и статистику работы
 */
export function calculate(normalizedInput: INormalizedInput, statistic = false, precision = 8): ICalculateResult {
  // Запустим таймер расчета времени работы
  const start = statistic ? performance.now() : undefined;

  // Отсортируем устройства
  const sortedDevices = sortDevices(normalizedInput.devices);

  // Хранить все дерево не будем, для работы нам нужна лишь последняя строка дерева
  let lastTreeRow: Array<IVertex | null> = [null];

  for (const device of sortedDevices) {
    const nextTreeRow: IVertex[] = [];

    // Для каждого элемента последней строки
    for (const parent of lastTreeRow) {
      // Создадим ветви
      const unfilteredChildVertices = createDeviceVertices(parent, device, normalizedInput.normalizedRates);
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
    // Если работа по ветви, заканчивающейся текущей вершиной "дешевле", чем сохраненный результат
    if (!decisionVertex || (vertex as IVertex).totalCoast < decisionVertex.totalCoast) {
      // Сохраним текущую вершину, как результат
      decisionVertex = vertex;
      // Сбросим счетчик "одинаково дешевых решений"
      equallyDecisionCount = 1;
    } else if (statistic && decisionVertex && (vertex as IVertex).totalCoast === decisionVertex.totalCoast) {
      // Если мы собираем статистику, и решение стоит столько же, то увеличим счетчик "одинаково дешевых решений"
      equallyDecisionCount++;
    }
  }

  // Сохраним результат
  const value: number = parseFloat((decisionVertex as IVertex).totalCoast.toFixed(precision));
  const devices: IOutputDeviceValues = {};
  const schedule: IOutputSchedule = {};
  // Заполним расписание пустыми массивами
  for (let i = 0; i < 24; ++i) {
    schedule[i] = [];
  }

  // Пройдемся по всем родительским вершинам от найденной "оптимальной"
  let currentVertex: IVertex | null = decisionVertex;
  while (currentVertex) {
    const hours = deviceWorkHours(currentVertex.device, currentVertex.startHour);
    // Добавим устройство в расписание
    for (const hour of hours) {
      schedule[hour].push(currentVertex.device.id);
    }
    // Сохраним стоимость работы устройства
    devices[currentVertex.device.id] = parseFloat(currentVertex.coast.toFixed(precision));

    currentVertex = currentVertex.parent;
  }

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
      equallyDecisionCount,
      leadTime: end - (start as number),
      verticesInLastRow: lastTreeRow.length,
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
