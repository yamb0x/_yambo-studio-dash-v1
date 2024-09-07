import React, { useState } from 'react';
import { Box, Typography, Button, Dialog, DialogTitle, DialogContent, DialogActions, TextField, List, ListItem, ListItemText, IconButton, Collapse } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import moment from 'moment';

function RightPanel({ project, onAddDelivery, onEditDelivery, onDeleteDelivery }) {
  const [openDialog, setOpenDialog] = useState(false);
  const [deliveryName, setDeliveryName] = useState('');
  const [deliveryDate, setDeliveryDate] = useState('');
  const [deliveryNotes, setDeliveryNotes] = useState('');
  const [editingDelivery, setEditingDelivery] = useState(null);
  const [expandedDelivery, setExpandedDelivery] = useState(null);

  const handleAddOrEditDelivery = () => {
    const delivery = {
      id: editingDelivery ? editingDelivery.id : Date.now(),
      name: deliveryName,
      date: deliveryDate,
      notes: deliveryNotes,
    };

    if (editingDelivery) {
      onEditDelivery(delivery);
    } else {
      onAddDelivery(delivery);
    }

    setOpenDialog(false);
    resetForm();
  };

  const resetForm = () => {
    setDeliveryName('');
    setDeliveryDate('');
    setDeliveryNotes('');
    setEditingDelivery(null);
  };

  const handleEditClick = (delivery) => {
    setEditingDelivery(delivery);
    setDeliveryName(delivery.name);
    setDeliveryDate(delivery.date);
    setDeliveryNotes(delivery.notes || '');
    setOpenDialog(true);
  };

  const handleDeleteClick = (deliveryId) => {
    onDeleteDelivery(deliveryId);
  };

  const toggleExpand = (deliveryId) => {
    setExpandedDelivery(expandedDelivery === deliveryId ? null : deliveryId);
  };

  return (
    <Box sx={{ p: 2, height: '100%', overflow: 'auto' }}>
      <Typography variant="h6" gutterBottom>Project Summary</Typography>
      {/* ... (existing project summary code) */}
      
      <Box sx={{ mt: 4 }}>
        <Typography variant="h6" gutterBottom>Deliveries</Typography>
        <Button variant="contained" onClick={() => setOpenDialog(true)}>Add Delivery</Button>
        
        <List>
          {project.deliveries && project.deliveries.map((delivery) => (
            <React.Fragment key={delivery.id}>
              <ListItem
                secondaryAction={
                  <>
                    <IconButton edge="end" aria-label="edit" onClick={() => handleEditClick(delivery)}>
                      <EditIcon />
                    </IconButton>
                    <IconButton edge="end" aria-label="delete" onClick={() => handleDeleteClick(delivery.id)}>
                      <DeleteIcon />
                    </IconButton>
                    <IconButton edge="end" aria-label="expand" onClick={() => toggleExpand(delivery.id)}>
                      {expandedDelivery === delivery.id ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                    </IconButton>
                  </>
                }
              >
                <ListItemText
                  primary={delivery.name}
                  secondary={moment(delivery.date).format('MMMM D, YYYY')}
                />
              </ListItem>
              <Collapse in={expandedDelivery === delivery.id} timeout="auto" unmountOnExit>
                <Box sx={{ pl: 4, pr: 2, pb: 2 }}>
                  <Typography variant="body2">{delivery.notes || 'No notes available.'}</Typography>
                </Box>
              </Collapse>
            </React.Fragment>
          ))}
        </List>
      </Box>

      <Dialog open={openDialog} onClose={() => { setOpenDialog(false); resetForm(); }}>
        <DialogTitle>{editingDelivery ? 'Edit Delivery' : 'Add New Delivery'}</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Delivery Name"
            fullWidth
            value={deliveryName}
            onChange={(e) => setDeliveryName(e.target.value)}
          />
          <TextField
            margin="dense"
            label="Delivery Date"
            type="date"
            fullWidth
            InputLabelProps={{ shrink: true }}
            value={deliveryDate}
            onChange={(e) => setDeliveryDate(e.target.value)}
          />
          <TextField
            margin="dense"
            label="Notes"
            fullWidth
            multiline
            rows={4}
            value={deliveryNotes}
            onChange={(e) => setDeliveryNotes(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => { setOpenDialog(false); resetForm(); }}>Cancel</Button>
          <Button onClick={handleAddOrEditDelivery}>{editingDelivery ? 'Save' : 'Add'}</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default RightPanel;
