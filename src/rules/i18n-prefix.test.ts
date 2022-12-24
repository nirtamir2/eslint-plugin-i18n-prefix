import { RuleTester } from "eslint";
import { i18nPrefix } from "./i18n-prefix";

const tester = new RuleTester({
  parserOptions: { ecmaVersion: 2015, sourceType: "module" },
});

const message =
  'i18n translation key does not start with component name. Expected "TestFunction" but got "Other".';

tester.run("i18n-prefix", i18nPrefix, {
  valid: [
    {
      code: `
        function TestFunction() {
          t("TestFunction.string");
        }
      `,
    },
    {
      code: `
        const TestFunction = () => {
          t("TestFunction.string");
        }
      `,
    },
    {
      code: `
        function TestFunction() {
          function nestedFunction() {
            t("TestFunction.string");
          }
        }
      `,
    },
    {
      code: `
        function TestFunction() {
          const variable = "some"
          t(\`TestFunction.string.\${variable}\`);
        }
      `,
    },
    {
      code: `
        function RootFunction() {
          function TestFunction() {
            function nestedFunction() {
              t("TestFunction.string");
            }
          }
        }
      `,
    },
  ],
  invalid: [
    {
      code: `
        function TestFunction() {
          t("Other.string");
        }
      `,
      errors: [
        {
          message,
        },
      ],
      output: `
        function TestFunction() {
          t("TestFunction.string");
        }
      `,
    },
    {
      code: `
        function TestFunction() {
          const variable = "some"
          t(\`Other.string.\${variable}\`);
        }
      `,
      errors: [
        {
          message,
        },
      ],
      output: `
        function TestFunction() {
          const variable = "some"
          t(\`TestFunction.string.\${variable}\`);
        }
      `,
    },
    {
      code: `
        const TestFunction = () => {
          t("Other.string");
        }
      `,
      errors: [
        {
          message,
        },
      ],
      output: `
        const TestFunction = () => {
          t("TestFunction.string");
        }
      `,
    },
  ],
});
