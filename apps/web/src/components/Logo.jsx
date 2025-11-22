import { useCompanyInfo } from '../hooks/useCompanyInfo';

const Logo = ({ className = "h-12", showRif = false }) => {
  const { companyInfo } = useCompanyInfo();

  return (
    <div className="flex items-center gap-3">
      <img
        src={companyInfo?.logo_full_url || '/Logo.png'}
        alt={companyInfo?.logo_alt_text || companyInfo?.name || 'Laboratorio'}
        className={className + " object-contain"}
      />

      {showRif && companyInfo?.rif && (
        <span className="text-xs text-eg-gray">RIF: {companyInfo.rif}</span>
      )}
    </div>
  );
};

export default Logo;