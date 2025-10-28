const Button = ({ children, onClick, disabled, className = "", ...props }) => {
  return (
    <button
      className={`btn ${className}`}
      onClick={onClick}
      disabled={disabled}
      {...props}
    >
      {children}
    </button>
  );
}

export default Button;
