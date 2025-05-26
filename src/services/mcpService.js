/**
 * EXPERIMENTAL SERVICE - MCP Integration
 * Model Context Protocol service for AI features
 * Currently using mock implementations
 * 
 * TO REMOVE: Delete this file and src/config/mcpConfig.js
 * TO INTEGRATE: Install @anthropic/mcp-sdk and update connection logic
 */

// MCP Service for AI-powered automation features
// This service handles communication with Claude API for script optimization and timeline generation

import { mcpConfig, shouldUseMockData } from '../config/mcpConfig';

class MCPService {
  constructor() {
    this.isConnected = false;
    this.client = null;
  }

  // Initialize MCP connection
  async connect() {
    try {
      // TODO: Implement actual MCP client connection
      // const transport = new StdioClientTransport();
      // this.client = new Client({ name: "yambo-studio-dashboard" }, { capabilities: {} });
      // await this.client.connect(transport);
      
      this.isConnected = true;
      // MCP Service connected (mock mode)
      return true;
    } catch (error) {
      console.error('Failed to connect to MCP:', error);
      return false;
    }
  }

  // Optimize script using Claude via MCP
  async optimizeScript(originalScript, keywords = [], stylePreferences = []) {
    if (shouldUseMockData('scriptOptimizer')) {
      // Using mock optimization (configured)
      return this.mockOptimizeScript(originalScript, keywords);
    }
    
    if (!this.isConnected) {
      console.warn('MCP not connected, falling back to mock optimization');
      return this.mockOptimizeScript(originalScript, keywords);
    }

    try {
      // TODO: Implement actual MCP tool call
      const prompt = this.buildOptimizationPrompt(originalScript, keywords, stylePreferences);
      
      // const result = await this.client.callTool('optimize_script', {
      //   original_script: originalScript,
      //   keywords: keywords,
      //   style_preferences: stylePreferences,
      //   versions_requested: 3
      // });
      
      // For now, return mock data
      return this.mockOptimizeScript(originalScript, keywords);
    } catch (error) {
      console.error('Script optimization failed:', error);
      throw new Error('Failed to optimize script');
    }
  }

  // Build optimization prompt for Claude
  buildOptimizationPrompt(script, keywords, styles) {
    return `
Please optimize this script in 3 different ways:

Original Script:
"${script}"

Focus Keywords: ${keywords.join(', ')}
Style Preferences: ${styles.join(', ')}

Please provide:
1. Professional Version - Corporate-friendly, formal tone
2. Concise Version - Shortened while maintaining key message  
3. Engaging Version - More dynamic and compelling language

For each version, include:
- The optimized script text
- Key improvements made
- Brief description of the approach

Format as JSON with this structure:
{
  "versions": [
    {
      "title": "Professional Version",
      "description": "Corporate-friendly tone...",
      "content": "optimized script text...",
      "improvements": ["improvement1", "improvement2", ...]
    }
  ]
}
    `;
  }

  // Enhanced mock optimization with more sophisticated transformations
  mockOptimizeScript(originalScript, keywords) {
    return new Promise((resolve) => {
      setTimeout(() => {
        // Base transformations for each version
        const versions = [];
        
        // Professional Version
        let professionalContent = originalScript
          .replace(/\b(awesome|great|cool|nice)\b/gi, (match) => {
            const replacements = {
              'awesome': 'exceptional',
              'great': 'excellent',
              'cool': 'innovative',
              'nice': 'professional'
            };
            return replacements[match.toLowerCase()] || match;
          })
          .replace(/\b(hey|hi|hello)\b/gi, 'Greetings')
          .replace(/!/g, '.')
          .replace(/\b(gonna|wanna|gotta)\b/gi, (match) => {
            const replacements = {
              'gonna': 'going to',
              'wanna': 'want to',
              'gotta': 'need to'
            };
            return replacements[match.toLowerCase()] || match;
          });
          
        versions.push({
          title: 'Professional Version',
          description: 'Corporate-friendly tone with industry terminology',
          content: professionalContent,
          improvements: [
            'Professional tone throughout',
            'Industry-standard terminology',
            'Formal grammatical structure',
            'Removed colloquialisms'
          ]
        });
        
        // Concise Version - smarter shortening
        const sentences = originalScript.match(/[^.!?]+[.!?]+/g) || [originalScript];
        let conciseContent = sentences
          .filter((sentence, index) => {
            // Keep first and last sentences, and key sentences with keywords
            if (index === 0 || index === sentences.length - 1) return true;
            return keywords.some(keyword => 
              sentence.toLowerCase().includes(keyword.toLowerCase())
            );
          })
          .join(' ')
          .replace(/\s+/g, ' ')
          .trim();
          
        versions.push({
          title: 'Concise Version',
          description: 'Streamlined for maximum impact',
          content: conciseContent,
          improvements: [
            `Reduced to ${Math.round((conciseContent.length / originalScript.length) * 100)}% of original`,
            'Retained all key messages',
            'Improved readability',
            'Focus on essential points'
          ]
        });
        
        // Engaging Version
        let engagingContent = originalScript
          .replace(/\b(will|can|should)\b/gi, (match) => {
            const replacements = {
              'will': 'will definitely',
              'can': 'can easily',
              'should': 'must'
            };
            return replacements[match.toLowerCase()] || match;
          })
          .replace(/\./g, '!')
          .replace(/\b(good|nice|okay)\b/gi, (match) => {
            const replacements = {
              'good': 'outstanding',
              'nice': 'remarkable',
              'okay': 'fantastic'
            };
            return replacements[match.toLowerCase()] || match;
          });
          
        versions.push({
          title: 'Engaging Version',
          description: 'Dynamic language that captures attention',
          content: engagingContent,
          improvements: [
            'Energetic and compelling tone',
            'Action-oriented language',
            'Emotional engagement',
            'Strong call-to-action'
          ]
        });

        // Keyword-specific optimizations
        if (keywords.length > 0) {
          let keywordOptimized = originalScript;
          
          // Highlight keywords by making them more prominent
          keywords.forEach(keyword => {
            const regex = new RegExp(`\\b(${keyword})\\b`, 'gi');
            keywordOptimized = keywordOptimized.replace(regex, (match) => {
              return match.charAt(0).toUpperCase() + match.slice(1);
            });
          });
          
          versions.push({
            title: 'Keyword-Optimized Version',
            description: `Emphasizes: ${keywords.join(', ')}`,
            content: keywordOptimized,
            improvements: [
              `Enhanced focus on ${keywords.length} key terms`,
              'SEO-friendly structure',
              'Keyword prominence increased',
              'Natural keyword integration'
            ]
          });
        }

        resolve({ versions });
      }, 1500);
    });
  }

  // Create timeline based on project requirements and reference data
  async createTimeline(projectData, referenceProject = null, artists = []) {
    if (shouldUseMockData('timelineCreator')) {
      // Using mock timeline creation (configured)
      return this.mockCreateTimeline(projectData, referenceProject, artists);
    }
    
    if (!this.isConnected) {
      console.warn('MCP not connected, falling back to mock timeline creation');
      return this.mockCreateTimeline(projectData, referenceProject, artists);
    }

    try {
      // TODO: Implement actual MCP tool call
      const prompt = this.buildTimelinePrompt(projectData, referenceProject, artists);
      
      // const result = await this.client.callTool('create_timeline', {
      //   project_data: projectData,
      //   reference_project: referenceProject,
      //   available_artists: artists,
      //   team_requirements: projectData.teamRequirements
      // });
      
      // For now, return mock data
      return this.mockCreateTimeline(projectData, referenceProject, artists);
    } catch (error) {
      console.error('Timeline creation failed:', error);
      throw new Error('Failed to create timeline');
    }
  }

  // Build timeline creation prompt for Claude
  buildTimelinePrompt(projectData, referenceProject, artists) {
    return `
Create a detailed project timeline based on the following requirements:

Project Details:
- Name: ${projectData.projectName}
- Type: ${projectData.projectType}
- Complexity: ${projectData.complexity}
- Urgency: ${projectData.urgency}
- Start Date: ${projectData.startDate}
- Deliverables: ${projectData.deliverables.join(', ')}

${referenceProject ? `
Reference Project (for duration estimation):
- Name: ${referenceProject.name}
- Duration: ${Math.ceil((new Date(referenceProject.endDate) - new Date(referenceProject.startDate)) / (1000 * 60 * 60 * 24))} days
- Use this as a baseline for similar project phases
` : ''}

Team Requirements:
"${projectData.teamRequirements}"

Available Artists:
${artists.map(artist => `- ${artist.name}: Skills: ${artist.skills?.join(', ') || 'General'}, Rate: $${artist.dailyRate || 'TBD'}/day`).join('\n')}

Please create:
1. Project phases with realistic durations
2. Team assignments based on requirements and available artists
3. Dependencies between phases
4. Deliverable mapping to phases
5. Insights and recommendations

Format as JSON with this structure:
{
  "timeline": {
    "totalDuration": number,
    "startDate": "date",
    "endDate": "date", 
    "phases": [
      {
        "name": "phase name",
        "startDate": "date",
        "endDate": "date",
        "duration": number,
        "assignedTeam": [
          {
            "role": "role description",
            "artist": "artist name",
            "involvement": "percentage",
            "dailyRate": number
          }
        ],
        "deliverables": ["deliverable1", "deliverable2"],
        "dependencies": ["previous phase names"]
      }
    ]
  },
  "insights": ["insight1", "insight2", ...]
}
    `;
  }

  // Enhanced mock timeline creation with intelligent phase generation
  mockCreateTimeline(projectData, referenceProject, artists) {
    return new Promise((resolve) => {
      setTimeout(() => {
        // Calculate duration from end date if provided, otherwise from reference or default
        let adjustedDuration;
        
        if (projectData.endDate && projectData.startDate) {
          // Use provided dates
          adjustedDuration = Math.ceil((new Date(projectData.endDate) - new Date(projectData.startDate)) / (1000 * 60 * 60 * 24));
        } else if (projectData.maxDuration) {
          // Use max duration if specified
          adjustedDuration = projectData.maxDuration;
        } else if (referenceProject) {
          // Use reference project duration
          adjustedDuration = Math.ceil((new Date(referenceProject.endDate) - new Date(referenceProject.startDate)) / (1000 * 60 * 60 * 24));
        } else {
          // Default duration based on project type
          const defaultDurations = {
            'Commercial': 45,
            'Art': 30,
            'Studio': 20
          };
          adjustedDuration = defaultDurations[projectData.projectType] || 30;
        }

        // Generate phases based on project type
        const phases = this.generateProjectPhases(
          projectData, 
          adjustedDuration, 
          artists
        );

        const timeline = {
          totalDuration: adjustedDuration,
          startDate: projectData.startDate,
          endDate: new Date(projectData.startDate.getTime() + adjustedDuration * 24 * 60 * 60 * 1000),
          phases: phases
        };

        // Generate intelligent insights
        const insights = this.generateTimelineInsights(
          projectData, 
          adjustedDuration, 
          referenceProject, 
          phases
        );

        resolve({ timeline, insights });
      }, 2000);
    });
  }

  // Generate project phases based on type and deliverables
  generateProjectPhases(projectData, totalDuration, artists) {
    const phases = [];
    let currentDate = new Date(projectData.startDate);
    
    // Define phase templates based on project type
    const phaseTemplates = {
      'Commercial': [
        { name: 'Pre-Production', percentage: 0.20, deliverables: ['Brand film + KVs', 'KVs'] },
        { name: 'Production', percentage: 0.30, deliverables: ['Brand film + KVs'] },
        { name: 'Post-Production', percentage: 0.35, deliverables: ['Brand film + KVs', 'KVs'] },
        { name: 'Delivery & Revisions', percentage: 0.15, deliverables: ['Brand film + KVs', 'KVs', 'Custom'] }
      ],
      'Art': [
        { name: 'Concept Development', percentage: 0.25, deliverables: ['Custom'] },
        { name: 'Creation', percentage: 0.45, deliverables: ['Custom'] },
        { name: 'Refinement', percentage: 0.20, deliverables: ['Custom'] },
        { name: 'Final Delivery', percentage: 0.10, deliverables: ['Custom'] }
      ],
      'Studio': [
        { name: 'Planning', percentage: 0.15, deliverables: ['Custom'] },
        { name: 'Development', percentage: 0.50, deliverables: ['Custom'] },
        { name: 'Review & Iteration', percentage: 0.25, deliverables: ['Custom'] },
        { name: 'Finalization', percentage: 0.10, deliverables: ['Custom'] }
      ]
    };
    
    // Get templates for the project type or use default
    const templates = phaseTemplates[projectData.projectType] || phaseTemplates['Commercial'];
    
    // Parse team requirements to assign roles
    const teamRequirements = this.parseTeamRequirements(projectData.teamRequirements);
    
    templates.forEach((template, index) => {
      const phaseDuration = Math.round(totalDuration * template.percentage);
      const phaseEndDate = new Date(currentDate.getTime() + phaseDuration * 24 * 60 * 60 * 1000);
      
      // Match deliverables from project data to phase
      const phaseDeliverables = template.deliverables.filter(del => 
        projectData.deliverables.some(projDel => 
          projDel.toLowerCase().includes(del.toLowerCase()) ||
          del.toLowerCase().includes(projDel.toLowerCase())
        )
      );
      
      // If no matching deliverables, use template defaults
      if (phaseDeliverables.length === 0) {
        phaseDeliverables.push(...template.deliverables.slice(0, 2));
      }
      
      // Assign team based on phase requirements
      const assignedTeam = this.assignTeamToPhase(
        template.name, 
        teamRequirements, 
        artists,
        index
      );
      
      phases.push({
        name: template.name,
        startDate: new Date(currentDate),
        endDate: phaseEndDate,
        duration: phaseDuration,
        assignedTeam: assignedTeam,
        deliverables: phaseDeliverables,
        dependencies: index > 0 ? [phases[index - 1].name] : []
      });
      
      currentDate = phaseEndDate;
    });
    
    return phases;
  }

  // Parse natural language team requirements
  parseTeamRequirements(requirements) {
    const roles = [];
    const lowerReq = requirements.toLowerCase();
    
    // Common role patterns
    const rolePatterns = [
      { pattern: /senior.*(designer|developer|engineer)/gi, role: 'Senior Designer', level: 'senior' },
      { pattern: /junior.*(designer|developer)/gi, role: 'Junior Designer', level: 'junior' },
      { pattern: /ui.*(designer|developer)/gi, role: 'UI Designer', skill: 'UI' },
      { pattern: /ux.*(designer|researcher)/gi, role: 'UX Designer', skill: 'UX' },
      { pattern: /mobile.*(developer|designer)/gi, role: 'Mobile Developer', skill: 'mobile' },
      { pattern: /frontend/gi, role: 'Frontend Developer', skill: 'frontend' },
      { pattern: /backend/gi, role: 'Backend Developer', skill: 'backend' },
      { pattern: /prototyp/gi, role: 'Prototyping Specialist', skill: 'prototyping' }
    ];
    
    rolePatterns.forEach(({ pattern, role, level, skill }) => {
      if (pattern.test(lowerReq)) {
        roles.push({ role, level, skill });
      }
    });
    
    // Default if no specific roles found
    if (roles.length === 0) {
      roles.push({ role: 'Designer', level: 'mid', skill: 'general' });
    }
    
    return roles;
  }

  // Assign team members to phase
  assignTeamToPhase(phaseName, teamRequirements, artists, phaseIndex) {
    const assignments = [];
    const availableArtists = [...artists];
    
    // Match team requirements to available artists
    teamRequirements.forEach((requirement, index) => {
      // Try to find matching artist based on skills
      let matchedArtist = availableArtists.find(artist => {
        if (requirement.skill && artist.skills) {
          return artist.skills.some(skill => 
            skill.toLowerCase().includes(requirement.skill.toLowerCase())
          );
        }
        return false;
      });
      
      // If no skill match, assign based on availability
      if (!matchedArtist && availableArtists.length > 0) {
        matchedArtist = availableArtists[phaseIndex % availableArtists.length];
      }
      
      // Default artist if none available
      if (!matchedArtist) {
        const defaultArtists = [
          { name: 'Marina Chen', dailyRate: 400, skills: ['UI', 'UX'] },
          { name: 'Alex Rivera', dailyRate: 350, skills: ['Frontend', 'Mobile'] },
          { name: 'Sam Kim', dailyRate: 450, skills: ['Senior', 'Architecture'] }
        ];
        matchedArtist = defaultArtists[index % defaultArtists.length];
      }
      
      assignments.push({
        role: requirement.role,
        artist: matchedArtist.name,
        involvement: phaseName.includes('Research') ? '50%' : '100%',
        dailyRate: matchedArtist.dailyRate || 400
      });
    });
    
    return assignments;
  }

  // Generate intelligent timeline insights
  generateTimelineInsights(projectData, duration, referenceProject, phases) {
    const insights = [];
    
    // Duration insight
    insights.push(
      `Timeline spans ${duration} days with ${phases.length} distinct phases for ${projectData.projectType} project`
    );
    
    // Reference project insight
    if (referenceProject) {
      const refDuration = Math.ceil(
        (new Date(referenceProject.endDate) - new Date(referenceProject.startDate)) / 
        (1000 * 60 * 60 * 24)
      );
      const difference = duration - refDuration;
      insights.push(
        `Based on reference project "${referenceProject.name}" (${refDuration} days), ` +
        `timeline is ${Math.abs(difference)} days ${difference > 0 ? 'longer' : 'shorter'}`
      );
    }
    
    // Team composition insight
    const totalTeamMembers = new Set(
      phases.flatMap(phase => phase.assignedTeam.map(member => member.artist))
    ).size;
    insights.push(
      `Requires ${totalTeamMembers} team members across all phases, ` +
      `with parallel work possible in ${phases.filter(p => p.assignedTeam.some(m => m.involvement !== '100%')).length} phases`
    );
    
    // Budget insight
    const estimatedCost = phases.reduce((total, phase) => {
      return total + phase.assignedTeam.reduce((phaseTotal, member) => {
        const involvement = parseFloat(member.involvement) / 100;
        return phaseTotal + (member.dailyRate * phase.duration * involvement);
      }, 0);
    }, 0);
    insights.push(
      `Estimated team cost: $${estimatedCost.toLocaleString()} based on current rates and assignments`
    );
    
    // Critical path insight
    insights.push(
      `Critical path includes ${phases.filter(p => p.dependencies.length > 0).length} dependent phases - ` +
      `consider parallel execution where possible to reduce timeline`
    );
    
    return insights;
  }

  // Disconnect MCP client
  async disconnect() {
    try {
      if (this.client) {
        await this.client.close();
      }
      this.isConnected = false;
      // MCP Service disconnected
    } catch (error) {
      console.error('Error disconnecting MCP:', error);
    }
  }
}

// Export singleton instance
export const mcpService = new MCPService();

// Auto-connect on import (you might want to do this elsewhere)
// mcpService.connect();