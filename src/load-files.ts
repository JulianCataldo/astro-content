import glob from 'glob-promise';
import config from '../config';
import type { ContentComponent } from '../types';

const supportedExtensions = ['yaml', 'yml', 'md'];

// TODO: make component unique with child files embedded in each object
// Then find a way to generate types enums for all found components

export default async function load() {
  const files = await glob(
    `${config.components.src}/**/*.{${supportedExtensions}}`,
  );

  const contentComponents: ContentComponent[] = [];

  files.forEach(async (filePath) => {
    const parts = filePath.split('/').splice(2);

    const basename = parts[parts.length - 1].split('.');
    const extension = basename.pop();
    const role = basename.pop();

    let type;
    switch (extension) {
      case 'yaml':
        type = 'yaml';
        break;
      case 'yml':
        type = 'yaml';
        break;
      case 'md':
        type = 'markdown';
        break;
      default:
        type = 'unknown';
        /* Unhandled case, exit iteration */
        return;
    }

    const contentComponent: ContentComponent = {
      name: parts[parts.length - 2],
      collection: parts[parts.length - 3],
      type,
      role,
      path: filePath,
    };

    contentComponents.push(contentComponent);
  });

  console.log(contentComponents);

  return contentComponents;
}
