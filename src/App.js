import React from 'react';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
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
    <DndProvider backend={HTML5Backend}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <ArtistProvider>
          <ProjectProvider>
            <Router>
              <div className="App">
                <Header />
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

export default App;
