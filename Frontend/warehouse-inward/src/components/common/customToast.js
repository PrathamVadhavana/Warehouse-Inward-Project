import React, { useState, useEffect } from "react";
import "./customToast.css";

let toastId = 0;
let addToastCallback = null;

// Function to trigger toast from anywhere
export const showToast = (message, type = "success", duration = 3000) => {
  console.log("showToast called", { message, type, duration });
  if (addToastCallback) {
    addToastCallback({ id: toastId++, message, type, duration });
  } else {
    console.log("addToastCallback not set");
  }
};

const CustomToast = () => {
  const [toasts, setToasts] = useState([]);

  useEffect(() => {
    addToastCallback = (toast) => {
  console.log("addToastCallback called", toast);
  setToasts((prev) => [...prev, toast]);
  setTimeout(() => removeToast(toast.id), toast.duration || 3000);
};
    return () => {
      addToastCallback = null;
    };
  }, []);

  const removeToast = (id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  return (
    <div className="toast-container">
      {toasts.map((toast) => (
        <div key={toast.id} className={`toast toast-${toast.type}`}>
          <span>{toast.message}</span>
          <button className="toast-close" onClick={() => removeToast(toast.id)}>
            &times;
          </button>
          <div
            className="toast-progress"
            style={{ animationDuration: `${toast.duration}ms` }}
          ></div>
        </div>
      ))}
    </div>
  );
};

export default CustomToast;
