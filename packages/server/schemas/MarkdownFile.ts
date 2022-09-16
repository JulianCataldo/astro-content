export default {
  title: 'Markdown file',
  description: 'Markdown content of this entry with frontmatter',
  properties: {
    headings: {
      items: [
        {
          properties: { level: { type: 'number' } },
          required: ['level'],
        },
      ],
    },
    Content: { type: 'object' },
  },
  required: ['body', 'headings'],
};