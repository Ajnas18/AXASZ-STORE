export function SendWhatsAppAction(props) {
  const { published, draft } = props;
  const doc = draft || published;

  const hasTrackingNumber = !!doc?.trackingNumber;
  const hasPhone = !!doc?.shippingAddress?.phone;

  return {
    label: 'Send WhatsApp Update',
    disabled: !hasTrackingNumber || !hasPhone,
    onHandle: () => {
      if (!hasTrackingNumber || !hasPhone) return;

      const phone = doc.shippingAddress.phone.replace(/[^0-9]/g, '');
      const orderId = doc.orderId || 'Unknown';
      const tracking = doc.trackingNumber;
      const name = doc.shippingAddress.firstName || 'Customer';
      
      const message = `Hi ${name},\n\nYour order (#${orderId}) from AXASZ STORE has been updated with tracking details.\n\nTracking Number: ${tracking}\n\nThank you for shopping with us!`;
      const encodedMessage = encodeURIComponent(message);
      
      // Attempt to ensure country code is present (assuming +91 for India if exactly 10 digits)
      let formattedPhone = phone;
      if (formattedPhone.length === 10) {
        formattedPhone = `91${formattedPhone}`;
      }

      const url = `https://wa.me/${formattedPhone}?text=${encodedMessage}`;
      window.open(url, '_blank');

      props.onComplete();
    }
  }
}
