import { db, storage } from "@/app/firebase";
import { addDoc, collection } from "firebase/firestore";
import { getDownloadURL, ref, uploadBytes } from "firebase/storage";
import { useRef, useState } from "react";
import React from 'react';

type ModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onPost: (content: string, image: File | null, cityName: string) => void;
  city: string;
};

const Modal: React.FC<ModalProps> = ({ isOpen, onClose, onPost, city }) => {
  const [postContent, setPostContent] = useState<string>("");
  const [postImage, setPostImage] = useState<File | null>(null);
  const [uploading, setUploading] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const handlePost = async () => {
    // onPostを呼び出して親コンポーネントにデータを渡す
    onPost(postContent, postImage, city);

    if (postImage) {
      setUploading(true);
      const imageRef = ref(storage, `images/${postImage.name}`);
      let imageUrl = "";
      try {
        const uploadResult = await uploadBytes(imageRef, postImage);
        imageUrl = await getDownloadURL(uploadResult.ref);
      } catch (error) {
        alert('画像のアップロードに失敗しました。');
        setUploading(false);
        onClose();
        return;
      }

      const postDoc = {
        content: postContent,
        imageUrl: imageUrl,
        timestamp: new Date().toISOString()
      };

      try {
        await addDoc(collection(db, 'posts'), postDoc);
      } catch (error) {
        alert('投稿に失敗しました。');
      }
    }

    setPostContent("");
    setPostImage(null);
    setUploading(false);
    onClose();
  };

  const handleFileButtonClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setPostImage(e.target.files[0]);
    } else {
      setPostImage(null);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-gray-700 bg-opacity-50 overflow-y-auto h-full w-full flex justify-center items-center">
      <div className="bg-white p-6 w-2/5 rounded-lg">
        <textarea 
          value={postContent}
          onChange={e => setPostContent(e.target.value)}
          placeholder="コメントを入力..."
          className="w-full p-2 border border-gray-300 rounded"
          rows={6}
        />
        <input 
          type="file"
          ref={fileInputRef}
          onChange={handleImageChange}
          className="hidden"
        />
        <div className="mt-2 flex items-center">
          <button 
            onClick={handleFileButtonClick}
            className="bg-blue-500 text-white px-4 py-2 rounded mr-2"
          >
            ファイルを選択
          </button>
          {postImage && <span className="text-sm">{postImage.name}</span>}
        </div>
        <div className="flex justify-end mt-4">
          <button onClick={handlePost} className="bg-blue-500 text-white px-4 py-2 rounded mr-2">Post</button>
          <button onClick={onClose} className="bg-red-500 text-white px-4 py-2 rounded">Close</button>
        </div>
      </div>
    </div>
  );
};

export default Modal;
