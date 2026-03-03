import React, { createContext, useContext, useState, ReactNode } from 'react';

// Project interface matches backend model
interface Project {
  id: number;
  project_id: string;
  name: string;
  client_id: number;
  entité: string;
  project_type_id?: string;
  status: string;
  progress: number;
  chef_projet?: string;
  linked_project_id?: string;
  budget: number;
  currency: string; // XOF, EUR, USD, CHF
  estimated_start_date?: string;
  // ... other fields as needed
}

// Context interface
interface ProjectContextType {
  project: Project | null;
  setProject: (project: Project | null) => void;
  currency: string; // Derived convenience accessor
}

// Helper function to format currency amounts
export const formatCurrency = (amount: number, currency: string = 'XOF'): string => {
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: currency
  }).format(amount);
};

// Create Context
export const ProjectContext = createContext<ProjectContextType | undefined>(undefined);

// Custom hook to use ProjectContext
export const useProjectContext = (): ProjectContextType => {
  const context = useContext(ProjectContext);
  if (!context) {
    throw new Error('useProjectContext must be used within ProjectContextProvider');
  }
  return context;
};

// Provider component
export const ProjectContextProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [project, setProject] = useState<Project | null>(null);

  return (
    <ProjectContext.Provider value={{ project, setProject, currency: project?.currency || 'XOF' }}>
      {children}
    </ProjectContext.Provider>
  );
};
