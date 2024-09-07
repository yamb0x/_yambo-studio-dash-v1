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

2. **Artist Management**: Users can add, edit, and delete artists. Each artist has a name, daily rate, country, skills, email, website, and favorite status.

3. **Gantt Chart View**: Displays projects and artist bookings in a timeline format. Users can select projects, view associated bookings, and adjust bookings using drag-and-drop functionality.

4. **Database View**: Provides sortable and filterable tables for both projects and artists.

5. **Local Storage**: Project and artist data are stored in the browser's local storage for persistence.

6. **Expense Calculation**: Automatically calculates project expenses based on artist bookings and their daily rates.

## How It Works

### Project and Artist Data Management

Project and artist data are managed using React Context. The `ProjectContext` and `ArtistContext` provide the following operations:

- `addProject` / `addArtist`: Adds a new project or artist to the state.
- `updateProject` / `updateArtist`: Updates an existing project or artist.
- `deleteProject` / `deleteArtist`: Removes a project or artist from the state.

These contexts make the data and operations available throughout the application without prop drilling.

### Gantt Chart View

The Gantt chart view allows for:

- Viewing project timelines
- Viewing artist bookings across projects
- Selecting projects to view associated bookings
- Drag-and-drop functionality for adjusting artist bookings
- Automatic recalculation of project expenses when bookings are adjusted

### Database View

The database view uses Material-UI's `Table` component to display project and artist data. It includes:

- Sortable columns
- Filtering functionality
- Edit and delete operations for each entry

### Expense Calculation

The application calculates project expenses based on:

- The duration of each artist's booking within the project
- Each artist's daily rate
- The total duration of all bookings for each artist in the project

This calculation is updated in real-time as bookings are adjusted in the Gantt chart view.

## Getting Started

[Include instructions on how to set up and run the project locally]

## Dependencies

[List main dependencies and their purposes]

## Future Improvements

- Enhance the drag-and-drop functionality for adjusting bookings in the Gantt view
- Implement more detailed expense breakdowns and reports
- Add filtering functionality to the database views
- Enhance the dashboard with summary widgets and expense charts
