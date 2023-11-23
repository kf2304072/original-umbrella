import React from 'react';
import { useState } from 'react';


type ModalProps = {
  isOpen:boolean;
  onClose:() =>void;
};

const Modal:React.FC<ModalProps> = ({isOpen, onClose }) => {

  const [postContent, setPostContent] = useState<string>("");
  const [postImage, setPostImage] =useState<File | null>(null);

  const handlePost = async() =>{
    
  };

  return (

    <div>

    </div>
  )
}



export default Modal;