import React, { useState } from 'react';
import { 
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow, 
  IconButton, Rating, TableSortLabel, Modal, Box, Link, Chip
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import FavoriteIcon from '@mui/icons-material/Favorite';
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
              <TableCell>Behance</TableCell>
              <TableCell>Instagram</TableCell>
              <TableCell>Favorite</TableCell>
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
                <TableCell>
                  {artist.skills.map((skill) => (
                    <Chip key={skill} label={skill} size="small" style={{ margin: '2px' }} />
                  ))}
                </TableCell>
                <TableCell>{artist.email}</TableCell>
                <TableCell>
                  {artist.website && (
                    <Link href={artist.website} target="_blank" rel="noopener noreferrer">
                      Website
                    </Link>
                  )}
                </TableCell>
                <TableCell>
                  {artist.behanceLink && (
                    <Link href={artist.behanceLink} target="_blank" rel="noopener noreferrer">
                      Behance
                    </Link>
                  )}
                </TableCell>
                <TableCell>
                  {artist.instagramLink && (
                    <Link href={artist.instagramLink} target="_blank" rel="noopener noreferrer">
                      Instagram
                    </Link>
                  )}
                </TableCell>
                <TableCell>
                  {artist.favorite && <FavoriteIcon color="error" />}
                </TableCell>
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
