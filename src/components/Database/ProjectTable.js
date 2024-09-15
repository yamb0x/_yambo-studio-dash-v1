import React, { useState } from 'react';
import { 
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow, 
  IconButton, TableSortLabel, Modal, Box, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, Button, Chip
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { useProjects } from '../../contexts/ProjectContext';
import ProjectForm from '../Forms/ProjectForm';

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

function ProjectTable() {
  const { projects, deleteProject } = useProjects();
  const [orderBy, setOrderBy] = useState('name');
  const [order, setOrder] = useState('asc');
  const [openModal, setOpenModal] = useState(false);
  const [editingProject, setEditingProject] = useState(null);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [projectToDelete, setProjectToDelete] = useState(null);

  const handleRequestSort = (property) => {
    const isAsc = orderBy === property && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(property);
  };

  const handleEdit = (project) => {
    setEditingProject(project);
    setOpenModal(true);
  };

  const handleCloseModal = () => {
    setOpenModal(false);
    setEditingProject(null);
  };

  const handleDeleteClick = (project) => {
    setProjectToDelete(project);
    setOpenDeleteDialog(true);
  };

  const handleConfirmDelete = () => {
    if (projectToDelete) {
      deleteProject(projectToDelete.id);
    }
    setOpenDeleteDialog(false);
    setProjectToDelete(null);
  };

  const handleCancelDelete = () => {
    setOpenDeleteDialog(false);
    setProjectToDelete(null);
  };

  const sortedProjects = React.useMemo(() => {
    const comparator = (a, b) => {
      if (b[orderBy] < a[orderBy]) {
        return order === 'asc' ? 1 : -1;
      }
      if (b[orderBy] > a[orderBy]) {
        return order === 'asc' ? -1 : 1;
      }
      return 0;
    };
    return [...projects].sort(comparator);
  }, [projects, order, orderBy]);

  return (
    <>
      <TableContainer>
        <Table size="small">
          <TableHead>
            <TableRow>
              {['name', 'startDate', 'endDate', 'budget', 'projectType'].map((column) => (
                <TableCell key={column}>
                  <TableSortLabel
                    active={orderBy === column}
                    direction={orderBy === column ? order : 'asc'}
                    onClick={() => handleRequestSort(column)}
                  >
                    {column.charAt(0).toUpperCase() + column.slice(1)}
                  </TableSortLabel>
                </TableCell>
              ))}
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {sortedProjects.map((project) => (
              <TableRow key={project.id} hover>
                <TableCell>{project.name}</TableCell>
                <TableCell>{project.startDate}</TableCell>
                <TableCell>{project.endDate}</TableCell>
                <TableCell>${project.budget}</TableCell>
                <TableCell>
                  {project.projectType && project.projectType.map((type) => (
                    <Chip key={type} label={type} size="small" style={{ margin: '2px' }} />
                  ))}
                </TableCell>
                <TableCell align="right">
                  <IconButton size="small" onClick={() => handleEdit(project)}>
                    <EditIcon fontSize="small" />
                  </IconButton>
                  <IconButton size="small" onClick={() => handleDeleteClick(project)}>
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
          <ProjectForm project={editingProject} onClose={handleCloseModal} />
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
            Are you sure you want to delete the project "{projectToDelete?.name}"? This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCancelDelete}>Cancel</Button>
          <Button onClick={handleConfirmDelete} autoFocus>
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}

export default ProjectTable;
