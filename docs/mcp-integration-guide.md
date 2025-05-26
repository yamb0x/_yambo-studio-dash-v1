# MCP Integration Guide

## Overview

The Yambo Studio Dashboard now includes AI-powered automation features through the Model Context Protocol (MCP). This guide explains how to set up and use these features.

## Current Features

### 1. Script Optimizer
- **Purpose**: AI-powered script refinement for various communication needs
- **Status**: ✅ Functional with mock data
- **Location**: Automations widget → Script Optimizer

The Script Optimizer takes your original script and generates multiple optimized versions:
- Professional Version - Corporate-friendly tone
- Concise Version - Shortened while maintaining key message
- Engaging Version - Dynamic and compelling language
- Keyword-Optimized Version - Emphasizes specific keywords

### 2. Intuitive Timeline Creator
- **Purpose**: Generate intelligent project timelines based on requirements
- **Status**: ✅ Functional with mock data
- **Location**: Automations widget → Timeline Creator

The Timeline Creator features:
- 4-step wizard interface
- Natural language team requirements
- Reference project selection for accurate estimation
- Intelligent phase generation based on project type
- Team assignment recommendations
- Budget and duration insights

### 3. Smart Team Matcher
- **Purpose**: Match team members to project requirements using AI
- **Status**: 🚧 Coming Soon
- **Location**: Automations widget → Team Matcher

## Architecture

```
src/
├── services/
│   └── mcpService.js          # Core MCP service with mock implementations
├── config/
│   └── mcpConfig.js           # Configuration and feature flags
├── components/
│   ├── ScriptOptimizer.js     # Script optimization UI
│   ├── TimelineCreator.js     # Timeline generation UI
│   └── AutomationsWidget.js   # Main automation hub
```

## Configuration

The MCP integration is configured in `src/config/mcpConfig.js`:

```javascript
// Feature flags
features: {
  scriptOptimizer: {
    enabled: true,
    useMockData: true,  // Set to false when MCP is connected
  },
  timelineCreator: {
    enabled: true,
    useMockData: true,  // Set to false when MCP is connected
  },
  teamMatcher: {
    enabled: false,     // Coming soon
  }
}
```

## Setting Up Real MCP Integration

### 1. Install MCP SDK (when available)

```bash
npm install @anthropic/mcp-sdk
```

### 2. Configure Environment Variables

Add to your `.env` file:
```
REACT_APP_MCP_ENDPOINT=http://localhost:3001/mcp
REACT_APP_MCP_API_KEY=your-api-key-here
```

### 3. Update Configuration

In `src/config/mcpConfig.js`, set `useMockData: false` for features you want to connect:

```javascript
scriptOptimizer: {
  enabled: true,
  useMockData: false,  // Now uses real MCP
}
```

### 4. Implement MCP Client

In `src/services/mcpService.js`, uncomment and implement the MCP client connection:

```javascript
async connect() {
  try {
    const transport = new StdioClientTransport();
    this.client = new Client(
      { name: "yambo-studio-dashboard" }, 
      { capabilities: {} }
    );
    await this.client.connect(transport);
    this.isConnected = true;
    return true;
  } catch (error) {
    console.error('Failed to connect to MCP:', error);
    return false;
  }
}
```

## Mock Data Behavior

While `useMockData: true`, the system provides realistic mock responses:

### Script Optimizer Mock
- Applies intelligent text transformations
- Generates 3-4 versions based on input
- Simulates 1.5s API delay

### Timeline Creator Mock
- Generates phase-based timelines
- Calculates durations based on complexity
- Assigns team members intelligently
- Provides budget estimates and insights
- Simulates 2s API delay

## Testing Integration

Use the MCPTestPanel component to verify your integration:

```javascript
import { MCPTestPanel } from './components/MCPTestPanel';

// Add to a test route or page
<MCPTestPanel />
```

This panel allows you to:
- Test MCP connection
- Verify each feature independently
- See raw API responses
- Check mock vs real mode

## Troubleshooting

### Common Issues

1. **Features showing as disabled**
   - Check `mcpConfig.js` feature flags
   - Ensure features are set to `enabled: true`

2. **Always using mock data**
   - Verify `useMockData` is set to `false`
   - Check MCP connection status
   - Ensure environment variables are set

3. **Connection failures**
   - Verify MCP server is running
   - Check endpoint URL in config
   - Validate API key

### Debug Mode

Enable debug logging in `mcpService.js`:
```javascript
console.log('MCP Service:', {
  connected: this.isConnected,
  mockMode: shouldUseMockData('scriptOptimizer'),
  config: mcpConfig
});
```

## Future Enhancements

1. **Caching Layer**
   - Implement result caching to reduce API calls
   - Cache duration configurable per feature

2. **Batch Processing**
   - Process multiple scripts at once
   - Generate timelines for multiple projects

3. **Real-time Collaboration**
   - Share optimized scripts with team
   - Collaborative timeline editing

4. **Advanced Analytics**
   - Track usage patterns
   - Measure optimization effectiveness
   - Timeline accuracy metrics

## API Reference

### mcpService.optimizeScript()
```javascript
const result = await mcpService.optimizeScript(
  originalScript,    // string: The script to optimize
  keywords,          // string[]: Focus keywords
  stylePreferences   // string[]: Style preferences
);

// Returns:
{
  versions: [{
    title: string,
    description: string,
    content: string,
    improvements: string[]
  }]
}
```

### mcpService.createTimeline()
```javascript
const result = await mcpService.createTimeline(
  projectData,       // object: Project requirements
  referenceProject,  // object: Optional reference project
  artists           // array: Available team members
);

// Returns:
{
  timeline: {
    totalDuration: number,
    startDate: Date,
    endDate: Date,
    phases: [{
      name: string,
      startDate: Date,
      endDate: Date,
      duration: number,
      assignedTeam: array,
      deliverables: array,
      dependencies: array
    }]
  },
  insights: string[]
}
```