# 🚀 CatchOPP - Freelance Marketplace Platform

> A comprehensive freelance marketplace platform with subscription management, skill testing, referral systems, and gamification features.

[![Spring Boot](https://img.shields.io/badge/Spring%20Boot-4.0.2-brightgreen.svg)](https://spring.io/projects/spring-boot)
[![Angular](https://img.shields.io/badge/Angular-18.2.0-red.svg)](https://angular.io/)
[![Java](https://img.shields.io/badge/Java-17-orange.svg)](https://www.oracle.com/java/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.5.2-blue.svg)](https://www.typescriptlang.org/)

---

## 📋 Table of Contents

- [Overview](#-overview)
- [Features](#-features)
- [Architecture](#-architecture)
- [Technology Stack](#-technology-stack)
- [Getting Started](#-getting-started)
- [Microservices](#-microservices)
- [Frontend Application](#-frontend-application)
- [API Documentation](#-api-documentation)
- [Database Schema](#-database-schema)
- [Configuration](#-configuration)
- [Testing](#-testing)
- [Deployment](#-deployment)
- [Contributing](#-contributing)
- [License](#-license)

---

## 🎯 Overview

**CatchOPP** is a modern, full-stack freelance marketplace platform built with microservices architecture. It connects clients with freelancers while providing comprehensive features for project management, skill verification, subscription monetization, and community engagement.

### Key Highlights

- 🏗️ **Microservices Architecture** - 5 independent services with API Gateway
- 💳 **Multiple Payment Gateways** - PayPal & Flouci integration
- 🎓 **Skill Testing & Certification** - Automated testing with AI-powered CV generation
- 🎁 **Gamification** - Rewards, promo codes, spin wheel, and leaderboards
- 🤝 **Referral System** - Viral growth with automatic discounts
- 💰 **Donation & Wallet** - Peer-to-peer rewards and achievement-based earnings
- 📊 **Admin Dashboard** - Comprehensive management interface
- 🌍 **Availability Management** - Time zone support and world clock
- 🎨 **Modern UI** - Angular 18 with responsive design and dark mode

---

## ✨ Features

### Core Features

#### 🔐 Authentication & Authorization
- Multi-role system (Admin, Client, Freelancer)
- JWT token-based authentication
- Email verification
- Secure password hashing (BCrypt)
- Role-based access control (RBAC)
- Automatic role-based redirection

#### 💼 Project Management
- Project creation and publication
- Advanced search and filtering
- Proposal submission and tracking
- Bid management
- Virtual contracts
- Project status tracking
- Client-Freelancer communication

#### 💳 Subscription System
- **3 Subscription Tiers**:
  - **Basic** - Essential features
  - **Pro** - Advanced features + AI CV
  - **Enterprise** - All features + priority support
- Monthly/Annual billing options
- PayPal & Flouci payment integration
- Subscription dashboard
- Plan comparison tool
- Automatic renewal management

#### 🎁 Promo Code & Rewards System
- **9 Reward Types**:
  1. **LOYAL15** - 3 months loyalty (15% off)
  2. **HALF20** - 6 months loyalty (20% off)
  3. **YEAR30** - Annual upgrade (30% off)
  4. **REF5** - 5 referrals (1 month free)
  5. **CERT20** - Certification achievement (20% off)
  6. **TOP10** - Top 10 leaderboard (35% off)
  7. **CHAL25** - Monthly challenge (25% off)
  8. **STU20** - Student discount (20% off)
  9. **SPIN** - Spin wheel (5-25% random)

- Automatic code generation
- One-time use enforcement
- 30-day expiry
- Real-time validation
- Discount calculation

#### 🎰 Spin Wheel Gamification
- Interactive spinning animation
- Random discounts (5%, 10%, 15%, 20%, 25%)
- Once per 30 days per user
- Confetti celebration effects
- Cooldown management

#### 🤝 Referral System
- Unique referral code generation (Format: `CATCH-{userId}-{randomCode}`)
- Referral link sharing
- Automatic 20% welcome discount for referred users
- Referral tracking and conversion analytics
- Social sharing integration (Twitter, LinkedIn, Facebook, WhatsApp, Email)
- Referral dashboard with statistics

#### 🎓 Skill Tests & Certifications
- Multiple choice skill tests
- Automatic scoring and grading
- Pass/fail tracking
- Certification issuance
- Test statistics (attempts, average score, pass rate)
- Scheduled publishing (future activation)
- Expiry dates (automatic deactivation)
- Admin test management
- AI-powered test generation (OpenAI integration)

#### 💰 Donation & Wallet System
- User wallet with balance tracking
- Peer-to-peer donations with messages
- **Achievement-Based Rewards**:
  - 10 certifications → $25 (Bronze)
  - 20 certifications → $50 (Silver)
  - 30 certifications → $100 (Gold)
  - 50 certifications → $200 (Platinum)
  - 100 certifications → $500 (Diamond)
- Donation history
- Reward transaction tracking
- Leaderboards (top learners, top donors)

#### 🌍 Availability & Time Management
- Freelancer availability scheduling
- Time slot management
- World clock view
- Time zone support
- Availability profile management

#### 🤖 AI Features
- AI CV Generator
- OpenAI integration
- CV image support
- Automated CV generation from user data

#### 📊 Admin Dashboard
- Statistics and analytics
- Subscription management
- Promo code administration
- Plan management
- User management
- Certification management
- Skill test management
- Protected routes with AdminGuard

---

## 🏗️ Architecture

### Microservices Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    Frontend (Angular 18)                     │
│  ┌──────────────────────────────────────────────────────┐   │
│  │ Authentication │ Projects │ Subscriptions │ Rewards  │   │
│  │ Skill Tests    │ Referral │ Admin Panel   │ AI CV    │   │
│  └──────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
                            ↓
                    JWT Interceptor
                            ↓
┌─────────────────────────────────────────────────────────────┐
│              API Gateway (Spring Cloud Gateway)              │
│                    Service Routing                           │
└─────────────────────────────────────────────────────────────┘
                            ↓
        ┌───────────────────┼───────────────────┐
        ↓                   ↓                   ↓
┌──────────────┐  ┌──────────────┐  ┌──────────────┐
│ User Service │  │Subscription  │  │ Skill Tests  │
│  (8081)      │  │  Service     │  │  Service     │
│              │  │  (8083)      │  │  (8084)      │
│ • Auth       │  │              │  │              │
│ • JWT        │  │ • Plans      │  │ • Tests      │
│ • Profiles   │  │ • Payments   │  │ • Certs      │
│ • Roles      │  │ • Promo      │  │ • Stats      │
│              │  │ • Rewards    │  │ • AI Gen     │
└──────────────┘  └──────────────┘  └──────────────┘
        ↓                   ↓                   ↓
    UserDB          SubscriptionDB      SkillTestDB
        
        ↓                   ↓
┌──────────────┐  ┌──────────────┐
│ Referral     │  │ Project      │
│ Service      │  │ Service      │
│ (8085)       │  │ (8086)       │
│              │  │              │
│ • Referrals  │  │ • Projects   │
│ • Donations  │  │ • Proposals  │
│ • Wallet     │  │ • Contracts  │
│ • Rewards    │  │ • Bids       │
│ • Availability│  │              │
└──────────────┘  └──────────────┘
        ↓                   ↓
    ReferralDB      ProjectDB
```

---

## 🛠️ Technology Stack

### Backend

- **Framework**: Spring Boot 4.0.2
- **Language**: Java 17
- **Service Discovery**: Netflix Eureka
- **API Gateway**: Spring Cloud Gateway
- **Database**: MySQL (Production), H2 (Development)
- **Security**: Spring Security + JWT
- **Build Tool**: Maven
- **ORM**: Spring Data JPA
- **Payment**: PayPal API, Flouci API
- **AI**: OpenAI API

### Frontend

- **Framework**: Angular 18.2.0
- **Language**: TypeScript 5.5.2
- **Styling**: CSS3 with custom branding
- **Charts**: ng2-charts 5.0.4
- **Payment**: @paypal/paypal-js 9.2.0
- **Utilities**: 
  - QR code generation (qrcode 1.5.4)
  - PDF export (jspdf 4.1.0)
  - HTML to Canvas (html2canvas 1.4.1)
  - Charts (chart.js 4.5.1)

### DevOps & Tools

- **Version Control**: Git
- **IDE**: IntelliJ IDEA, VS Code
- **API Testing**: Postman
- **Database**: phpMyAdmin

---

## 🚀 Getting Started

### Prerequisites

- **Java 17** or higher
- **Node.js 18** or higher
- **npm** or **yarn**
- **Maven 3.8+**
- **MySQL 8.0+** (or H2 for development)
- **Git**

### Installation

#### 1. Clone the Repository

```bash
git clone https://github.com/yourusername/catchopp.git
cd catchopp
```

#### 2. Backend Setup

```bash
# Navigate to backend directory
cd CATCHOPP/CatchOPP

# Install dependencies and build all microservices
mvn clean install

# Start each microservice (in separate terminals)
cd UserMicroService
mvn spring-boot:run

cd ../SubscriptionMicroService
mvn spring-boot:run

cd ../SkillTestsMicroService
mvn spring-boot:run

cd ../ReferralMicroService
mvn spring-boot:run

cd ../ProjectMicroService
mvn spring-boot:run

cd ../gateway
mvn spring-boot:run
```

#### 3. Frontend Setup

```bash
# Navigate to frontend directory
cd CATCHOPP/FrontFreelanceApp

# Install dependencies
npm install

# Start development server
npm start
# or
ng serve
```

#### 4. Database Setup

```sql
-- Create databases
CREATE DATABASE UserDB;
CREATE DATABASE SubscriptionDB;
CREATE DATABASE SkillTestDB;
CREATE DATABASE ReferralDB;
CREATE DATABASE ProjectDB;

-- Create admin account
USE UserDB;
INSERT INTO users (first_name, last_name, email, password, role, created_at)
VALUES ('Admin', 'CatchOPP', 'admin@catchopp.com', 
        '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 
        'ADMIN', NOW());
```

### Access the Application

- **Frontend**: http://localhost:4200
- **API Gateway**: http://localhost:8080
- **User Service**: http://localhost:8081
- **Subscription Service**: http://localhost:8083
- **Skill Tests Service**: http://localhost:8084
- **Referral Service**: http://localhost:8085
- **Project Service**: http://localhost:8086

### Default Admin Credentials

- **Email**: admin@catchopp.com
- **Password**: Admin@123

⚠️ **Change the default password after first login!**

---

## 🔧 Microservices

### 1. User Microservice (Port 8081)

**Purpose**: Authentication, user management, JWT token generation

**Key Features**:
- User registration & login
- Role-based access control (ADMIN, FREELANCER, CLIENT)
- JWT token generation and validation
- User profile management
- Email verification

**Endpoints**:
```
POST   /User/register
POST   /User/login
GET    /User/{id}
PUT    /User/{id}
DELETE /User/{id}
GET    /User/all
```

**Database**: UserDB

---

### 2. Subscription Microservice (Port 8083)

**Purpose**: Subscription plans, payments, promo codes, rewards

**Key Features**:
- Multiple subscription plans
- Payment processing (PayPal, Flouci)
- Promo code management
- Spin wheel gamification
- Reward scheduler
- Discount calculation

**Endpoints**:
```
# Subscriptions
GET    /api/subscriptions/plans
POST   /api/subscriptions/subscribe
GET    /api/subscriptions/user/{userId}
PUT    /api/subscriptions/{id}/cancel

# Promo Codes
POST   /api/promo-codes/validate
GET    /api/promo-codes/user/{userId}
POST   /api/promo-codes/admin/create
GET    /api/promo-codes/admin/all

# Rewards
GET    /api/rewards/user/{userId}
POST   /api/rewards/spin-wheel/{userId}
GET    /api/rewards/check-eligibility/{userId}

# Payments
POST   /api/flouci/initiate
POST   /api/flouci/verify
GET    /api/payments/user/{userId}
```

**Database**: SubscriptionDB

---

### 3. Skill Tests Microservice (Port 8084)

**Purpose**: Skill assessments, certifications, test management

**Key Features**:
- Multiple choice skill tests
- Certification tracking
- Test statistics
- Scheduled publishing
- Test expiry dates
- AI CV generation

**Endpoints**:
```
# Skill Tests
GET    /api/skill-tests/all
GET    /api/skill-tests/{id}
POST   /api/skill-tests/submit
GET    /api/skill-tests/user/{userId}/results

# Certifications
GET    /api/certifications/user/{userId}
GET    /api/certifications/{id}
POST   /api/certifications/issue

# Admin
POST   /api/admin/skill-tests/create
PUT    /api/admin/skill-tests/{id}
DELETE /api/admin/skill-tests/{id}
GET    /api/admin/skill-tests/{id}/statistics

# AI CV
POST   /api/ai-cv/generate
```

**Database**: SkillTestDB

---

### 4. Referral Microservice (Port 8085)

**Purpose**: Referral tracking, donations, wallet management

**Key Features**:
- Referral code generation
- Referral tracking
- Peer-to-peer donations
- User wallet management
- Reward transactions
- Availability scheduling

**Endpoints**:
```
# Referrals
GET    /Referral/generate/{userId}
POST   /Referral/use/{code}
GET    /Referral/stats/{userId}

# Donations
POST   /api/donations/send
GET    /api/donations/history/{userId}
GET    /api/leaderboards/learners
GET    /api/leaderboards/donors

# Wallet
GET    /api/wallet/{userId}
POST   /api/wallet/check-rewards/{userId}
GET    /api/wallet/transactions/{userId}

# Availability
GET    /api/availability/{userId}
POST   /api/availability/{userId}
PUT    /api/availability/{userId}
```

**Database**: ReferralDB

---

### 5. Project Microservice (Port 8086)

**Purpose**: Project/contract management, proposals

**Key Features**:
- Project creation and management
- Proposal submission
- Project status tracking
- Virtual contracts
- Bid management

**Endpoints**:
```
# Projects
GET    /Project/all
GET    /Project/{id}
POST   /Project/create
PUT    /Project/{id}
DELETE /Project/{id}

# Proposals
GET    /Proposal/project/{projectId}
POST   /Proposal/submit
PUT    /Proposal/{id}/accept
PUT    /Proposal/{id}/reject
```

**Database**: ProjectDB

---

## 💻 Frontend Application

### Project Structure

```
FrontFreelanceApp/
├── src/
│   ├── app/
│   │   ├── Interfaces_Authentification/
│   │   │   ├── login-freelancer/
│   │   │   ├── login-client/
│   │   │   ├── register-freelancer/
│   │   │   └── register-client/
│   │   ├── Interfaces_Client/
│   │   │   ├── client-dashboard/
│   │   │   ├── client-feed/
│   │   │   ├── project-details/
│   │   │   ├── project-proposals/
│   │   │   └── virtual-contract/
│   │   ├── Interfaces_Freelancers/
│   │   │   ├── freelancer-feed/
│   │   │   └── freelancer-jobs/
│   │   ├── Interfaces_Subscription/
│   │   │   ├── subscription-plans/
│   │   │   ├── subscription-detail/
│   │   │   ├── subscription-checkout/
│   │   │   ├── subscription-dashboard/
│   │   │   └── plan-comparator/
│   │   ├── Interfaces_SkillTests/
│   │   │   ├── skill-tests-list/
│   │   │   ├── skill-test-take/
│   │   │   ├── skill-test-result/
│   │   │   └── my-certifications/
│   │   ├── Interfaces_Rewards/
│   │   │   ├── rewards-dashboard/
│   │   │   └── spin-wheel/
│   │   ├── Interfaces_Referral/
│   │   │   └── referral-dashboard/
│   │   ├── Interfaces_Admin/
│   │   │   ├── admin-statistics/
│   │   │   ├── admin-subscriptions/
│   │   │   ├── admin-promo-codes/
│   │   │   ├── admin-plans/
│   │   │   ├── admin-users/
│   │   │   ├── admin-certifications/
│   │   │   └── admin-skill-tests/
│   │   ├── Interfaces_Availability/
│   │   │   ├── my-availability/
│   │   │   └── world-clock-view/
│   │   ├── Interfaces_AI/
│   │   │   └── ai-cv-generator/
│   │   ├── services/
│   │   │   ├── user.service.ts
│   │   │   ├── subscription.service.ts
│   │   │   ├── skill-test.service.ts
│   │   │   ├── referral.service.ts
│   │   │   ├── promo-code.service.ts
│   │   │   ├── donation.service.ts
│   │   │   └── ai-cv.service.ts
│   │   ├── guards/
│   │   │   └── admin.guard.ts
│   │   ├── interceptors/
│   │   │   └── jwt.interceptor.ts
│   │   ├── app-routing.module.ts
│   │   ├── app.module.ts
│   │   └── app.component.ts
│   ├── assets/
│   │   └── images/
│   │       └── catchopp-logo.png
│   ├── styles.css
│   └── index.html
├── package.json
├── angular.json
└── tsconfig.json
```

### Key Components

#### Authentication
- Login (Client & Freelancer)
- Registration (Client & Freelancer)
- JWT token management
- Role-based redirection

#### Client Features
- Dashboard with project overview
- Project creation and management
- Proposal review
- Virtual contracts
- Profile management

#### Freelancer Features
- Job feed with filtering
- Job applications
- Availability scheduling
- Skill tests and certifications

#### Subscription Management
- Plan browsing and comparison
- Checkout with PayPal
- Subscription dashboard
- Promo code application

#### Admin Panel
- Statistics dashboard
- User management
- Subscription management
- Promo code administration
- Skill test management

---

## 📚 API Documentation

### Authentication

All protected endpoints require JWT token in header:
```
Authorization: Bearer <token>
```

### Response Format

Success Response:
```json
{
  "status": "success",
  "data": { ... },
  "message": "Operation successful"
}
```

Error Response:
```json
{
  "status": "error",
  "message": "Error description",
  "code": "ERROR_CODE"
}
```

### Common Status Codes

- `200` - Success
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `500` - Internal Server Error

---

## 🗄️ Database Schema

### UserDB

```sql
-- Users Table
CREATE TABLE users (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    role ENUM('ADMIN', 'FREELANCER', 'CLIENT'),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

### SubscriptionDB

```sql
-- Subscription Plans
CREATE TABLE subscription_plans (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100),
    price DECIMAL(10,2),
    duration VARCHAR(50),
    features TEXT,
    popular BOOLEAN DEFAULT FALSE
);

-- User Subscriptions
CREATE TABLE subscriptions (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    user_id BIGINT,
    plan_id BIGINT,
    start_date DATE,
    end_date DATE,
    status VARCHAR(50),
    payment_id BIGINT
);

-- Promo Codes
CREATE TABLE promo_codes (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    code VARCHAR(50) UNIQUE,
    discount_type VARCHAR(50),
    discount_value DECIMAL(10,2),
    user_id BIGINT,
    expires_at TIMESTAMP,
    used BOOLEAN DEFAULT FALSE
);

-- Payments
CREATE TABLE payments (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    user_id BIGINT,
    amount DECIMAL(10,2),
    payment_method VARCHAR(50),
    status VARCHAR(50),
    transaction_id VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### SkillTestDB

```sql
-- Skill Tests
CREATE TABLE skill_tests (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    title VARCHAR(255),
    description TEXT,
    duration_minutes INT,
    pass_score INT,
    active BOOLEAN DEFAULT TRUE,
    scheduled_start TIMESTAMP,
    expiry_date TIMESTAMP
);

-- Test Questions
CREATE TABLE test_questions (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    test_id BIGINT,
    question TEXT,
    options TEXT,
    correct_answer VARCHAR(255)
);

-- Certifications
CREATE TABLE certifications (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    user_id BIGINT,
    test_id BIGINT,
    score INT,
    passed BOOLEAN,
    issued_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### ReferralDB

```sql
-- Referral Codes
CREATE TABLE referral_codes (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    user_id BIGINT,
    code VARCHAR(50) UNIQUE,
    uses INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- User Wallets
CREATE TABLE user_wallets (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    user_id BIGINT UNIQUE,
    balance DECIMAL(10,2) DEFAULT 0,
    total_earned DECIMAL(10,2) DEFAULT 0,
    total_donated DECIMAL(10,2) DEFAULT 0
);

-- Donations
CREATE TABLE donations (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    from_user_id BIGINT,
    to_user_id BIGINT,
    amount DECIMAL(10,2),
    message TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### ProjectDB

```sql
-- Projects
CREATE TABLE projects (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    client_id BIGINT,
    title VARCHAR(255),
    description TEXT,
    budget DECIMAL(10,2),
    status VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Proposals
CREATE TABLE proposals (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    project_id BIGINT,
    freelancer_id BIGINT,
    bid_amount DECIMAL(10,2),
    cover_letter TEXT,
    status VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

---

## ⚙️ Configuration

### Backend Configuration

Each microservice has an `application.properties` file:

```properties
# Server Configuration
server.port=8081

# Database Configuration
spring.datasource.url=jdbc:mysql://localhost:3306/UserDB
spring.datasource.username=root
spring.datasource.password=your_password

# JPA Configuration
spring.jpa.hibernate.ddl-auto=update
spring.jpa.show-sql=true

# JWT Configuration
jwt.secret=your_secret_key
jwt.expiration=86400000

# Eureka Configuration
eureka.client.service-url.defaultZone=http://localhost:8761/eureka
```

### Frontend Configuration

Update `src/environments/environment.ts`:

```typescript
export const environment = {
  production: false,
  apiUrl: 'http://localhost:8080/api',
  paypalClientId: 'your_paypal_client_id',
  openaiApiKey: 'your_openai_api_key'
};
```

---

## 🧪 Testing

### Backend Testing

```bash
# Run all tests
mvn test

# Run tests for specific microservice
cd UserMicroService
mvn test

# Run with coverage
mvn test jacoco:report
```

### Frontend Testing

```bash
# Run unit tests
ng test

# Run e2e tests
ng e2e

# Run with coverage
ng test --code-coverage
```

---

## 🚢 Deployment

### Docker Deployment

```bash
# Build Docker images
docker-compose build

# Start all services
docker-compose up -d

# Stop all services
docker-compose down
```

### Production Deployment

1. **Build Backend**:
```bash
mvn clean package -DskipTests
```

2. **Build Frontend**:
```bash
ng build --configuration production
```

3. **Deploy to Server**:
- Upload JAR files to server
- Configure environment variables
- Start services with systemd or PM2
- Configure reverse proxy (Nginx/Apache)

---

## 🤝 Contributing

We welcome contributions! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

### Coding Standards

- Follow Java coding conventions
- Use TypeScript strict mode
- Write unit tests for new features
- Update documentation
- Follow commit message conventions

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 👥 Team

- **Project Lead**: Your Name
- **Backend Development**: Team Members
- **Frontend Development**: Team Members
- **UI/UX Design**: Team Members

---

## 📞 Support

For support, email support@catchopp.com or join our Slack channel.

---

## 🙏 Acknowledgments

- Spring Boot Team
- Angular Team
- PayPal Developer Platform
- OpenAI API
- All contributors and supporters

---

## 📊 Project Status

- ✅ Authentication & Authorization
- ✅ Project Management
- ✅ Subscription System
- ✅ Promo Codes & Rewards
- ✅ Referral System
- ✅ Skill Tests & Certifications
- ✅ Donation & Wallet System
- ✅ Admin Dashboard
- ✅ AI Features
- ✅ Availability Management
- 🚧 Mobile App (Coming Soon)
- 🚧 Real-time Chat (Coming Soon)

---

## 🔗 Links

- [Documentation](https://docs.catchopp.com)
- [API Reference](https://api.catchopp.com/docs)
- [Demo](https://demo.catchopp.com)
- [Blog](https://blog.catchopp.com)

---

**Made with ❤️ by the CatchOPP Team**
