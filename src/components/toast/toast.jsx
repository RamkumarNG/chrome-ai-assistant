import { useEffect } from "react";

const Toast = ({ message, show, duration = 1500, bottom = "20%" }) => {
  useEffect(() => {
    if (!show) return;
    const timer = setTimeout(() => {}, duration);
    return () => clearTimeout(timer);
  }, [show, duration]);

  if (!show) return null;

  return <div className="toast" style={{ bottom }}>{message}</div>;
};

export default Toast;
