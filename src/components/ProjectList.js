const handleDelete = async (projectId) => {
  console.log('Deleting project with ID:', projectId);
  await deleteProject(projectId);
};
