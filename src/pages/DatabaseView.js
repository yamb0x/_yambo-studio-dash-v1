import React, { useState } from 'react';
import { Typography, Container, Button, Modal, Box } from '@mui/material';
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
  const [openProjectModal, setOpenProjectModal] = useState(false);
  const [openArtistModal, setOpenArtistModal] = useState(false);

  return (
    <Container>
      <Typography variant="h4" gutterBottom>
        Database View
      </Typography>
      
      <Button onClick={() => setOpenProjectModal(true)} variant="contained" color="primary" sx={{ mb: 2 }}>
        Add New Project
      </Button>
      <ProjectTable />
      
      <Button onClick={() => setOpenArtistModal(true)} variant="contained" color="primary" sx={{ my: 2 }}>
        Add New Artist
      </Button>
      <ArtistTable />

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
