const bongou = require('./bongou');
const azenda = require('./azenda');
const guideReunion = require('./guideReunion');
const ouestReunion = require('./ouestReunion');
const estReunion = require('./estReunion');

const PARSERS = {
  'bongou.re': bongou,
  'azenda.re': azenda,
  'guide-reunion.fr': guideReunion,
  'ouest-lareunion.com': ouestReunion,
  'reunionest.fr': estReunion,
};

function getParser(source) {
  for (const [urlFragment, parser] of Object.entries(PARSERS)) {
    if (source.url.includes(urlFragment)) {
      return parser;
    }
  }
  return null;
}

module.exports = { getParser };
