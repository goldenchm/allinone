const fs = require('fs');
const path = require('path');
const ejs = require('ejs');

// Create dist directory if it doesn't exist
if (!fs.existsSync('dist')) {
    fs.mkdirSync('dist', { recursive: true });
}

// Copy static files
function copyDir(src, dest) {
    if (!fs.existsSync(dest)) {
        fs.mkdirSync(dest, { recursive: true });
    }
    
    const files = fs.readdirSync(src);
    files.forEach(file => {
        const srcPath = path.join(src, file);
        const destPath = path.join(dest, file);
        
        if (fs.lstatSync(srcPath).isDirectory()) {
            copyDir(srcPath, destPath);
        } else {
            fs.copyFileSync(srcPath, destPath);
        }
    });
}

// Copy public folder
copyDir('public', 'dist');

// Create a simple index.html for the application
const indexHtml = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Golden Chicken and Mutton Centre</title>
    
    <!-- Google Fonts -->
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap" rel="stylesheet">
    
    <!-- Bootstrap and Icons -->
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">
    <link href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.10.0/font/bootstrap-icons.css" rel="stylesheet">
    
    <!-- Custom Styles -->
    <link href="/css/style.css" rel="stylesheet">
    
    <!-- Favicon -->
    <link rel="icon" href="data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><text y='.9em' font-size='90'>🍖</text></svg>">
</head>
<body>
    <!-- Beautiful Loading Splash Screen -->
    <div id="loading-splash" class="loading-splash">
        <div class="loading-content">
            <div class="loading-logo">
                <i class="bi bi-shop" style="font-size: 4rem; color: white;"></i>
            </div>
            <h2 class="loading-title">Golden Chicken & Mutton Centre</h2>
            <div class="loading-spinner">
                <div class="spinner-border text-light" role="status">
                    <span class="visually-hidden">Loading...</span>
                </div>
            </div>
            <p class="loading-text">Loading your beautiful experience...</p>
        </div>
    </div>

    <!-- Main Application Container -->
    <div id="app" class="container-fluid">
        <div class="row justify-content-center align-items-center min-vh-100">
            <div class="col-md-6 col-lg-4">
                <div class="card login-card shadow-lg animate-fade-in">
                    <div class="card-body p-4">
                        <div class="text-center mb-4">
                            <i class="bi bi-shop text-primary" style="font-size: 3rem;"></i>
                            <h3 class="mt-2">Golden Chicken and Mutton Centre</h3>
                            <p class="text-muted">Management System</p>
                        </div>
                        
                        <div class="alert alert-info" role="alert">
                            <i class="bi bi-info-circle"></i>
                            <strong>Demo Mode:</strong> This is a demonstration version of the application.
                            The full version requires a backend server for complete functionality.
                        </div>
                        
                        <div class="text-center">
                            <h5>Features Included:</h5>
                            <ul class="list-unstyled text-start">
                                <li><i class="bi bi-check-circle text-success"></i> Beautiful Modern UI</li>
                                <li><i class="bi bi-check-circle text-success"></i> Responsive Design</li>
                                <li><i class="bi bi-check-circle text-success"></i> Product Management</li>
                                <li><i class="bi bi-check-circle text-success"></i> POS System Interface</li>
                                <li><i class="bi bi-check-circle text-success"></i> Receipt Printing</li>
                                <li><i class="bi bi-check-circle text-success"></i> Profit/Loss Tracking</li>
                            </ul>
                        </div>
                        
                        <div class="text-center mt-4">
                            <a href="https://github.com/goldenchm/allinone" target="_blank" class="btn btn-primary">
                                <i class="bi bi-github"></i> View Source Code
                            </a>
                        </div>
                        
                        <div class="mt-3 text-center">
                            <small class="text-muted">
                                <strong>Live Demo Available:</strong><br>
                                For full functionality, deploy with Node.js backend
                            </small>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>

    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/js/bootstrap.bundle.min.js"></script>
    <script src="/js/app.js"></script>
    
    <!-- Beautiful Loading Script -->
    <script>
        // Hide loading splash after page loads
        window.addEventListener('load', function() {
            const splash = document.getElementById('loading-splash');
            if (splash) {
                setTimeout(() => {
                    splash.style.opacity = '0';
                    splash.style.transform = 'scale(1.1)';
                    setTimeout(() => {
                        splash.style.display = 'none';
                    }, 500);
                }, 800);
            }
        });
        
        // Add some demo functionality
        document.addEventListener('DOMContentLoaded', function() {
            console.log('Golden Chicken and Mutton Centre - Demo Mode');
            console.log('Repository: https://github.com/goldenchm/allinone');
        });
    </script>
</body>
</html>
`;

fs.writeFileSync('dist/index.html', indexHtml);

console.log('✅ Client build completed successfully!');
console.log('📁 Static files copied to dist/');
console.log('🌐 Ready for Netlify deployment!');