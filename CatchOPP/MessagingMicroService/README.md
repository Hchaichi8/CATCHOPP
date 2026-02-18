# MessagingMicroService — Module Messagerie & Support Technique

## Description

Ce microservice Spring Boot gère les modules **Messagerie** et **Support Technique** de la plateforme CatchOPP. Il fournit des APIs RESTful pour la gestion des conversations de messagerie et des tickets de support technique.

Le microservice est conçu pour fonctionner dans une architecture microservices avec :
- **Eureka** pour le service discovery
- **Spring Cloud Config** pour la configuration centralisée
- **MySQL** comme base de données relationnelle

---

## Stack Technique

| Technologie | Version |
|---|---|
| Spring Boot | 4.0.2 |
| Java | 17 |
| Spring Data JPA | inclus |
| MySQL | Runtime |
| Lombok | inclus |
| Spring Cloud | 2025.1.0 |
| Eureka Client | inclus |

---

## Architecture du Projet

```
MessagingMicroService/
├── pom.xml
└── src/main/java/org/example/messagingmicroservice/
    ├── MessagingMicroServiceApplication.java
    ├── Controllers/
    │   ├── ConversationController.java
    │   ├── MessageController.java
    │   ├── SupportTicketController.java
    │   └── SupportMessageController.java
    ├── Entities/
    │   ├── Conversation.java
    │   ├── ConversationParticipant.java
    │   ├── ConversationType.java          (enum)
    │   ├── Message.java
    │   ├── SupportTicket.java
    │   ├── SupportMessage.java
    │   ├── TicketStatus.java              (enum)
    │   └── TicketPriority.java            (enum)
    ├── Repositories/
    │   ├── ConversationRepository.java
    │   ├── ConversationParticipantRepository.java
    │   ├── MessageRepository.java
    │   ├── SupportTicketRepository.java
    │   └── SupportMessageRepository.java
    └── Services/
        ├── ConversationService.java
        ├── MessageService.java
        ├── SupportTicketService.java
        └── SupportMessageService.java
```

---

## Entités et Relations

### Module Messagerie

#### Conversation
Représente un chat entre deux utilisateurs (DIRECT) ou un groupe (GROUP).

| Champ | Type | Description |
|---|---|---|
| `id` | Long | Identifiant unique (auto-généré) |
| `type` | ConversationType | DIRECT ou GROUP |
| `createdAt` | LocalDateTime | Date de création (auto-rempli) |
| `updatedAt` | LocalDateTime | Date de dernière mise à jour (auto-rempli) |
| `lastMessageAt` | LocalDateTime | Date du dernier message envoyé |
| `lastMessagePreview` | String (500) | Aperçu du dernier message (max 100 caractères) |
| `deleted` | boolean | Soft delete (false par défaut) |

**Relations :**
- `@OneToMany` → `Message` (mappedBy "conversation")
- `@OneToMany` → `ConversationParticipant` (mappedBy "conversation")

#### ConversationParticipant
Lie un utilisateur à une conversation.

| Champ | Type | Description |
|---|---|---|
| `id` | Long | Identifiant unique |
| `userId` | Long | Référence à l'utilisateur |
| `joinedAt` | LocalDateTime | Date d'ajout (auto-rempli) |

**Relations :**
- `@ManyToOne` → `Conversation`

#### Message
Un message envoyé dans une conversation.

| Champ | Type | Description |
|---|---|---|
| `id` | Long | Identifiant unique |
| `senderId` | Long | Référence à l'expéditeur |
| `content` | TEXT | Contenu du message |
| `createdAt` | LocalDateTime | Date de création (auto-rempli) |
| `updatedAt` | LocalDateTime | Date de mise à jour (auto-rempli) |

**Relations :**
- `@ManyToOne` → `Conversation`

---

### Module Support Technique

#### SupportTicket
Demande d'assistance créée par un utilisateur.

| Champ | Type | Description |
|---|---|---|
| `id` | Long | Identifiant unique |
| `createdBy` | Long | Référence au créateur |
| `subject` | String | Sujet du ticket |
| `description` | TEXT | Description du problème |
| `status` | TicketStatus | OPEN, IN_PROGRESS, RESOLVED, CLOSED (défaut: OPEN) |
| `priority` | TicketPriority | LOW, MEDIUM, HIGH (défaut: MEDIUM) |
| `createdAt` | LocalDateTime | Date de création (auto-rempli) |
| `updatedAt` | LocalDateTime | Date de mise à jour (auto-rempli) |
| `deleted` | boolean | Soft delete (false par défaut) |

**Relations :**
- `@OneToMany` → `SupportMessage` (mappedBy "supportTicket")

#### SupportMessage
Message échangé dans le cadre d'un ticket de support.

| Champ | Type | Description |
|---|---|---|
| `id` | Long | Identifiant unique |
| `senderId` | Long | Référence à l'expéditeur |
| `content` | TEXT | Contenu du message |
| `createdAt` | LocalDateTime | Date de création (auto-rempli) |

**Relations :**
- `@ManyToOne` → `SupportTicket`

---

## API Endpoints

### Conversation — `/api/conversations`

| Méthode | Endpoint | Description | Body (JSON) |
|---|---|---|---|
| `POST` | `/api/conversations` | Créer une conversation | `{ "type": "DIRECT", "participantUserIds": [1, 2] }` |
| `GET` | `/api/conversations/{id}` | Obtenir une conversation par ID | — |
| `GET` | `/api/conversations/user/{userId}` | Lister les conversations d'un utilisateur | — |
| `GET` | `/api/conversations/{id}/participants` | Lister les participants | — |
| `PUT` | `/api/conversations/{id}` | Mettre à jour une conversation | `{ "type": "GROUP" }` |
| `DELETE` | `/api/conversations/{id}` | Supprimer (soft delete) | — |

### Message — `/api/messages`

| Méthode | Endpoint | Description | Body (JSON) |
|---|---|---|---|
| `POST` | `/api/messages` | Envoyer un message | `{ "conversationId": 1, "senderId": 1, "content": "Bonjour" }` |
| `GET` | `/api/messages/{conversationId}` | Messages d'une conversation (triés par date) | — |
| `PUT` | `/api/messages/{id}` | Modifier un message | `{ "content": "Nouveau contenu" }` |
| `DELETE` | `/api/messages/{id}` | Supprimer un message | — |

### SupportTicket — `/api/support/tickets`

| Méthode | Endpoint | Description | Body (JSON) |
|---|---|---|---|
| `POST` | `/api/support/tickets` | Créer un ticket | `{ "createdBy": 1, "subject": "Bug", "description": "...", "priority": "HIGH" }` |
| `GET` | `/api/support/tickets/{id}` | Obtenir un ticket par ID | — |
| `GET` | `/api/support/tickets/user/{userId}` | Lister les tickets d'un utilisateur | — |
| `PUT` | `/api/support/tickets/{id}` | Mettre à jour (statut, priorité) | `{ "status": "IN_PROGRESS", "priority": "HIGH" }` |
| `DELETE` | `/api/support/tickets/{id}` | Supprimer (soft delete) | — |

### SupportMessage — `/api/support/messages`

| Méthode | Endpoint | Description | Body (JSON) |
|---|---|---|---|
| `POST` | `/api/support/messages` | Ajouter un message au ticket | `{ "ticketId": 1, "senderId": 1, "content": "Détails..." }` |
| `GET` | `/api/support/messages/{ticketId}` | Messages d'un ticket (triés par date) | — |
| `DELETE` | `/api/support/messages/{id}` | Supprimer un message | — |

---

## Configuration

Le microservice tourne sur le **port 8083** et se connecte à :
- **MySQL** : `jdbc:mysql://localhost:3306/catchop_messaging_db` (auto-créé)
- **Eureka** : `http://localhost:8761/eureka/`
- **Config Server** : optionnel

### `application.properties`

```properties
spring.application.name=MessagingMicroService
server.port=8083
spring.config.import=optional:configserver:
spring.datasource.url=jdbc:mysql://localhost:3306/catchop_messaging_db?createDatabaseIfNotExist=true
spring.datasource.username=root
spring.datasource.password=
spring.jpa.hibernate.ddl-auto=update
spring.jpa.show-sql=true
eureka.client.service-url.defaultZone=http://localhost:8761/eureka/
```

---

## Démarrage

1. S'assurer que **MySQL** est en cours d'exécution sur `localhost:3306`
2. S'assurer qu'**Eureka Server** est démarré sur `localhost:8761` (optionnel mais recommandé)
3. Lancer le microservice :

```bash
cd MessagingMicroService
../mvnw.cmd spring-boot:run
```

Le service sera accessible sur `http://localhost:8083`.

---

## Fonctionnalités Avancées Implémentées

- **Soft Delete** : Les conversations et tickets de support sont marqués comme supprimés (`deleted = true`) au lieu d'être physiquement supprimés de la base de données.
- **Auto-timestamping** : Les champs `createdAt` et `updatedAt` sont automatiquement remplis via `@PrePersist` et `@PreUpdate`.
- **Aperçu du dernier message** : Lors de l'envoi d'un message, la conversation est automatiquement mise à jour avec `lastMessageAt` et un aperçu tronqué à 100 caractères.
- **Defaults intelligents** : Les tickets sont créés avec le statut `OPEN` et la priorité `MEDIUM` par défaut.
- **CORS activé** : Tous les contrôleurs utilisent `@CrossOrigin(origins = "*")` pour permettre les appels depuis le frontend Angular.
- **Mises à jour partielles** : Les endpoints `PUT` ne mettent à jour que les champs fournis (les champs `null` sont ignorés).
