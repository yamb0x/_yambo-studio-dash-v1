import React, { useState } from 'react';
import { 
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow, 
  IconButton, TableSortLabel, Modal, Box, Link, Chip, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, Button
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import FavoriteIcon from '@mui/icons-material/Favorite';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import { useArtists } from '../../contexts/ArtistContext';
import ArtistForm from '../Forms/ArtistForm';
import BookingEmailPopup from './BookingEmailPopup';

const skillOptions = [
  'Animation',
  'Look Dev',
  'Rigging',
  'Creative Direction',
  'Production',
  'Simulations',
  'CAD',
  'Houdini',
  'Color Grading',
  'Compositing',
  '2D Animation',
  'Modeling',
  'Sound Design'
];

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
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [artistToDelete, setArtistToDelete] = useState(null);
  const [openBookingPopup, setOpenBookingPopup] = useState(false);
  const [selectedArtist, setSelectedArtist] = useState(null);

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

  const handleDeleteClick = (artist) => {
    setArtistToDelete(artist);
    setOpenDeleteDialog(true);
  };

  const handleConfirmDelete = () => {
    if (artistToDelete) {
      deleteArtist(artistToDelete.id);
    }
    setOpenDeleteDialog(false);
    setArtistToDelete(null);
  };

  const handleCancelDelete = () => {
    setOpenDeleteDialog(false);
    setArtistToDelete(null);
  };

  const handleCopyEmail = (artist) => {
    setSelectedArtist(artist);
    setOpenBookingPopup(true);
  };

  const sortedArtists = React.useMemo(() => {
    return [...artists].sort((a, b) => {
      if (b[orderBy] < a[orderBy]) {
        return order === 'asc' ? 1 : -1;
      }
      if (b[orderBy] > a[orderBy]) {
        return order === 'asc' ? -1 : 1;
      }
      return 0;
    });
  }, [artists, order, orderBy]);

  return (
    <>
      <Table size="small">
        <TableHead>
          <TableRow>
            <TableCell width="15%">
              <TableSortLabel
                active={orderBy === 'name'}
                direction={orderBy === 'name' ? order : 'asc'}
                onClick={() => handleRequestSort('name')}
              >
                Name
              </TableSortLabel>
            </TableCell>
            <TableCell width="10%">Daily Rate</TableCell>
            <TableCell width="10%">Country</TableCell>
            <TableCell width="20%">Skills</TableCell>
            <TableCell width="15%">Email</TableCell>
            <TableCell width="7%">Website</TableCell>
            <TableCell width="7%">Behance</TableCell>
            <TableCell width="7%">Instagram</TableCell>
            <TableCell width="5%">Favorite</TableCell>
            <TableCell width="5%" align="right">Actions</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {sortedArtists.map((artist) => (
            <TableRow key={artist.id} hover>
              <TableCell width="15%">{artist.name}</TableCell>
              <TableCell width="10%">${artist.dailyRate}</TableCell>
              <TableCell width="10%">{artist.country}</TableCell>
              <TableCell width="20%">
                {artist.skills.map((skill) => (
                  <Chip key={skill} label={skill} size="small" style={{ margin: '2px' }} />
                ))}
              </TableCell>
              <TableCell width="15%">
                <Box display="flex" alignItems="center">
                  <IconButton size="small" onClick={() => handleCopyEmail(artist)} style={{ marginRight: '4px' }}>
                    <ContentCopyIcon fontSize="small" />
                  </IconButton>
                  {artist.email}
                </Box>
              </TableCell>
              <TableCell width="7%">
                {artist.website && (
                  <Link 
                    href={artist.website.startsWith('http') ? artist.website : `https://${artist.website}`} 
                    target="_blank" 
                    rel="noopener noreferrer"
                  >
                    Website
                  </Link>
                )}
              </TableCell>
              <TableCell width="7%">
                {artist.behanceLink && (
                  <Link 
                    href={artist.behanceLink.startsWith('http') ? artist.behanceLink : `https://www.behance.net/${artist.behanceLink}`} 
                    target="_blank" 
                    rel="noopener noreferrer"
                  >
                    Behance
                  </Link>
                )}
              </TableCell>
              <TableCell width="7%">
                {artist.instagramLink && (
                  <Link 
                    href={artist.instagramLink.startsWith('http') ? artist.instagramLink : `https://www.instagram.com/${artist.instagramLink}`} 
                    target="_blank" 
                    rel="noopener noreferrer"
                  >
                    Instagram
                  </Link>
                )}
              </TableCell>
              <TableCell width="5%">
                {artist.favorite && (
                  <FavoriteIcon 
                    sx={{ 
                      color: 'black',
                      fontSize: '1rem'
                    }} 
                  />
                )}
              </TableCell>
              <TableCell width="5%" align="right">
                <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                  <IconButton size="small" onClick={() => handleEdit(artist)}>
                    <EditIcon fontSize="small" />
                  </IconButton>
                  <IconButton size="small" onClick={() => handleDeleteClick(artist)}>
                    <DeleteIcon fontSize="small" />
                  </IconButton>
                </Box>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <Modal open={openModal} onClose={handleCloseModal}>
        <Box sx={modalStyle}>
          <ArtistForm artist={editingArtist} onClose={handleCloseModal} />
        </Box>
      </Modal>

      <Dialog
        open={openDeleteDialog}
        onClose={handleCancelDelete}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title">{"Confirm Delete"}</DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-description">
            Are you sure you want to delete the artist "{artistToDelete?.name}"? This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCancelDelete}>Cancel</Button>
          <Button onClick={handleConfirmDelete} autoFocus>
            Delete
          </Button>
        </DialogActions>
      </Dialog>

      <BookingEmailPopup
        open={openBookingPopup}
        onClose={() => setOpenBookingPopup(false)}
        artistName={selectedArtist?.name || ''}
      />
    </>
  );
}

export default ArtistTable;
