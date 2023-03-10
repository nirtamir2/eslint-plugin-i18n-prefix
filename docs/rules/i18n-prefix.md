### i18n-prefix

💼 This rule is enabled in the ✅ `recommended` config

🔧 This rule is automatically fixable by
the [`--fix` CLI option](https://eslint.org/docs/latest/user-guide/command-line-interface#--fix).

Ensure that the first argument of the translation function `TranslationFunction` (can be configured),
which is the i18n key,
will start with `${ComponentName}${Delemiter}` where `ComponentName` is the nearest component in the hierarchy
and delimiter can be configured.

## Options

Type: `object`

### translationFunctionName

Type: `string`

The translation function name. Default: `t`

### delimiter

Type: `string`

The translation delimiter. Default: `.`

### ignorePrefixes

Type: `Array<string>`

Prefixes to ignore. Default: `[]`

Setting it to `["A", "B"]` will ignore `t("A.other")` and `t("B.too")`

Example:

```json
{
    "i18n-prefix/i18n-prefix": [
        "error",
        {
            "translationFunctionName": "t",
            "delimiter": ".",
            "ignorePrefixes": []
        }
    ]
}
```

```js
// eslint-i18n-prefix/i18n-prefix: ["error", {
//   translationFunctionName: "t",
//   delimiter: ".",
//   ignorePrefixes: ["Ignore"]
// }]

const TestFunction = () => {
  t("Other.string"); // Fails
  t("Ignore.string"); // Pass
};
```

## Pass

```js
const TestFunction = () => {
  t("TestFunction.string");
};
```

```js
function TestFunction() {
  t("TestFunction.string");
}
```

## Fail

```js
const TestFunction = () => {
  t("Other.string");
};
```

```js
function TestFunction() {
  t("Other.string");
}
```
