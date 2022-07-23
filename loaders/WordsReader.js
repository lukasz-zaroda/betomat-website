/**
 * @param {[]} array1
 * @param {[]} array2
 */
function mergeArraysAndDeDup(array1, array2) {
  const array = array1.concat(array2);
  return Array.from(new Set(array));
}

module.exports = class WordsReader {

  /**
   * @private
   * @type {string[]}
   */
  _exclude;

  _allowDuplicatesInGroups;

  /**
   * @type {string[]}
   * @private
   */
  _separators = ['/'];

  _commentPrefix = '#';

  /**
   * @param {string[]} exclude
   * @param {boolean} allowDuplicatesInGroups
   */
  constructor(exclude = [], allowDuplicatesInGroups = true) {
    this._exclude = exclude;
    this._allowDuplicatesInGroups = allowDuplicatesInGroups;
  }

  /**
   * @param {string} content
   *
   * @returns string[]
   */
  read(content) {
    let results = [];

    const pronounsArray = content.split(/\r?\n/);

    for (const line of pronounsArray) {
      // Ignore empty strings
      if (!line) {
        continue;
      }

      // Ignore comments
      if (line.startsWith(this._commentPrefix)) {
        continue;
      }

      const lineArray = line.split(
        new RegExp(this._separators.join('|'), 'u')
      ).filter((pronoun) => {
        return !this._exclude.includes(pronoun);
      });

      results = mergeArraysAndDeDup(results, lineArray);
    }

    return results;
  }
}