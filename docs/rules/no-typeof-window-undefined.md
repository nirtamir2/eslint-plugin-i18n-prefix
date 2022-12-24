### i18n-prefix

💼 This rule is enabled in the ✅ `recommended` config

🔧 This rule is automatically fixable by
the [`--fix` CLI option](https://eslint.org/docs/latest/user-guide/command-line-interface#--fix).

Because the same JavaScript code can run in the browser as well as the server, sometimes you need to have a part of your
code that only runs in one context or the other:

```ts
if (typeof window === "undefined") {
  // running in a server environment
} else {
  // running in a browser environment
}
```

This works fine in a Node.js environment, however, Deno actually supports window! So if you really want to check whether
you're running in the browser, it's better to check for document instead:

```ts
if (typeof document === "undefined") {
  // running in a server environment
} else {
  // running in a browser environment
}
```

This will work for all JS environments (Node.js, Deno, Workers, etc.).

## Fail

```js
typeof window === "undefined";
```

```js
typeof window !== "undefined";
```

## Pass

```js
typeof document === "undefined";
```

```js
typeof document !== "undefined";
```

## Credits

- https://twitter.com/JLarky/status/1598147116093693952
- [Remix documentation](https://remix.run/docs/en/v1/pages/gotchas#typeof-window-checks)
