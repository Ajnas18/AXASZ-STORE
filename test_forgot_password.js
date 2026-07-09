const email = "mhdajnascp@gmail.com"; // Use the registered customer email for testing

fetch("http://localhost:3000/api/auth/forgot-password", {
  method: "POST",
  headers: {
    "Content-Type": "application/json"
  },
  body: JSON.stringify({ email })
})
.then(res => res.json())
.then(data => console.log(data))
.catch(err => console.error(err));
