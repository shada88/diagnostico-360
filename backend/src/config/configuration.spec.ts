import { configuration } from './configuration';

describe('configuration()', () => {
  const ORIGINAL_ENV = process.env;

  beforeEach(() => {
    jest.resetModules();
    process.env = { ...ORIGINAL_ENV };
  });

  afterAll(() => {
    process.env = ORIGINAL_ENV;
  });

  it('(a) parses valid env and returns typed config object', () => {
    process.env.NODE_ENV = 'development';
    process.env.FRONTEND_URL = 'http://localhost:3000';
    process.env.RESEND_API_KEY = 're_test_key_123';
    process.env.MAIL_DOMAIN = 'example.com';

    const config = configuration();

    expect(config.app.nodeEnv).toBe('development');
    expect(config.app.frontendUrl).toBe('http://localhost:3000');
    expect(config.mail.resendApiKey).toBe('re_test_key_123');
    expect(config.mail.fromDomain).toBe('example.com');
    expect(config.reminders.cronExpression).toBe('0 9 * * *');
    expect(config.reminders.followUpThreshold).toBe(30);
  });

  it('(b) throws when RESEND_API_KEY is missing in production', () => {
    process.env.NODE_ENV = 'production';
    process.env.FRONTEND_URL = 'https://example.com';
    delete process.env.RESEND_API_KEY;

    expect(() => configuration()).toThrow('Config validation failed');
  });

  it('(c) throws when FRONTEND_URL has no protocol (bare hostname)', () => {
    process.env.NODE_ENV = 'development';
    process.env.FRONTEND_URL = 'localhost:3000';
    process.env.RESEND_API_KEY = 're_test_key_123';

    expect(() => configuration()).toThrow('Config validation failed');
  });
});
