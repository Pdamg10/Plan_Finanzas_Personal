const http = require('http');

const data = JSON.stringify({ email: 'demo@example.com', password: 'password123' });

const req = http.request('http://localhost:3000/auth/login', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': data.length
  }
}, (res) => {
  let body = '';
  res.on('data', chunk => body += chunk);
  res.on('end', () => {
    const json = JSON.parse(body);
    console.log('Login Response:', json);
    if (json.token) {
      http.get('http://localhost:3000/transactions', {
        headers: { 'Authorization': 'Bearer ' + json.token }
      }, (res2) => {
        let body2 = '';
        res2.on('data', chunk => body2 += chunk);
        res2.on('end', () => {
          console.log('Transactions Count:', JSON.parse(body2).length);
        });
      });
    }
  });
});
req.write(data);
req.end();
