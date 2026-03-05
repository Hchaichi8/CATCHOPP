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
- CORS configuration
- Microservices architecture

## Architecture

The application follows a microservices architecture with:
- **Frontend**: Angular SPA (Single Page Application)
- **Backend Microservices**:
  - Community Microservice (Groups, Clubs, Events, Posts)
  - Project Microservice (Freelance management)
- **Database**: MySQL with separate schemas per microservice

## Contributors

This project was developed by a team of 4th year engineering students at Esprit School of Engineering:
- [Add team member names here]

## Academic Context

**Developed at Esprit School of Engineering – Tunisia**  
PIDEV – 4SAE7 | 2025–2026

**Supervised by**: [Add supervisor name]

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
spring.datasource.url=jdbc:mysql://localhost:3306/catchopp_community
spring.datasource.username=your_username
spring.datasource.password=your_password
```

4. Run Community Microservice:
```bash
cd CatchOPP/CommunityMicroService
mvn clean install
mvn spring-boot:run
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

3. Update API configuration in `src/app/interfaces_events/api.config.ts`:
```typescript
export const API_BASE_URL = 'http://localhost:8089/api';
```

4. Run the development server:
```bash
ng serve
```

The application will be available at `http://localhost:4200`

## API Documentation

Detailed API documentation is available in:
- [Community Microservice API Documentation](CatchOPP/CommunityMicroService/API_DOCUMENTATION_EVENTS_COMMUNITIES.md)

### Key Endpoints

#### Groups
- `GET /api/groups` - Get all groups
- `POST /api/groups` - Create a new group
- `PUT /api/groups/{id}` - Update a group
- `DELETE /api/groups/{id}` - Delete a group

#### Clubs
- `GET /api/clubs` - Get all clubs
- `POST /api/clubs` - Create a new club
- `PUT /api/clubs/{id}/pause` - Pause a club
- `PUT /api/clubs/{id}/unpause` - Unpause a club

#### Events
- `GET /api/events` - Get all events
- `POST /api/events` - Create a new event
- `PUT /api/events/{id}` - Update an event

#### Posts
- `GET /api/posts/group/{groupId}` - Get posts by group
- `GET /api/posts/club/{clubId}` - Get posts by club
- `POST /api/posts` - Create a new post

## Project Structure

```
CATCHOPP/
├── CatchOPP/
│   ├── CommunityMicroService/
│   │   ├── src/main/java/tn/esprit/communitymicroservice/
│   │   │   ├── controllers/
│   │   │   ├── services/
│   │   │   ├── repositories/
│   │   │   ├── entities/
│   │   │   └── config/
│   │   └── pom.xml
│   └── ProjectMicroService/
└── FrontFreelanceApp/
    ├── src/app/
    │   ├── interfaces_events/
    │   ├── Interfaces_Client/
    │   ├── Interfaces_Freelancers/
    │   └── Interfaces_Authentification/
    └── package.json
```

## Key Features Implementation

### Club Management
- Clubs can be paused/unpaused by administrators
- Status badges (ACTIVE/PAUSED) displayed on all club cards
- Notifications sent when club status changes

### Separate Post Systems
- Groups have their own isolated post collection
- Clubs maintain independent post feeds
- Posts are filtered by `group_id` or `club_id`

### Event System
- Events use "Join" terminology instead of "Attend"
- Dedicated event details page with full information
- Event status management (APPROVED, PENDING, REJECTED)

### Notification System
- Real-time toast notifications
- Notification bell with unread count
- Activity logging in admin dashboard

## Testing

Run backend tests:
```bash
cd CatchOPP/CommunityMicroService
mvn test
```

Run frontend tests:
```bash
cd FrontFreelanceApp
ng test
```

## Deployment

The application can be deployed using:
- **Frontend**: Vercel, Netlify, or GitHub Pages
- **Backend**: Heroku, AWS, or DigitalOcean
- **Database**: MySQL on cloud providers (AWS RDS, DigitalOcean)

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
