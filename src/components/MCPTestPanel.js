import React, { useState } from 'react';
import { 
  Box, 
  Button, 
  Card, 
  CardContent, 
  Typography, 
  Stack,
  Alert,
  CircularProgress,
  Chip
} from '@mui/material';
import { CheckCircle, Error, Info } from '@mui/icons-material';
import { mcpService } from '../services/mcpService';
import { isFeatureEnabled } from '../config/mcpConfig';

export function MCPTestPanel() {
  const [testResults, setTestResults] = useState({
    connection: null,
    scriptOptimizer: null,
    timelineCreator: null
  });
  const [loading, setLoading] = useState({
    connection: false,
    scriptOptimizer: false,
    timelineCreator: false
  });

  // Test MCP connection
  const testConnection = async () => {
    setLoading({ ...loading, connection: true });
    try {
      const connected = await mcpService.connect();
      setTestResults({
        ...testResults,
        connection: {
          success: true,
          message: connected ? 'Connected to MCP' : 'Using mock mode',
          mockMode: !connected
        }
      });
    } catch (error) {
      setTestResults({
        ...testResults,
        connection: {
          success: false,
          message: error.message
        }
      });
    }
    setLoading({ ...loading, connection: false });
  };

  // Test Script Optimizer
  const testScriptOptimizer = async () => {
    setLoading({ ...loading, scriptOptimizer: true });
    try {
      const testScript = "Hey! We're making a cool new app that's gonna be awesome for managing projects!";
      const result = await mcpService.optimizeScript(
        testScript,
        ['efficiency', 'innovation'],
        ['professional', 'concise']
      );
      
      setTestResults({
        ...testResults,
        scriptOptimizer: {
          success: true,
          message: `Generated ${result.versions.length} optimized versions`,
          data: result
        }
      });
    } catch (error) {
      setTestResults({
        ...testResults,
        scriptOptimizer: {
          success: false,
          message: error.message
        }
      });
    }
    setLoading({ ...loading, scriptOptimizer: false });
  };

  // Test Timeline Creator
  const testTimelineCreator = async () => {
    setLoading({ ...loading, timelineCreator: true });
    try {
      const testProject = {
        projectName: 'Test Mobile App',
        projectType: 'Mobile App',
        referenceProject: null,
        teamRequirements: 'Need a senior UI designer and junior developer for mobile app',
        deliverables: ['App designs', 'Prototype', 'Documentation'],
        complexity: 'Medium',
        urgency: 'Standard',
        startDate: new Date(),
        maxDuration: 60,
        budgetConstraint: 'Medium'
      };
      
      const result = await mcpService.createTimeline(testProject, null, []);
      
      setTestResults({
        ...testResults,
        timelineCreator: {
          success: true,
          message: `Generated timeline with ${result.timeline.phases.length} phases (${result.timeline.totalDuration} days)`,
          data: result
        }
      });
    } catch (error) {
      setTestResults({
        ...testResults,
        timelineCreator: {
          success: false,
          message: error.message
        }
      });
    }
    setLoading({ ...loading, timelineCreator: false });
  };

  const renderTestResult = (key, title) => {
    const result = testResults[key];
    const isLoading = loading[key];
    
    return (
      <Card variant="outlined">
        <CardContent>
          <Stack spacing={2}>
            <Box display="flex" alignItems="center" justifyContent="space-between">
              <Typography variant="h6">{title}</Typography>
              {result && (
                result.success ? 
                  <CheckCircle color="success" /> : 
                  <Error color="error" />
              )}
            </Box>
            
            {isLoading && (
              <Box display="flex" alignItems="center" gap={1}>
                <CircularProgress size={20} />
                <Typography variant="body2">Testing...</Typography>
              </Box>
            )}
            
            {result && (
              <>
                <Alert 
                  severity={result.success ? (result.mockMode ? 'info' : 'success') : 'error'}
                  icon={result.mockMode ? <Info /> : undefined}
                >
                  {result.message}
                  {result.mockMode && (
                    <Typography variant="caption" display="block" mt={1}>
                      Running in mock mode - configure MCP to use real API
                    </Typography>
                  )}
                </Alert>
                
                {result.data && (
                  <Box>
                    <Typography variant="subtitle2" gutterBottom>
                      Result Preview:
                    </Typography>
                    <Box 
                      component="pre" 
                      sx={{ 
                        backgroundColor: 'grey.100',
                        p: 1,
                        borderRadius: 1,
                        fontSize: '0.75rem',
                        overflow: 'auto',
                        maxHeight: 200
                      }}
                    >
                      {JSON.stringify(result.data, null, 2)}
                    </Box>
                  </Box>
                )}
              </>
            )}
          </Stack>
        </CardContent>
      </Card>
    );
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h5" gutterBottom>
        MCP Integration Test Panel
      </Typography>
      
      <Stack spacing={3}>
        <Box>
          <Typography variant="body2" color="text.secondary" gutterBottom>
            Test the MCP automation features to ensure they're working correctly.
          </Typography>
          
          <Stack direction="row" spacing={1} mt={2}>
            <Chip 
              label={`Script Optimizer: ${isFeatureEnabled('scriptOptimizer') ? 'Enabled' : 'Disabled'}`}
              color={isFeatureEnabled('scriptOptimizer') ? 'success' : 'default'}
              size="small"
            />
            <Chip 
              label={`Timeline Creator: ${isFeatureEnabled('timelineCreator') ? 'Enabled' : 'Disabled'}`}
              color={isFeatureEnabled('timelineCreator') ? 'success' : 'default'}
              size="small"
            />
            <Chip 
              label={`Team Matcher: ${isFeatureEnabled('teamMatcher') ? 'Enabled' : 'Disabled'}`}
              color={isFeatureEnabled('teamMatcher') ? 'success' : 'default'}
              size="small"
            />
          </Stack>
        </Box>
        
        <Stack spacing={2}>
          <Box>
            {renderTestResult('connection', 'MCP Connection')}
            <Button 
              variant="outlined" 
              onClick={testConnection}
              disabled={loading.connection}
              sx={{ mt: 1 }}
            >
              Test Connection
            </Button>
          </Box>
          
          <Box>
            {renderTestResult('scriptOptimizer', 'Script Optimizer')}
            <Button 
              variant="outlined" 
              onClick={testScriptOptimizer}
              disabled={loading.scriptOptimizer || !isFeatureEnabled('scriptOptimizer')}
              sx={{ mt: 1 }}
            >
              Test Script Optimizer
            </Button>
          </Box>
          
          <Box>
            {renderTestResult('timelineCreator', 'Timeline Creator')}
            <Button 
              variant="outlined" 
              onClick={testTimelineCreator}
              disabled={loading.timelineCreator || !isFeatureEnabled('timelineCreator')}
              sx={{ mt: 1 }}
            >
              Test Timeline Creator
            </Button>
          </Box>
        </Stack>
      </Stack>
    </Box>
  );
}