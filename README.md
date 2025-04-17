**Discussion Forum – Web-Based Q&A Platform**
This project is a full-stack web application designed to enable open, real-time discussions without requiring user authentication. Built using Angular 16 (with Angular Material) for the frontend, Node.js (TypeScript) with Express for the backend, and MySQL for data storage, it allows users to post questions, respond with answers, and like valuable replies.

**🔧 Key Features:**
Anonymous Participation: Users can browse, post, and interact without logging in.

Question Management: Create, search, filter, and view questions with tags and descriptions.

Answer Interaction: Post answers, like responses, and view replies sorted by popularity.

RESTful API: A fully structured backend with CRUD endpoints, error handling, and input validation.

Modern UI: Angular Material components and routing structure for clean navigation.

**🗂️ Frontend Highlights:**
Component-based structure: QuestionList, QuestionDetails, QuestionForm, AnswerForm, LikeButton.

Routing paths like /questions, /questions/new, and /questions/:id for seamless user flow.

**🛠️ Backend & Database:**
MySQL Schema: Two main tables—questions and answers—with relationships and timestamps.

API Endpoints for listing, creating, and reacting to questions/answers.

Includes validation rules, proper HTTP status codes, and user feedback mechanisms.

This project provides a scalable, simple-to-use platform for community-driven Q&A interactions, suitable for forums, internal team discussions, or educational use cases.
