// JSON Schema for mirahub.yaml. Mirrors mira-skills/schemas/mirahub.schema.json;
// kept here too so the builder can run standalone without the schema file.

export const mirahubSchema = {
  $schema: 'https://json-schema.org/draft/2020-12/schema',
  $id: 'https://raw.githubusercontent.com/MIRA-Intelligence/mira-skills/main/schemas/mirahub.schema.json',
  title: 'mirahub.yaml',
  type: 'object',
  additionalProperties: false,
  required: ['slug', 'version', 'tags'],
  properties: {
    slug: {
      type: 'string',
      pattern: '^[a-z0-9][a-z0-9-]{0,63}$',
    },
    version: {
      type: 'string',
      pattern: '^\\d+\\.\\d+\\.\\d+(?:-[0-9A-Za-z.-]+)?(?:\\+[0-9A-Za-z.-]+)?$',
    },
    maturity: {
      type: 'string',
      enum: ['stable', 'beta', 'experimental'],
      default: 'experimental',
    },
    license: { type: 'string' },
    author: {
      type: 'object',
      additionalProperties: false,
      required: ['name'],
      properties: {
        name: { type: 'string', minLength: 1 },
        github: { type: 'string', pattern: '^[A-Za-z0-9-]+$' },
        email: { type: 'string', format: 'email' },
        url: { type: 'string', format: 'uri' },
      },
    },
    homepage: { type: 'string', format: 'uri' },
    links: {
      type: 'object',
      additionalProperties: false,
      properties: {
        repo: { type: 'string', format: 'uri' },
        docs: { type: 'string', format: 'uri' },
        issues: { type: 'string', format: 'uri' },
      },
    },
    cover: { type: 'string' },
    screenshots: {
      type: 'array',
      items: { type: 'string' },
      uniqueItems: true,
      maxItems: 12,
    },
    tags: {
      type: 'array',
      minItems: 1,
      maxItems: 32,
      uniqueItems: true,
      items: {
        type: 'string',
        pattern: '^[a-z0-9][a-z0-9:_-]{0,63}$',
      },
    },
  },
};
