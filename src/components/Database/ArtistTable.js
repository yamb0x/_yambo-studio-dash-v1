import React, { useState } from 'react';
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, IconButton, Modal, Box, Rating } from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { useArtists } from '../../contexts/ArtistContext';
import ArtistForm from '../Forms/ArtistForm';

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

function ArtistTable() {
  const { artists, deleteArtist } = useArtists();
  const [openModal, setOpenModal] = useState(false);
  const [editingArtist, setEditingArtist] = useState(null);

  const handleEdit = (artist) => {
    setEditingArtist(artist);
    setOpenModal(true);
  };

  const handleDelete = (artistId) => {
    if (window.confirm('Are you sure you want to delete this artist?')) {
      deleteArtist(artistId);
    }
  };

  return (
    <>
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Name</TableCell>
              <TableCell>Rating</TableCell>
              <TableCell>Daily Rate</TableCell>
              <TableCell>Country</TableCell>
              <TableCell>Skills</TableCell>
              <TableCell>Email</TableCell>
              <TableCell>Website</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {artists.map((artist) => (
              <TableRow key={artist.id}>
                <TableCell>{artist.name}</TableCell>
                <TableCell>
                  <Rating value={artist.rating} readOnly />
                </TableCell>
                <TableCell>${artist.dailyRate}</TableCell>
                <TableCell>{artist.country}</TableCell>
                <TableCell>{artist.skills}</TableCell>
                <TableCell>{artist.email}</TableCell>
                <TableCell>{artist.website}</TableCell>
                <TableCell>
                  <IconButton onClick={() => handleEdit(artist)}>
                    <EditIcon />
                  </IconButton>
                  <IconButton onClick={() => handleDelete(artist.id)}>
                    <DeleteIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Modal open={openModal} onClose={() => setOpenModal(false)}>
        <Box sx={modalStyle}>
          <ArtistForm artist={editingArtist} onClose={() => setOpenModal(false)} />
        </Box>
      </Modal>
    </>
  );
}

export default ArtistTable;
