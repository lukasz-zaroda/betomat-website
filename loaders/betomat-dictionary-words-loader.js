const SchemaUtils = require('schema-utils');
const schema = require('./options.json')
const WordsReader = require('./WordsReader');

module.exports = function (source) {

  const options = this.getOptions();

  SchemaUtils.validate(schema, options, {
    name: 'Betomat Dictionary Words Loader',
    baseDataPath: 'options',
  });

  const reader = new WordsReader(options.excludedWords);

  const result = reader.read(source);

  // JSON.parse is an optimization.
  return `export default JSON.parse('${JSON.stringify(result)}')`;
}
