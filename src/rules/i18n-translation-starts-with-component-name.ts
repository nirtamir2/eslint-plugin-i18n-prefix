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
      // @ts-expect-error
      result.block.id?.name ??
        // @ts-expect-error
        /*result.block.type === "ArrowFunctionExpression"*/ result?.block.parent
          .id.name
    )
  ) {
    result = currentScope.upper;
  }

  const componentName: string | null =
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-expect-error
    result.block.id?.name ?? result?.block.parent.id.name;
  return componentName;
}

export const i18nTranslationStartsWithComponentName: Rule.RuleModule = {
  meta: {
    type: "problem",
    fixable: "code",
    docs: {
      description:
        "i18n translation key should starts with matching component name",
      recommended: true,
      url: "https://github.com/nirtamir2/eslint-plugin-i18n-prefix",
    },
    schema: [],
  },
  create(context) {
    return {
      // eslint-disable-next-line sonarjs/cognitive-complexity
      CallExpression(node) {
        if (node.callee.type !== "Identifier" || node.callee.name !== "t") {
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
          const { range } = firstArg;
          const [firstI18nKeyPart, ...restI18nKey] = firstArg.value.split(".");
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
                const newValue = `${componentName}.${restI18nKey.join(".")}`;
                const [start, end] = range;
                return fixer.replaceTextRange([start + 1, end - 1], newValue);
              },
            });
          }
        } else if (
          firstArg.type === "TemplateLiteral" &&
          typeof firstArg.quasis[0]?.value.raw === "string"
        ) {
          const parts = firstArg.quasis[0].value.raw.split(".");
          const { range } = firstArg.quasis[0];
          const firstPart = parts[0];
          if (firstPart == null || range == null) {
            //  Lint not using . in translation
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
                const newValue = `${componentName}.${parts.slice(1).join(".")}`;
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
