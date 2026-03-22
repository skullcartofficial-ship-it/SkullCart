import { useState, useEffect } from "react";
import { auth } from "../firebase";
import { updateProfile } from "firebase/auth";
import "./EditProfile.css";

interface EditProfileProps {
  onClose: () => void;
  onNameUpdated: (newName: string) => void;
}

export default function EditProfile({
  onClose,
  onNameUpdated,
}: EditProfileProps) {
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const currentName = localStorage.getItem("userName") || "";
    setName(currentName);
  }, []);

  const handleSave = async () => {
    if (!name.trim()) {
      alert("Please enter a name");
      return;
    }

    setLoading(true);
    try {
      const user = auth.currentUser;
      if (user) {
        // Update Firebase profile
        await updateProfile(user, {
          displayName: name,
        });

        // Update localStorage
        localStorage.setItem("userName", name);
        localStorage.setItem("userDisplayName", name);

        alert("Profile updated successfully!");
        onNameUpdated(name);
        onClose();
      }
    } catch (error) {
      console.error("Error updating name:", error);
      alert("Failed to update name");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="edit-profile-overlay" onClick={onClose}>
      <div className="edit-profile-modal" onClick={(e) => e.stopPropagation()}>
        <h3>Edit Profile</h3>

        <div className="edit-profile-field">
          <label>Display Name</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Enter your name"
            autoFocus
          />
        </div>

        <div className="edit-profile-actions">
          <button className="cancel-btn" onClick={onClose}>
            Cancel
          </button>
          <button className="save-btn" onClick={handleSave} disabled={loading}>
            {loading ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </div>
    </div>
  );
}
