import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { ArtistProvider } from './contexts/ArtistContext';
import { ProjectProvider } from './contexts/ProjectContext';
import theme from './styles/theme';
import Header from './components/Header';
import Dashboard from './pages/Dashboard';
import GanttView from './pages/GanttView';
import DatabaseView from './pages/DatabaseView';
import { Container } from '@mui/material';

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <ArtistProvider>
        <ProjectProvider>
          <Router>
            <div className="App">
              <Header />
              <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
                <Routes>
                  <Route path="/" element={<Dashboard />} />
                  <Route path="/gantt" element={<GanttView />} />
                  <Route path="/database" element={<DatabaseView />} />
                </Routes>
              </Container>
            </div>
          </Router>
        </ProjectProvider>
      </ArtistProvider>
    </ThemeProvider>
  );
}

export default App;
