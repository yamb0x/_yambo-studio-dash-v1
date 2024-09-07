import React, { createContext, useContext, useState, useEffect } from 'react';

const ProjectContext = createContext();

export function useProjects() {
  return useContext(ProjectContext);
}

export function ProjectProvider({ children }) {
  const [projects, setProjects] = useState(() => {
    const storedProjects = localStorage.getItem('projects');
    return storedProjects
      ? JSON.parse(storedProjects).map(project => ({
          ...project,
          bookings: project.bookings || []
        }))
      : [];
  });

  useEffect(() => {
    localStorage.setItem('projects', JSON.stringify(projects));
  }, [projects]);

  const addProject = (newProject) => {
    setProjects((prevProjects) => [...prevProjects, { ...newProject, id: Date.now(), bookings: [] }]);
  };

  const updateProject = (updatedProject) => {
    setProjects((prevProjects) =>
      prevProjects.map((project) =>
        project.id === updatedProject.id ? { ...updatedProject, bookings: updatedProject.bookings || [] } : project
      )
    );
  };

  const deleteProject = (projectId) => {
    setProjects((prevProjects) => prevProjects.filter((project) => project.id !== projectId));
  };

  const updateBooking = (updatedBooking) => {
    setProjects((prevProjects) => {
      return prevProjects.map((project) => {
        if (project.id === updatedBooking.projectId) {
          const updatedBookings = project.bookings.map((booking) =>
            booking.id === updatedBooking.id ? updatedBooking : booking
          );
          return { ...project, bookings: updatedBookings };
        }
        return project;
      });
    });
  };

  const addBooking = (newBooking) => {
    setProjects((prevProjects) => {
      return prevProjects.map((project) => {
        if (project.id === newBooking.projectId) {
          const updatedBookings = [...project.bookings, { ...newBooking, id: Date.now() }];
          return { ...project, bookings: updatedBookings };
        }
        return project;
      });
    });
  };

  const value = {
    projects,
    addProject,
    updateProject,
    deleteProject,
    updateBooking,
    addBooking,
  };

  return <ProjectContext.Provider value={value}>{children}</ProjectContext.Provider>;
}
