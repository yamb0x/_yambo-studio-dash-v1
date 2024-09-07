import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';

const ProjectContext = createContext();

export function useProjects() {
  return useContext(ProjectContext);
}

export function ProjectProvider({ children }) {
  const [projects, setProjects] = useState(() => {
    const savedProjects = localStorage.getItem('projects');
    return savedProjects ? JSON.parse(savedProjects) : [];
  });

  const updateBooking = useCallback((projectId, updatedBooking) => {
    setProjects(prevProjects => 
      prevProjects.map(project => 
        project.id === projectId
          ? {
              ...project,
              bookings: project.bookings.map(booking =>
                booking.id === updatedBooking.id ? updatedBooking : booking
              )
            }
          : project
      )
    );
  }, []);

  const addBooking = useCallback((newBooking) => {
    setProjects(prevProjects =>
      prevProjects.map(project =>
        project.id === newBooking.projectId
          ? {
              ...project,
              bookings: [...(project.bookings || []), newBooking]
            }
          : project
      )
    );
  }, []);

  const removeBooking = useCallback((projectId, bookingId) => {
    setProjects(prevProjects =>
      prevProjects.map(project =>
        project.id === projectId
          ? {
              ...project,
              bookings: project.bookings.filter(booking => booking.id !== bookingId)
            }
          : project
      )
    );
  }, []);

  const addProject = useCallback((newProject) => {
    setProjects(prevProjects => [...prevProjects, { ...newProject, id: Date.now() }]);
  }, []);

  useEffect(() => {
    localStorage.setItem('projects', JSON.stringify(projects));
  }, [projects]);

  return (
    <ProjectContext.Provider value={{ projects, updateBooking, addBooking, removeBooking, addProject }}>
      {children}
    </ProjectContext.Provider>
  );
}
