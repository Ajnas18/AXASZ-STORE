import { createClient } from 'next-sanity'

const client = createClient({
  projectId: 'if1xc1so',
  dataset: 'production',
  apiVersion: '2024-01-01',
  useCdn: false,
})

async function fetchUsers() {
  const users = await client.fetch(`*[_type == "customer"]{email}`)
  console.log(users)
}

fetchUsers()
