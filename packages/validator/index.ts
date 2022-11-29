import { generateChecker, generateAllCheckers } from './schema-to-validator.js';
import { integration, type Settings } from './integration.js';
import { itemChecker } from './validator.js';

export {
  Settings,
  /* ———————————————————————————————————————————————————————————————————————— */
  itemChecker,
  generateChecker,
  generateAllCheckers,
};

export default integration;
