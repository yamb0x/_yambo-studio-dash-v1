import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { database, ref, set, get, push, remove } from '../firebase';

const ProjectContext = createContext();

export function useProjects() {
  return useContext(ProjectContext);
}

export function ProjectProvider({ children }) {
  const [projects, setProjects] = useState([]);

  useEffect(() => {
    const fetchProjects = async () => {
      const projectsRef = ref(database, 'projects');
      const snapshot = await get(projectsRef);
      if (snapshot.exists()) {
        const projectsData = snapshot.val();
        const projectsArray = Object.keys(projectsData).map(key => ({
          id: key,
          ...projectsData[key]
        }));
        setProjects(projectsArray);
      }
    };
    fetchProjects();
  }, []);

  const addProject = useCallback(async (project) => {
    const projectsRef = ref(database, 'projects');
    const newProjectRef = push(projectsRef);
    const newProject = { ...project, id: newProjectRef.key };
    await set(newProjectRef, newProject);
    setProjects(prevProjects => [...prevProjects, newProject]);
  }, []);

  const updateProject = useCallback(async (updatedProject) => {
    const projectRef = ref(database, `projects/${updatedProject.id}`);
    await set(projectRef, updatedProject);
    setProjects(prevProjects => prevProjects.map(project => 
      project.id === updatedProject.id ? updatedProject : project
    ));
  }, []);

  const deleteProject = useCallback(async (projectId) => {
    const projectRef = ref(database, `projects/${projectId}`);
    await remove(projectRef);
    setProjects(prevProjects => prevProjects.filter(project => project.id !== projectId));
  }, []);

  const updateBooking = useCallback(async (projectId, updatedBooking) => {
    const projectRef = ref(database, `projects/${projectId}`);
    const snapshot = await get(projectRef);
    if (snapshot.exists()) {
      const project = snapshot.val();
      const updatedBookings = project.bookings.map(booking => 
        booking.id === updatedBooking.id ? updatedBooking : booking
      );
      await set(projectRef, { ...project, bookings: updatedBookings });
      setProjects(prevProjects => prevProjects.map(p => 
        p.id === projectId ? { ...p, bookings: updatedBookings } : p
      ));
    }
  }, []);

  const addBooking = useCallback(async (projectId, newBooking) => {
    const projectRef = ref(database, `projects/${projectId}`);
    const snapshot = await get(projectRef);
    if (snapshot.exists()) {
      const project = snapshot.val();
      const updatedBookings = [...(project.bookings || []), newBooking];
      await set(projectRef, { ...project, bookings: updatedBookings });
      setProjects(prevProjects => prevProjects.map(p => 
        p.id === projectId ? { ...p, bookings: updatedBookings } : p
      ));
    }
  }, []);

  const removeBooking = useCallback(async (projectId, bookingId) => {
    const projectRef = ref(database, `projects/${projectId}`);
    const snapshot = await get(projectRef);
    if (snapshot.exists()) {
      const project = snapshot.val();
      const updatedBookings = project.bookings.filter(booking => booking.id !== bookingId);
      await set(projectRef, { ...project, bookings: updatedBookings });
      setProjects(prevProjects => prevProjects.map(p => 
        p.id === projectId ? { ...p, bookings: updatedBookings } : p
      ));
    }
  }, []);

  const value = {
    projects,
    addProject,
    updateProject,
    deleteProject,
    updateBooking,
    addBooking,
    removeBooking,
  };

  return (
    <ProjectContext.Provider value={value}>
      {children}
    </ProjectContext.Provider>
  );
}
