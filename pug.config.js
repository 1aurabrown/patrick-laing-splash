yaml = require('js-yaml');
fs   = require('fs');

var settings = yaml.safeLoad(fs.readFileSync('./config.yml', 'utf8'));
module.exports = {
  locals: settings
};