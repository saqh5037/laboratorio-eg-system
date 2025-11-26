import { Navigate } from 'react-router-dom';

/**
 * DimogenCarouselManager - Redirect to unified carousel manager
 *
 * The carousel system is now lab-aware via LabContext.
 * This component redirects to the main carousel manager which
 * will automatically load DIMOGEN's slides when DIMOGEN is selected.
 */
export default function DimogenCarouselManager() {
  return <Navigate to="/admin/carousel" replace />;
}
