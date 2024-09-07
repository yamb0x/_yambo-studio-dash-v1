import React, { useState } from 'react';
import { 
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow, 
  IconButton, Rating, TableSortLabel, Modal, Box
} from '@mui/material';
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
  const [orderBy, setOrderBy] = useState('name');
  const [order, setOrder] = useState('asc');
  const [openModal, setOpenModal] = useState(false);
  const [editingArtist, setEditingArtist] = useState(null);

  const handleRequestSort = (property) => {
    const isAsc = orderBy === property && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(property);
  };

  const handleEdit = (artist) => {
    setEditingArtist(artist);
    setOpenModal(true);
  };

  const handleCloseModal = () => {
    setOpenModal(false);
    setEditingArtist(null);
  };

  const sortedArtists = artists.sort((a, b) => {
    if (b[orderBy] < a[orderBy]) {
      return order === 'asc' ? 1 : -1;
    }
    if (b[orderBy] > a[orderBy]) {
      return order === 'asc' ? -1 : 1;
    }
    return 0;
  });

  return (
    <>
      <TableContainer>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>
                <TableSortLabel
                  active={orderBy === 'name'}
                  direction={orderBy === 'name' ? order : 'asc'}
                  onClick={() => handleRequestSort('name')}
                >
                  Name
                </TableSortLabel>
              </TableCell>
              <TableCell>Rating</TableCell>
              <TableCell>Daily Rate</TableCell>
              <TableCell>Country</TableCell>
              <TableCell>Skills</TableCell>
              <TableCell>Email</TableCell>
              <TableCell>Website</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {sortedArtists.map((artist) => (
              <TableRow key={artist.id} hover>
                <TableCell>{artist.name}</TableCell>
                <TableCell>
                  <Rating value={artist.rating} readOnly size="small" />
                </TableCell>
                <TableCell>${artist.dailyRate}</TableCell>
                <TableCell>{artist.country}</TableCell>
                <TableCell>{artist.skills}</TableCell>
                <TableCell>{artist.email}</TableCell>
                <TableCell>{artist.website}</TableCell>
                <TableCell align="right">
                  <IconButton size="small" onClick={() => handleEdit(artist)}>
                    <EditIcon fontSize="small" />
                  </IconButton>
                  <IconButton size="small" onClick={() => deleteArtist(artist.id)}>
                    <DeleteIcon fontSize="small" />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Modal open={openModal} onClose={handleCloseModal}>
        <Box sx={modalStyle}>
          <ArtistForm artist={editingArtist} onClose={handleCloseModal} />
        </Box>
      </Modal>
    </>
  );
}

export default ArtistTable;
