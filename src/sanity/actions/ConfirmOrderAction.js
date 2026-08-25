import { useDocumentOperation } from 'sanity';
import {
  generateCustomerOrderConfirmedMessage,
  buildWhatsAppUrl,
  normalizePhoneNumber,
} from '../../lib/orderRouting';

export function ConfirmOrderAction(props) {
  const { published, draft, onComplete } = props;
  const doc = draft || published;
  const { patch } = useDocumentOperation(props.id, props.type);

  if (!doc || doc._type !== 'order') {
    return null;
  }

  const isPendingConfirmation = doc.orderStatus === 'Pending Confirmation';

  // Only show this action if the order is in "Pending Confirmation" state
  if (!isPendingConfirmation) {
    return null;
  }

  return {
    label: '✅ Confirm Order',
    title: 'Confirm this customer order and prepare payment notification',
    tone: 'positive',
    onHandle: () => {
      const orderId = doc.orderId || 'Unknown';
      const customerPhone = doc.shippingAddress?.phone;
      const origin = typeof window !== 'undefined' ? window.location.origin : '';
      const orderPayLink = origin ? `${origin}/dashboard/order/${doc._id}` : '';

      // Execute Sanity patch to update orderStatus to 'Confirmed'
      patch.execute([
        {
          set: {
            orderStatus: 'Confirmed',
          },
        },
      ]);

      // If customer phone is available, open WhatsApp notification
      if (customerPhone) {
        const msg = generateCustomerOrderConfirmedMessage({
          order: doc,
          paymentLink: orderPayLink,
        });
        const waUrl = buildWhatsAppUrl(customerPhone, msg);
        if (waUrl) {
          window.open(waUrl, '_blank');
        }
      }

      onComplete();
    },
  };
}
