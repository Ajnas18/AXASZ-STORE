import { defineConfig } from 'sanity';
import { structureTool } from 'sanity/structure';
import { schema } from './src/sanity/schemas';
import { SendWhatsAppAction } from './src/sanity/actions/SendWhatsAppAction';


const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || 'if1xc1so';
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET || 'production';

export default defineConfig({
  basePath: '/admin',
  name: 'AXASZ_STORE_Studio',
  title: 'AXASZ STORE Admin',
  projectId,
  dataset,
  plugins: [structureTool()],
  schema: {
    types: schema.types,
  },
  document: {
    actions: (prev, context) => {
      // Add custom action for orders
      if (context.schemaType === 'order') {
        return [...prev, SendWhatsAppAction];
      }
      return prev;
    },
  },
});
