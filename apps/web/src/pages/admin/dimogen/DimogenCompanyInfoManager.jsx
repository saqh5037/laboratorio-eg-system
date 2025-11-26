import { Navigate } from 'react-router-dom';

/**
 * DimogenCompanyInfoManager - Redirect to unified company info manager
 *
 * The company info system is now lab-aware via LabContext.
 * This component redirects to the main company manager which
 * will automatically load DIMOGEN's company info when DIMOGEN is selected.
 */
export default function DimogenCompanyInfoManager() {
  return <Navigate to="/admin/company" replace />;
}
