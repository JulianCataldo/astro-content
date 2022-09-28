import type { JSONSchema7 } from 'json-schema';

export default {
  title: 'Markdown file',
  description: 'Markdown content of this entry with frontmatter',
  properties: {
    file: { type: 'string' },
    headingsCompiled: {
      type: 'array',
      items: [
        {
          properties: {
            depth: { type: 'number' },
            slug: { type: 'string' },
            text: { type: 'string' },
          },
          required: ['depth', 'slug', 'text'],
          additionalProperties: false,
        },
      ],
    },
    // headings: {
    //   type: 'null',
    // },
    Content: { type: 'string' },
  },
  required: ['headings', 'Content'],
  additionalProperties: false,
} as JSONSchema7;
