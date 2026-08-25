import { defineConfig } from 'sanity';
import { structureTool } from 'sanity/structure';
import { schema } from './src/sanity/schemas';
import { SendWhatsAppAction } from './src/sanity/actions/SendWhatsAppAction';
import { OrderWhatsAppRoutingAction } from './src/sanity/actions/OrderWhatsAppRoutingAction';
import { ConfirmOrderAction } from './src/sanity/actions/ConfirmOrderAction';
import { PostToInstagramAction, createPublishAndInstagramAction } from './src/sanity/actions/PostToInstagramAction';
import { AnalyticsToolComponent } from './src/sanity/tools/AnalyticsTool';

const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || 'if1xc1so';
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET || 'production';

export default defineConfig({
  basePath: '/admin',
  name: 'AXASZ_STORE_Studio',
  title: 'AXASZ STORE Admin',
  projectId,
  dataset,
  plugins: [
    structureTool({
      structure: (S) =>
        S.list()
          .title('AXASZ STORE Admin')
          .items([
            // Orders Section with quick filtering
            S.listItem()
              .title('Orders')
              .child(
                S.list()
                  .title('Orders Management')
                  .items([
                    S.listItem()
                      .title('All Orders')
                      .child(S.documentTypeList('order').title('All Orders')),
                    S.listItem()
                      .title('📋 Pending Confirmation (Connect Store)')
                      .child(
                        S.documentList()
                          .title('Pending Confirmation Orders')
                          .filter('_type == "order" && orderStatus == "Pending Confirmation"')
                      ),
                    S.listItem()
                      .title(' Confirmed Orders (Awaiting Payment)')
                      .child(
                        S.documentList()
                          .title('Confirmed Orders')
                          .filter('_type == "order" && orderStatus == "Confirmed" && paymentStatus != "Paid"')
                      ),
                    S.listItem()
                      .title(' Paid Orders (Ready for Dealer)')
                      .child(
                        S.documentList()
                          .title('Paid Orders')
                          .filter('_type == "order" && paymentStatus == "Paid"')
                      ),
                    S.listItem()
                      .title(' Unpaid / Pending Orders')
                      .child(
                        S.documentList()
                          .title('Unpaid / Pending Orders')
                          .filter('_type == "order" && (paymentStatus == "Pending" || !defined(paymentStatus))')
                      ),
                    S.listItem()
                      .title(' Failed / Cancelled Orders')
                      .child(
                        S.documentList()
                          .title('Failed / Cancelled Orders')
                          .filter('_type == "order" && (paymentStatus == "Failed" || paymentStatus == "Cancelled")')
                      ),
                    S.listItem()
                      .title('🔄 Refunded Orders')
                      .child(
                        S.documentList()
                          .title('Refunded Orders')
                          .filter('_type == "order" && paymentStatus == "Refunded"')
                      ),
                    S.listItem()
                      .title('Needs Admin Attention')
                      .child(
                        S.documentList()
                          .title('Orders Requiring Attention')
                          .filter('_type == "order" && needsAdminAttention == true')
                      ),
                  ])
              ),

            // Dealers Section
            S.listItem()
              .title('Dealers / Suppliers')
              .child(
                S.documentTypeList('dealer').title('All Dealers')
              ),

            // Products Section
            S.listItem()
              .title('Sneakers & Products')
              .child(
                S.documentTypeList('product').title('All Products')
              ),

            // Customers Section
            S.listItem()
              .title('Customers')
              .child(
                S.documentTypeList('customer').title('All Customers')
              ),
          ]),
    }),
  ],
  tools: (prev) => [
    ...prev,
    {
      name: 'analytics',
      title: 'Analytics & Growth',
      icon: () => '📊',
      component: AnalyticsToolComponent,
    },
  ],
  schema: {
    types: schema.types,
  },
  document: {
    actions: (prev, context) => {
      // Add custom actions for orders
      if (context.schemaType === 'order') {
        return [ConfirmOrderAction, ...prev, OrderWhatsAppRoutingAction, SendWhatsAppAction];
      }
      // Wrap publish action & add manual Instagram posting for products
      if (context.schemaType === 'product') {
        const withInstagramPublish = prev.map((action) => {
          if (action.action === 'publish') {
            return createPublishAndInstagramAction(action);
          }
          return action;
        });
        return [...withInstagramPublish, PostToInstagramAction];
      }
      return prev;
    },
  },
});
