import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
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

  const addProject = async (newProject) => {
    const projectsRef = ref(database, 'projects');
    const newProjectRef = push(projectsRef);
    await set(newProjectRef, newProject);
    setProjects(prevProjects => [...prevProjects, { id: newProjectRef.key, ...newProject }]);
  };

  const updateProject = async (updatedProject) => {
    const projectRef = ref(database, `projects/${updatedProject.id}`);
    await set(projectRef, updatedProject);
    setProjects(prevProjects => 
      prevProjects.map(project => 
        project.id === updatedProject.id ? updatedProject : project
      )
    );
  };

  const updateBooking = async (projectId, updatedBooking) => {
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
  };

  const addBooking = async (projectId, newBooking) => {
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
  };

  const removeBooking = async (projectId, bookingId) => {
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
  };

  const addDelivery = useCallback(async (projectId, newDelivery) => {
    const projectRef = ref(database, `projects/${projectId}`);
    const snapshot = await get(projectRef);
    if (snapshot.exists()) {
      const project = snapshot.val();
      const updatedDeliveries = [...(project.deliveries || []), newDelivery];
      await set(projectRef, { ...project, deliveries: updatedDeliveries });
      setProjects(prevProjects =>
        prevProjects.map(p =>
          p.id === projectId
            ? { ...p, deliveries: updatedDeliveries }
            : p
        )
      );
    }
  }, []);

  const removeDelivery = useCallback(async (projectId, deliveryId) => {
    const projectRef = ref(database, `projects/${projectId}`);
    const snapshot = await get(projectRef);
    if (snapshot.exists()) {
      const project = snapshot.val();
      const updatedDeliveries = project.deliveries.filter(delivery => delivery.id !== deliveryId);
      await set(projectRef, { ...project, deliveries: updatedDeliveries });
      setProjects(prevProjects =>
        prevProjects.map(p =>
          p.id === projectId
            ? { ...p, deliveries: updatedDeliveries }
            : p
        )
      );
    }
  }, []);

  const updateDelivery = useCallback(async (projectId, deliveryId, updatedDelivery) => {
    const projectRef = ref(database, `projects/${projectId}`);
    const snapshot = await get(projectRef);
    if (snapshot.exists()) {
      const project = snapshot.val();
      const updatedDeliveries = project.deliveries.map(delivery =>
        delivery.id === deliveryId
          ? { ...delivery, ...updatedDelivery }
          : delivery
      );
      await set(projectRef, { ...project, deliveries: updatedDeliveries });
      setProjects(prevProjects =>
        prevProjects.map(p =>
          p.id === projectId
            ? { ...p, deliveries: updatedDeliveries }
            : p
        )
      );
    }
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

  const updateProjectBudget = useCallback(async (projectId, newBudget) => {
    const projectRef = ref(database, `projects/${projectId}`);
    await set(projectRef, { budget: newBudget }, { merge: true });
    setProjects(prevProjects =>
      prevProjects.map(project =>
        project.id === projectId
          ? { ...project, budget: newBudget }
          : project
      )
    );
  }, []);

  const deleteProject = useCallback(async (projectId) => {
    try {
      const projectRef = ref(database, `projects/${projectId}`);
      await remove(projectRef);
      setProjects(prevProjects => prevProjects.filter(project => project.id !== projectId));
      console.log(`Project ${projectId} deleted successfully from Firebase and local state.`);
    } catch (error) {
      console.error(`Error deleting project ${projectId}:`, error);
      // Optionally, you can handle the error here, e.g., show an error message to the user
    }
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
    updateBooking,
    addBooking,
    removeBooking,
    // Include other functions here
  };

  return (
    <ProjectContext.Provider value={value}>
      {children}
    </ProjectContext.Provider>
  );
}
