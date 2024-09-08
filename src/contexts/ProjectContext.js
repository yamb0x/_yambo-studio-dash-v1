import React, { createContext, useState, useContext, useCallback, useEffect } from 'react';

const ProjectContext = createContext();

export function useProjects() {
  return useContext(ProjectContext);
}

export function ProjectProvider({ children }) {
  const [projects, setProjects] = useState(() => {
    const savedProjects = localStorage.getItem('projects');
    return savedProjects ? JSON.parse(savedProjects) : [];
  });

  const updateBooking = (projectId, updatedBooking) => {
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
  };

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

  const deleteProject = useCallback((projectId) => {
    setProjects(prevProjects => prevProjects.filter(project => project.id !== projectId));
  }, []);

  const addDelivery = useCallback((projectId, newDelivery) => {
    setProjects(prevProjects =>
      prevProjects.map(project =>
        project.id === projectId
          ? {
              ...project,
              deliveries: [...(project.deliveries || []), newDelivery]
            }
          : project
      )
    );
  }, []);

  const editDelivery = useCallback((projectId, updatedDelivery) => {
    setProjects(prevProjects =>
      prevProjects.map(project =>
        project.id === projectId
          ? {
              ...project,
              deliveries: project.deliveries.map(delivery =>
                delivery.id === updatedDelivery.id ? updatedDelivery : delivery
              )
            }
          : project
      )
    );
  }, []);

  const deleteDelivery = useCallback((projectId, deliveryId) => {
    setProjects(prevProjects =>
      prevProjects.map(project =>
        project.id === projectId
          ? {
              ...project,
              deliveries: project.deliveries.filter(delivery => delivery.id !== deliveryId)
            }
          : project
      )
    );
  }, []);

  const updateProjectBudget = useCallback((projectId, newBudget) => {
    setProjects(prevProjects =>
      prevProjects.map(project =>
        project.id === projectId
          ? { ...project, budget: newBudget }
          : project
      )
    );
  }, []);

  useEffect(() => {
    localStorage.setItem('projects', JSON.stringify(projects));
  }, [projects]);

  return (
    <ProjectContext.Provider value={{ 
      projects, 
      updateBooking, 
      addBooking, 
      removeBooking, 
      addProject, 
      deleteProject,
      addDelivery,
      editDelivery,
      deleteDelivery,
      updateProjectBudget // Add this new function to the context
    }}>
      {children}
    </ProjectContext.Provider>
  );
}
