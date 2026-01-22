# Ticket Management System

A full-stack web application for managing support tickets with role-based access control. This system allows users to create, view, and manage tickets with different access levels based on user roles.

## 📋 Table of Contents

- [Project Overview](#project-overview)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Prerequisites](#prerequisites)
- [Installation & Setup](#installation--setup)
- [Frontend Setup](#frontend-setup)
- [Backend Setup](#backend-setup)
- [API Endpoints](#api-endpoints)
- [User Roles & Permissions](#user-roles--permissions)
- [Database Schema](#database-schema)
- [Running the Application](#running-the-application)
- [Development](#development)
- [Building for Production](#building-for-production)

## 🎯 Project Overview

The Ticket Management System is designed to handle support tickets and requests efficiently. Users can create tickets, track their status, assign them to team members, and collaborate through comments. The system provides different views and functionalities based on user roles.

## ✨ Features

### Core Features
- **User Authentication & Registration** - Secure login and registration with JWT tokens
- **Role-Based Access Control** - Different permissions for Admin, Requester, and Data Member roles
- **Ticket Management** - Create, view, update, and manage support tickets
- **Ticket Assignment** - Assign tickets to team members
- **Ticket Comments** - Collaborate on tickets with threaded comments
- **Audit Logging** - Track all ticket changes and activities
- **Dashboard** - Get an overview of all tickets with filtering and search
- **Priority & Status Management** - Organize tickets by priority and status

### User Roles
- **Admin** - Full system access, manage all tickets and users
- **Requester** - Create and view their tickets
- **Data Member** - View and manage assigned tickets

## 🛠️ Tech Stack

### Frontend
- **React** 19.2.0 - UI library
- **React Router** 7.12.0 - Client-side routing
- **Vite** 7.2.4 - Build tool and dev server
- **JWT Decode** 4.0.0 - JWT token decoding
- **CSS** - Styling

### Backend
- **Spring Boot** 3.2.0 - Java framework
- **Spring Security** - Authentication and authorization
- **Spring Data JPA** - Data persistence
- **MySQL** 8.0+ - Database
- **JWT (jjwt)** 0.11.5 - Token generation and validation
- **Lombok** - Boilerplate reduction
- **Java** 17 - Programming language

## 📁 Project Structure

```
TicketManagement/
├── Frontend (React + Vite)
│   ├── src/
│   │   ├── App.jsx              # Main app component with routing
│   │   ├── main.jsx             # React entry point
│   │   ├── App.css              # Global styles
│   │   ├── components/
│   │   │   └── ProtectedRoute.jsx
│   │   └── assets/
│   ├── Component/
│   │   ├── Admin/               # Admin panel component
│   │   ├── CreateTicket/        # Create ticket component
│   │   ├── DashBoard/           # Dashboard component
│   │   ├── DataMember/          # Assigned tickets for data members
│   │   ├── Register/            # User registration component
│   │   ├── TicketDetails/       # Ticket detail view component
│   │   └── TicketComment/       # Comment component
│   ├── Login/                   # Login component
│   ├── constants.jsx            # Frontend constants
│   ├── index.html               # HTML entry point
│   ├── package.json             # Frontend dependencies
│   ├── vite.config.js           # Vite configuration
│   └── eslint.config.js         # ESLint configuration
│
└── Backend/ (Spring Boot Backend)
    ├── src/
    │   ├── main/
    │   │   ├── java/com/ticketmanagement/
    │   │   │   ├── TicketManagementApplication.java  # Spring Boot entry point
    │   │   │   ├── config/
    │   │   │   │   ├── CorsConfig.java          # CORS configuration
    │   │   │   │   └── SecurityConfig.java      # Spring Security configuration
    │   │   │   ├── controller/
    │   │   │   │   ├── LoginController.java     # Authentication endpoints
    │   │   │   │   ├── UserController.java      # User management endpoints
    │   │   │   │   ├── TicketController.java    # Ticket CRUD endpoints
    │   │   │   │   ├── CommentController.java   # Comment endpoints
    │   │   │   │   └── TicketAuditLogController.java
    │   │   │   ├── model/
    │   │   │   │   ├── User.java                # User entity
    │   │   │   │   ├── Ticket.java              # Ticket entity
    │   │   │   │   ├── TicketComment.java       # Comment entity
    │   │   │   │   ├── TicketAuditLog.java      # Audit log entity
    │   │   │   │   ├── LoginRequest.java        # Login DTO
    │   │   │   │   └── role/
    │   │   │   │       ├── Role.java            # User roles enum
    │   │   │   │       ├── Priority.java        # Ticket priority enum
    │   │   │   │       ├── Status.java          # Ticket status enum
    │   │   │   │       ├── RequestType.java     # Request type enum
    │   │   │   │       └── CommentVisibility.java
    │   │   │   ├── repository/
    │   │   │   │   ├── UserRepository.java
    │   │   │   │   ├── TicketRepository.java
    │   │   │   │   ├── TicketCommentRepository.java
    │   │   │   │   └── TicketAuditLogRepository.java
    │   │   │   ├── service/
    │   │   │   │   ├── UserService.java
    │   │   │   │   ├── TicketService.java
    │   │   │   │   ├── CommentService.java
    │   │   │   │   └── TicketAuditLogService.java
    │   │   │   ├── specification/
    │   │   │   │   └── TicketSpecification.java
    │   │   │   └── util/
    │   │   │       └── JwtUtil.java             # JWT utilities
    │   │   └── resources/
    │   │       ├── application.properties       # Backend configuration
    │   │       ├── static/                      # Static resources
    │   │       └── templates/                   # Email templates
    │   └── test/
    │       └── java/com/ticketmanagement/
    │           └── TicketMnagementApplicationTests.java
    ├── pom.xml                  # Maven configuration
    ├── mvnw                     # Maven wrapper (Linux/Mac)
    ├── mvnw.cmd                 # Maven wrapper (Windows)
    └── .mvn/wrapper/
        └── maven-wrapper.properties
```

## 📋 Prerequisites

### Required Software
- **Java Development Kit (JDK)** 17 or higher
- **MySQL** 8.0 or higher
- **Node.js** 18.0 or higher
- **npm** 9.0 or higher (comes with Node.js)

### Verify Installation
```bash
# Check Java version
java -version

# Check Node.js version
node --version

# Check npm version
npm --version

# Check MySQL version (if installed)
mysql --version
```

## 🚀 Installation & Setup

### 1. Clone or Navigate to Project

```bash
cd TicketManagement
```

### 2. Database Setup

Create a MySQL database:

```sql
CREATE DATABASE ticket CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

Update database credentials in `Backend/src/main/resources/application.properties`:

```properties
spring.datasource.url=jdbc:mysql://localhost:3306/ticket
spring.datasource.username=root
spring.datasource.password=root
```

## 🎨 Frontend Setup

### Install Dependencies

```bash
npm install
```

### Development Server

```bash
npm run dev
```

The frontend will start at `http://localhost:5173`

### Build for Production

```bash
npm run build
```

### Preview Production Build

```bash
npm run preview
```

### Linting

```bash
npm run lint
```

## 🔧 Backend Setup

### Navigate to Backend Directory

```bash
cd Backend
```

### Build with Maven

```bash
# Using Maven wrapper (Windows)
mvnw.cmd clean build

# Using Maven wrapper (Linux/Mac)
./mvnw clean build

# Using system Maven (if installed)
mvn clean build
```

### Run the Application

```bash
# Using Maven wrapper (Windows)
mvnw.cmd spring-boot:run

# Using Maven wrapper (Linux/Mac)
./mvnw spring-boot:run

# Using system Maven
mvn spring-boot:run
```

The backend will start at `http://localhost:8080`

## 🔌 API Endpoints

### Authentication Endpoints
- **POST** `/api/auth/login` - User login
- **POST** `/api/auth/register` - User registration

### User Endpoints
- **GET** `/api/users` - Get all users
- **GET** `/api/users/{id}` - Get user by ID
- **PUT** `/api/users/{id}` - Update user
- **DELETE** `/api/users/{id}` - Delete user

### Ticket Endpoints
- **GET** `/api/tickets` - Get all tickets (with filtering and pagination)
- **POST** `/api/tickets` - Create new ticket
- **GET** `/api/tickets/{id}` - Get ticket details
- **PUT** `/api/tickets/{id}` - Update ticket
- **DELETE** `/api/tickets/{id}` - Delete ticket
- **PUT** `/api/tickets/{id}/assign` - Assign ticket to user
- **PUT** `/api/tickets/{id}/status` - Update ticket status

### Comment Endpoints
- **GET** `/api/tickets/{ticketId}/comments` - Get ticket comments
- **POST** `/api/tickets/{ticketId}/comments` - Add comment
- **PUT** `/api/comments/{id}` - Update comment
- **DELETE** `/api/comments/{id}` - Delete comment

### Audit Log Endpoints
- **GET** `/api/tickets/{ticketId}/audit-logs` - Get ticket audit logs

## 👥 User Roles & Permissions

| Role | Permissions |
|------|-------------|
| **Admin** | View all tickets, manage users, assign tickets, view audit logs, access admin panel |
| **Requester** | Create tickets, view own tickets, add comments, track ticket status |
| **Data Member** | View assigned tickets, update assigned tickets, add comments |

## 🗄️ Database Schema

### Users Table
- `id` - Primary key
- `name` - User's full name
- `email` - User's email (unique)
- `password` - Hashed password
- `role` - User role (ADMIN, REQUESTER, DATAMEMBER)
- `created_at` - Account creation timestamp

### Tickets Table
- `id` - Primary key
- `title` - Ticket title
- `description` - Ticket description
- `request_type` - Type of request
- `priority` - Priority level (LOW, MEDIUM, HIGH, CRITICAL)
- `status` - Current status (OPEN, IN_PROGRESS, RESOLVED, CLOSED)
- `requested_dataset` - Related dataset/component
- `due_date` - Due date for resolution
- `requester_id` - User who created the ticket
- `assigned_to` - User assigned to resolve
- `created_at` - Creation timestamp
- `updated_at` - Last update timestamp

### Ticket Comments Table
- `id` - Primary key
- `ticket_id` - Related ticket
- `user_id` - Comment author
- `content` - Comment text
- `visibility` - Comment visibility (PUBLIC, INTERNAL)
- `created_at` - Creation timestamp
- `updated_at` - Last update timestamp

### Ticket Audit Logs Table
- `id` - Primary key
- `ticket_id` - Related ticket
- `user_id` - User who made the change
- `action` - Action performed
- `old_value` - Previous value
- `new_value` - New value
- `timestamp` - Change timestamp

## ▶️ Running the Application

### Run Both Frontend and Backend

**Terminal 1 - Backend:**
```bash
cd Backend
./mvnw spring-boot:run  # Linux/Mac
# or
mvnw.cmd spring-boot:run  # Windows
```

**Terminal 2 - Frontend:**
```bash
npm run dev
```

### Access the Application

- Frontend: http://localhost:5173
- Backend API: http://localhost:8080

### Default Test Users

The system supports user registration. Create test accounts with different roles:
- Admin user
- Requester user
- Data Member user

## 👨‍💻 Development

### Frontend Development Workflow

1. Start Vite dev server: `npm run dev`
2. Edit components in `Component/` or `src/`
3. Changes hot-reload automatically

### Backend Development Workflow

1. Start Spring Boot: `./mvnw spring-boot:run`
2. Edit Java files
3. Spring Boot DevTools auto-reload changes

### Code Quality

- **Frontend Linting:** `npm run lint`
- **Backend Testing:** `mvn test`

## 📦 Building for Production

### Frontend Build

```bash
npm run build
```

Generates optimized bundle in `dist/` directory.

### Backend Build

```bash
mvnw.cmd clean package  # Windows
# or
./mvnw clean package    # Linux/Mac
```

Creates executable JAR in `Backend/target/` directory.

### Run Production Backend

```bash
java -jar Backend/target/TicketManagement-0.0.1-SNAPSHOT.jar
```

## 🔐 Security Considerations

- JWT tokens are used for authentication
- Passwords are hashed before storage
- CORS is configured for cross-origin requests
- Role-based access control is enforced on all endpoints
- SQL injection is prevented through parameterized queries

## 📝 Environment Configuration

### Backend Configuration

See `Backend/src/main/resources/application.properties`:

```properties
# Server Configuration
server.port=8080

# Database Configuration
spring.datasource.url=jdbc:mysql://localhost:3306/ticket
spring.datasource.username=root
spring.datasource.password=root
spring.datasource.driver-class-name=com.mysql.cj.jdbc.Driver

# JPA Configuration
spring.jpa.hibernate.ddl-auto=update
spring.jpa.show-sql=true
```

## 🤝 Contributing

1. Create feature branches
2. Make changes following project structure
3. Test thoroughly before committing
4. Submit pull requests with clear descriptions

## 📄 License

This project is proprietary and for authorized use only.

## 📞 Support

For issues or questions, please contact the development team.

---

**Last Updated:** January 2026
