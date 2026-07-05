export default {
  name: 'customer',
  title: 'Customer',
  type: 'document',
  fields: [
    {
      name: 'fullName',
      title: 'Full Name',
      type: 'string',
      validation: (Rule) => Rule.required(),
    },
    {
      name: 'email',
      title: 'Email Address',
      type: 'string',
      validation: (Rule) => Rule.required().email(),
    },
    {
      name: 'phone',
      title: 'Phone Number',
      type: 'string',
    },
    {
      name: 'address',
      title: 'Address',
      type: 'object',
      fields: [
        { name: 'street', type: 'string', title: 'Street Address' },
        { name: 'city', type: 'string', title: 'City' },
        { name: 'state', type: 'string', title: 'State / Province' },
        { name: 'postalCode', type: 'string', title: 'Postal / Zip Code' },
        { name: 'country', type: 'string', title: 'Country' }
      ]
    },
    {
      name: 'password',
      title: 'Hashed Password',
      type: 'string',
      hidden: true, // Hide in studio so admins can't see the hash
    },
    {
      name: 'resetPasswordToken',
      title: 'Reset Password Token',
      type: 'string',
      hidden: true,
    },
    {
      name: 'resetPasswordExpires',
      title: 'Reset Password Expires',
      type: 'datetime',
      hidden: true,
    },
  ],
};
