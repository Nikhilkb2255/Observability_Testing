# Student Marks Management System

A full-stack application for managing student marks with GraphQL API, React frontend, and comprehensive observability.

## 🏗️ Project Structure

```
Task_3/
├── backend/                 # Node.js + Express + GraphQL backend
│   ├── db/                 # MongoDB connection and models
│   ├── graphql/            # GraphQL schema and resolvers
│   ├── routes/             # REST API routes (auth, students, marks)
│   ├── middleware/         # Authentication middleware
│   ├── observability/      # Logging, metrics, and tracing
│   └── logs/               # Application logs
├── frontend/               # React frontend application
│   ├── src/
│   │   ├── components/     # React components
│   │   ├── pages/          # Page components
│   │   ├── context/        # React context (Auth)
│   │   └── graphql/        # GraphQL queries and mutations
├── observability/          # Observability stack configuration
│   ├── grafana/            # Grafana dashboards and provisioning
│   ├── prometheus/         # Prometheus metrics collection
│   ├── loki/               # Log aggregation
│   └── promtail/           # Log collection
└── docker-compose.observability.yml  # Docker compose for observability stack
```

## 🚀 Features

- **Authentication System**: JWT-based login/logout with role-based access
- **Student Management**: CRUD operations for students
- **Marks Management**: Track and manage student marks
- **GraphQL API**: Modern GraphQL interface for data operations
- **Observability**: Comprehensive logging, metrics, and tracing
- **Role-based Access**: Admin and Teacher roles with different permissions

## 🛠️ Tech Stack

### Backend
- **Node.js** + **Express**
- **GraphQL** with Apollo Server
- **MongoDB** with native driver
- **JWT** authentication
- **Winston** logging
- **Prometheus** metrics
- **OpenTelemetry** tracing

### Frontend
- **React** 19
- **Apollo Client** for GraphQL
- **React Router** for navigation
- **Context API** for state management
- **OpenTelemetry** instrumentation

### Observability
- **Grafana** for visualization
- **Prometheus** for metrics
- **Loki** for log aggregation
- **Promtail** for log collection
- **Jaeger** for distributed tracing

## 📋 Prerequisites

- Node.js 18+
- Docker and Docker Compose
- MongoDB instance
- Git

## 🚀 Quick Start

### 1. Clone the Repository
```bash
git clone <your-repo-url>
cd Task_3
```

### 2. Backend Setup
```bash
cd backend
npm install
# Set environment variables if needed
npm start
```

### 3. Frontend Setup
```bash
cd frontend
npm install
npm start
```

### 4. Observability Stack
```bash
docker-compose -f docker-compose.observability.yml up -d
```

## 🔧 Configuration

### Environment Variables

Create `.env` files in respective directories:

#### Backend (.env)
```env
PORT=5002
MONGODB_URI=mongodb://localhost:27017/student-marks
JWT_SECRET=your-secret-key
NODE_ENV=development
```

#### Frontend (.env)
```env
REACT_APP_API_URL=http://localhost:5002
REACT_APP_GRAPHQL_URL=http://localhost:5002/graphql
```

### Observability Configuration

- **Grafana**: http://localhost:3003 (admin/admin123)
- **Prometheus**: http://localhost:9091
- **Loki**: http://localhost:3100
- **Jaeger**: http://localhost:16687

## 📊 API Endpoints

### REST API
- `POST /api/auth/login` - User authentication
- `POST /api/auth/logout` - User logout
- `POST /api/auth/register` - User registration

### GraphQL
- `POST /graphql` - GraphQL endpoint

### Health & Metrics
- `GET /health` - Health check
- `GET /metrics` - Prometheus metrics

## 🔐 Authentication

The system uses JWT tokens for authentication:

1. **Login**: POST `/api/auth/login` with username/password
2. **Token**: JWT token returned on successful login
3. **Authorization**: Include token in `Authorization: Bearer <token>` header
4. **Logout**: POST `/api/auth/logout` to invalidate session

## 📝 Logging

Structured logging is implemented using Winston:

- **Log Levels**: error, warn, info, debug
- **Log Format**: JSON with timestamp, level, message, and metadata
- **Log Files**: Stored in `backend/logs/app.log`
- **Observability**: Logs are collected by Promtail and sent to Loki

## 📈 Metrics

Prometheus metrics are exposed at `/metrics`:

- HTTP request duration and count
- GraphQL query metrics
- Database connection metrics
- Custom business metrics

## 🐳 Docker

### Observability Stack
```bash
# Start all services
docker-compose -f docker-compose.observability.yml up -d

# Stop all services
docker-compose -f docker-compose.observability.yml down

# View logs
docker-compose -f docker-compose.observability.yml logs -f
```

## 🧪 Testing

```bash
# Backend tests
cd backend
npm test

# Frontend tests
cd frontend
npm test
```

## 📚 API Documentation

### GraphQL Schema
The GraphQL schema defines the following types:
- **User**: Authentication and user management
- **Student**: Student information
- **Mark**: Student marks and grades
- **Query**: Data retrieval operations
- **Mutation**: Data modification operations

### Example Queries

#### Get All Students
```graphql
query {
  students {
    id
    name
    email
    marks {
      subject
      score
    }
  }
}
```

#### Add Student Mark
```graphql
mutation {
  addMark(studentId: "123", subject: "Math", score: 85) {
    id
    subject
    score
    student {
      name
    }
  }
}
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

For support and questions:
- Create an issue in the repository
- Check the documentation
- Review the logs and metrics

## 🔄 Updates

Keep your dependencies updated:
```bash
# Backend
cd backend && npm update

# Frontend
cd frontend && npm update
```
