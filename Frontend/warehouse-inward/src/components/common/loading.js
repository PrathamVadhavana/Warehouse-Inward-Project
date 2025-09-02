// src/components/common/Loading.js
const Loading = () => {
  return (
    <div className="d-flex justify-content-center align-items-center my-4">
      <div className="spinner-border text-primary" role="status" style={{ width: "3rem", height: "3rem" }}>
        <span className="visually-hidden">Loading...</span>
      </div>
    </div>
  );
};

export default Loading;