/** @type {import("@types/stylelint").Options} */

module.exports = {
  /**
   * Reference:
   *
   * https://github.com/JulianCataldo/web-garden/blob/develop/configs/stylelint-all.cjs
   *
   * */
  extends: ['webdev-configs/stylelint-all.cjs'],

  rules: {
    /* NOTE: For VS Code colors variables */
    'custom-property-pattern': null,
    // 'custom-selector-pattern': null,
  },
};
