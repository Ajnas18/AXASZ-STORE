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
