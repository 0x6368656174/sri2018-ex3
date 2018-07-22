import { IInput, IRate } from './index';

/**
 * Нормализованные тариф
 */
export interface INormalizedRate extends IRate {
  /** Цена, условные единицы за Вт/час */
  value: number;
}

/**
 * Нормализованные входные данные
 */
export interface INormalizedInput extends IInput {
  /** Нормализованные тарифы */
  normalizedRates: INormalizedRate[];
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
