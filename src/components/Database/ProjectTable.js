import React, { useState, useMemo } from 'react';
import { 
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow, 
  IconButton, TableSortLabel, Modal, Box, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, Button, Chip
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { useProjects } from '../../contexts/ProjectContext';
import ProjectForm from '../Forms/ProjectForm';
import { useFinancialVisibility } from '../../contexts/FinancialVisibilityContext';

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
  const { showFinancialInfo } = useFinancialVisibility();
  const [orderBy, setOrderBy] = useState('startDate');
  const [order, setOrder] = useState('desc');
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

  const sortedProjects = useMemo(() => {
    const comparator = (a, b) => {
      if (orderBy === 'startDate' || orderBy === 'endDate') {
        const dateA = new Date(a[orderBy]);
        const dateB = new Date(b[orderBy]);
        return order === 'asc' ? dateA - dateB : dateB - dateA;
      }
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

  const columns = [
    { field: 'name', headerName: 'Name' },
    { field: 'startDate', headerName: 'Start Date' },
    { field: 'endDate', headerName: 'End Date' },
    { 
      field: 'budget', 
      headerName: 'Budget',
      renderCell: (project) => showFinancialInfo ? `$${project.budget}` : '***'
    },
    { 
      field: 'projectType', 
      headerName: 'Project Type',
      renderCell: (project) => (
        <>
          {project.projectType && project.projectType.map((type) => (
            <Chip key={type} label={type} size="small" style={{ margin: '2px' }} />
          ))}
        </>
      )
    }
  ];

  return (
    <>
      <TableContainer>
        <Table size="small">
          <TableHead>
            <TableRow>
              {columns.map((column) => (
                <TableCell key={column.field}>
                  <TableSortLabel
                    active={orderBy === column.field}
                    direction={orderBy === column.field ? order : 'asc'}
                    onClick={() => handleRequestSort(column.field)}
                  >
                    {column.headerName}
                  </TableSortLabel>
                </TableCell>
              ))}
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {sortedProjects.map((project) => (
              <TableRow key={project.id} hover>
                {columns.map((column) => (
                  <TableCell key={column.field}>
                    {column.renderCell ? column.renderCell(project) : project[column.field]}
                  </TableCell>
                ))}
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
