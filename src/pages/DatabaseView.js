import React, { useState, useEffect } from 'react';
import { useProjects } from '../contexts/ProjectContext';
import { Typography, Container, Button, Modal, Box, Paper, Grid } from '@mui/material';
import ProjectTable from '../components/Database/ProjectTable';
import ArtistTable from '../components/Database/ArtistTable';
import ProjectForm from '../components/Forms/ProjectForm';
import ArtistForm from '../components/Forms/ArtistForm';

const modalStyle = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: 400,
  bgcolor: 'background.paper',
  boxShadow: 24,
  p: 4,
};

function DatabaseView() {
  const { projects } = useProjects();

  useEffect(() => {
    console.log('Projects in DatabaseView:', projects);
  }, [projects]);

  const [openProjectModal, setOpenProjectModal] = useState(false);
  const [openArtistModal, setOpenArtistModal] = useState(false);

  return (
    <Container maxWidth={false} disableGutters>
      <Box sx={{ px: 5, py: 2 }}> {/* Reduced horizontal padding here */}
        <Grid container spacing={4}>
          <Grid item xs={12}>
            <Paper elevation={0} sx={{ border: '1px solid #e0e0e0', borderRadius: 0 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', px: 2, py: 2 }}>
                <Typography 
                  variant="h6"
                  sx={{
                    fontSize: '1.25rem',
                    letterSpacing: '0.0075em',
                    color: '#757575',
                    fontWeight: 500,
                  }}
                >
                  Projects
                </Typography>
                <Button 
                  onClick={() => setOpenProjectModal(true)} 
                  variant="outlined" 
                  color="primary"
                >
                  Add New Project
                </Button>
              </Box>
              <ProjectTable />
            </Paper>
          </Grid>
          
          <Grid item xs={12}>
            <Paper elevation={0} sx={{ border: '1px solid #e0e0e0', borderRadius: 0 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', px: 2, py: 2 }}>
                <Typography 
                  variant="h6"
                  sx={{
                    fontSize: '1.25rem',
                    letterSpacing: '0.0075em',
                    color: '#757575',
                    fontWeight: 500,
                  }}
                >
                  Artists
                </Typography>
                <Button 
                  onClick={() => setOpenArtistModal(true)} 
                  variant="outlined" 
                  color="primary"
                >
                  Add New Artist
                </Button>
              </Box>
              <ArtistTable />
            </Paper>
          </Grid>
        </Grid>
      </Box>

      <Modal open={openProjectModal} onClose={() => setOpenProjectModal(false)}>
        <Box sx={modalStyle}>
          <ProjectForm onClose={() => setOpenProjectModal(false)} />
        </Box>
      </Modal>

      <Modal open={openArtistModal} onClose={() => setOpenArtistModal(false)}>
        <Box sx={modalStyle}>
          <ArtistForm onClose={() => setOpenArtistModal(false)} />
        </Box>
      </Modal>
    </Container>
  );
}

export default DatabaseView;
