export const formatDate = (date: Date): string => {
  return date.toISOString();
};

export const parseIsoDate = (isoString: string): Date => {
  return new Date(isoString);
};

export const toIsoString = (date: Date): string => {
  return date.toISOString();
};
