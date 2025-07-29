const http = require('http');
const url = require('url');

// Mock data for demonstration
const mockData = {
  users: [
    { id: 1, email: 'student@test.com', first_name: 'John', last_name: 'Doe', user_type: 'student' },
    { id: 2, email: 'instructor@test.com', first_name: 'Jane', last_name: 'Smith', user_type: 'instructor' }
  ],
  courses: [
    { id: 1, title: 'Introduction to Python', price: 99.99, instructor: 2, status: 'published' },
    { id: 2, title: 'Django for Beginners', price: 149.99, instructor: 2, status: 'published' }
  ]
};

const server = http.createServer((req, res) => {
  const parsedUrl = url.parse(req.url, true);
  const path = parsedUrl.pathname;
  const method = req.method;

  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.setHeader('Content-Type', 'application/json');

  if (method === 'OPTIONS') {
    res.writeHead(200);
    res.end();
    return;
  }

  console.log(`${method} ${path}`);

  // API Routes
  if (path === '/api/auth/login/' && method === 'POST') {
    res.writeHead(200);
    res.end(JSON.stringify({
      access: 'mock-access-token',
      refresh: 'mock-refresh-token',
      user: mockData.users[0]
    }));
  }
  else if (path === '/api/users/' && method === 'GET') {
    res.writeHead(200);
    res.end(JSON.stringify({ results: mockData.users, count: mockData.users.length }));
  }
  else if (path === '/api/courses/' && method === 'GET') {
    res.writeHead(200);
    res.end(JSON.stringify({ results: mockData.courses, count: mockData.courses.length }));
  }
  else if (path === '/api/auth/register/' && method === 'POST') {
    let body = '';
    req.on('data', chunk => body += chunk);
    req.on('end', () => {
      try {
        const userData = JSON.parse(body);
        const newUser = {
          id: mockData.users.length + 1,
          ...userData,
          created_at: new Date().toISOString()
        };
        mockData.users.push(newUser);
        res.writeHead(201);
        res.end(JSON.stringify({
          user: newUser,
          access: 'mock-access-token',
          refresh: 'mock-refresh-token'
        }));
      } catch (error) {
        res.writeHead(400);
        res.end(JSON.stringify({ error: 'Invalid JSON' }));
      }
    });
  }
  else if (path.startsWith('/api/')) {
    // Generic API response for other endpoints
    res.writeHead(200);
    res.end(JSON.stringify({
      message: `Mock response for ${path}`,
      method: method,
      note: 'This is a development mock server. Real Django backend would handle this endpoint.'
    }));
  }
  else if (path === '/' || path === '/health') {
    res.writeHead(200);
    res.end(JSON.stringify({
      status: 'ok',
      message: 'BMad LMS Backend Mock Server',
      version: '1.0.0',
      endpoints: [
        'POST /api/auth/login/',
        'POST /api/auth/register/',
        'GET /api/users/',
        'GET /api/courses/',
        'GET /api/live-classes/',
        'GET /api/chat/rooms/',
        'GET /api/payments/transactions/'
      ],
      note: 'This is a development mock server demonstrating the Django LMS backend structure.'
    }));
  }
  else {
    res.writeHead(404);
    res.end(JSON.stringify({ error: 'Not found' }));
  }
});

const PORT = process.env.PORT || 8000;
server.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 BMad LMS Mock Server running on http://0.0.0.0:${PORT}`);
  console.log('📚 Available endpoints:');
  console.log('  GET  / - Server status');
  console.log('  POST /api/auth/login/ - User login');
  console.log('  POST /api/auth/register/ - User registration');
  console.log('  GET  /api/users/ - List users');
  console.log('  GET  /api/courses/ - List courses');
  console.log('  GET  /api/live-classes/ - List live classes');
  console.log('  GET  /api/chat/rooms/ - List chat rooms');
  console.log('  GET  /api/payments/transactions/ - List transactions');
  console.log('');
  console.log('⚠️  This is a development mock server.');
  console.log('💡 To run the real Django backend:');
  console.log('   1. Install Python dependencies: pip install -r requirements.txt');
  console.log('   2. Run migrations: python manage.py migrate');
  console.log('   3. Start server: python manage.py runserver 0.0.0.0:8000');
});
