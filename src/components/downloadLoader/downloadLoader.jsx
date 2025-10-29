const DownloadLoader = ({ progress }) => {
  const radius = 60;
  const stroke = 8;
  const normalizedRadius = radius - stroke * 2;
  const circumference = normalizedRadius * 2 * Math.PI;
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  return (
    <div className="download-overlay">
      <div className="download-box">
        <svg height={radius * 2} width={radius * 2}>
          <circle
            stroke="#e6e6e6"
            fill="transparent"
            strokeWidth={stroke}
            r={normalizedRadius}
            cx={radius}
            cy={radius}
          />
          <circle
            stroke="#007bff"
            fill="transparent"
            strokeWidth={stroke}
            strokeLinecap="round"
            r={normalizedRadius}
            cx={radius}
            cy={radius}
            strokeDasharray={`${circumference} ${circumference}`}
            strokeDashoffset={strokeDashoffset}
            style={{ transition: "stroke-dashoffset 0.3s ease" }}
          />
          <text
            x="50%"
            y="50%"
            dominantBaseline="middle"
            textAnchor="middle"
            fontSize="20"
            fill="#007bff"
          >
            {progress.toFixed(0)}%
          </text>
        </svg>
        <p>Downloading AI model...</p>
      </div>
    </div>
  );
}

export default DownloadLoader;
