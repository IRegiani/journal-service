const isIsoDateString = (string) => {
  if (!/\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}.\d{3}Z/.test(string)) return false;

  const date = new Date(string);
  let isDate;

  try {
    isDate = date.toISOString() === string;
  } catch {
    isDate = false;
  }

  return isDate;
};

module.exports = {
  isIsoDateString,
};
