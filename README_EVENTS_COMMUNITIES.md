# Events & Communities Module - CATCHOPP

## Developer Information
**Developer**: Islem  
**Branch**: islem-branch  
**Module**: Events & Communities (Module 5)  
**Academic Year**: 2025-2026  
**Program**: PIDEV – 4SAE7  
**Institution**: Esprit School of Engineering – Tunisia

---

## Overview

This module implements a comprehensive Events & Communities management system for the CATCHOPP platform. It enables users to create and manage groups, clubs, and events while fostering community engagement through posts, reactions, and notifications.

## Module Components

### Backend - Community Microservice
**Technology Stack**: Java 17, Spring Boot 3.x, MySQL 8.0  
**Port**: 8089  
**Base URL**: `http://localhost:8089/api`

### Frontend - Interfaces Events
**Technology Stack**: Angular 15+, TypeScript, Bootstrap 5  
**Location**: `FrontFreelanceApp/src/app/interfaces_events/`

---

## Features Implemented

### 1. Groups Management
#### Backend Features
- ✅ Create, Read, Update, Delete (CRUD) operations
- ✅ Group types: PUBLIC, PRIVATE, INVITATION_ONLY
- ✅ Group member management with roles (ADMIN, MODERATOR, MEMBER)
- ✅ Group search and filtering

#### Frontend Features
- ✅ Group list with grid/list view toggle
- ✅ Group creation and editing forms
- ✅ Group detail pages with banner and description
- ✅ Member management interface
- ✅ Join/Leave group functionality
- ✅ Group wall for posts and announcements

**Key Files**:
- Backend: `GroupController.java`, `GroupService.java`, `GroupRepository.java`, `Group.java`
- Frontend: `group-list.component.ts`, `group-page.component.ts`, `group.service.ts`

---

### 2. Clubs Management
#### Backend Features
- ✅ Full CRUD operations for clubs
- ✅ Club status management (ACTIVE/PAUSED)
- ✅ Pause/Unpause functionality
- ✅ Club member tracking
- ✅ Club-specific posts isolation

#### Frontend Features
- ✅ Clubs list with search and filters
- ✅ Club dashboard for administrators
- ✅ Club creation and editing
- ✅ Pause/Unpause buttons with status badges
- ✅ Dynamic club pages
- ✅ Club-specific post feeds
- ✅ Grid and list view modes

**Key Files**:
- Backend: `ClubController.java`, `ClubService.java`, `ClubRepository.java`, `Club.java`
- Frontend: `clubs-list.component.ts`, `club.component.ts`, `club-dashboard.component.ts`, `club.service.ts`

**API Endpoints**:
```
GET    /api/clubs              - Get all clubs
POST   /api/clubs              - Create a new club
GET    /api/clubs/{id}         - Get club by ID
PUT    /api/clubs/{id}         - Update club
DELETE /api/clubs/{id}         - Delete club
PUT    /api/clubs/{id}/pause   - Pause a club
PUT    /api/clubs/{id}/unpause - Unpause a club
```

---

### 3. Events Management
#### Backend Features
- ✅ Event CRUD operations
- ✅ Event status management (APPROVED, PENDING, REJECTED)
- ✅ Event-group associations
- ✅ Event-club associations
- ✅ Attendee tracking

#### Frontend Features
- ✅ Events calendar view
- ✅ Events list with filters
- ✅ Event creation and editing
- ✅ Dedicated event details page
- ✅ Join/Unjoin event functionality (changed from "Attend" to "Join")
- ✅ Event status badges
- ✅ Automatic event creation templates

**Key Files**:
- Backend: `EventController.java`, `EventService.java`, `EventRepository.java`, `Event.java`
- Frontend: `events-list.component.ts`, `event-details.component.ts`, `event.service.ts`

**API Endpoints**:
```
GET    /api/events           - Get all events
POST   /api/events           - Create a new event
GET    /api/events/{id}      - Get event by ID
PUT    /api/events/{id}      - Update event
DELETE /api/events/{id}      - Delete event
```

---

### 4. Posts & Interactions
#### Backend Features
- ✅ Post CRUD operations
- ✅ Group-specific posts
- ✅ Club-specific posts (isolated from group posts)
- ✅ Post reactions (LIKE, LOVE, HAHA, WOW, SAD, ANGRY)
- ✅ Comments system
- ✅ Comment reactions

#### Frontend Features
- ✅ Post creation and editing
- ✅ Post feed for groups
- ✅ Separate post feed for clubs
- ✅ Reaction buttons with counts
- ✅ Comments section
- ✅ Comment reactions
- ✅ Real-time interaction updates

**Key Files**:
- Backend: `PostController.java`, `PostService.java`, `ReactionController.java`, `CommentController.java`
- Frontend: `post.service.ts`, `post-reactions.component.ts`, `post-comments.component.ts`, `comment-reactions.component.ts`

**API Endpoints**:
```
GET    /api/posts                  - Get all posts
POST   /api/posts                  - Create a new post
GET    /api/posts/group/{groupId}  - Get posts by group
GET    /api/posts/club/{clubId}    - Get posts by club
POST   /api/reactions              - Add reaction to post
POST   /api/comments               - Add comment to post
POST   /api/comment-reactions      - Add reaction to comment
```

---

### 5. Notifications System
#### Features
- ✅ Real-time toast notifications
- ✅ Notification bell with unread count
- ✅ Notification types: event, club, group, post
- ✅ Importance levels: normal, high
- ✅ Mark as read functionality
- ✅ Notification history

**Key Files**:
- Frontend: `notification.service.ts`, `notification-bell.component.ts`, `notification-toast.component.ts`

---

### 6. Admin Dashboard
#### Features
- ✅ Overview statistics (active groups, total clubs, events this month)
- ✅ Groups management section
- ✅ Clubs management section with pause/unpause
- ✅ Events calendar
- ✅ Recent activities log
- ✅ Announcements management
- ✅ Posts moderation
- ✅ Multiple view modes (grid/list)
- ✅ Search and filter functionality

**Key Files**:
- Frontend: `admin-dashboard.component.ts`, `club-dashboard.component.ts`

---

## Database Schema

### Main Entities

#### Group
```sql
- id (Long, Primary Key)
- name (String)
- description (String)
- type (Enum: PUBLIC, PRIVATE, INVITATION_ONLY)
- bannerUrl (String)
- createdAt (LocalDateTime)
```

#### Club
```sql
- id (Long, Primary Key)
- name (String)
- description (String)
- interests (String)
- bannerUrl (String)
- status (Enum: ACTIVE, PAUSED)
- membersCount (Integer)
- eventsCount (Integer)
- createdAt (LocalDateTime)
```

#### Event
```sql
- id (Long, Primary Key)
- title (String)
- description (String)
- location (String)
- startDate (LocalDateTime)
- endDate (LocalDateTime)
- status (Enum: APPROVED, PENDING, REJECTED)
- groupId (Long, Foreign Key)
- clubId (Long, Foreign Key)
```

#### Post
```sql
- id (Long, Primary Key)
- content (String)
- authorId (Long)
- groupId (Long, Foreign Key, nullable)
- clubId (Long, Foreign Key, nullable)
- createdAt (LocalDateTime)
```

#### Reaction
```sql
- id (Long, Primary Key)
- type (Enum: LIKE, LOVE, HAHA, WOW, SAD, ANGRY)
- userId (Long)
- postId (Long, Foreign Key)
- createdAt (LocalDateTime)
```

#### Comment
```sql
- id (Long, Primary Key)
- content (String)
- authorId (Long)
- postId (Long, Foreign Key)
- createdAt (LocalDateTime)
```

---

## Project Structure

```
CATCHOPP/
├── CatchOPP/CommunityMicroService/
│   └── src/main/java/tn/esprit/communitymicroservice/
│       ├── controllers/
│       │   ├── ClubController.java
│       │   ├── EventController.java
│       │   ├── GroupController.java
│       │   ├── GroupMemberController.java
│       │   ├── PostController.java
│       │   ├── ReactionController.java
│       │   ├── CommentController.java
│       │   └── CommentReactionController.java
│       ├── services/
│       │   ├── ClubService.java
│       │   ├── EventService.java
│       │   ├── GroupService.java
│       │   ├── GroupMemberService.java
│       │   ├── PostService.java
│       │   ├── ReactionService.java
│       │   ├── CommentService.java
│       │   └── CommentReactionService.java
│       ├── repositories/
│       │   ├── ClubRepository.java
│       │   ├── EventRepository.java
│       │   ├── GroupRepository.java
│       │   ├── GroupMemberRepository.java
│       │   ├── PostRepository.java
│       │   ├── ReactionRepository.java
│       │   ├── CommentRepository.java
│       │   └── CommentReactionRepository.java
│       ├── entities/
│       │   ├── Club.java
│       │   ├── Event.java
│       │   ├── EventStatus.java
│       │   ├── Group.java
│       │   ├── GroupType.java
│       │   ├── GroupMember.java
│       │   ├── Role.java
│       │   ├── Post.java
│       │   ├── Reaction.java
│       │   ├── ReactionType.java
│       │   ├── Comment.java
│       │   └── CommentReaction.java
│       ├── dto/
│       │   └── PostWithInteractionsDTO.java
│       └── config/
│           └── CorsConfig.java
│
└── FrontFreelanceApp/src/app/interfaces_events/
    ├── admin-dashboard/
    ├── club-dashboard/
    ├── club/
    ├── clubs-list/
    ├── event-details/
    ├── events-list/
    ├── group-list/
    ├── group-page/
    ├── notification-bell/
    ├── notification-toast/
    ├── post-comments/
    ├── post-reactions/
    ├── comment-reactions/
    ├── models.ts
    ├── club.service.ts
    ├── event.service.ts
    ├── group.service.ts
    ├── group-member.service.ts
    ├── post.service.ts
    ├── reaction.service.ts
    ├── comment.service.ts
    ├── comment-reaction.service.ts
    ├── notification.service.ts
    └── api.config.ts
```

---

## Installation & Setup

### Backend Setup

1. Navigate to Community Microservice:
```bash
cd CatchOPP/CommunityMicroService
```

2. Configure database in `application.properties`:
```properties
spring.datasource.url=jdbc:mysql://localhost:3306/catchopp_community
spring.datasource.username=root
spring.datasource.password=your_password
spring.jpa.hibernate.ddl-auto=update
server.port=8089
```

3. Run the microservice:
```bash
mvn clean install
mvn spring-boot:run
```

### Frontend Setup

1. Navigate to frontend:
```bash
cd FrontFreelanceApp
```

2. Install dependencies:
```bash
npm install
```

3. Configure API endpoint in `src/app/interfaces_events/api.config.ts`:
```typescript
export const API_BASE_URL = 'http://localhost:8089/api';
```

4. Run the application:
```bash
ng serve
```

Access the application at `http://localhost:4200`

---

## Key Improvements & Innovations

### 1. Club Pause/Unpause Feature
- Administrators can temporarily pause clubs without deleting them
- Status badges (ACTIVE/PAUSED) displayed on all club cards
- Notifications sent when club status changes
- Activity log entries for pause/unpause actions

### 2. Separate Post Systems
- Groups and clubs maintain completely isolated post collections
- Posts are filtered by `group_id` or `club_id`
- Each community type has its own independent feed
- Prevents cross-contamination of content

### 3. Enhanced Event System
- Changed terminology from "Attend" to "Join" for better UX
- Dedicated event details page instead of modal
- Full event information with hero section
- Responsive design with gradient styling
- Share functionality with clipboard fallback

### 4. Comprehensive Notification System
- Toast notifications for immediate feedback
- Notification bell with unread count
- Multiple notification types and importance levels
- Persistent notification history

### 5. Admin Dashboard
- Centralized management interface
- Real-time statistics and analytics
- Activity logging system
- Multiple view modes (grid/list)
- Advanced search and filtering

---

## API Documentation

Complete API documentation is available in:
- [API_DOCUMENTATION_EVENTS_COMMUNITIES.md](CatchOPP/CommunityMicroService/API_DOCUMENTATION_EVENTS_COMMUNITIES.md)

---

## Testing

### Backend Tests
```bash
cd CatchOPP/CommunityMicroService
mvn test
```

### Frontend Tests
```bash
cd FrontFreelanceApp
ng test --include='**/interfaces_events/**/*.spec.ts'
```

---

## Challenges & Solutions

### Challenge 1: Post Isolation
**Problem**: Groups and clubs were sharing the same post feed  
**Solution**: Added `club_id` field to Post entity and created separate endpoints for club posts

### Challenge 2: Event Terminology
**Problem**: "Attend" terminology was confusing for users  
**Solution**: Changed all references to "Join/Joining" throughout the application

### Challenge 3: Club Management
**Problem**: Deleting clubs permanently removed all data  
**Solution**: Implemented pause/unpause functionality to temporarily disable clubs

---

## Future Enhancements

- [ ] Real-time chat integration for groups and clubs
- [ ] Advanced analytics dashboard
- [ ] Email notifications for events
- [ ] Mobile responsive improvements
- [ ] Event reminder system
- [ ] Group/Club invitation system
- [ ] Advanced search with filters
- [ ] Export functionality for reports

---

## Documentation Files

- `API_DOCUMENTATION_EVENTS_COMMUNITIES.md` - Complete API reference
- `SETUP_GUIDE.md` - Detailed setup instructions
- `RESTART_BACKEND.md` - Backend restart procedures
- `DATABASE_FIX_DESCRIPTION.sql` - Database schema and fixes

---

## Academic Context

This module was developed as part of the PIDEV (Projet Intégré de Développement) for the 4th year Software Engineering program at Esprit School of Engineering.

**Project Name**: CATCHOPP  
**Module**: Events & Communities (Module 5)  
**Developer**: Islem  
**Branch**: islem-branch  
**Academic Year**: 2025-2026  
**Class**: 4SAE7

---

## Acknowledgments

- Esprit School of Engineering for the academic framework
- Project supervisors for guidance and support
- Team members for collaboration
- Community for feedback and testing

---

**Note**: This README documents the Events & Communities module implementation on the `islem-branch`. For the complete project documentation, see the main README on the `main` branch.
