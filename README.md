# Medi Reminder App

A complete medication reminder application with user authentication, medication management, and daily reminders.

## Features

- **User Authentication**: Secure login and registration system
- **Medication Management**: Add, view, and delete medications
- **Reminder System**: Daily medication reminders with status tracking
- **Responsive Design**: Modern, user-friendly interface
- **Real-time Updates**: Dynamic content updates without page refresh

## Technology Stack

- **Backend**: Python Flask
- **Database**: SQLite
- **Frontend**: HTML, CSS, JavaScript
- **Authentication**: JWT (JSON Web Tokens)
- **Security**: Password hashing with Werkzeug

## Project Structure

```
Sem1 IC/
├── app.py                 # Main Flask application
├── requirements.txt       # Python dependencies
├── README.md             # This file
├── templates/            # HTML templates
│   ├── index.html        # Main dashboard
│   ├── login.html        # Login page
│   └── signup.html       # Registration page
└── medication_reminder.db # SQLite database (created automatically)
```

## Installation and Setup

### Prerequisites

- Python 3.7 or higher
- pip (Python package installer)

### Step 1: Install Dependencies

1. Open a terminal/command prompt in the project directory
2. Install the required packages:

```bash
pip install -r requirements.txt
```

### Step 2: Run the Application

**Option 1: Using the startup script (Recommended)**
```bash
python start_app.py
```

**Option 2: Manual startup**
```bash
# First, initialize the database
python init_db.py

# Then start the Flask server
python app.py
```

**Option 3: Using the helper script**
```bash
python run.py
```

2. Open your web browser and navigate to:
   ```
   http://localhost:5000
   ```

## Usage

### 1. Registration
- Visit `http://localhost:5000/signup`
- Create a new account with username, email, and password
- You'll be redirected to the login page

### 2. Login
- Visit `http://localhost:5000/login`
- Enter your credentials
- Upon successful login, you'll be redirected to the main dashboard

### 3. Managing Medications
- **Add Medication**: Fill in the medication name, dosage, time, and frequency
- **View Schedule**: See all your medications in a table format
- **Delete Medication**: Click the delete button to remove medications
- **Today's Reminders**: View and mark today's medication reminders as taken

### 4. Logout
- Click the logout button in the top-right corner to sign out

## API Endpoints

### Authentication
- `POST /api/register` - User registration
- `POST /api/login` - User login

### Medications (Protected Routes)
- `GET /api/medications` - Get user's medications
- `POST /api/medications` - Add new medication
- `PUT /api/medications/<id>` - Update medication
- `DELETE /api/medications/<id>` - Delete medication

### Reminders (Protected Routes)
- `GET /api/reminders` - Get today's reminders
- `POST /api/reminders/<id>/take` - Mark reminder as taken

## Database Schema

### Users Table
- `id` (Primary Key)
- `username` (Unique)
- `email` (Unique)
- `password_hash`
- `created_at`

### Medications Table
- `id` (Primary Key)
- `user_id` (Foreign Key)
- `medication_name`
- `dosage`
- `time`
- `frequency`
- `is_active`
- `created_at`

### Reminders Table
- `id` (Primary Key)
- `medication_id` (Foreign Key)
- `user_id` (Foreign Key)
- `reminder_time`
- `is_taken`
- `created_at`

## Security Features

- **Password Hashing**: Passwords are securely hashed using Werkzeug
- **JWT Authentication**: Secure token-based authentication
- **Input Validation**: Server-side validation for all inputs
- **SQL Injection Protection**: Parameterized queries
- **CORS Support**: Cross-origin resource sharing enabled

## Customization

### Adding New Features
1. **New Medication Fields**: Modify the database schema and update the forms
2. **Reminder Frequency**: Add more frequency options in the frontend
3. **Notifications**: Integrate with browser notifications or email services
4. **Mobile App**: Create a mobile app using the existing API endpoints

### Styling
- Modify the CSS in the HTML files to change the appearance
- The app uses a green color scheme (#4CAF50) which can be customized

## Troubleshooting

### Common Issues

1. **Port Already in Use**
   - Change the port in `app.py`: `app.run(debug=True, host='0.0.0.0', port=5001)`

2. **Database Errors**
   - Delete `medication_reminder.db` and restart the application

3. **Import Errors**
   - Ensure all dependencies are installed: `pip install -r requirements.txt`

4. **CORS Issues**
   - The app includes CORS support, but if you're accessing from a different domain, you may need to configure it

## Future Enhancements

- Email notifications for medication reminders
- Mobile app development
- Medication history and analytics
- Family member access for elderly care
- Integration with pharmacy APIs
- Push notifications
- Medication interaction warnings
- Prescription image upload

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is open source and available under the MIT License.

## Support

For support or questions, please create an issue in the repository or contact the development team. # Care Cronus

Welcome to the Care Cronus project! This repository contains both the frontend and backend components for the application.

## Prerequisites

Before you begin, ensure you have the following installed on your system:

- [Node.js](https://nodejs.org/) (v18 or higher recommended) and `npm`
- [Python](https://www.python.org/) (v3.8 or higher recommended)

---

## 🏗️ Backend Setup

The backend is built with Python and FastAPI. It uses SQLite for the database.

### 1. Navigate to the backend directory

```bash
cd backend
```

### 2. Create and activate a Virtual Environment (Recommended)

**On Windows:**

```bash
python -m venv venv
venv\Scripts\activate
```

**On macOS/Linux:**

```bash
python3 -m venv venv
source venv/bin/activate
```

### 3. Install dependencies

```bash
pip install -r requirements.txt
```

### 4. Run the development server

```bash
uvicorn main:app --reload
```

The backend API will be accessible at [http://127.0.0.1:8000](http://127.0.0.1:8000).
You can also view the interactive API documentation at [http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs).

---

## 🎨 Frontend Setup

The frontend is a React application built with TypeScript, Vite, and Tailwind CSS (shadcn-ui).

### 1. Navigate to the frontend directory

Open a **new terminal window** so both frontend and backend can run simultaneously:

```bash
cd frontend
```

### 2. Install dependencies

```bash
npm install
```

### 3. Run the development server

```bash
npm run dev
```

The application will be accessible at [http://localhost:5173](http://localhost:5173).

---

## 🚀 Running Both Simultaneously

To run the application locally, you must have both the backend and frontend servers running at the same time. Open two separate command-line tabs/windows:

- **Terminal 1**: `cd backend` -> activate virtual env -> `uvicorn main:app --reload`
- **Terminal 2**: `cd frontend` -> `npm run dev`
