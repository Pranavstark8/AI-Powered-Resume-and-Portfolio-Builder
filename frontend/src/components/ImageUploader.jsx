import { useState, useRef } from "react";
import ReactCrop from "react-image-crop";
import "react-image-crop/dist/ReactCrop.css";
import axios from "axios";
import API_URL from "../config/api";

export default function ImageUploader({ onImageUploaded, currentImageUrl, currentPublicId, onImageDeleted }) {
  const [selectedFile, setSelectedFile] = useState(null);
  const [imageSrc, setImageSrc] = useState(null);
  const [crop, setCrop] = useState({
    unit: "%",
    x: 25,
    y: 25,
    width: 50,
    height: 50,
    aspect: 1, // 1:1 aspect ratio
  });
  const [completedCrop, setCompletedCrop] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [uploadMessage, setUploadMessage] = useState("");
  
  const imgRef = useRef(null);
  const fileInputRef = useRef(null);

  // Handle file selection
  const handleFileSelect = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith("image/")) {
      setUploadMessage("❌ Please select an image file");
      return;
    }

    // Validate file size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      setUploadMessage("❌ File size must be less than 5MB");
      return;
    }

    setSelectedFile(file);
    setUploadMessage("");

    // Reset crop state
    setCrop({
      unit: "%",
      x: 25,
      y: 25,
      width: 50,
      height: 50,
      aspect: 1,
    });
    setCompletedCrop(null);

    // Create preview URL
    const reader = new FileReader();
    reader.onload = () => {
      setImageSrc(reader.result);
    };
    reader.readAsDataURL(file);
  };

  // Generate cropped image as Blob
  const getCroppedImage = () => {
    return new Promise((resolve, reject) => {
      if (!completedCrop || !imgRef.current) {
        reject(new Error("No crop completed"));
        return;
      }

      const image = imgRef.current;
      const canvas = document.createElement("canvas");
      const scaleX = image.naturalWidth / image.width;
      const scaleY = image.naturalHeight / image.height;
      
      canvas.width = completedCrop.width * scaleX;
      canvas.height = completedCrop.height * scaleY;
      
      const ctx = canvas.getContext("2d");
      ctx.drawImage(
        image,
        completedCrop.x * scaleX,
        completedCrop.y * scaleY,
        completedCrop.width * scaleX,
        completedCrop.height * scaleY,
        0,
        0,
        canvas.width,
        canvas.height
      );

      canvas.toBlob(
        (blob) => {
          if (!blob) {
            reject(new Error("Canvas is empty"));
            return;
          }
          resolve(blob);
        },
        "image/jpeg",
        0.9
      );
    });
  };

  // Upload cropped image to backend
  const handleUpload = async () => {
    if (!completedCrop || !imgRef.current) {
      setUploadMessage("❌ Please complete the crop selection");
      return;
    }

    setUploading(true);
    setUploadMessage("");

    try {
      // Get cropped image as blob
      const croppedBlob = await getCroppedImage();
      
      // Create FormData
      const formData = new FormData();
      formData.append("image", croppedBlob, selectedFile.name);

      // Get token
      const token = localStorage.getItem("token");
      
      // Upload to backend
      const response = await axios.post(
        `${API_URL}/api/upload/upload`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );

      if (response.data.success) {
        setUploadMessage("✅ Image uploaded successfully!");
        // Call callback with Cloudinary URL
        if (onImageUploaded) {
          onImageUploaded(response.data.url, response.data.public_id);
        }
        // Reset state
        setImageSrc(null);
        setSelectedFile(null);
        setCrop({
          unit: "%",
          x: 25,
          y: 25,
          width: 50,
          height: 50,
          aspect: 1,
        });
        setCompletedCrop(null);
        if (fileInputRef.current) {
          fileInputRef.current.value = "";
        }
      }
    } catch (error) {
      console.error("Upload error:", error);
      setUploadMessage(
        `❌ ${error.response?.data?.message || "Error uploading image. Please try again."}`
      );
    } finally {
      setUploading(false);
    }
  };

  // Cancel selection
  const handleCancel = () => {
    setImageSrc(null);
    setSelectedFile(null);
    setCrop({
      unit: "%",
      x: 25,
      y: 25,
      width: 50,
      height: 50,
      aspect: 1,
    });
    setCompletedCrop(null);
    setUploadMessage("");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  // Delete profile picture
  const handleDelete = async () => {
    if (!currentPublicId && !currentImageUrl) {
      setUploadMessage("❌ No profile picture to delete");
      return;
    }

    if (!window.confirm("Are you sure you want to remove your profile picture?")) {
      return;
    }

    setDeleting(true);
    setUploadMessage("");

    try {
      const token = localStorage.getItem("token");
      
      // Delete from Cloudinary (if we have public_id)
      if (currentPublicId) {
        await axios.delete(
          `${API_URL}/api/upload/delete/${encodeURIComponent(currentPublicId)}`,
          {
            headers: { Authorization: `Bearer ${token}` }
          }
        );
      }

      // Update database to remove profile picture URL
      await axios.put(
        `${API_URL}/api/auth/profile-picture`,
        {
          profilePictureUrl: null,
          publicId: null
        },
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      setUploadMessage("✅ Profile picture removed successfully!");
      
      // Call callback to update parent component
      if (onImageDeleted) {
        onImageDeleted();
      }

      // Clear message after 3 seconds
      setTimeout(() => setUploadMessage(""), 3000);
    } catch (error) {
      console.error("Delete error:", error);
      setUploadMessage(
        `❌ ${error.response?.data?.message || "Error deleting image. Please try again."}`
      );
    } finally {
      setDeleting(false);
    }
  };

  return (
    <>
      {/* Main Profile Picture Display - Only show when NOT cropping */}
      {!imageSrc && (
        <div style={{
          backgroundColor: "white",
          borderRadius: "16px",
          padding: "3rem 2rem",
          boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
          border: "1px solid #E5E7EB",
          marginTop: "1.5rem",
          textAlign: "center",
          maxWidth: "500px",
          margin: "1.5rem auto 0 auto"
        }}>
          {/* Profile Picture Circle */}
          <div style={{ marginBottom: "2rem" }}>
            {/* Gradient border wrapper */}
            <div style={{
              width: "208px",
              height: "208px",
              borderRadius: "50%",
              background: "linear-gradient(135deg, #3B82F6, #10B981)",
              padding: "4px",
              margin: "0 auto",
              boxShadow: "0 8px 24px rgba(0, 0, 0, 0.12)"
            }}>
              {/* Inner circle with image */}
              <div style={{
                width: "100%",
                height: "100%",
                borderRadius: "50%",
                overflow: "hidden",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                backgroundColor: "#F3F4F6"
              }}>
                {currentImageUrl ? (
                  <img
                    src={currentImageUrl}
                    alt="Profile"
                    style={{
                      width: "100%",
                      height: "100%",
                      objectFit: "cover"
                    }}
                  />
                ) : (
                  <svg width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                    <circle cx="12" cy="7" r="4"/>
                  </svg>
                )}
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div style={{ 
            display: "flex", 
            gap: "1rem", 
            justifyContent: "center",
            marginBottom: "1.5rem",
            flexWrap: "wrap"
          }}>
            {/* Upload Button */}
            <label style={{
              backgroundColor: "#14B8A6",
              color: "white",
              padding: "0.75rem 1.75rem",
              borderRadius: "10px",
              fontSize: "1rem",
              fontWeight: "600",
              cursor: "pointer",
              display: "inline-flex",
              alignItems: "center",
              gap: "0.5rem",
              border: "none",
              transition: "all 0.3s ease",
              boxShadow: "0 4px 12px rgba(20, 184, 166, 0.3)"
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.backgroundColor = "#0D9488";
              e.currentTarget.style.transform = "translateY(-2px)";
              e.currentTarget.style.boxShadow = "0 6px 16px rgba(20, 184, 166, 0.4)";
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.backgroundColor = "#14B8A6";
              e.currentTarget.style.transform = "translateY(0)";
              e.currentTarget.style.boxShadow = "0 4px 12px rgba(20, 184, 166, 0.3)";
            }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                <polyline points="17 8 12 3 7 8"/>
                <line x1="12" y1="3" x2="12" y2="15"/>
              </svg>
              Upload Photo
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileSelect}
                style={{ display: "none" }}
              />
            </label>

            {/* Remove Button */}
            {currentImageUrl && (
              <button
                onClick={handleDelete}
                disabled={deleting}
                style={{
                  backgroundColor: "white",
                  color: "#6B7280",
                  padding: "0.75rem 1.75rem",
                  borderRadius: "10px",
                  fontSize: "1rem",
                  fontWeight: "600",
                  cursor: deleting ? "not-allowed" : "pointer",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "0.5rem",
                  border: "2px solid #E5E7EB",
                  transition: "all 0.3s ease",
                  opacity: deleting ? 0.6 : 1
                }}
                onMouseOver={(e) => {
                  if (!deleting) {
                    e.currentTarget.style.borderColor = "#EF4444";
                    e.currentTarget.style.color = "#EF4444";
                    e.currentTarget.style.transform = "translateY(-2px)";
                  }
                }}
                onMouseOut={(e) => {
                  if (!deleting) {
                    e.currentTarget.style.borderColor = "#E5E7EB";
                    e.currentTarget.style.color = "#6B7280";
                    e.currentTarget.style.transform = "translateY(0)";
                  }
                }}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="3 6 5 6 21 6"/>
                  <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
                  <line x1="10" y1="11" x2="10" y2="17"/>
                  <line x1="14" y1="11" x2="14" y2="17"/>
                </svg>
                {deleting ? "Removing..." : "Remove"}
              </button>
            )}
          </div>

          {/* Info Text */}
          <p style={{
            fontSize: "0.875rem",
            color: "#9CA3AF",
            margin: 0
          }}>
            Max file size: 5MB (JPG, PNG)
          </p>
        </div>
      )}

      {/* Image Crop Section - Show when editing */}
      {imageSrc && (
        <div style={{
          backgroundColor: "white",
          borderRadius: "16px",
          padding: "2rem",
          boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
          border: "1px solid #E5E7EB",
          marginTop: "1.5rem",
          maxWidth: "600px",
          margin: "1.5rem auto 0 auto"
        }}>
          <h3 style={{
            fontSize: "1.25rem",
            fontWeight: "700",
            color: "#1F2937",
            marginBottom: "1.5rem",
            textAlign: "center"
          }}>
            Crop Your Image
          </h3>

          <div style={{
            maxWidth: "500px",
            maxHeight: "500px",
            overflow: "auto",
            marginBottom: "1.5rem",
            border: "2px solid #E5E7EB",
            borderRadius: "12px",
            padding: "1rem",
            backgroundColor: "#F9FAFB",
            margin: "0 auto 1.5rem auto"
          }}>
            <ReactCrop
              crop={crop}
              onChange={(c) => setCrop(c)}
              onComplete={(c) => setCompletedCrop(c)}
              aspect={1}
              circularCrop={false}
            >
              <img
                ref={imgRef}
                src={imageSrc}
                alt="Crop preview"
                style={{ maxWidth: "100%", maxHeight: "450px", display: "block", objectFit: "contain" }}
              />
            </ReactCrop>
          </div>

          <p style={{ 
            fontSize: "0.875rem", 
            color: "#6B7280", 
            marginBottom: "1.5rem",
            textAlign: "center"
          }}>
            Drag to adjust the crop area. The image will be cropped to a square (1:1 ratio).
          </p>

          <div style={{ display: "flex", gap: "1rem", justifyContent: "center", flexWrap: "wrap" }}>
            <button
              onClick={handleUpload}
              disabled={!completedCrop || uploading}
              style={{
                backgroundColor: "#14B8A6",
                color: "white",
                padding: "0.75rem 2rem",
                borderRadius: "10px",
                fontSize: "1rem",
                fontWeight: "600",
                cursor: !completedCrop || uploading ? "not-allowed" : "pointer",
                border: "none",
                opacity: !completedCrop || uploading ? 0.5 : 1,
                transition: "all 0.3s ease",
                boxShadow: !completedCrop || uploading ? "none" : "0 4px 12px rgba(20, 184, 166, 0.3)"
              }}
            >
              {uploading ? "Uploading..." : "Upload Cropped Image"}
            </button>
            <button
              onClick={handleCancel}
              disabled={uploading}
              style={{
                backgroundColor: "white",
                color: "#6B7280",
                padding: "0.75rem 2rem",
                borderRadius: "10px",
                fontSize: "1rem",
                fontWeight: "600",
                cursor: uploading ? "not-allowed" : "pointer",
                border: "2px solid #E5E7EB",
                opacity: uploading ? 0.5 : 1,
                transition: "all 0.3s ease"
              }}
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Upload/Delete Message */}
      {uploadMessage && (
        <div style={{
          marginTop: "1rem",
          padding: "1rem 1.5rem",
          borderRadius: "12px",
          textAlign: "center",
          maxWidth: "500px",
          margin: "1rem auto 0 auto",
          backgroundColor: uploadMessage.includes("✅") ? "#D1FAE5" : "#FEE2E2",
          color: uploadMessage.includes("✅") ? "#065F46" : "#991B1B",
          fontWeight: "600",
          fontSize: "0.95rem",
          boxShadow: "0 2px 8px rgba(0,0,0,0.1)"
        }}>
          {uploadMessage}
        </div>
      )}
    </>
  );
}

