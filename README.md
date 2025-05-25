# Yambo Studio Dashboard

A comprehensive project management dashboard for creative studios, featuring artist booking management, project tracking, and financial oversight.

## 🚀 Features

- **Interactive Gantt Chart** - Drag-and-drop interface for managing artist bookings across projects
- **Project Management** - Track active, completed, and upcoming projects with progress visualization
- **Artist Database** - Manage artist profiles, skills, rates, and availability
- **Financial Tracking** - Real-time budget calculations, expenses, and profit/loss analysis
- **Multi-Currency Support** - Built-in currency converter for international projects
- **Dark Mode** - Toggle between light and dark themes
- **Real-time Updates** - Firebase-powered synchronization across all users
- **Responsive Design** - Optimized for desktop and mobile devices

## 🛠 Tech Stack

- **Frontend Framework**: React 18.3.1
- **UI Components**: Material-UI (MUI) v6
- **State Management**: React Context API
- **Database**: Firebase Realtime Database
- **Authentication**: Firebase Auth
- **Routing**: React Router v6
- **Drag & Drop**: react-dnd
- **Charts**: Recharts, D3.js
- **Date Handling**: date-fns, moment.js
- **Styling**: Emotion (CSS-in-JS)
- **Build Tool**: Create React App

## 📋 Prerequisites

- Node.js (v14.0.0 or higher)
- npm (v6.0.0 or higher)
- Firebase account with Realtime Database enabled
- Modern web browser (Chrome, Firefox, Safari, Edge)

## 🔧 Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/yambo-studio-dashboard.git
   cd yambo-studio-dashboard
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure Firebase**
   - Create a Firebase project at [console.firebase.google.com](https://console.firebase.google.com)
   - Enable Authentication (Email/Password provider)
   - Enable Realtime Database
   - Update `src/firebase.js` with your Firebase configuration

4. **Start the development server**
   ```bash
   npm start
   ```

5. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## 🚦 Usage

### Getting Started

1. **Sign Up/Login**
   - Create an account or login with existing credentials
   - Authentication is required to access the dashboard

2. **Dashboard Overview**
   - View project statistics and currently booked artists
   - Access quick tools: Calculator and Currency Exchange
   - Navigate between different views using the header menu

3. **Managing Projects**
   - **Add Project**: Click "Add Project" in the Database view
   - **Edit Project**: Click on any project to modify details
   - **Track Progress**: View real-time progress bars and delivery dates
   - **Financial Analysis**: Monitor budget vs. expenses automatically

4. **Artist Management**
   - **Add Artist**: Use the "Add Artist" button in Database view
   - **Set Rates**: Define daily rates for accurate cost calculations
   - **Track Availability**: See which artists are currently booked
   - **Manage Skills**: Add skills and specialties for better project matching

5. **Gantt Chart**
   - **Drag & Drop**: Move bookings between dates and projects
   - **Resize Bookings**: Adjust booking duration by dragging edges
   - **Visual Timeline**: See all project timelines at a glance
   - **Artist Workload**: View artist availability across all projects

## 📁 Project Structure

```
yambo-studio-dash-v1/
├── public/
│   ├── assets/          # Static assets (images, icons)
│   ├── fonts/           # Custom fonts
│   └── index.html       # HTML template
├── src/
│   ├── components/      # Reusable React components
│   │   ├── Auth/        # Authentication components
│   │   ├── Database/    # Database view components
│   │   ├── Forms/       # Form components
│   │   ├── Gantt/       # Gantt chart components
│   │   └── common/      # Shared components
│   ├── contexts/        # React Context providers
│   ├── hooks/           # Custom React hooks
│   ├── pages/           # Page components
│   ├── styles/          # Theme and global styles
│   ├── utils/           # Utility functions
│   ├── App.js           # Main application component
│   ├── firebase.js      # Firebase configuration
│   └── index.js         # Application entry point
└── package.json         # Project dependencies
```

## 🔐 Environment Variables

Create a `.env` file in the root directory:

```env
REACT_APP_FIREBASE_API_KEY=your_api_key
REACT_APP_FIREBASE_AUTH_DOMAIN=your_auth_domain
REACT_APP_FIREBASE_DATABASE_URL=your_database_url
REACT_APP_FIREBASE_PROJECT_ID=your_project_id
REACT_APP_FIREBASE_STORAGE_BUCKET=your_storage_bucket
REACT_APP_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
REACT_APP_FIREBASE_APP_ID=your_app_id
```

## 🧪 Available Scripts

- `npm start` - Run development server
- `npm build` - Build for production
- `npm test` - Run test suite
- `npm eject` - Eject from Create React App (irreversible)

## 🐛 Troubleshooting

### Common Issues

1. **Firebase Connection Error**
   - Verify Firebase configuration in `src/firebase.js`
   - Check Firebase project settings and database rules
   - Ensure Realtime Database is enabled in your region

2. **Authentication Issues**
   - Verify Email/Password authentication is enabled in Firebase
   - Check network connection
   - Clear browser cache and cookies

3. **Styling Issues**
   - Ensure all MUI dependencies are installed
   - Check for conflicting CSS styles
   - Verify theme provider is properly configured

4. **Build Errors**
   - Delete `node_modules` and run `npm install`
   - Clear npm cache: `npm cache clean --force`
   - Ensure Node.js version compatibility

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

### Code Style

- Use functional components with hooks
- Follow React best practices
- Maintain consistent code formatting
- Add comments for complex logic
- Update documentation for new features

## 📄 License

This project is proprietary software. All rights reserved by Yambo Studio.

## 🙏 Acknowledgments

- Material-UI team for the excellent component library
- Firebase team for real-time database capabilities
- React community for continuous improvements
- All contributors and testers

---

Built with ❤️ by Yambo Studio