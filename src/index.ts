import { recommended } from "./config/recommended";
import { i18nPrefix } from "./rules/i18n-prefix";

// eslint-disable-next-line unicorn/prefer-module,import/no-commonjs
module.exports = {
  rules: {
    "i18n-prefix": i18nPrefix,
  },
  configs: {
    recommended,
  },
};
