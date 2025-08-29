const express = require('express');
const { ApolloServer } = require('@apollo/server');
const { expressMiddleware } = require('@apollo/server/express4');
const cors = require('cors');
const bodyParser = require('body-parser');
const jwt = require('jsonwebtoken');
// Removed morgan import since it's no longer used
// const morgan = require('morgan');

// Import observability modules
const { register, httpRequestDuration, httpRequestTotal, activeConnections, loginAttempts, graphqlQueries } = require('./metrics');
const { logInfo, logError, logWarn } = require('./logger');
const { createSpan, addSpanEvent, setSpanAttributes } = require('./tracing');

const connectDB = require('./db/mongoClient');
const typeDefs = require('./graphql/schema');
const resolvers = require('./graphql/resolvers');
const authRoutes = require('./routes/auth');

const JWT_SECRET = process.env.JWT_SECRET || 'dev_secret_key';
const PORT = process.env.PORT || 5002;

async function startServer() {
  const app = express();
  
  // Create logs directory if it doesn't exist
  const fs = require('fs');
  if (!fs.existsSync('./logs')) {
    fs.mkdirSync('./logs');
  }

  // Removed Morgan middleware to reduce console noise
  // app.use(morgan('combined', {
  //   stream: {
  //     write: (message) => logInfo('HTTP Request', { message: message.trim() })
  //   }
  // }));
  
  app.use(cors());
  app.use(bodyParser.json());

  // Metrics middleware
  app.use(async (req, res, next) => {
    const start = Date.now();
    
    // Create span for request tracing
    const span = createSpan('http_request', {
      'http.method': req.method,
      'http.url': req.url,
      'http.user_agent': req.get('User-Agent')
    });

    // Add request to span context
    req.span = span;

    res.on('finish', () => {
      const duration = (Date.now() - start) / 1000;
      
      // Record metrics
      httpRequestDuration
        .labels(req.method, req.route?.path || req.url, res.statusCode)
        .observe(duration);
      
      httpRequestTotal
        .labels(req.method, req.route?.path || req.url, res.statusCode)
        .inc();

      // Set span attributes
      setSpanAttributes(span, {
        'http.status_code': res.statusCode,
        'http.response_time': duration
      });

      // Add span event
      addSpanEvent(span, 'request_completed', {
        status_code: res.statusCode,
        duration: duration
      });

      span.end();

      // Log request - commented out to reduce console noise
      // logInfo('HTTP Request Completed', {
      //   method: req.method,
      //   url: req.url,
      //   statusCode: res.statusCode,
      //   duration: duration,
      //   userAgent: req.get('User-Agent')
      // });
    });

    next();
  });

  // Connect to MongoDB
  try {
    const { db, client } = await connectDB();
    app.locals.db = db;
    logInfo('Connected to MongoDB successfully');
  } catch (error) {
    logError('Failed to connect to MongoDB', error);
    process.exit(1);
  }

  // Mount auth routes
  app.use('/api/auth', authRoutes);

  // Create Apollo Server
  const server = new ApolloServer({ 
    typeDefs, 
    resolvers,
    plugins: [
      {
        requestDidStart() {
          return {
            willSendResponse(requestContext) {
              const { request, response } = requestContext;
              
              // Record GraphQL metrics
              graphqlQueries
                .labels(request.operationName || 'anonymous', response.errors ? 'error' : 'success')
                .inc();

              // Log GraphQL queries - commented out to reduce console noise
              // logInfo('GraphQL Query', {
              //   operationName: request.operationName,
              //   query: request.query,
              //   variables: request.variables,
              //   hasErrors: !!response.errors,
              //   errorCount: response.errors?.length || 0
              // });
            }
          };
        }
      }
    ]
  });
  
  await server.start();

  // Attach Apollo middleware to /graphql
  app.use(
    '/graphql',
    express.json(),
    expressMiddleware(server, {
      context: async ({ req }) => {
        const authHeader = req.headers.authorization || '';
        const token = authHeader.split(' ')[1] || '';
        let user = null;
        
        if (token) {
          try {
            user = jwt.verify(token, JWT_SECRET);
            // logInfo('User authenticated', { username: user.username, role: user.role });
          } catch (err) {
            // logWarn('Invalid token provided', { token: token.substring(0, 10) + '...' });
          }
        }
        
        return { db: app.locals.db, user };
      }
    })
  );

  // Metrics endpoint for Prometheus
  app.get('/metrics', async (req, res) => {
    try {
      res.set('Content-Type', register.contentType);
      res.end(await register.metrics());
    } catch (error) {
      logError('Error serving metrics', error);
      res.status(500).end();
    }
  });

  // Health check endpoint
  app.get('/health', (req, res) => {
    res.json({ 
      status: 'healthy', 
      timestamp: new Date().toISOString(),
      uptime: process.uptime()
    });
  });

  // Simple health route
  app.get('/', (req, res) => res.send('✅ GraphQL Student Marks API running'));

  app.listen(PORT, () => {
    logInfo('Server started successfully', {
      port: PORT,
      environment: process.env.NODE_ENV || 'development',
      graphqlEndpoint: `http://localhost:${PORT}/graphql`,
      metricsEndpoint: `http://localhost:${PORT}/metrics`
    });
    console.log(`🚀 Server running at http://localhost:${PORT}/graphql`);
    console.log(`📊 Metrics available at http://localhost:${PORT}/metrics`);
  });
}

startServer().catch(err => {
  logError('Failed to start server', err);
  console.error('Failed to start server', err);
  process.exit(1);
});