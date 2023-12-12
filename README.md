<h1 align='center'>Routine App - API Overview</h1>

# Description

Routine App API serves as the backbone of the application [Routine App](https://github.com/mayerprog/routine-app-ui-bll), facilitating all backend processes that power the app's core functionalities. It is meticulously designed to manage user authentication, task operations, and notification scheduling, ensuring a seamless and intuitive user experience.

### **API Features and Endpoints:**

#### **User Authentication:**

- `POST /users/login`: Authenticate users with a username and password.
- `POST /users/logout`: Log users out and end their session.
- `POST /users/register`: Register a new user account.
- `POST /users/updateToken`: Update token to make sure notifications are to be sent to a right device.

#### **Task Management:**

- `GET /tasks/getAll`: Retrieve a list of tasks for the logged-in user.
- `POST /tasks/createTask`: Create a new task with title, description, mediafiles and scheduled times for notifications.
- `PUT /tasks/updateTask/:id`: Update an existing task.
- `DELETE /tasks/deleteOne/:id`: Remove a task from the user's list (+remove files from local server and scheduled time from queue).

#### **Media File Handling:**

- Static directory setup for media uploads (`/uploads`), allowing retrieval and storage of user-uploaded files.

#### **Notification System:**

- Integrates with `bull` queue for job scheduling to send notifications.
- Utilizes custom notification helper functions to manage the delivery of task reminders to users.

### **Server Configuration:**

- Server built with `express.js`, running on port 3000.
- Database connections managed with `mongoose`, connecting to a MongoDB instance.
- Environment variables are configured and managed securely.

### **Database Interaction:**

- MongoDB is utilized for storing user and task data, with models defined in separate schema files.
- Database connection and error handling are set up to ensure stable operations.

### **Upcoming Features**

- #### **Social Media Authorization**
- #### **Flexible Notification Settings (daily, weekly, or on chosen weekdays)**
- #### **Document Support**
- #### **Social Sharing (the ability to share routines with friends on social platforms like Facebook)**

# Get Started

- Clone the repository with `git clone https://github.com/mayerprog/routine-app-api`
- Install dependencies `yarn install`
- Run `yarn start` to run the project on Expo Go app

## Tecnologies

- Express.js
- Mongoose
- Passport.js
- Express-Session
- Bull
- Multer
- Expo Server SDK

## Contacts

<p>Mayra Tulegenova</p>

- Telegram: [mayerprog](https://t.me/mayerprog)
- Email: [supermayerehs@gmail.com](supermayerehs@gmail.com)
