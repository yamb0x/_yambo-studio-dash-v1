/**
 * EXPERIMENTAL COMPONENT - Script Optimizer
 * AI-powered script optimization tool
 * Part of MCP integration features
 */
import React, { useState } from 'react';
import { mcpService } from '../services/mcpService';
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
  Tabs,
  Tab,
  CircularProgress,
  IconButton,
  Divider,
  alpha,
  useTheme,
} from '@mui/material';
import {
  AutoAwesome,
  ContentCopy,
  Close,
  CompareArrows,
  Refresh,
} from '@mui/icons-material';

function TabPanel({ children, value, index, ...other }) {
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`script-tabpanel-${index}`}
      aria-labelledby={`script-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ pt: 2 }}>{children}</Box>}
    </div>
  );
}

export function ScriptOptimizer({ open, onClose }) {
  const theme = useTheme();
  const [originalScript, setOriginalScript] = useState('');
  const [keywords, setKeywords] = useState('');
  const [optimizedVersions, setOptimizedVersions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedTab, setSelectedTab] = useState(0);
  
  // Script optimization using MCP service
  const optimizeScript = async () => {
    if (!originalScript.trim()) return;
    
    setLoading(true);
    
    try {
      // Parse keywords from input
      const keywordList = keywords.split(',').map(k => k.trim()).filter(k => k);
      
      // Call MCP service for optimization
      const result = await mcpService.optimizeScript(originalScript, keywordList);
      
      setOptimizedVersions(result.versions);
      setSelectedTab(0);
    } catch (error) {
      console.error('Optimization failed:', error);
      // Could add error snackbar here
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    // You could add a snackbar notification here
  };

  const handleClose = () => {
    setOriginalScript('');
    setKeywords('');
    setOptimizedVersions([]);
    setSelectedTab(0);
    onClose();
  };

  return (
    <Dialog 
      open={open} 
      onClose={handleClose}
      maxWidth="lg"
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
          <AutoAwesome color="primary" />
          <Typography variant="h6" fontWeight={600}>
            Script Optimizer
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
        <Stack spacing={3}>
          {/* Input Section */}
          <Box>
            <Typography variant="subtitle1" fontWeight={600} gutterBottom>
              Original Script
            </Typography>
            <TextField
              multiline
              rows={6}
              fullWidth
              value={originalScript}
              onChange={(e) => setOriginalScript(e.target.value)}
              placeholder="Paste your script here to optimize it with AI..."
              variant="outlined"
              sx={{
                '& .MuiOutlinedInput-root': {
                  backgroundColor: alpha(theme.palette.action.hover, 0.05),
                }
              }}
            />
          </Box>

          {/* Keywords Section */}
          <Box>
            <Typography variant="subtitle1" fontWeight={600} gutterBottom>
              Focus Keywords (Optional)
            </Typography>
            <TextField
              fullWidth
              value={keywords}
              onChange={(e) => setKeywords(e.target.value)}
              placeholder="e.g., professional, concise, engaging, technical..."
              variant="outlined"
              helperText="Comma-separated keywords to guide the optimization"
              sx={{
                '& .MuiOutlinedInput-root': {
                  backgroundColor: alpha(theme.palette.action.hover, 0.05),
                }
              }}
            />
          </Box>

          {/* Action Button */}
          <Box sx={{ display: 'flex', justifyContent: 'center' }}>
            <Button
              variant="contained"
              size="large"
              onClick={optimizeScript}
              disabled={!originalScript.trim() || loading}
              startIcon={loading ? <CircularProgress size={20} /> : <AutoAwesome />}
              sx={{
                px: 4,
                py: 1.5,
                fontSize: '1rem',
                textTransform: 'none',
                borderRadius: 3,
              }}
            >
              {loading ? 'Optimizing...' : 'Generate Optimized Versions'}
            </Button>
          </Box>

          {/* Results Section */}
          {optimizedVersions.length > 0 && (
            <Box>
              <Divider sx={{ my: 2 }} />
              
              <Typography variant="h6" fontWeight={600} gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <CompareArrows color="primary" />
                Optimized Versions
              </Typography>

              <Tabs 
                value={selectedTab} 
                onChange={(e, newValue) => setSelectedTab(newValue)}
                variant="scrollable"
                scrollButtons="auto"
                sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}
              >
                {optimizedVersions.map((version, index) => (
                  <Tab 
                    key={index}
                    label={version.title}
                    sx={{ 
                      textTransform: 'none',
                      fontSize: '0.875rem',
                      fontWeight: 500,
                    }}
                  />
                ))}
              </Tabs>

              {optimizedVersions.map((version, index) => (
                <TabPanel key={index} value={selectedTab} index={index}>
                  <Card variant="outlined" sx={{ backgroundColor: alpha(theme.palette.primary.main, 0.02) }}>
                    <CardContent sx={{ p: 3 }}>
                      <Stack spacing={2}>
                        <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
                          <Box>
                            <Typography variant="subtitle1" fontWeight={600} gutterBottom>
                              {version.title}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              {version.description}
                            </Typography>
                          </Box>
                          <Button
                            size="small"
                            startIcon={<ContentCopy />}
                            onClick={() => copyToClipboard(version.content)}
                            sx={{ textTransform: 'none' }}
                          >
                            Copy
                          </Button>
                        </Stack>

                        <Box
                          sx={{
                            p: 2,
                            backgroundColor: 'background.paper',
                            borderRadius: 1,
                            border: '1px solid',
                            borderColor: 'divider',
                            fontFamily: 'monospace',
                            fontSize: '0.875rem',
                            lineHeight: 1.6,
                            whiteSpace: 'pre-wrap',
                          }}
                        >
                          {version.content}
                        </Box>

                        <Box>
                          <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1 }}>
                            Key Improvements:
                          </Typography>
                          <Stack direction="row" spacing={1} flexWrap="wrap">
                            {version.improvements.map((improvement, i) => (
                              <Chip
                                key={i}
                                label={improvement}
                                size="small"
                                variant="outlined"
                                color="primary"
                                sx={{ fontSize: '0.7rem' }}
                              />
                            ))}
                          </Stack>
                        </Box>
                      </Stack>
                    </CardContent>
                  </Card>
                </TabPanel>
              ))}
            </Box>
          )}
        </Stack>
      </DialogContent>

      <DialogActions sx={{ p: 3, pt: 0 }}>
        <Button onClick={handleClose} sx={{ textTransform: 'none' }}>
          Close
        </Button>
        {optimizedVersions.length > 0 && (
          <Button
            variant="outlined"
            startIcon={<Refresh />}
            onClick={optimizeScript}
            disabled={loading}
            sx={{ textTransform: 'none' }}
          >
            Generate New Versions
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
}