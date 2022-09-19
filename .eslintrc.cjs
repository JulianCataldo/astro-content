/** @type {import("@types/eslint").Linter.Config} */

module.exports = {
  // Prevent cascading
  // root: true,

  /**
   * Reference:
   *
   * https://github.com/JulianCataldo/web-garden/blob/develop/configs/eslint-all.cjs
   *
   * */
  extends: ['./node_modules/@julian_cataldo/astro-configs/eslint-all.cjs'],
};
