# Experimental Features Guide

## Overview

The EXPERIMENTAL tab contains new features being tested before integration into the main dashboard. These features are isolated to prevent disruption to the stable production environment.

## Current Experimental Features

### 1. MCP Integration
- **Location**: `src/services/mcpService.js`, `src/config/mcpConfig.js`
- **Purpose**: Model Context Protocol integration for AI-powered features
- **Status**: Mock implementation ready, awaiting real MCP SDK

### 2. AI-Powered Tools
- **Script Optimizer**: `src/components/ScriptOptimizer.js`
  - Generates multiple optimized versions of scripts
  - Keyword and style-based optimization
- **Timeline Creator**: `src/components/TimelineCreator.js`
  - AI-generated project timelines
  - Automatic team assignment
  - Integration with project creation

### 3. New Dashboard Layout
- **Location**: `src/pages/ExperimentalDashboard.js`
- **Features**:
  - Widget-based modular design
  - Drag-and-drop interface
  - Smart widgets with real-time data
  - Responsive grid layout

### 4. New Components
- `AutomationsWidget.js` - Hub for AI tools
- `SmartWidgets.js` - Intelligent data widgets
- `QuickLinksWidget.js` - Quick access links
- `ArtistsWorkingWidget.js` - Real-time artist status

## Architecture

```
src/
├── pages/
│   └── ExperimentalDashboard.js    # Main experimental page
├── components/
│   ├── AutomationsWidget.js        # MCP automation hub
│   ├── ScriptOptimizer.js          # Script optimization tool
│   ├── TimelineCreator.js          # Timeline generation tool
│   └── SmartWidgets.js             # Smart widget components
├── services/
│   └── mcpService.js               # MCP integration service
└── config/
    └── mcpConfig.js                # MCP configuration
```

## How to Remove Experimental Features

### Complete Removal
1. Delete the following files:
   ```bash
   rm src/pages/ExperimentalDashboard.js
   rm src/components/AutomationsWidget.js
   rm src/components/ScriptOptimizer.js
   rm src/components/TimelineCreator.js
   rm src/components/SmartWidgets.js
   rm src/components/QuickLinksWidget.js
   rm src/components/ArtistsWorkingWidget.js
   rm src/components/MCPTestPanel.js
   rm src/services/mcpService.js
   rm src/config/mcpConfig.js
   rm -rf docs/experimental-*
   rm docs/mcp-integration-guide.md
   ```

2. Update `src/App.js`:
   - Remove the ExperimentalDashboard import
   - Remove the `/experimental` route

3. Update `src/components/Header.js`:
   - Remove the EXPERIMENTAL button

## How to Merge as Main Dashboard

### Option 1: Replace Current Dashboard
1. Backup current dashboard:
   ```bash
   cp src/pages/Dashboard.js src/pages/Dashboard.backup.js
   ```

2. Replace with experimental:
   ```bash
   cp src/pages/ExperimentalDashboard.js src/pages/Dashboard.js
   ```

3. Update imports in Dashboard.js:
   - Change component name from `ExperimentalDashboard` to `Dashboard`

4. Remove experimental route from App.js

### Option 2: Gradual Integration
1. Copy individual widgets to main dashboard
2. Add MCP features as optional toggles
3. Migrate users gradually

## Dependencies

### NPM Packages
- `@dnd-kit/core` - Drag and drop
- `@dnd-kit/sortable` - Sortable lists
- `framer-motion` - Animations

### Future Dependencies
- `@anthropic/mcp-sdk` - When available

## Configuration

### Enable/Disable Features
Edit `src/config/mcpConfig.js`:
```javascript
features: {
  scriptOptimizer: {
    enabled: true,        // Toggle feature
    useMockData: true,    // Use mock vs real API
  },
  timelineCreator: {
    enabled: true,
    useMockData: true,
  }
}
```

## Testing

### Test MCP Integration
1. Navigate to EXPERIMENTAL tab
2. Use MCPTestPanel component:
   ```javascript
   import { MCPTestPanel } from './components/MCPTestPanel';
   ```

### Mock Data
All AI features currently use sophisticated mock implementations that simulate real responses.

## Known Issues

1. **Performance**: Large widget counts may impact performance
2. **Mobile**: Drag-and-drop needs mobile optimization
3. **Safari**: Some animations may flicker

## Future Roadmap

1. **Real MCP Integration**
   - Connect to Claude API
   - Implement streaming responses
   - Add error handling

2. **Enhanced Features**
   - Team Matcher AI tool
   - Project Research Assistant
   - Automated reporting

3. **UI Improvements**
   - Widget persistence
   - Custom widget creation
   - Advanced layouts

## Support

For issues with experimental features:
1. Check browser console for errors
2. Verify feature flags in mcpConfig.js
3. Test with MCPTestPanel
4. Document issues before merging to main

## Best Practices

1. **Isolation**: Keep experimental code separate
2. **Feature Flags**: Use config to enable/disable
3. **Documentation**: Update docs with changes
4. **Testing**: Test thoroughly before merging
5. **Backup**: Always backup before major changes

---

**Remember**: These are EXPERIMENTAL features. Use in production at your own risk!