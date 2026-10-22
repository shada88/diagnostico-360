import { Test } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { AiService } from './ai.service';

function makeConfig(overrides: Record<string, unknown> = {}) {
  return {
    get: jest.fn((key: string) => {
      const map: Record<string, unknown> = {
        'ai.geminiApiKey': undefined,
        'ai.groqApiKey':   undefined,
        ...overrides,
      };
      return map[key];
    }),
  };
}

describe('AiService', () => {
  it('boots without AI keys — clients remain null', async () => {
    const module = await Test.createTestingModule({
      providers: [
        AiService,
        { provide: ConfigService, useValue: makeConfig() },
      ],
    }).compile();

    const service = module.get(AiService);
    // Both clients should be null when keys are absent
    expect((service as unknown as { geminiClient: unknown }).geminiClient).toBeNull();
    expect((service as unknown as { groqClient: unknown }).groqClient).toBeNull();
  });

  it('boots with gemini key — geminiClient is non-null', async () => {
    const module = await Test.createTestingModule({
      providers: [
        AiService,
        {
          provide: ConfigService,
          useValue: makeConfig({ 'ai.geminiApiKey': 'test-gemini-key' }),
        },
      ],
    }).compile();

    const service = module.get(AiService);
    expect((service as unknown as { geminiClient: unknown }).geminiClient).not.toBeNull();
    expect((service as unknown as { groqClient: unknown }).groqClient).toBeNull();
  });
});
