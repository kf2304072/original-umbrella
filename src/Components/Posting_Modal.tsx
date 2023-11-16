interface ModalProps {
  isOpen:boolean;
  onClose:() => void;
  children:React.ReactNode;
};

const Modal:React.FC<ModalProps> = ({isOpen, onClose, children}) =>{
  if(!isOpen) return null;

  return (
    <div className="modal-backdrop">
      <div className="modal-content">
        {children}
        <button onClick={onClose}>Close</button>
      </div>
    </div>
  );
};

export default Modal;