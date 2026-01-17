export const isWithInRange = (value: number, range: { min: number; max: number }): boolean => {
  const areAllFiniteNumbers =
    Number.isFinite(value) && Number.isFinite(range.min) && Number.isFinite(range.max);

  if (!areAllFiniteNumbers) return false;

  return value >= range.min && value <= range.max;
};
