export default {
  name: 'dealer',
  title: 'Dealer / Supplier',
  type: 'document',
  fields: [
    {
      name: 'name',
      title: 'Dealer Name',
      type: 'string',
      description: 'Public/Display name of the dealer (e.g. ABC Footwear)',
      validation: (Rule) => Rule.required().min(2).max(100),
    },
    {
      name: 'businessName',
      title: 'Business / Legal Name',
      type: 'string',
      description: 'Official registered business name or trading entity',
    },
    {
      name: 'whatsapp',
      title: 'WhatsApp Number',
      type: 'string',
      description: 'Normalized international format without spaces, dashes, or "+" (e.g. 919876543210 for India)',
      validation: (Rule) =>
        Rule.required().custom((value) => {
          if (!value) return 'WhatsApp number is required';
          const clean = value.replace(/[^0-9]/g, '');
          if (clean.length < 10 || clean.length > 15) {
            return 'WhatsApp number must be a valid international number between 10 and 15 digits (e.g. 919876543210)';
          }
          if (value !== clean) {
            return 'Please enter numbers only without "+", spaces, or dashes (e.g. 919876543210)';
          }
          return true;
        }),
    },
    {
      name: 'phone',
      title: 'Contact Phone Number',
      type: 'string',
      description: 'Secondary contact number if different from WhatsApp',
    },
    {
      name: 'email',
      title: 'Email Address',
      type: 'string',
      validation: (Rule) => Rule.email(),
    },
    {
      name: 'address',
      title: 'Address / Location',
      type: 'text',
      rows: 3,
      description: 'Warehouse / Store / Business address of this dealer',
    },
    {
      name: 'status',
      title: 'Dealer Status',
      type: 'string',
      options: {
        list: [
          { title: 'Active', value: 'active' },
          { title: 'Inactive', value: 'inactive' },
        ],
        layout: 'radio',
      },
      initialValue: 'active',
      validation: (Rule) => Rule.required(),
    },
    {
      name: 'notes',
      title: 'Admin Internal Notes',
      type: 'text',
      rows: 2,
      description: 'Private notes for AXASZSTORE internal reference only',
    },
  ],
  preview: {
    select: {
      title: 'name',
      subtitle: 'businessName',
      whatsapp: 'whatsapp',
      status: 'status',
    },
    prepare(selection) {
      const { title, subtitle, whatsapp, status } = selection;
      const statusBadge = status === 'active' ? '🟢 Active' : '🔴 Inactive';
      return {
        title: title || 'Unnamed Dealer',
        subtitle: `${statusBadge} | WA: +${whatsapp || 'N/A'} ${subtitle ? `(${subtitle})` : ''}`,
      };
    },
  },
};
