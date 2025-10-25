import React from 'react';
import { motion } from 'framer-motion';

interface SpeedometerProps {
  value: number;
  ideal: number;
  max?: number;
  size?: number;
  strokeWidth?: number;
}

const Speedometer: React.FC<SpeedometerProps> = ({
  value,
  ideal,
  max = 50,
  size = 200,
  strokeWidth = 20
}) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const percentage = Math.min((value / max) * 100, 100);
  const idealPercentage = Math.min((ideal / max) * 100, 100);
  
  const strokeDasharray = circumference;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;
  const idealStrokeDashoffset = circumference - (idealPercentage / 100) * circumference;

  // Color based on how close to ideal
  const getColor = () => {
    const diff = Math.abs(value - ideal);
    if (diff <= 2) return '#10b981'; // Green - very close to ideal
    if (diff <= 5) return '#f59e0b'; // Yellow - close to ideal
    return '#ef4444'; // Red - far from ideal
  };

  const getStatus = () => {
    const diff = value - ideal;
    if (Math.abs(diff) <= 2) return 'Optimal';
    if (diff > 0) return 'Above Ideal';
    return 'Below Ideal';
  };

  return (
    <div className="flex flex-col items-center space-y-4">
      <div className="relative">
        <svg width={size} height={size} className="transform -rotate-90">
          {/* Background circle */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke="currentColor"
            strokeWidth={strokeWidth}
            fill="none"
            className="text-gray-200"
          />
          
          {/* Ideal range indicator */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke="currentColor"
            strokeWidth={strokeWidth * 0.3}
            fill="none"
            strokeDasharray={strokeDasharray}
            strokeDashoffset={idealStrokeDashoffset}
            className="text-blue-300"
            opacity={0.6}
          />
          
          {/* Current value circle */}
          <motion.circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke={getColor()}
            strokeWidth={strokeWidth}
            fill="none"
            strokeDasharray={strokeDasharray}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset }}
            transition={{ duration: 1.5, ease: "easeInOut" }}
          />
        </svg>
        
        {/* Center content */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.5, duration: 0.5 }}
            className="text-center"
          >
            <div className="text-3xl font-bold" style={{ color: getColor() }}>
              {value.toFixed(1)}%
            </div>
            <div className="text-sm text-muted-foreground">Current</div>
          </motion.div>
        </div>
      </div>
      
      {/* Status and ideal info */}
      <div className="text-center space-y-2">
        <div className={`px-3 py-1 rounded-full text-sm font-medium ${
          getStatus() === 'Optimal' ? 'bg-green-100 text-green-800' :
          getStatus() === 'Above Ideal' ? 'bg-red-100 text-red-800' :
          'bg-yellow-100 text-yellow-800'
        }`}>
          {getStatus()}
        </div>
        <div className="text-sm text-muted-foreground">
          Ideal: <span className="font-medium">{ideal}%</span>
        </div>
      </div>
    </div>
  );
};

export default Speedometer;
