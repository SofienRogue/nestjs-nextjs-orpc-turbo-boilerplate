# @workspace/prettier-config

Shared Prettier configuration for the monorepo.

## Usage

In your app's `package.json`:

```json
{
  "prettier": "@workspace/prettier-config"
}
```

Or create a `.prettierrc.js` to extend and override:

```js
module.exports = {
  ...require('@workspace/prettier-config'),
  // Your overrides
};
```
