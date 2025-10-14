import React, { useState, useRef, useContext } from "react";
import { UserDisplayContext } from "../../contexts/UserContxet/UserContext";

const PhotoUploadModalContent = ({ onClose, userData }) => {
  const { UpdateUserProfile } = useContext(UserDisplayContext);
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [message, setMessage] = useState("");
  const fileInputRef = useRef(null);

  const handleFileChange = (file) => {
    setMessage("");
    if (file && file.type.startsWith("image/")) {
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    } else {
      setSelectedFile(null);
      setPreviewUrl(null);
      setMessage("Please select a valid image file (jpg, jpeg, png).");
    }
  };

  const onDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const onDragLeave = () => {
    setIsDragging(false);
  };

  const onDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleFileChange(files[0]);
    }
  };

  const handleButtonClick = () => {
    fileInputRef.current.click();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");

    if (!selectedFile) {
      setMessage("Please select a photo to upload.");
      return;
    }

    if (!userData || !userData._id) {
      setMessage("User data is missing. Cannot upload photo.");
      return;
    }

    try {
      setMessage("Uploading photo...");
      await UpdateUserProfile(userData._id, { avatar: selectedFile });
      setMessage("Photo uploaded successfully!");
      setTimeout(() => onClose(), 1000);
    } catch (error) {
      console.error("Upload error:", error);
      setMessage(`Error uploading photo: ${error.message}`);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col items-center">
      <div
        className={`flex h-48 w-full cursor-pointer items-center justify-center rounded-lg border-2 border-dashed p-4 text-center transition-colors duration-200 ${
          isDragging
            ? "border-[#7B8D6A] bg-blue-50 text-white"
            : "border-gray-300 bg-gray-50 text-gray-500 hover:border-gray-400 hover:bg-gray-100"
        }`}
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
        onDrop={onDrop}
        onClick={handleButtonClick}
      >
        {previewUrl ? (
          <img
            src={previewUrl}
            alt="Preview"
            className="max-h-full max-w-full rounded-md object-contain"
          />
        ) : (
          <div>
            <p className="text-lg font-medium">Drag and drop the photo here</p>
            <p className="text-sm">or click to select a file</p>
            <input
              type="file"
              ref={fileInputRef}
              onChange={(e) => handleFileChange(e.target.files[0])}
              className="hidden"
              accept="image/*"
            />
          </div>
        )}
      </div>

      {selectedFile && (
        <p className="mt-4 text-gray-700">
          Selected file: <span className="font-semibold">{selectedFile.name}</span>
        </p>
      )}

      {message && (
        <p
          className={`mt-2 text-sm ${
            message.includes("successfully") ? "text-green-600" : "text-red-600"
          }`}
        >
          {message}
        </p>
      )}

      <div className="mt-6 flex w-full justify-end space-x-3">
        <button
          type="button"
          onClick={onClose}
          className="rounded-md bg-gray-300 px-4 py-2 font-bold text-gray-800 transition duration-200 hover:bg-gray-400"
        >
          Cancel
        </button>
        <button
          type="submit"
          className="rounded-md bg-[#7B8D6A] px-4 py-2 font-bold text-white transition duration-200 hover:bg-[#7B8D6A]/60"
          disabled={!selectedFile}
        >
          Upload Photo
        </button>
      </div>
    </form>
  );
};

export default PhotoUploadModalContent;
