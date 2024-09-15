import React, { createContext, useContext, useState, useCallback, useEffect, useMemo } from 'react';
import { v4 as uuidv4 } from 'uuid';

const ProjectContext = createContext();

export function useProjects() {
  return useContext(ProjectContext);
}

export function ProjectProvider({ children }) {
  const [projects, setProjects] = useState(() => {
    const storedProjects = localStorage.getItem('projects');
    console.log('Initial projects from localStorage:', storedProjects);
    return storedProjects ? JSON.parse(storedProjects) : [];
  });

  useEffect(() => {
    console.log('Saving projects to localStorage:', projects);
    localStorage.setItem('projects', JSON.stringify(projects));
  }, [projects]);

  const addProject = useCallback((newProject) => {
    setProjects(prevProjects => [...prevProjects, newProject]);
  }, []);

  const updateProject = useCallback((updatedProject) => {
    setProjects(prevProjects => 
      prevProjects.map(project => 
        project.id === updatedProject.id ? updatedProject : project
      )
    );
  }, []);

  const updateBooking = (projectId, updatedBooking) => {
    setProjects(prevProjects => {
      return prevProjects.map(project => {
        if (project.id === projectId) {
          const updatedBookings = project.bookings.map(booking => 
            booking.id === updatedBooking.id ? updatedBooking : booking
          );
          return {
            ...project,
            bookings: updatedBookings,
          };
        }
        return project;
      });
    });
  };

  const addBooking = (projectId, newBooking) => {
    setProjects(prevProjects => 
      prevProjects.map(project => 
        project.id === projectId
          ? { ...project, bookings: [...(project.bookings || []), newBooking] }
          : project
      )
    );
  };

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

  const removeDelivery = useCallback((projectId, deliveryId) => {
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

  const deleteProject = useCallback((projectId) => {
    setProjects(prevProjects => prevProjects.filter(project => project.id !== projectId));
  }, []);

  useEffect(() => {
    localStorage.setItem('projects', JSON.stringify(projects));
  }, [projects]);

  const getActiveProjects = useMemo(() => {
    const currentDate = new Date();
    const oneMonthFromNow = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, currentDate.getDate());

    return projects.filter(project => {
      const startDate = new Date(project.startDate);
      const endDate = new Date(project.endDate);

      return (
        (startDate <= currentDate && endDate >= currentDate) || // Current projects
        (startDate > currentDate && startDate <= oneMonthFromNow) // Projects starting within a month
      );
    });
  }, [projects]);

  const value = {
    projects,
    addProject,
    updateProject,
    deleteProject,
    addBooking,
    removeBooking,
    updateBooking,
    addDelivery,
    editDelivery,
    deleteDelivery,
    updateProjectBudget,
    getActiveProjects, // Add this new function to the context value
    addDelivery,
    removeDelivery,
  };

  return (
    <ProjectContext.Provider value={value}>
      {children}
    </ProjectContext.Provider>
  );
}
