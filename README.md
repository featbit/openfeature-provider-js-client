# featbit-client Provider

## Introduction

This is the OpenFeature provider for the [JavaScript Client-Side SDK](https://github.com/featbit/featbit-js-client-sdk) for the 100% open-source feature flags management platform [FeatBit](https://github.com/featbit/featbit).

## Installation

```bash
npm install @openfeature/web-sdk@^1.10.0
npm install @featbit/js-client-sdk@4.4.0
npm install @featbit/openfeature-provider-js-client
```

## Tracking

After registering and initializing the provider, use the OpenFeature client to
record user actions:

```ts
const client = OpenFeature.getClient();
client.track('checkout-started');
client.track('purchase', { value: 99.5 });
```

Tracking requires `@openfeature/web-sdk` 1.10.0 or later within version 1.x.
The provider forwards the event name and optional numeric `value` to FeatBit.
Events use the FeatBit client's current user, synchronized through OpenFeature
context changes. Additional tracking detail fields are not forwarded because
the FeatBit tracking API only accepts an event name and metric value.

## Building

Run `npm run build` to build the library.

## Running unit tests

Run `npm run test` to execute the unit tests via [Jest](https://jestjs.io).
