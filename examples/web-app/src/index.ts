import { FeatbitClientProvider } from '@featbit/openfeature-provider-js-client';
import { OpenFeature } from '@openfeature/web-sdk';
import { IOption } from "featbit-js-client-sdk/esm";

(async () => {
   const provider = new FeatbitClientProvider({} as IOption);

   const user = { keyId: '123' };
   await OpenFeature.setContext(user);
   await OpenFeature.setProviderAndWait(provider);

   const client = OpenFeature.getClient();

   const value = client.getBooleanValue('my-feature', false);
   console.log(value);
})()