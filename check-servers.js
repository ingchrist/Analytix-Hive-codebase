
const http = require('http');

function checkServer(port, name) {
  return new Promise((resolve) => {
    const req = http.get(`http://0.0.0.0:${port}`, (res) => {
      console.log(`✅ ${name} server is running on port ${port}`);
      resolve(true);
    });
    
    req.on('error', () => {
      console.log(`❌ ${name} server is not running on port ${port}`);
      resolve(false);
    });
    
    req.setTimeout(3000, () => {
      console.log(`⏰ ${name} server timeout on port ${port}`);
      req.destroy();
      resolve(false);
    });
  });
}

async function checkAllServers() {
  console.log('🔍 Checking server status...\n');
  
  await checkServer(8000, 'Backend');
  await checkServer(3000, 'Frontend');
  
  console.log('\n📋 Server URLs:');
  console.log('Backend API: http://0.0.0.0:8000');
  console.log('Frontend App: http://0.0.0.0:3000');
}

checkAllServers();
