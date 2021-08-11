/**
 * sortStrings - sorts array of string by two criteria "asc" or "desc"
 * @param {string[]} arr - the array of strings
 * @param {string} [param="asc"] param - the sorting type "asc" or "desc"
 * @returns {string[]}
 */
export function sortStrings(arr, param = 'asc') {
  const locales = ['ru', 'en'];
  const options = {caseFirst: 'upper'};
  const compareFn = (a, b) => a.localeCompare(b, locales, options);
  return (param === 'asc') ? [...arr].sort(compareFn) : [...arr].sort(compareFn).reverse();
}
