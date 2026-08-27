const webhookUrl = 'https://hook.us2.make.com/985j7k5jd1pwqta8dy3n22q6vfrscl42';

async function sendTest() {
  const payload = {
    productId: 'test-product-001',
    name: 'Nike Dunk Low Panda',
    brand: 'Nike',
    price: 9500,
    productCode: 'AXS0013',
    imageUrl: 'https://axaszstore.com/api/instagram-image/test/sneaker.jpg',
    tryUrl: 'https://axaszstore.com/try/test',
    caption: '🔥 NEW DROP: Nike Dunk Low Panda\n━━━━━━━━━━━━━━━━━━━━\nBrand: Nike\nSKU: AXS0013\n━━━━━━━━━━━━━━━━━━━━\nCheck our website for price & details! 👟\nVirtual Try-on & Shop → https://axaszstore.com/try/test\n\n#sneakers #axaszstore #sneakerhead #kicks #nike #freshkicks'
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
