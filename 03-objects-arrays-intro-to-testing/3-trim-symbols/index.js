/**
 * trimSymbols - removes consecutive identical symbols if they quantity bigger that size
 * @param {string} string - the initial string
 * @param {number} size - the allowed size of consecutive identical symbols
 * @returns {string} - the new string without extra symbols according passed size
 */
export function trimSymbols(string, size) {
  if (size === undefined) {
    return string;
  }

  let trimmedString = "";
  let index = 0;
  let charCount = 0;

  while (index < string.length) {
    let char = string.charAt(index++);
    if (charCount < size) {
      trimmedString += char;
      charCount++;
    }
    if (index < string.length && string.charAt(index) != char) {
      charCount = 0;
    }
  }
  return trimmedString;
}
