async function testAuth() {
  try {
    const regRes = await fetch('http://localhost:3000/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: 'Test', email: 'test1@example.com', password: 'password123', phone: '123' })
    });
    console.log('Register Response:', regRes.status, await regRes.text());

    const loginRes = await fetch('http://localhost:3000/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'test1@example.com', password: 'password123' })
    });
    console.log('Login Response:', loginRes.status, await loginRes.text());
  } catch (err) {
    console.error('Error:', err);
  }
}

testAuth();
