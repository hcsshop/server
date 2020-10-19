const assert = require('assert');
const app = require('../../src/app');

describe('\'SMS-Twilio\' service', () => {
  it('registered the service', () => {
    const service = app.service('sms-twilio');

    assert.ok(service, 'Registered the service');
  });
});
