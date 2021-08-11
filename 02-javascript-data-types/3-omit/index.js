/**
 * omit - creates an object composed of enumerable property fields
 * @param {object} obj - the source object
 * @param {...string} fields - the properties paths to omit
 * @returns {object} - returns the new object
 */
export const omit = (obj, ...fields) => {

  let result = {};

  for (const key in obj) {
    if (!fields.includes(key)) { // if (fields.indexOf(key) === - 1)
      result[key] = obj[key];
    }
  }
  return result;
};
