import Table from 'cli-table3';

/**
 * Print all registered routes in Express app
 * @param {object} app - Express app instance
 */
export const printRoutesList = (app) => {
  const routes = [];
  
  /**
   * Extract routes from layer
   * @param {object} layer - Router layer
   * @param {string} prefix - URL prefix
   */
  const extractRoutes = (layer, prefix = '') => {
    if (layer.route) {
      // Routes registered directly
      const methods = Object.keys(layer.route.methods)
        .filter(method => layer.route.methods[method])
        .join(', ')
        .toUpperCase();
        
      routes.push({
        path: prefix + layer.route.path,
        methods,
        middleware: layer.route.stack
          .filter(handler => handler.name !== '<anonymous>')
          .map(handler => handler.name)
          .join(', ') || '-'
      });
    } else if (layer.name === 'router') {
      // Router middleware
      let routerPath = layer.regexp.source;
      routerPath = routerPath
        .replace('^\\/','/')
        .replace('\\/?(?=\\/|$)', '')
        .replace(/\\\//g, '/');
      
      if (routerPath === '/^/') {
        routerPath = '/';
      }
      
      layer.handle.stack.forEach((handler) => {
        extractRoutes(handler, routerPath !== '/' ? routerPath : '');
      });
    }
  };

  // Get registered routes
  app._router.stack.forEach((layer) => {
    extractRoutes(layer);
  });

  // Sort routes by path
  routes.sort((a, b) => a.path.localeCompare(b.path));

  // Create and configure table
  const table = new Table({
    head: ['Method', 'Path', 'Middleware'],
    style: {
      head: ['cyan'],
      border: ['gray']
    },
    chars: {
      'top': '═', 'top-mid': '╤', 'top-left': '╔', 'top-right': '╗',
      'bottom': '═', 'bottom-mid': '╧', 'bottom-left': '╚', 'bottom-right': '╝',
      'left': '║', 'left-mid': '╟', 'mid': '─', 'mid-mid': '┼',
      'right': '║', 'right-mid': '╢', 'middle': '│'
    }
  });

  // Add routes to table
  routes.forEach(route => {
    table.push([
      route.methods,
      route.path || '/',
      route.middleware
    ]);
  });

  // Print table
  console.log('\nRegistered Routes:');
  console.log(table.toString());
  console.log(`\nTotal Routes: ${routes.length}\n`);
}; 