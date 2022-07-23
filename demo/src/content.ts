import * as fs from 'node:fs/promises';

export default async function content(contentPath: string) {
  return {
    frontmatter: JSON.parse(
      await fs.readFile(`./content/${contentPath}/frontmatter.json`, 'utf-8'),
    ),
    body: await fs.readFile(`./content/${contentPath}/body.html`, 'utf-8'),
  };
}
