import { recommended } from "./config/recommended";
import { noTypeofWindowUndefined } from "./rules/i18n-prefix";

// eslint-disable-next-line unicorn/prefer-module,import/no-commonjs
module.exports = {
  rules: {
    "i18n-prefix": noTypeofWindowUndefined,
  },
  configs: {
    recommended,
  },
};
