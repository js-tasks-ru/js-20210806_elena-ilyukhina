/**
 * sortStrings - sorts array of string by two criteria "asc" or "desc"
 * @param {string[]} arr - the array of strings
 * @param {string} [param="asc"] param - the sorting type "asc" or "desc"
 * @returns {string[]}
 */
export function sortStrings(arr, param = 'asc') {
  const locales = ['ru', 'en'];
  const options = {caseFirst: 'upper'};
  const compare = (str1, str2) => str1.localeCompare(str2, locales, options);

  return [...arr].sort((str1, str2) => {
    return (param === 'asc') ? compare(str1, str2) : compare(str2, str1);
  });
}
