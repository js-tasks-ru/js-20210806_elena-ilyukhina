/**
 * invertObj - should swap object keys and values
 * @param {object} obj - the initial object
 * @returns {object | undefined} - returns new object or undefined if nothing did't pass
 */
export function invertObj(obj) {
  if (obj !== undefined) {
    return Object.fromEntries(Object.entries(obj).map(element => [element[1], element[0]]));
  }
}
