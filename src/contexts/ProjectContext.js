import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { database, ref, set, get, push, remove, onValue, off } from '../firebase';

const ProjectContext = createContext();

export function useProjects() {
  return useContext(ProjectContext);
}

export function ProjectProvider({ children }) {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const projectsRef = ref(database, 'projects');
    
    const unsubscribe = onValue(projectsRef, (snapshot) => {
      if (snapshot.exists()) {
        const projectsData = snapshot.val();
        const projectsArray = Object.keys(projectsData).map(key => ({
          id: key,
          ...projectsData[key]
        }));
        setProjects(projectsArray);
      } else {
        setProjects([]);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const addProject = useCallback(async (newProject) => {
    const projectsRef = ref(database, 'projects');
    const newProjectRef = push(projectsRef);
    await set(newProjectRef, newProject);
  }, []);

  const updateProject = useCallback(async (updatedProject) => {
    const projectRef = ref(database, `projects/${updatedProject.id}`);
    await set(projectRef, updatedProject);
  }, []);

  const deleteProject = useCallback(async (projectId) => {
    const projectRef = ref(database, `projects/${projectId}`);
    await remove(projectRef);
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
    loading,
    addProject,
    updateProject,
    deleteProject,
    updateBooking,
    addBooking,
    removeBooking,
    getActiveProjects,
  };

  return (
    <ProjectContext.Provider value={value}>
      {children}
    </ProjectContext.Provider>
  );
}
