import type { Rule, Scope } from "eslint";

function isValidComponentName(name: string): boolean {
  // A valid component name must start with an uppercase letter
  const firstChar = name[0];
  if (firstChar == null || firstChar !== firstChar.toUpperCase()) {
    return false;
  }

  // It must also only contain letters, numbers, and underscores
  const regex = /^\w+$/;
  return regex.test(name);
}

function getErrorMessage({ expected, got }: { expected: string; got: string }) {
  return `i18n translation key does not start with component name. Expected "${expected}" but got "${got}".`;
}

function getNearestComponentNameInHierarchy(
  currentScope: Scope.Scope
): string | null {
  let result: Scope.Scope | null = currentScope;
  while (
    (result != null && result.type !== "function") ||
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    !isValidComponentName(
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-expect-error
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access,@typescript-eslint/no-unsafe-argument
      result.block.id?.name ??
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-expect-error
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        /*result.block.type === "ArrowFunctionExpression"*/ result?.block.parent
          .id.name
    )
  ) {
    result = currentScope.upper;
  }

  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  const componentName: string | null =
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-expect-error
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    result.block.id?.name ?? result?.block.parent.id.name;
  return componentName;
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

        const componentName = getNearestComponentNameInHierarchy(
          context.getScope()
        );

        if (componentName == null) {
          return;
        }

        if (firstArg.type === "Literal" && typeof firstArg.value === "string") {
          const { range, value } = firstArg;
          const [firstI18nKeyPart, ...restI18nKey] = value.split(delimiter);
          if (firstI18nKeyPart == null || range == null) {
            return;
          }

          if (componentName !== firstI18nKeyPart) {
            context.report({
              node,
              message: getErrorMessage({
                expected: componentName,
                got: firstI18nKeyPart,
              }),
              fix(fixer) {
                // fix function: replace the first part of the string literal with the function name
                const newValue = `${componentName}.${restI18nKey.join(
                  delimiter
                )}`;
                const [start, end] = range;
                return fixer.replaceTextRange([start + 1, end - 1], newValue);
              },
            });
          }
        } else if (
          firstArg.type === "TemplateLiteral" &&
          typeof firstArg.quasis[0]?.value.raw === "string"
        ) {
          const parts = firstArg.quasis[0].value.raw.split(delimiter);
          const { range } = firstArg.quasis[0];
          const firstPart = parts[0];
          if (firstPart == null || range == null) {
            return;
          }

          if (componentName !== firstPart) {
            context.report({
              node,
              message: getErrorMessage({
                expected: componentName,
                got: firstPart,
              }),
              fix(fixer) {
                const newValue = `${componentName}.${parts
                  .slice(1)
                  .join(delimiter)}`;
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
