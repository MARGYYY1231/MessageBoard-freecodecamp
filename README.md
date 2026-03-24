## Anonymous Message Board

An anonymous message board API built as part of the FreeCodeCamp Information Security certification. This project allows users to create threads and replies without needing to register, while still maintaining moderation controls such as deletion passwords and reporting.

# Features
Create new message threads anonymously
Post replies to existing threads
Delete threads or replies using a password
Report inappropriate content
View the 10 most recent threads with their latest replies
Hide sensitive fields (like delete passwords and reports) from public responses

# Tech Stack
Backend: Node.js, Express
Database: MongoDB
Testing: Mocha & Chai
Security Concepts: Input validation, data sanitization, secure deletion logic

# Project Structure
/public     → Static frontend files (CSS, client-side JavaScript)  
/routes     → API route handlers  
/tests      → Functional and unit tests  
/views      → HTML pages / templates  
server.js   → Entry point of the application 

# API Endpoints
Threads
POST /api/threads/{board}
Create a new thread
GET /api/threads/{board}
Get the 10 most recent threads (with up to 3 replies each)
DELETE /api/threads/{board}
Delete a thread (requires thread_id and delete_password)
PUT /api/threads/{board}
Report a thread
Replies
POST /api/replies/{board}
Add a reply to a thread
GET /api/replies/{board}
Get a thread and all its replies
DELETE /api/replies/{board}
Delete a reply (requires thread_id, reply_id, and delete_password)
PUT /api/replies/{board}
Report a reply

# Security Considerations
Passwords are never exposed in API responses
Report flags are hidden from users
Sensitive fields are removed before sending data to clients
Basic protection against malicious input

# Running Tests

To run the test suite:

npm install
npm test

# Running the Project Locally
npm install
npm start

The server will run on:

http://localhost:3000

# What I Learned
Building RESTful APIs with Express
Structuring a backend project cleanly
Working with MongoDB and schemas
Implementing basic security practices
Writing and running backend tests

# Project Status

 Ongoing — currently redesigning the layout to enhance usability, accessibility, and overall user experience.

# Acknowledgements
FreeCodeCamp for the project guidelines and testing suite

This is the boilerplate for the Anonymous Message Board project. Instructions for completing your project can be found at https://www.freecodecamp.org/learn/information-security/information-security-projects/anonymous-message-board
