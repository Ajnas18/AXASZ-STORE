const webhookUrl = 'https://hook.us2.make.com/985j7k5jd1pwqta8dy3n22q6vfrscl42';

async function sendTest() {
  const payload = {
    productId: 'test-product-001',
    name: 'Nike Dunk Low Panda',
    brand: 'Nike',
    price: 9500,
    productCode: 'AXS0013',
    imageUrl: 'https://axasz-store.vercel.app/api/instagram-image/0dc31b77-5d90-4b78-ba6c-185f9a64934d/sneaker.jpg',
    tryUrl: 'https://axasz-store.vercel.app/try/0dc31b77-5d90-4b78-ba6c-185f9a64934d',
    caption: 'NEW DROP: Nike Dunk Low Panda\n━━━━━━━━━━━━━━━━━━━━\nBrand: Nike\nSKU: AXS0013\n━━━━━━━━━━━━━━━━━━━━\nCheck our website for price & details!\nVirtual Try-on & Shop → https://axasz-store.vercel.app/try/0dc31b77-5d90-4b78-ba6c-185f9a64934d\n\n#sneakers #axaszstore #sneakerhead #kicks #nike #freshkicks'
  };

  console.log('Sending test data to Make.com webhook...');
  const res = await fetch(webhookUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });

  const responseText = await res.text();
  console.log('Response Status:', res.status);
  console.log('Response Body:', responseText);
}

sendTest();
