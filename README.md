# Studio Dashboard Application

This application is a comprehensive dashboard for managing studio projects and artists. It provides a Gantt chart view for project scheduling, a database view for managing project and artist data, and calculation features for project expenses.

## Application Structure

The application is built using React and follows a component-based architecture. Here's an overview of the main parts of the application:

### Components

- `Header`: The main navigation component.
- `Dashboard`: The home page of the application.
- `GanttView`: Displays projects and artist bookings in a Gantt chart format.
- `DatabaseView`: Provides tables for managing project and artist data.

### Contexts

- `ProjectContext`: Manages the state and operations for projects.
- `ArtistContext`: Manages the state and operations for artists.

### Main Features

1. **Project Management**: Users can add, edit, and delete projects. Each project has a name, start date, end date, and associated artists.

2. **Artist Management**: Users can add, edit, and delete artists. Each artist has a name, daily rate, country, skills, and booking periods.

3. **Gantt Chart View**: Displays projects and artist bookings in a timeline format. Users can adjust bookings directly in this view.

4. **Database View**: Provides sortable and filterable tables for both projects and artists.

5. **Expense Calculation**: Automatically calculates project expenses based on artist bookings and rates.

## How It Works

### Project and Artist Data Management

Project and artist data are managed using React Context. The `ProjectContext` and `ArtistContext` provide the following operations:

- `addProject` / `addArtist`: Adds a new project or artist to the state.
- `updateProject` / `updateArtist`: Updates an existing project or artist.
- `deleteProject` / `deleteArtist`: Removes a project or artist from the state.

These contexts make the data and operations available throughout the application without prop drilling.

### Gantt Chart View

The Gantt chart view uses [library name] to display projects and artist bookings on a timeline. It allows for:

- Viewing project timelines
- Viewing artist bookings across projects
- Drag-and-drop functionality for adjusting bookings

### Database View

The database view uses Material-UI's `Table` component to display project and artist data. It includes:

- Sortable columns
- Filtering functionality
- Edit and delete operations for each entry

### Expense Calculation

Project expenses are calculated based on:
1. The duration of the project
2. The artists booked for the project
3. The daily rate of each artist
4. The duration of each artist's booking

The calculation is performed automatically whenever there's a change in project duration or artist bookings.

## Getting Started

[Include instructions on how to set up and run the project locally]

## Dependencies

[List main dependencies and their purposes]

## Future Improvements

[List any planned features or improvements]
