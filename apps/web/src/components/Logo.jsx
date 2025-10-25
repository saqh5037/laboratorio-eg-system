const Logo = ({ className = "h-12", showRif = true }) => {
  return (
    <div className="flex items-center gap-3">
      <img 
        src="/logo-eg.png" 
        alt="LaboratorioEG" 
        className={className + " object-contain"}
      />
      
      {showRif && (
        <span className="text-xs text-eg-gray">RIF: J-40233378-1</span>
      )}
    </div>
  );
};

export default Logo;