import React from 'react';

type DisplayMode = 'both' | 'chart-only';

interface BigCardProps {
  title: string;
  subtitle?: string;
  chart: React.ReactNode;
  metricValue?: number;
  metricLabel?: string;
  metricChange?: string;
  displayMode: DisplayMode;
  className: string;
}

const BigCard: React.FC<BigCardProps> = ({
  title,
  subtitle,
  chart,
  metricValue,
  metricLabel,
  metricChange,
  displayMode = 'both',
  className = ''
}) => {
  const shouldShowChart = displayMode === 'both' || displayMode === 'chart-only';
  const shouldShowMetric = displayMode === 'both';

  return (
    <div 
      className={className}
      style={{
        backgroundColor: "#ffffff",
        border: "1px solid #E5E5E5",
        borderRadius: "12px",
        boxShadow: "0px 2px 8px rgba(0, 0, 0, 0.08)",
        padding: "20px"
      }}
    >
      {/* Header with title and subtitle */}
      <div className="flex justify-between items-center mb-6">
        <h3 
          style={{
            fontFamily: "Poppins, sans-serif",
            fontWeight: 500,
            fontSize: "16px",
            color: "#000000",
          }}
        >
          {title}
        </h3>
        {subtitle && (
          <div className="flex items-center gap-1 cursor-pointer">
            <span 
              style={{
                fontFamily: 'Poppins, sans-serif',
                fontWeight: 500,
                fontSize: '12px',
                lineHeight: '100%',
                letterSpacing: '0%',
                textAlign: 'right',
                color: '#000000'
              }}
            >
              {subtitle}
            </span>
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              fill="none" 
              viewBox="0 0 24 24" 
              strokeWidth={1.5} 
              stroke="currentColor" 
              style={{
                width: '12px',
                height: '12px',
                color: '#000000'
              }}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
            </svg>
          </div>
        )}
      </div>

      {/* Metric Display - shown above chart when both are present */}
      {shouldShowMetric && metricValue !== undefined && (
        <div className="mb-4">
          <div className="flex items-baseline gap-2 flex-wrap">
            <span 
              className="text-blue-600"
              style={{
                fontFamily: 'Poppins, sans-serif',
                fontWeight: 400,
                fontSize: '32px',
                lineHeight: '100%',
                letterSpacing: '-3.75%'
              }}
            >
              {metricValue}
            </span>
            {metricChange && (
              <span 
                className={metricChange.includes('increase') || metricChange.startsWith('+') ? "text-green-500" : metricChange.includes('decrease') || metricChange.startsWith('-') ? "text-red-500" : "text-green-500"}
                style={{
                  fontFamily: 'Poppins, sans-serif',
                  fontWeight: 400,
                  fontSize: '14px',
                  lineHeight: '100%',
                  letterSpacing: '0%'
                }}
              >
                {metricChange}
              </span>
            )}
            {metricLabel && (
              <span 
                className="text-gray-500"
                style={{
                  fontFamily: 'Poppins, sans-serif',
                  fontWeight: 400,
                  fontSize: '14px',
                  lineHeight: '100%',
                  letterSpacing: '0%'
                }}
              >
                {metricLabel}
              </span>
            )}
          </div>
        </div>
      )}

      {/* Chart Display */}
      {shouldShowChart && chart && (
        <div className="w-full">
          {chart}
        </div>
      )}
    </div>
  );
};

export default BigCard;