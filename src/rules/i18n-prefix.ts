import type { Rule, Scope } from "eslint";

function isValidComponentName(name: string): boolean {
  // A valid component name must start with an uppercase letter
  const [firstChar] = name;
  if (firstChar == null || firstChar !== firstChar.toUpperCase()) {
    return false;
  }

  // It must also only contain letters, numbers, and underscores
  const regex = /^\w+$/;
  return regex.test(name);
}

function getWrongI18nKeyPrefixMessage({
  expected,
  got,
}: {
  expected: string;
  got: string;
}) {
  return `i18n translation key does not start with component name. Expected "${expected}" but got "${got}".`;
}

function getParentComponentName(initialScope: Scope.Scope): string | null {
  for (
    let resultScope: Scope.Scope | null = initialScope;
    resultScope != null;
    resultScope = resultScope.upper
  ) {
    if (resultScope.type !== "function") {
      continue;
    }

    const { block } = resultScope;

    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const functionName: string | null =
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-expect-error
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      block.id?.name ??
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-expect-error
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      /*result.block.type === "ArrowFunctionExpression"*/ block.parent.id?.name;

    if (functionName != null && isValidComponentName(functionName)) {
      return functionName;
    }
  }

  return null;
}

function getParentComponentNotFoundMessage(translationFunctionName: string) {
  return `${translationFunctionName} function is not wrapped inside a component`;
}

export const i18nPrefix: Rule.RuleModule = {
  meta: {
    type: "problem",
    fixable: "code",
    docs: {
      description:
        "i18n translation key should starts with matching component name",
      recommended: true,
      url: "https://github.com/nirtamir2/eslint-plugin-i18n-prefix",
    },
    schema: [
      {
        additionalProperties: false,
        properties: {
          delimiter: {
            type: "string",
          },
          translationFunctionName: {
            type: "string",
          },
        },
        type: "object",
      },
    ],
  },
  create(context) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const config: Partial<{
      delimiter: string;
      translationFunctionName: string;
    }> = context.options[0] ?? {};
    const { delimiter = ".", translationFunctionName = "t" } = config;
    return {
      // eslint-disable-next-line sonarjs/cognitive-complexity
      CallExpression(node) {
        if (
          node.callee.type !== "Identifier" ||
          node.callee.name !== translationFunctionName
        ) {
          return;
        }
        const firstArg = node.arguments[0];
        if (firstArg == null) {
          return;
        }

        const componentName = getParentComponentName(context.getScope());

        if (componentName == null) {
          context.report({
            node,
            message: getParentComponentNotFoundMessage(translationFunctionName),
          });
          return;
        }

        // t("string.literal")
        if (firstArg.type === "Literal" && typeof firstArg.value === "string") {
          const { range, value } = firstArg;
          const [firstI18nKeyPart, ...restI18nKeyParts] =
            value.split(delimiter);
          if (firstI18nKeyPart == null || range == null) {
            return;
          }

          if (componentName !== firstI18nKeyPart) {
            context.report({
              node,
              message: getWrongI18nKeyPrefixMessage({
                expected: componentName,
                got: firstI18nKeyPart,
              }),
              fix(fixer) {
                // fix function: replace the first part of the string literal with the function name
                const newValue = [componentName, ...restI18nKeyParts].join(
                  delimiter
                );
                const [start, end] = range;
                return fixer.replaceTextRange([start + 1, end - 1], newValue);
              },
            });
          }
          // t(`template.string.with.${parameter}`)
        } else if (
          firstArg.type === "TemplateLiteral" &&
          typeof firstArg.quasis[0]?.value.raw === "string"
        ) {
          const [firstI18nKeyPart, ...restI18nKeyParts] =
            firstArg.quasis[0].value.raw.split(delimiter);
          const { range } = firstArg.quasis[0];
          if (firstI18nKeyPart == null || range == null) {
            return;
          }

          if (componentName !== firstI18nKeyPart) {
            context.report({
              node,
              message: getWrongI18nKeyPrefixMessage({
                expected: componentName,
                got: firstI18nKeyPart,
              }),
              fix(fixer) {
                const newValue = [componentName, ...restI18nKeyParts].join(
                  delimiter
                );
                const [start, end] = range;
                return fixer.replaceTextRange([start + 1, end - 2], newValue);
              },
            });
          }
        }
      },
    };
  },
};
