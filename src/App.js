import React, { useState, useEffect } from 'react';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { ArtistProvider } from './contexts/ArtistContext';
import { ProjectProvider } from './contexts/ProjectContext';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { lightTheme, darkTheme } from './styles/theme';
import Header from './components/Header';
import Dashboard from './pages/Dashboard';
import GanttView from './pages/GanttView';
import DatabaseView from './pages/DatabaseView';
import LoginForm from './components/Auth/LoginForm';
import { Container, CircularProgress } from '@mui/material';
import { testFirebaseConnection } from './firebase';

function AppContent() {
  const [isDarkMode, setIsDarkMode] = useState(() => {
    const savedMode = localStorage.getItem('darkMode');
    return savedMode === 'true';
  });
  const { currentUser, loading } = useAuth();

  useEffect(() => {
    localStorage.setItem('darkMode', isDarkMode);
    testFirebaseConnection();
  }, [isDarkMode]);

  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
  };

  if (loading) {
    return <CircularProgress />;
  }

  if (!currentUser) {
    return <LoginForm />;
  }

  return (
    <DndProvider backend={HTML5Backend}>
      <ThemeProvider theme={isDarkMode ? darkTheme : lightTheme}>
        <CssBaseline />
        <ArtistProvider>
          <ProjectProvider>
            <Router>
              <div className="App">
                <Header toggleDarkMode={toggleDarkMode} isDarkMode={isDarkMode} />
                <Container maxWidth={false} disableGutters>
                  <Routes>
                    <Route path="/" element={<Dashboard />} />
                    <Route path="/gantt" element={<GanttView />} />
                    <Route path="/gantt/:projectId" element={<GanttView />} />
                    <Route path="/database" element={<DatabaseView />} />
                  </Routes>
                </Container>
              </div>
            </Router>
          </ProjectProvider>
        </ArtistProvider>
      </ThemeProvider>
    </DndProvider>
  );
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;
