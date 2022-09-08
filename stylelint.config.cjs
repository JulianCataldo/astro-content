/** @type {import("@types/stylelint").Options} */

module.exports = {
  extends: ['@julian_cataldo/astro-configs/stylelint-all.cjs'],
  rules: {
    /* NOTE: For VS Code colors variables */
    'custom-property-pattern': null,
    // 'custom-selector-pattern': null,
  },
};
