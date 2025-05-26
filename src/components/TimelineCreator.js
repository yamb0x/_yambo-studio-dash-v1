/**
 * EXPERIMENTAL COMPONENT - Timeline Creator
 * AI-powered project timeline generation
 * Creates projects with automatic Gantt integration
 * Part of MCP integration features
 */
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { mcpService } from '../services/mcpService';
import { useProjects } from '../contexts/ProjectContext';
import { useArtists } from '../contexts/ArtistContext';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Box,
  Typography,
  Chip,
  Stack,
  Card,
  CardContent,
  Stepper,
  Step,
  StepLabel,
  StepContent,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Autocomplete,
  CircularProgress,
  IconButton,
  Divider,
  Avatar,
  alpha,
  useTheme,
  Paper,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Alert,
} from '@mui/material';
import {
  Close,
  Schedule,
  Group,
  AutoAwesome,
  PlayArrow,
  Person,
  CalendarToday,
  TrendingUp,
  CheckCircle,
  AccessTime,
} from '@mui/icons-material';
import { format, addDays, parseISO } from 'date-fns';

export function TimelineCreator({ open, onClose }) {
  const theme = useTheme();
  const navigate = useNavigate();
  const { projects, addProject, addBooking } = useProjects();
  const { artists } = useArtists();
  const [activeStep, setActiveStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [generatedTimeline, setGeneratedTimeline] = useState(null);
  const [creatingProject, setCreatingProject] = useState(false);
  
  // Form data
  const [formData, setFormData] = useState({
    projectName: '',
    projectType: '',
    referenceProject: null,
    teamRequirements: '',
    deliverables: [],
    startDate: new Date(),
    endDate: null,
    budget: '',
    maxDuration: null
  });

  // Use the same project types as the main app
  const projectTypes = ['Commercial', 'Art', 'Studio'];


  const deliverableOptions = [
    'Brand film + KVs',
    'KVs',
    'Custom'
  ];

  const steps = [
    'Project Setup',
    'Reference & Deliverables', 
    'Team Requirements',
    'Review & Generate'
  ];

  const handleNext = () => {
    setActiveStep((prevActiveStep) => prevActiveStep + 1);
  };

  const handleBack = () => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
  };

  const handleGenerateTimeline = async () => {
    setLoading(true);
    
    try {
      // Calculate duration if end date is set
      if (formData.endDate) {
        const duration = Math.ceil((formData.endDate - formData.startDate) / (1000 * 60 * 60 * 24));
        formData.maxDuration = duration;
      }
      
      // Call MCP service for timeline generation
      const result = await mcpService.createTimeline(formData, formData.referenceProject, artists);
      
      setGeneratedTimeline(result);
      setActiveStep(4); // Move to results step
    } catch (error) {
      console.error('Timeline generation failed:', error);
    } finally {
      setLoading(false);
    }
  };
  
  const handleCreateProject = async () => {
    if (!generatedTimeline) return;
    
    setCreatingProject(true);
    
    try {
      // Create the project
      const newProject = {
        name: formData.projectName,
        startDate: formData.startDate.toISOString(),
        endDate: formData.endDate ? formData.endDate.toISOString() : generatedTimeline.timeline.endDate.toISOString(),
        budget: parseFloat(formData.budget) || 0,
        projectType: [formData.projectType],
        bookings: [],
        deliveries: formData.deliverables.map((del, index) => ({
          id: `delivery-${Date.now()}-${index}`,
          name: del,
          date: formData.endDate ? formData.endDate.toISOString() : generatedTimeline.timeline.endDate.toISOString()
        })),
        additionalExpenses: 0
      };
      
      // Add project to database
      await addProject(newProject);
      
      // Wait a bit for the project to be added to the database
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Navigate to Gantt view - the bookings will be added after navigation
      navigate('/gantt');
      
      // Add bookings after navigation (with delay to ensure project exists)
      setTimeout(async () => {
        // Get the newly created project
        const createdProject = projects.find(p => p.name === formData.projectName && p.startDate === newProject.startDate);
        
        if (createdProject) {
          // Add bookings for each phase
          for (const phase of generatedTimeline.timeline.phases) {
            for (const teamMember of phase.assignedTeam) {
              const artist = artists.find(a => a.name === teamMember.artist);
              if (artist) {
                const booking = {
                  id: `booking-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
                  artistId: artist.id,
                  artistName: artist.name,
                  startDate: phase.startDate.toISOString(),
                  endDate: phase.endDate.toISOString(),
                  dailyRate: teamMember.dailyRate || artist.dailyRate || 400,
                  duration: phase.duration
                };
                
                await addBooking(createdProject.id, booking);
              }
            }
          }
        }
      }, 2000);
      
      handleClose();
    } catch (error) {
      console.error('Failed to create project:', error);
    } finally {
      setCreatingProject(false);
    }
  };

  const handleClose = () => {
    setActiveStep(0);
    setFormData({
      projectName: '',
      projectType: '',
      referenceProject: null,
      teamRequirements: '',
      deliverables: [],
      startDate: new Date(),
      endDate: null,
      budget: '',
      maxDuration: null
    });
    setGeneratedTimeline(null);
    onClose();
  };

  const renderStepContent = (step) => {
    switch (step) {
      case 0:
        return (
          <Stack spacing={3}>
            <TextField
              label="Project Name"
              value={formData.projectName}
              onChange={(e) => setFormData({...formData, projectName: e.target.value})}
              fullWidth
              placeholder="e.g., Mobile Banking App Redesign"
            />
            
            <FormControl fullWidth>
              <InputLabel>Project Type</InputLabel>
              <Select
                value={formData.projectType}
                onChange={(e) => setFormData({...formData, projectType: e.target.value})}
                label="Project Type"
              >
                {projectTypes.map((type) => (
                  <MenuItem key={type} value={type}>{type}</MenuItem>
                ))}
              </Select>
            </FormControl>

            <Stack direction="row" spacing={2}>
              <TextField
                label="Start Date"
                type="date"
                value={formData.startDate ? formData.startDate.toISOString().split('T')[0] : ''}
                onChange={(e) => setFormData({...formData, startDate: new Date(e.target.value)})}
                fullWidth
                InputLabelProps={{ shrink: true }}
              />
              <TextField
                label="End Date"
                type="date"
                value={formData.endDate ? formData.endDate.toISOString().split('T')[0] : ''}
                onChange={(e) => setFormData({...formData, endDate: new Date(e.target.value)})}
                fullWidth
                InputLabelProps={{ shrink: true }}
                inputProps={{
                  min: formData.startDate ? formData.startDate.toISOString().split('T')[0] : ''
                }}
              />
            </Stack>
            
            <TextField
              label="Budget"
              type="number"
              value={formData.budget}
              onChange={(e) => setFormData({...formData, budget: e.target.value})}
              fullWidth
              placeholder="Enter project budget"
            />
          </Stack>
        );

      case 1:
        return (
          <Stack spacing={3}>
            <Autocomplete
              options={projects}
              getOptionLabel={(option) => option.name || ''}
              value={formData.referenceProject}
              onChange={(event, newValue) => setFormData({...formData, referenceProject: newValue})}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Reference Project (Optional)"
                  placeholder="Select a similar past project for duration estimation"
                  helperText="Choose a project with similar scope to improve timeline accuracy"
                />
              )}
              renderOption={(props, option) => (
                <Box component="li" {...props}>
                  <Stack>
                    <Typography variant="body2" fontWeight={500}>
                      {option.name}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Duration: {Math.ceil((new Date(option.endDate) - new Date(option.startDate)) / (1000 * 60 * 60 * 24))} days
                    </Typography>
                  </Stack>
                </Box>
              )}
            />

            <Autocomplete
              multiple
              options={deliverableOptions}
              value={formData.deliverables}
              onChange={(event, newValue) => setFormData({...formData, deliverables: newValue})}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Required Deliverables"
                  placeholder="Select project deliverables"
                />
              )}
              renderTags={(value, getTagProps) =>
                value.map((option, index) => (
                  <Chip variant="outlined" label={option} size="small" {...getTagProps({ index })} />
                ))
              }
            />

          </Stack>
        );

      case 2:
        return (
          <Stack spacing={3}>
            <TextField
              label="Team Requirements"
              value={formData.teamRequirements}
              onChange={(e) => setFormData({...formData, teamRequirements: e.target.value})}
              multiline
              rows={4}
              fullWidth
              placeholder="Describe the team you need using natural language. E.g., 'Need a senior UI designer for main interface, junior designer for icons, and someone experienced with mobile prototyping'"
              helperText="AI will match your requirements to available team members"
            />

          </Stack>
        );

      case 3:
        return (
          <Stack spacing={3}>
            <Typography variant="h6" gutterBottom>
              Review Project Setup
            </Typography>
            
            <Card variant="outlined">
              <CardContent>
                <Stack spacing={2}>
                  <Box>
                    <Typography variant="subtitle2" color="text.secondary">Project</Typography>
                    <Typography variant="body1">{formData.projectName}</Typography>
                  </Box>
                  
                  <Box>
                    <Typography variant="subtitle2" color="text.secondary">Type</Typography>
                    <Chip label={formData.projectType} size="small" />
                  </Box>
                  
                  <Box>
                    <Typography variant="subtitle2" color="text.secondary">Duration</Typography>
                    <Typography variant="body1">
                      {format(formData.startDate, 'MMM d, yyyy')} - {formData.endDate ? format(formData.endDate, 'MMM d, yyyy') : 'Not set'}
                    </Typography>
                  </Box>
                  
                  <Box>
                    <Typography variant="subtitle2" color="text.secondary">Budget</Typography>
                    <Typography variant="body1">${formData.budget || 'Not set'}</Typography>
                  </Box>

                  <Box>
                    <Typography variant="subtitle2" color="text.secondary">Deliverables</Typography>
                    <Stack direction="row" spacing={1} flexWrap="wrap" mt={0.5}>
                      {formData.deliverables.map((deliverable, index) => (
                        <Chip key={index} label={deliverable} size="small" variant="outlined" />
                      ))}
                    </Stack>
                  </Box>


                  {formData.referenceProject && (
                    <Box>
                      <Typography variant="subtitle2" color="text.secondary">Reference Project</Typography>
                      <Typography variant="body1">{formData.referenceProject.name}</Typography>
                    </Box>
                  )}
                </Stack>
              </CardContent>
            </Card>

            <Button
              variant="contained"
              size="large"
              onClick={handleGenerateTimeline}
              disabled={loading}
              startIcon={loading ? <CircularProgress size={20} /> : <AutoAwesome />}
              sx={{
                py: 1.5,
                fontSize: '1rem',
                textTransform: 'none',
              }}
            >
              {loading ? 'Generating Timeline...' : 'Generate AI Timeline'}
            </Button>
          </Stack>
        );

      case 4:
        return generatedTimeline ? (
          <Stack spacing={3}>
            <Box>
              <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <CheckCircle color="success" />
                Timeline Generated Successfully
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Duration: {generatedTimeline.timeline.totalDuration} days 
                • {format(generatedTimeline.timeline.startDate, 'MMM d')} - {format(generatedTimeline.timeline.endDate, 'MMM d, yyyy')}
              </Typography>
            </Box>

            <List>
              {generatedTimeline.timeline.phases.map((phase, index) => (
                <ListItem key={index} sx={{ alignItems: 'flex-start', pl: 0 }}>
                  <ListItemIcon sx={{ minWidth: 120, flexDirection: 'column', alignItems: 'flex-start', mt: 1 }}>
                    <Typography variant="caption" color="text.secondary">
                      {format(phase.startDate, 'MMM d')}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {phase.duration} days
                    </Typography>
                    <Box sx={{ 
                      width: 8, 
                      height: 8, 
                      borderRadius: '50%', 
                      backgroundColor: 'primary.main',
                      mt: 0.5 
                    }} />
                  </ListItemIcon>
                  <ListItemText
                    sx={{ ml: 2 }}
                    primary={
                      <Paper elevation={1} sx={{ p: 2, backgroundColor: alpha(theme.palette.primary.main, 0.02) }}>
                        <Typography variant="subtitle2" fontWeight={600}>
                          {phase.name}
                        </Typography>
                        
                        <Stack spacing={1} mt={1}>
                          <Box>
                            <Typography variant="caption" color="text.secondary">Team:</Typography>
                            <Stack direction="row" spacing={1} mt={0.5}>
                              {phase.assignedTeam.map((member, i) => (
                                <Chip
                                  key={i}
                                  avatar={<Avatar sx={{ width: 20, height: 20 }}><Person sx={{ fontSize: 12 }} /></Avatar>}
                                  label={`${member.artist} (${member.involvement})`}
                                  size="small"
                                  variant="outlined"
                                />
                              ))}
                            </Stack>
                          </Box>
                          
                          <Box>
                            <Typography variant="caption" color="text.secondary">Deliverables:</Typography>
                            <Typography variant="body2" sx={{ mt: 0.5 }}>
                              {phase.deliverables.join(', ')}
                            </Typography>
                          </Box>
                        </Stack>
                      </Paper>
                    }
                  />
                </ListItem>
              ))}
            </List>

            <Card variant="outlined" sx={{ backgroundColor: alpha(theme.palette.info.main, 0.05) }}>
              <CardContent>
                <Typography variant="subtitle2" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <TrendingUp color="info" />
                  AI Insights
                </Typography>
                <Stack spacing={1}>
                  {generatedTimeline.insights.map((insight, index) => (
                    <Typography key={index} variant="body2" color="text.secondary">
                      • {insight}
                    </Typography>
                  ))}
                </Stack>
              </CardContent>
            </Card>
          </Stack>
        ) : null;

      default:
        return null;
    }
  };

  return (
    <Dialog 
      open={open} 
      onClose={handleClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: {
          minHeight: '80vh',
          backgroundColor: 'background.default',
        }
      }}
    >
      <DialogTitle sx={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'space-between',
        pb: 1,
        borderBottom: 1,
        borderColor: 'divider'
      }}>
        <Stack direction="row" spacing={1} alignItems="center">
          <Schedule color="primary" />
          <Typography variant="h6" fontWeight={600}>
            Intuitive Timeline Creator
          </Typography>
          <Chip 
            label="AI Powered" 
            size="small" 
            color="primary" 
            variant="outlined"
            sx={{ fontSize: '0.7rem' }}
          />
        </Stack>
        <IconButton onClick={handleClose} size="small">
          <Close />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ p: 3 }}>
        <Stepper activeStep={activeStep} orientation="vertical">
          {steps.map((label, index) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
              <StepContent>
                <Box sx={{ mb: 2 }}>
                  {renderStepContent(index)}
                </Box>
                {activeStep < 3 && (
                  <Box sx={{ mb: 2 }}>
                    <Button
                      variant="contained"
                      onClick={handleNext}
                      sx={{ mt: 1, mr: 1, textTransform: 'none' }}
                      disabled={
                        (activeStep === 0 && (!formData.projectName || !formData.projectType || !formData.startDate)) ||
                        (activeStep === 1 && formData.deliverables.length === 0) ||
                        (activeStep === 2 && !formData.teamRequirements)
                      }
                    >
                      Continue
                    </Button>
                    <Button
                      disabled={activeStep === 0}
                      onClick={handleBack}
                      sx={{ mt: 1, mr: 1, textTransform: 'none' }}
                    >
                      Back
                    </Button>
                  </Box>
                )}
              </StepContent>
            </Step>
          ))}
          
          {activeStep === 4 && (
            <Step>
              <StepLabel>Generated Timeline</StepLabel>
              <StepContent>
                {renderStepContent(4)}
              </StepContent>
            </Step>
          )}
        </Stepper>
      </DialogContent>

      <DialogActions sx={{ p: 3, pt: 0 }}>
        <Button onClick={handleClose} sx={{ textTransform: 'none' }}>
          {activeStep === 4 ? 'Cancel' : 'Close'}
        </Button>
        {activeStep === 4 && generatedTimeline && (
          <Button
            variant="contained"
            sx={{ textTransform: 'none' }}
            onClick={handleCreateProject}
            disabled={creatingProject}
            startIcon={creatingProject ? <CircularProgress size={20} /> : <PlayArrow />}
          >
            {creatingProject ? 'Creating Project...' : 'Create Project & Go to Gantt'}
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
}