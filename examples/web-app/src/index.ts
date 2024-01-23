import { FbProvider } from '@featbit/openfeature-provider-js-client';
import { OpenFeature, ProviderEvents } from '@openfeature/web-sdk';
import { IOption } from "featbit-js-client-sdk";

(async () => {
   const streamingUri = 'http://localhost:5100';
   const sdkKey = 'w5IHJzoS8UysSkEoV3N0Ogl42JeTw-xkuoZk0R2bRI5g';

   const user = {
      name: 'the-user',
      keyId: 'the-user'
   };

   const option: IOption = {
      secret: sdkKey,
      api: streamingUri,
      user: user,
   };

   const provider = new FbProvider(option);

   // uncomment this line if you want to set a different context
   // await OpenFeature.setContext(user);

   await OpenFeature.setProviderAndWait(provider);

   OpenFeature.addHandler(ProviderEvents.ConfigurationChanged, (eventDetails) => {
      const client = OpenFeature.getClient();
      const value = client.getBooleanValue('aaa', false);
      console.log({...eventDetails, value});
   });

   const client = OpenFeature.getClient();

   const value = client.getBooleanValue('aaa', false);
   console.log(value);
})()