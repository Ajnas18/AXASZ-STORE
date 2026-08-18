import { useDocumentOperation } from 'sanity';
import {
  generateDealerPaidMessage,
  generateAdminUnpaidMessage,
  generateAdminUnassignedDealerMessage,
  buildWhatsAppUrl,
  normalizePhoneNumber,
  DEFAULT_ADMIN_WHATSAPP,
} from '../../lib/orderRouting';

export function OrderWhatsAppRoutingAction(props) {
  const { published, draft, onComplete } = props;
  const doc = draft || published;
  const { patch } = useDocumentOperation(props.id, props.type);

  if (!doc || doc._type !== 'order') {
    return null;
  }

  const isPaid = (doc.paymentStatus || '').toLowerCase() === 'paid';
  const hasDealerNotifications = Array.isArray(doc.dealerNotifications) && doc.dealerNotifications.length > 0;
  const hasProducts = Array.isArray(doc.products) && doc.products.length > 0;

  if (isPaid) {
    return {
      label: hasDealerNotifications
        ? `Route Order to Dealer(s) WA (${doc.dealerNotifications.length})`
        : 'Route Order to Dealer(s) WA',
      title: 'Open WhatsApp message for each product dealer in this order',
      disabled: !hasProducts,
      tone: 'positive',
      onHandle: () => {
        const notifications = doc.dealerNotifications || [];

        if (notifications.length > 0) {
          // Open WhatsApp link for each dealer
          notifications.forEach((notif, index) => {
            if (notif.whatsappUrl) {
              setTimeout(() => {
                window.open(notif.whatsappUrl, '_blank');
              }, index * 400);
            }
          });

          // Update status in Sanity to WHATSAPP_LINK_GENERATED
          const updatedNotifs = notifications.map((n) => ({
            ...n,
            status: n.status === 'SENT' ? 'SENT' : 'WHATSAPP_LINK_GENERATED',
            sentAt: new Date().toISOString(),
          }));

          patch.execute([
            {
              set: {
                dealerNotifications: updatedNotifs,
              },
            },
          ]);
        } else {
          // If dealerNotifications wasn't generated yet (e.g. older order or manual update)
          alert('Generating dealer links... If products have dealers assigned, please verify their phone numbers.');
        }

        // If there are unassigned products in a paid order, notify admin as well
        if (doc.needsAdminAttention && doc.adminNotification?.whatsappUrl) {
          setTimeout(() => {
            window.open(doc.adminNotification.whatsappUrl, '_blank');
          }, (notifications.length + 1) * 400);
        }

        onComplete();
      },
    };
  }

  // UNPAID / PENDING ORDERS: Action to notify Admin WhatsApp
  return {
    label: 'Notify Admin WA (Unpaid Order)',
    title: 'Send unpaid follow-up message to AXASZSTORE Admin WhatsApp',
    tone: 'caution',
    disabled: !hasProducts,
    onHandle: () => {
      let adminWaUrl = doc.adminNotification?.whatsappUrl;

      if (!adminWaUrl) {
        const msg = generateAdminUnpaidMessage({
          order: doc,
          paymentStatus: doc.paymentStatus || 'UNPAID',
        });
        adminWaUrl = buildWhatsAppUrl(DEFAULT_ADMIN_WHATSAPP, msg);
      }

      window.open(adminWaUrl, '_blank');

      patch.execute([
        {
          set: {
            'adminNotification.status': 'WHATSAPP_LINK_GENERATED',
            'adminNotification.sentAt': new Date().toISOString(),
          },
        },
      ]);

      onComplete();
    },
  };
}
