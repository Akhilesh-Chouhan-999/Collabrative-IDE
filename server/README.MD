Database Models : 
---------------

USER 👤
ROOM 🏠
MESSAGE 💬
(Optional) ALLROOMS 📋

🔗 Relations Between Schemas :
1. USER 👤

Creates rooms → roomCreatedByMe

Joins rooms → roomJoinedByMe

Sends messages (through the author field in MESSAGE)

Has tokens for authentication

👉 Meaning: Users are the main actors. They can host coding rooms, join others’ rooms, and chat inside them.

2. ROOM 🏠

Created by an admin (admin.id → reference to USER)

Contains multiple messages (messages → references to MESSAGE)

Has language & code fields (the actual IDE content)

Tracks when it was created (time1 or timestamps)

👉 Meaning: A room is like a “shared coding space” where people collaborate.

3. MESSAGE 💬

Sent by an author (author.id → reference to USER)

Belongs to a room (messages array in ROOM)

Has text and time

👉 Meaning: Messages are for real-time chat or comments while coding.

4. ALLROOMS 📋 (Optional)

Contains references to all rooms.


Functionalities : 
--------------------


USER
 ├── roomCreatedByMe [ROOM]
 ├── roomJoinedByMe  [ROOM]
 └── messages (through MESSAGE.author)

ROOM
 ├── admin → USER
 ├── messages → [MESSAGE]
 └── code, language

MESSAGE
 ├── author → USER
 └── belongsTo → ROOM


🛠️ Functionality Flow in Collaborative IDE :
------------------------------------------------

User Registration/Login

Password is hashed (pre('save'))

JWT token is generated (generateAuthToken)

Room Creation

A user creates a room → stored in roomCreatedByMe

User becomes admin of the room

Room Joining

Other users join the room → stored in roomJoinedByMe

Collaboration

Room contains code (live code editor state)

Users can update code in real time (handled by sockets, not schema)

Chat/messages stored in MESSAGE, referenced by ROOM.messages

Messaging

A user sends a message → creates a MESSAGE with author.id

Message ID is pushed into the ROOM.messages array

✅ So basically:

USER ↔ ROOM = who created/joined which room
ROOM ↔ MESSAGE = messages inside a room
USER ↔ MESSAGE = who sent which message

------------------------------------------------------------------------------
| Feature               | Route                    | Status                  |
| --------------------- | ------------------------ | ----------------------- |
| Register              | `/register`              | ✅ Done                 |
| Login                 | `/login`                 | ✅ Done                 |
| Logout                | `/logout`                | ✅ Done                 |
| Fetch user rooms      | `/roomsforuser`          | ✅ Done                 |
| Fetch a specific room | `/inaroom/:roomId`       |  ✅ Done |
| Create room           | `/rooms/create`          | ✅ Done                 |
| Join room             | `/rooms/join`            | ✅ Done                 |
| Leave room            | `/rooms/leave`           |  ✅ Done                |
------------------------------------------------------------------------------