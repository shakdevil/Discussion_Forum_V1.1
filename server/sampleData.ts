import { storage } from './storage';
import { InsertQuestion, InsertAnswer } from '@shared/schema';

async function addSampleData() {
  // Sample questions with realistic programming/tech topics
  const sampleQuestions: InsertQuestion[] = [
    {
      title: "How do I implement authentication with JWT in Node.js?",
      description: "I'm building a REST API with Express and need to add user authentication. I've heard JSON Web Tokens (JWT) are a good approach, but I'm not sure how to implement them correctly. Can someone provide a step-by-step guide or code example for implementing JWT authentication in a Node.js application? I'm particularly concerned about token storage, validation, and refresh strategies.",
      tags: "javascript,node.js,authentication,jwt,express"
    },
    {
      title: "What's the best way to manage state in a large React application?",
      description: "I'm working on a large-scale React application and I'm finding state management is becoming increasingly complex. I've tried using Component state and props, but it's getting unwieldy with prop drilling. I've looked into Redux, Context API, and other state management libraries, but I'm not sure which approach is best for scalability and maintainability. What are the pros and cons of different state management approaches in React? Any real-world examples or best practices would be greatly appreciated.",
      tags: "react,javascript,state-management,redux,frontend"
    },
    {
      title: "How to optimize PostgreSQL queries for better performance?",
      description: "I have a database-heavy application running on PostgreSQL and some of my queries are starting to slow down as our data grows. I've implemented basic indexes, but I feel like there's more I could be doing. What are some strategies for optimizing PostgreSQL performance? I'm interested in both query optimization techniques and database configuration settings that could help improve response times.",
      tags: "postgresql,database,performance,sql,optimization"
    },
    {
      title: "Best practices for microservices architecture?",
      description: "My team is planning to migrate our monolithic application to a microservices architecture. We've done some research but are still unsure about many aspects. How should we define service boundaries? What's the best approach for inter-service communication (REST, gRPC, message queues)? How do we handle distributed transactions? And what about deployment and monitoring in a microservices environment? Looking for advice from those who have successfully implemented microservices in production.",
      tags: "microservices,architecture,system-design,backend,devops"
    },
    {
      title: "How to implement real-time features with WebSockets?",
      description: "I need to add real-time functionality to my web application, such as live notifications, instant messaging, and collaborative editing. I understand WebSockets are the way to go, but I'm not sure about the implementation details. Should I use Socket.IO or plain WebSockets? How do I handle authentication and connection management? What are some strategies for scaling WebSocket connections across multiple servers? Any examples or libraries you would recommend?",
      tags: "websockets,real-time,javascript,socket.io,node.js"
    }
  ];

  // Add questions to storage
  const createdQuestions = [];
  for (const question of sampleQuestions) {
    const newQuestion = await storage.createQuestion(question);
    createdQuestions.push(newQuestion);
  }

  // Sample answers for each question
  const answersForQuestion1: InsertAnswer[] = [
    {
      question_id: 1,
      answer_text: "JWT authentication in Node.js/Express is relatively straightforward. Here's a basic implementation:\n\n1. First, install required packages:\n```\nnpm install jsonwebtoken bcrypt express-jwt\n```\n\n2. Create tokens when a user logs in:\n```javascript\nconst jwt = require('jsonwebtoken');\n\napp.post('/login', async (req, res) => {\n  // Verify user credentials from database\n  // ...\n  \n  const token = jwt.sign(\n    { userId: user.id, email: user.email },\n    process.env.JWT_SECRET,\n    { expiresIn: '1h' }\n  );\n  \n  res.json({ token });\n});\n```\n\n3. Create middleware to protect routes:\n```javascript\nconst authenticateToken = (req, res, next) => {\n  const authHeader = req.headers['authorization'];\n  const token = authHeader && authHeader.split(' ')[1];\n  \n  if (!token) return res.sendStatus(401);\n  \n  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {\n    if (err) return res.sendStatus(403);\n    req.user = user;\n    next();\n  });\n};\n\n// Use the middleware to protect routes\napp.get('/protected-route', authenticateToken, (req, res) => {\n  res.json({ data: 'This is protected data' });\n});\n```\n\nFor refresh tokens, store them in a database and implement a /refresh endpoint that issues new access tokens. For frontend storage, keep access tokens in memory (or short-lived cookies) and refresh tokens in HTTP-only cookies for better security."
    },
    {
      question_id: 1,
      answer_text: "I recommend using the `passport-jwt` strategy with Passport.js for JWT authentication. It's more modular and extensible.\n\n```javascript\nconst passport = require('passport');\nconst JwtStrategy = require('passport-jwt').Strategy;\nconst ExtractJwt = require('passport-jwt').ExtractJwt;\n\nconst options = {\n  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),\n  secretOrKey: process.env.JWT_SECRET\n};\n\npassport.use(new JwtStrategy(options, async (payload, done) => {\n  try {\n    // Find the user in database\n    const user = await User.findById(payload.userId);\n    if (user) {\n      return done(null, user);\n    }\n    return done(null, false);\n  } catch (error) {\n    return done(error, false);\n  }\n}));\n\n// Use it in routes\napp.get('/protected', passport.authenticate('jwt', { session: false }), (req, res) => {\n  res.json({ user: req.user });\n});\n```\n\nDon't forget to consider token revocation strategies, especially for sensitive applications."
    },
    {
      question_id: 1,
      answer_text: "For a production application, I'd suggest looking into JWT best practices:\n\n1. Keep tokens small - only include necessary claims\n2. Use short expiration times for access tokens (15-60 minutes)\n3. Implement refresh tokens with longer expiration that can be revoked\n4. Store refresh tokens in a database with user associations\n5. Add a \"jti\" (JWT ID) claim for token revocation capability\n6. Never store sensitive data in JWTs (they're base64 encoded, not encrypted)\n\nAlso, consider using a library like `jose` which has better security than the older `jsonwebtoken` package. It supports modern algorithms and has typescript support.\n\nFor complete security, implement CSRF protection alongside JWTs if you're using cookies."
    }
  ];

  const answersForQuestion2: InsertAnswer[] = [
    {
      question_id: 2,
      answer_text: "After working on several large-scale React applications, I've found that a combination of approaches works best:\n\n1. **Local Component State**: Use for UI state that doesn't need to be shared (form inputs, toggles, etc.).\n\n2. **Context API**: Great for theme, user authentication, and other global state that doesn't change frequently.\n\n3. **Redux Toolkit**: For complex, frequently updated state that's accessed by many components. Redux Toolkit significantly reduces boilerplate compared to plain Redux.\n\nAn architecture I've found effective is:\n\n- Create domain-specific slices in Redux (users, products, orders, etc.)\n- Use context for app-wide settings and authentication\n- Keep UI state local\n\nI've also started using React Query for server state management, which handles caching, refetching, and loading states. This has dramatically reduced the amount of state I need to manage manually.\n\nThe key is not to pick one solution for everything, but to use the right tool for each specific state management need."
    },
    {
      question_id: 2,
      answer_text: "I recommend Zustand for state management in large React apps. It's much simpler than Redux but still powerful:\n\n```javascript\nimport create from 'zustand'\n\nconst useStore = create((set) => ({\n  bears: 0,\n  increasePopulation: () => set((state) => ({ bears: state.bears + 1 })),\n  removeAllBears: () => set({ bears: 0 }),\n}))\n\nfunction BearCounter() {\n  const bears = useStore((state) => state.bears)\n  return <h1>{bears} around here ...</h1>\n}\n\nfunction Controls() {\n  const increasePopulation = useStore((state) => state.increasePopulation)\n  return <button onClick={increasePopulation}>one up</button>\n}\n```\n\nBenefits:\n- No providers needed\n- Works with hooks naturally\n- No boilerplate\n- Supports middleware (persist, devtools)\n- TypeScript friendly\n- Much smaller bundle size\n\nI've used it in production apps with 100+ components and it scales well. Redux is overkill for most applications."
    },
    {
      question_id: 2,
      answer_text: "For large React applications, I'd recommend a combination of state management techniques based on the Flux architecture:\n\n1. **Component State**: For local UI state\n2. **Redux**: For global application state\n3. **React Query/SWR**: For server state\n\nThe key insight that improved our codebase was separating client state from server state. Most state management complexity comes from synchronizing server data, which libraries like React Query handle elegantly.\n\nFor Redux, we follow these principles:\n- Only store normalized data\n- Use Redux Toolkit to reduce boilerplate\n- Create selectors for derived data with Reselect\n- Group related actions, reducers and selectors in 'ducks' or 'features'\n\nWe also implemented a custom middleware for analytics and error tracking.\n\nThis approach has helped us maintain a codebase with 200+ components and 50+ developers contributing."
    }
  ];

  const answersForQuestion3: InsertAnswer[] = [
    {
      question_id: 3,
      answer_text: "PostgreSQL performance optimization is a deep topic, but here are some key strategies that have helped me:\n\n1. **Use EXPLAIN ANALYZE** to understand query execution plans:\n```sql\nEXPLAIN ANALYZE SELECT * FROM users WHERE email LIKE '%gmail.com';\n```\n\n2. **Proper indexing**:\n- Add indexes on columns used frequently in WHERE, JOIN, and ORDER BY clauses\n- Consider composite indexes for multi-column filters\n- Use partial indexes for filtered queries\n```sql\nCREATE INDEX idx_users_active ON users(email) WHERE active = TRUE;\n```\n\n3. **Query optimization**:\n- Avoid SELECT * and only request columns you need\n- Use JOINs instead of subqueries where possible\n- Use EXISTS instead of IN for better performance\n- Add LIMIT to large result sets\n\n4. **Database configuration**:\n- Increase `shared_buffers` (25% of system memory is a good starting point)\n- Adjust `work_mem` for complex sorts and joins\n- Set `effective_cache_size` to 50-75% of total system memory\n- Tune `checkpoint_segments` and `checkpoint_completion_target`\n\n5. **Regular maintenance**:\n- Run VACUUM ANALYZE regularly to update statistics\n- Set up autovacuum properly\n- Use pg_repack for table bloat\n\nThese changes reduced query times in our system from seconds to milliseconds. Start with query optimization and proper indexing before modifying PostgreSQL configuration."
    },
    {
      question_id: 3,
      answer_text: "Here are some advanced PostgreSQL optimization techniques I've used successfully:\n\n1. **Partitioning tables**: If you have very large tables, especially with time-series data, consider table partitioning. This can dramatically improve query performance by only scanning relevant partitions.\n\n```sql\nCREATE TABLE measurements (\n    city_id         int not null,\n    logdate         date not null,\n    peaktemp        int,\n    unitsales       int\n) PARTITION BY RANGE (logdate);\n\nCREATE TABLE measurements_y2020 PARTITION OF measurements\n    FOR VALUES FROM ('2020-01-01') TO ('2021-01-01');\n```\n\n2. **Using materialized views** for complex, frequently-accessed reports:\n\n```sql\nCREATE MATERIALIZED VIEW order_summary AS\n  SELECT \n    date_trunc('month', order_date) as month,\n    product_id,\n    sum(quantity) as total_quantity,\n    sum(amount) as total_amount\n  FROM orders\n  GROUP BY 1, 2;\n\n-- Then refresh when needed\nREFRESH MATERIALIZED VIEW order_summary;\n```\n\n3. **PgBouncer** for connection pooling to handle more concurrent users\n\n4. **BRIN indexes** for large tables with ordered data (much smaller than B-tree)\n\n5. **Expression indexes** for queries that filter on expressions:\n\n```sql\nCREATE INDEX idx_upper_email ON users (upper(email));\n-- This enables efficient querying with\nSELECT * FROM users WHERE upper(email) = 'USER@EXAMPLE.COM';\n```\n\nThese techniques helped us scale our PostgreSQL database to handle billions of rows with sub-second query times."
    },
    {
      question_id: 3,
      answer_text: "I work with multi-TB PostgreSQL databases, and these specific optimizations have helped us the most:\n\n1. **Denormalize strategically**: Sometimes adding redundant data to avoid joins is worth it for performance-critical queries\n\n2. **Use CTEs wisely**: Common Table Expressions (WITH queries) can improve readability but can sometimes prevent query optimization. Use them for recursive queries but be cautious otherwise.\n\n3. **Consider query parallelization**: Set max_parallel_workers_per_gather to utilize multiple CPUs\n\n4. **Use JSONB for flexible data but with indexes**:\n```sql\nCREATE INDEX idxgin ON api_logs USING GIN (data);\nCREATE INDEX idxginp ON api_logs USING GIN (data jsonb_path_ops);\n```\n\n5. **Horizontal scaling with read replicas** for read-heavy workloads\n\n6. **Use pg_stat_statements** to identify your worst-performing queries automatically\n\n7. **Consider table partitioning** by date/category for very large tables\n\n8. **Index-only scans**: Make sure your most common queries can be satisfied with index-only scans (add needed columns to the index)\n\nAlso, take a look at timescaledb extension if you're working with time-series data. It's made a huge difference for our metrics systems."
    }
  ];

  // Sample answers for the other questions
  const answersForQuestion4: InsertAnswer[] = [
    {
      question_id: 4,
      answer_text: "Based on my experience migrating several applications to microservices, here are key best practices:\n\n1. **Domain-Driven Design for Service Boundaries**:\n   - Define bounded contexts and align services with business capabilities\n   - Start with broader services and refine over time (don't over-decompose early)\n   - Use the \"single responsibility principle\" at the service level\n\n2. **Communication Patterns**:\n   - Synchronous (REST/gRPC): Use for query-heavy and user-facing operations\n   - Asynchronous (Kafka/RabbitMQ): Use for cross-service events and eventual consistency\n   - Implement API gateways for client-facing services\n   - Document APIs with OpenAPI/Swagger\n\n3. **Data Management**:\n   - Each service should own its data (private databases)\n   - Use the Saga pattern for distributed transactions\n   - Implement CQRS for complex query requirements\n   - Consider event sourcing for critical business processes\n\n4. **Operational Excellence**:\n   - Containerize everything with Docker\n   - Use Kubernetes for orchestration\n   - Implement centralized logging (ELK stack)\n   - Use distributed tracing (Jaeger/Zipkin)\n   - Implement circuit breakers (Resilience4j/Hystrix)\n\n5. **Deployment & CI/CD**:\n   - Independent deployment pipelines per service\n   - Blue/green or canary deployments\n   - Automate testing at all levels\n\n6. **Common Pitfalls to Avoid**:\n   - Shared databases between services\n   - Synchronous chains of service calls\n   - Too fine-grained services\n   - Neglecting observability\n\nStart with a clear migration strategy - we used the strangler pattern to gradually migrate features from our monolith to microservices."
    },
    {
      question_id: 4,
      answer_text: "I'd like to add some practical advice that helped us in our microservices journey:\n\n1. **Start with a monolith** for new projects and only move to microservices when complexity demands it. Premature decomposition creates more problems than it solves.\n\n2. **Create an internal developer platform** that makes it easy to create new services. We built templates with standard logging, metrics, health checks, and CI/CD pipelines that developers can use to bootstrap new services.\n\n3. **Establish clear ownership** with a service catalog that documents who owns each service, its SLAs, and dependencies.\n\n4. **Implement consumer-driven contract testing** (e.g., using Pact) to ensure API changes don't break consumers.\n\n5. **Use a service mesh** (like Istio or Linkerd) for advanced network features like traffic management, security, and observability.\n\n6. **Create a robust monitoring stack** with:\n   - Business metrics dashboards\n   - Service health monitoring\n   - Distributed tracing\n   - Log aggregation\n   - Alerting with clear runbooks\n\n7. **Implement feature flags** to control the rollout of new features across services.\n\nThe most valuable lesson: microservices are primarily an organizational architecture, not just a technical one. Conway's Law is real - make sure your team structure aligns with your service boundaries."
    },
    {
      question_id: 4,
      answer_text: "Having worked on microservices at both startups and large enterprises, my best advice is:\n\n1. **Focus on service autonomy above all else**\n   - Teams should be able to develop, test, deploy, and operate their services independently\n   - Avoid shared libraries except for very low-level utilities\n   - Standardize on communication protocols, not implementation details\n\n2. **Data ownership patterns**\n   - Duplicate data when necessary to maintain autonomy\n   - Use events to propagate changes between services\n   - Each service should have its own database schema/collection/keyspace\n\n3. **API design principles**\n   - Design APIs around resources, not internal implementations\n   - Version APIs explicitly (URI versioning is simplest)\n   - Use hypermedia controls (HATEOAS) for discoverability\n   - Document with OpenAPI and enforce with validation\n\n4. **Authentication & authorization**\n   - Use OAuth 2.0 / OpenID Connect\n   - Implement API gateways for edge concerns\n   - Push authorization decisions to services (with JWTs or tokens)\n\n5. **Observability is crucial**\n   - Standardize on logging format with correlation IDs\n   - Implement distributed tracing early (OpenTelemetry)\n   - Create service dashboards with consistent metrics\n\nStart small with 2-3 well-defined services, learn from them, then expand gradually. Our biggest mistake was trying to break our monolith into too many services too quickly without the right infrastructure."
    }
  ];
  
  const answersForQuestion5: InsertAnswer[] = [
    {
      question_id: 5,
      answer_text: "Here's a comprehensive guide to implementing WebSockets for real-time features:\n\n1. **WebSocket Libraries**:\n   - Socket.IO is excellent for most use cases as it handles fallbacks, reconnection, and room-based messaging\n   - Use plain WebSockets for performance-critical applications with modern browser requirements\n\n```javascript\n// Server (Node.js with Socket.IO)\nconst io = require('socket.io')(server);\n\n// Authentication middleware\nio.use((socket, next) => {\n  const token = socket.handshake.auth.token;\n  // Verify token\n  if (isValidToken(token)) {\n    socket.user = getUserFromToken(token);\n    next();\n  } else {\n    next(new Error('Authentication error'));\n  }\n});\n\nio.on('connection', (socket) => {\n  // Join user to their own room for direct messages\n  socket.join(`user:${socket.user.id}`);\n  \n  // Handle events\n  socket.on('send_message', (data) => {\n    // Save to database\n    saveMessage(data);\n    // Broadcast to room\n    io.to(data.roomId).emit('new_message', {\n      content: data.content,\n      sender: socket.user.id,\n      timestamp: Date.now()\n    });\n  });\n});\n```\n\n2. **Scaling WebSockets**:\n   - Use Redis adapter for Socket.IO to share state across servers\n   - Implement sticky sessions at load balancer level\n   - Consider specialized WebSocket services (Pusher, Ably) for large-scale needs\n\n3. **Connection Management**:\n   - Implement heartbeats to detect dead connections\n   - Use exponential backoff for reconnection attempts\n   - Handle graceful degradation when WebSockets aren't available\n\n4. **Real-world Architecture**:\n   - Separate your WebSocket server from API servers\n   - Use a message queue (Kafka/RabbitMQ) between your application and WebSocket servers\n   - Implement presence detection with Redis\n\n5. **Security Considerations**:\n   - Validate all incoming messages (never trust client data)\n   - Implement rate limiting\n   - Use HTTPS for the initial connection\n   - Consider message encryption for sensitive data\n\nThis architecture has successfully handled 100K+ concurrent connections in our production system."
    },
    {
      question_id: 5,
      answer_text: "For collaborative editing specifically, WebSockets alone aren't enough - you also need conflict resolution strategies. Here's my approach:\n\n1. Use **Operational Transformation (OT)** or **Conflict-free Replicated Data Types (CRDTs)** for shared editing. Libraries like Yjs, ShareDB, or Automerge implement these algorithms.\n\n2. Example with Yjs and WebSockets:\n\n```javascript\n// Client-side\nimport * as Y from 'yjs'\nimport { WebsocketProvider } from 'y-websocket'\n\nconst ydoc = new Y.Doc()\nconst provider = new WebsocketProvider(\n  'wss://your-server.com/ws',\n  'document-id',\n  ydoc\n)\n\n// Get a shared type from the doc\nconst ytext = ydoc.getText('shared-content')\n\n// Bind to a textarea\ntextarea.addEventListener('input', e => {\n  // Apply changes to Yjs\n  ytext.delete(0, ytext.length)\n  ytext.insert(0, textarea.value)\n})\n\n// Listen for changes\nytext.observe(event => {\n  textarea.value = ytext.toString()\n})\n```\n\n3. **Server implementation** with y-websocket:\n\n```javascript\nimport * as Y from 'yjs'\nimport { setupWSConnection } from 'y-websocket/bin/utils'\nimport http from 'http'\nimport WebSocket from 'ws'\n\nconst server = http.createServer((request, response) => {\n  response.writeHead(200, { 'Content-Type': 'text/plain' })\n  response.end('WebSocket server running')\n})\n\nconst wss = new WebSocket.Server({ server })\n\nwss.on('connection', (conn, req) => {\n  setupWSConnection(conn, req, { gc: true })\n})\n\nserver.listen(8080)\n```\n\nThis approach handles:\n- Simultaneous editing by multiple users\n- Offline editing with sync on reconnection\n- Conflict resolution automatically\n\nWe've implemented this for document editing with 20+ simultaneous users with excellent results."
    },
    {
      question_id: 5,
      answer_text: "For high-scale WebSocket implementations, here are some advanced patterns that have worked well for us:\n\n1. **Connection Lifecycle Management**:\n   - Implement proper connection termination on both sides\n   - Use ping/pong frames to detect connection health\n   - Add status recovery mechanisms after disconnections\n\n2. **Architecture for Scale**:\n   - Separate connection handlers from business logic\n   - Use a pub/sub system (Redis, Kafka) as the communication backbone\n   - Create specialized services for different real-time features\n\n```\n[Clients] <--WebSockets--> [Connection Servers] <--Pub/Sub--> [Business Logic Services]\n```\n\n3. **Advanced Socket.IO Configuration**:\n```javascript\nconst io = require('socket.io')(httpServer, {\n  connectTimeout: 45000,\n  pingInterval: 10000, \n  pingTimeout: 5000,\n  maxHttpBufferSize: 1e6, // 1MB\n  transports: ['websocket'], // Skip polling for performance\n  // Clustering support\n  adapter: require('socket.io-redis')({ \n    host: REDIS_HOST, \n    port: REDIS_PORT \n  })\n});\n```\n\n4. **Load Testing** is essential before production:\n   - Use Artillery or custom scripts with `ws` library\n   - Test connection bursts, message throughput, and reconnection scenarios\n   - Monitor both server resources and client performance\n\n5. **Implement proper backpressure** handling for clients that can't keep up\n\n6. **Consider using worker threads** in Node.js for CPU-intensive message processing\n\nThese patterns helped us scale to 500K simultaneous connections across a cluster of modest servers."
    }
  ];

  // Add answers to questions
  const allAnswers = [
    ...answersForQuestion1,
    ...answersForQuestion2,
    ...answersForQuestion3,
    ...answersForQuestion4,
    ...answersForQuestion5
  ];

  for (const answer of allAnswers) {
    await storage.createAnswer(answer);
  }

  console.log('✅ Sample data has been added to the discussion forum!');
}

// Export the function to be called from other files
export { addSampleData };