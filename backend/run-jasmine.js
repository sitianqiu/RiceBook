const Jasmine = require('jasmine');
const JasmineReporters = require('jasmine-reporters');

const jasmine = new Jasmine();

jasmine.loadConfigFile('spec/support/jasmine.json');
jasmine.addReporter(
  new JasmineReporters.JUnitXmlReporter({
    savePath: './test-results',
    consolidateAll: true,
    filePrefix: 'junit-results',
  })
);

jasmine.execute();
