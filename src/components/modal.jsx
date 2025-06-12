const Modal = ({ children, status }) => {
  return (
    <div
      className={`h-screen w-full fixed inset-0 z-40 top-0 left-0 bg-black/10 ${
        status ? "visible" : "hidden"
      }`}
    >
      <div className="h-screen w-full flex justify-center items-center">
        {children}
      </div>
    </div>
  );
};


export default Modal;