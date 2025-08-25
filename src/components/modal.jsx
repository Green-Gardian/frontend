const Modal = ({ children, isOpen, onClose, title }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/50" 
        onClick={onClose}
      />
      
      {/* Modal Content */}
      <div className="relative bg-[#1a1a1a] border border-zinc-800 rounded-lg p-6 w-full max-w-md mx-4">
        {/* Header */}
        {title && (
          <div className="mb-4">
            <h3 className="text-lg font-semibold text-white">{title}</h3>
          </div>
        )}
        
        {/* Body */}
        <div className="relative z-10">
          {children}
        </div>
      </div>
    </div>
  );
};

export default Modal;