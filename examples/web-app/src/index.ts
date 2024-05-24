import { FbProvider } from '@featbit/openfeature-provider-js-client';
import { EventDetails, OpenFeature, ProviderEvents } from '@openfeature/web-sdk';
import { IOptions } from "@featbit/js-client-sdk";

(async () => {
   const streamingUri = 'wss://app-eval.featbit.co';
   const eventsUri = 'https://app-eval.featbit.co';
   const sdkKey = 'Obg68EqYZk27JTxphPgy7At1aJ8GaAtEaIA1fb3IpuEA';

   const user = {
      name: 'the-user',
      keyId: 'the-user',
      customizedProperties: [],
   };

   const option: IOptions = {
      sdkKey: sdkKey,
      streamingUri: streamingUri,
      eventsUri: eventsUri,
      user: user,
   };

   const provider = new FbProvider(option);

   // uncomment this line if you want to set a different context
   // await OpenFeature.setContext(user);

   await OpenFeature.setProviderAndWait(provider);

   OpenFeature.addHandler(ProviderEvents.ConfigurationChanged, (eventDetails: EventDetails) => {
      const client = OpenFeature.getClient();
      const value = client.getStringValue('robot', 'ChatGPT');
      console.log({...eventDetails, value});
   });

   const client = OpenFeature.getClient();

   const value = client.getStringValue('robot', 'ChatGPT');
   console.log(value);
})()