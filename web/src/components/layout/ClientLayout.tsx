import { Outlet } from 'react-router-dom';
import { ProjectContextProvider } from '../../contexts/ProjectContext';

export function ClientLayout() {
  return (
    <ProjectContextProvider>
      <div className="h-screen w-full overflow-hidden">
        <Outlet />
      </div>
    </ProjectContextProvider>
  );
}
