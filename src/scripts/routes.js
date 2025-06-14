import Table from 'cli-table3';
import { App } from '../app.js';
import { config } from '../config/index.js';

// Parse command line arguments
const args = process.argv.slice(2);
const filterPath = args[0] || 'all';

async function displayRoutes() {
  try {
    // Initialize app
    const app = new App();
    await app.init();

    // Function to clean path pattern
    const cleanPath = (path) => {
      if (!path) return '/';
      
      // Remove regex syntax and make path more readable
      return path
        .replace(/\\/g, '')  // Remove backslashes
        .replace(/\^/g, '')  // Remove start anchor
        .replace(/\$/g, '')  // Remove end anchor
        .replace(/\(\?:([^)]+)\)/g, '$1')  // Remove non-capturing group syntax
        .replace(/\([^)]+\)/g, '*')  // Replace complex patterns with *
        .replace(/\?/g, '')  // Remove optional markers
        .replace(/\/\*/g, '/*')  // Clean up wildcards
        .replace(/\|\*/g, '/*')  // Clean up OR wildcards
        .replace(/\|/g, ' OR ')  // Make OR conditions readable
        .replace(/\/{2,}/g, '/'); // Remove duplicate slashes
    };

    // Function to get route details
    const getRouteDetails = (layer, currentPath = '') => {
      const routes = [];

      if (layer.route) {
        // Routes registered directly
        const methods = Object.keys(layer.route.methods)
          .filter(method => layer.route.methods[method])
          .map(method => method.toUpperCase())
          .join(', ');

        routes.push({
          path: cleanPath(currentPath + (layer.route.path || '')),
          methods,
          middleware: layer.route.stack
            .map(handler => handler.name || 'anonymous')
            .join(', ')
        });
      } else if (layer.name === 'router') {
        // Router middleware
        const router = layer.handle;
        
        if (router.stack) {
          const newPath = currentPath + 
            (layer.regexp.source === '^\\/?$' ? '' : 
             cleanPath(layer.regexp.source));
          
          router.stack.forEach(routerLayer => {
            routes.push(...getRouteDetails(routerLayer, newPath));
          });
        }
      } else {
        // Regular middleware
        const path = layer.regexp?.source === '^\\/?$' ? 
          '*' : 
          cleanPath(layer.regexp?.source || '*');
          
        routes.push({
          path: cleanPath(currentPath + path),
          methods: 'ALL',
          middleware: layer.name || 'anonymous'
        });
      }

      return routes;
    };

    // Get all routes
    const allRoutes = [];
    app.app._router.stack.forEach(layer => {
      allRoutes.push(...getRouteDetails(layer));
    });

    // Filter routes by options and internal middleware
    const filteredRoutes = allRoutes.filter(route => {
      // Skip internal Express middleware
      if (route.middleware.includes('query') || 
          route.middleware.includes('expressInit') ||
          route.middleware === 'anonymous') {
        return false;
      }

      // Filter by path if specified
      if (filterPath !== 'all') {
        return route.path.includes(filterPath);
      }

      return true;
    });

    // Create and configure table
    const table = new Table({
      head: ['Method', 'Path', 'Middleware'],
      style: {
        head: ['cyan'],
        border: ['gray']
      }
    });

    // Sort routes by path
    filteredRoutes.sort((a, b) => a.path.localeCompare(b.path));

    // Add routes to table
    filteredRoutes.forEach(route => {
      table.push([
        route.methods,
        route.path,
        route.middleware
      ]);
    });

    // Print filter info
    console.log(`\nShowing routes${filterPath === 'all' ? '' : ` containing "${filterPath}"`}`);
    console.log('Usage: npm run route:list [filter]');
    console.log('Examples:');
    console.log('  npm run route:list        # Show all routes');
    console.log('  npm run route:list /api   # Show routes containing "/api"');
    console.log('  npm run route:list health # Show routes containing "health"');
    
    // Print table
    console.log('\nAPI Routes:');
    console.log(table.toString());

    // Exit process
    process.exit(0);
  } catch (error) {
    console.error('Error displaying routes:', error);
    process.exit(1);
  }
}

// Run the function
displayRoutes(); 