# CATCHOPP – Freelance & Community Platform

## Overview

This project was developed as part of the PIDEV – 4th Year Engineering Program at **Esprit School of Engineering** (Academic Year 2025–2026).

CATCHOPP is a comprehensive full-stack web application that connects freelancers with clients while fostering community engagement through groups, clubs, and events. The platform enables users to manage projects, collaborate in communities, organize events, and build professional networks.

## Features

The platform is organized into 5 comprehensive modules:

### Module 1: Freelancer & Skills Management
- Personal dashboard (activities, income, ongoing projects)
- Document management (CV, portfolio, certificates)
- Add/edit/delete skills
- Search freelancers by skills
- Skill validation by admin or verification system
- Project categorization by skills
- Post-project evaluation form
- Display ratings and reviews for freelancers
- Badge assignment (e.g., "Top Freelancer")
- Leaderboard (freelancer ranking)
- User reputation page (credibility, trust, performance, client reviews of freelancers and freelancer reviews of clients)

### Module 2: Project & Submissions Management, Contracts & Payments
- Project posting creation (client)
- Project list with filters (status, budget, skills)
- Detailed project view (description, budget, deadline, documents)
- Edit project posts
- List of projects published by a client
- Automatic freelancer/project matching system
- Bid submission interface
- Submission tracking (sent, accepted, rejected)
- Submission details (price, deadline, message)
- Contract visualization
- Electronic signature interface
- Editable contract templates
- Contract history
- Contract editing
- Escrow management per project
- Payment interface (multiple methods)
- Transactions dashboard
- Payment history and invoice download

### Module 3: Subscription Management
- Subscription Creation (User / Freelancer)
- List of Available Subscriptions
- Complete Subscription Details
- Subscription Enrollment Interface
- Subscription Tracking
- Modification or Renewal of Subscription
- Subscription Payment Management
- Payment History
- Subscription Expiration Notifications
- Special Offers and Discounts Management
- Subscription Dashboard
- Group Subscriptions for Businesses

### Module 4: Communication
- Real-time chat (text, files, images)
- Conversation list
- Notification center (messages, offers, project updates)
- Technical support system
- File upload in chat
- Group and Project-specific Channels
- User presence and status tracking
- Message archiving and search

### Module 5: Events & Communities
- Create and edit groups (public, private, invitation-only)
- Group pages with banner, description, members
- Role system (admin, moderator, member)
- Group wall (announcements, posts)
- Search groups by interests
- Events Calendar
- Club Dashboard
- Club Creation and Management
- Dynamic clubs page
- Automatic Event Creation Template
- Event join/unjoin functionality
- Post reactions and comments
- Comment reactions system
- Notification system for community activities

## Tech Stack

### Frontend
- Angular 15+
- TypeScript
- Bootstrap 5
- RxJS
- Angular Material

### Backend
- Java 17
- Spring Boot 3.x
- Spring Data JPA
- Spring Security
- Maven

### Database
- MySQL 8.0

### Additional Technologies
- RESTful API architecture
- JWT Authentication
- Microservices architecture

## Architecture

The application follows a microservices architecture with:
- **Frontend**: Angular SPA (Single Page Application)
- **Backend Microservices**:
  - Community Microservice (Groups, Clubs, Events, Posts)
  - Project Microservice (Project & Submissions Management, Contracts & Payments )
  - Subscribe Microservice 
  - Communication Microservice
  - Freelancer Microservise (Freelancer & Skills Management )
- **Database**: MySQL with separate schemas per microservice

## Contributors

This project was developed by a team of 4th year engineering students at Esprit School of Engineering:
-Islem Bouchaala 
-Amna Gaied
-Ghassen Hachaichi
-Ayoub Somrani
-Hazem Ouasli

## Academic Context

**Developed at Esprit School of Engineering – Tunisia**  
PIDEV – 4SAE7 | 2025–2026

**Supervised by**: CatchOpp

## Getting Started

### Prerequisites
- Node.js 16+ and npm
- Java 17+
- MySQL 8.0+
- Maven 3.8+

### Backend Setup

1. Clone the repository:
```bash
git clone https://github.com/Hchaichi8/CATCHOPP.git
cd CATCHOPP
```

2. Configure MySQL database:
```sql
CREATE DATABASE catchopp_community;
CREATE DATABASE catchopp_project;
```

3. Update `application.properties` in each microservice:
```properties
spring.datasource.url=jdbc:mysql://localhost:3306/catchopp
spring.datasource.username=root
spring.datasource.password=
```


The backend will start on `http://localhost:8089`

### Frontend Setup

1. Navigate to frontend directory:
```bash
cd FrontFreelanceApp
```

2. Install dependencies:
```bash
npm install
```

3. Run the development server:
```bash
ng serve
```

The application will be available at `http://localhost:4200`

### Key Endpoints


Run frontend tests:
```bash
cd FrontFreelanceApp
ng test
```


## Troubleshooting

### Backend Issues
- Ensure MySQL is running and databases are created
- Check port 8089 is not in use
- Verify Java 17+ is installed

### Frontend Issues
- Clear npm cache: `npm cache clean --force`
- Delete `node_modules` and reinstall: `rm -rf node_modules && npm install`
- Check Angular CLI version: `ng version`

## License

This project is developed for academic purposes at Esprit School of Engineering.

## Acknowledgments

- Esprit School of Engineering for providing the academic framework
- Project supervisors and instructors
- All team members who contributed to this project

---

**Note**: This project is part of the academic curriculum and is intended for educational purposes.
