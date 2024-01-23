import { FbProvider } from '@featbit/openfeature-provider-js-client';
import { OpenFeature, ProviderEvents } from '@openfeature/web-sdk';
import { IOption } from "featbit-js-client-sdk";

(async () => {
   const api = 'http://localhost:5100';
   const secret = 'w5IHJzoS8UysSkEoV3N0Ogl42JeTw-xkuoZk0R2bRI5g';

   const user = {
      name: 'the-user',
      keyId: 'the-user'
   };

   const option: IOption = {
      secret: secret,
      api: api,
      user: user,
   };

   const provider = new FbProvider(option);

   await OpenFeature.setContext(user);
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