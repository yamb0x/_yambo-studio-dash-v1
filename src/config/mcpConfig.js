// MCP Configuration
// This file contains configuration for the Model Context Protocol integration

export const mcpConfig = {
  // API endpoint configuration
  api: {
    // When MCP is ready, update these endpoints
    endpoint: process.env.REACT_APP_MCP_ENDPOINT || 'http://localhost:3001/mcp',
    apiKey: process.env.REACT_APP_MCP_API_KEY || '',
    timeout: 30000, // 30 seconds
  },
  
  // Feature flags
  features: {
    scriptOptimizer: {
      enabled: true,
      useMockData: true, // Set to false when MCP is connected
      maxVersions: 4,
      cacheResults: true,
      cacheDuration: 3600000, // 1 hour
    },
    timelineCreator: {
      enabled: true,
      useMockData: true, // Set to false when MCP is connected
      maxPhases: 10,
      defaultDuration: 30,
      includeWeekends: false,
    },
    teamMatcher: {
      enabled: false, // Coming soon
      useMockData: true,
    }
  },
  
  // Claude model preferences
  modelPreferences: {
    scriptOptimization: {
      model: 'claude-3-opus', // or claude-3-sonnet for faster responses
      temperature: 0.7,
      maxTokens: 2000,
    },
    timelineGeneration: {
      model: 'claude-3-opus',
      temperature: 0.5, // Lower for more consistent timelines
      maxTokens: 3000,
    }
  },
  
  // Rate limiting
  rateLimits: {
    requestsPerMinute: 10,
    requestsPerHour: 100,
    concurrentRequests: 3,
  },
  
  // Error handling
  errorHandling: {
    retryAttempts: 3,
    retryDelay: 1000, // ms
    fallbackToMock: true,
    logErrors: true,
  }
};

// Helper function to check if a feature should use mock data
export const shouldUseMockData = (feature) => {
  return mcpConfig.features[feature]?.useMockData ?? true;
};

// Helper function to check if a feature is enabled
export const isFeatureEnabled = (feature) => {
  return mcpConfig.features[feature]?.enabled ?? false;
};