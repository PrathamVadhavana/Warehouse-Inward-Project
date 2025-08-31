import React from "react";
import axios from "axios";

const DeletePIModal = ({ pi, onClose, onDeleted }) => {
  const handleDelete = async () => {
    try {
      const res = await axios.post(
        "http://localhost/Backend/api/PI/deletepi.php",
        { pi_id: pi.pi_id }
      );
      if (res.data.status === "success") {
        alert("PI deleted successfully");
        onDeleted();
        onClose();
      } else {
        alert(res.data.message);
      }
    } catch (err) {
      console.error(err);
      alert("Error deleting PI");
    }
  };

  return (
    <div className="modal show d-block" tabIndex="-1">
      <div className="modal-dialog">
        <div className="modal-content">
          <div className="modal-header bg-danger text-white">
            <h5 className="modal-title">Delete Purchase Invoice</h5>
            <button type="button" className="btn-close" onClick={onClose}></button>
          </div>
          <div className="modal-body">
            <p>
              Are you sure you want to <strong>delete PI #{pi.pi_id}</strong>?  
              This action <span className="text-danger">cannot be undone</span>.
            </p>
          </div>
          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button type="button" className="btn btn-danger" onClick={handleDelete}>
              Delete
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DeletePIModal;
