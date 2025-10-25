import React from 'react';
import { motion } from 'framer-motion';
import { Droplets } from 'lucide-react';

interface WaterIntakeProps {
  currentIntake: number;
  unit?: string;
}

const WaterIntake: React.FC<WaterIntakeProps> = ({
  currentIntake,
  unit = 'L'
}) => {
  // Simple status based on current intake (assuming 2-4L is optimal range)
  const isOptimal = currentIntake >= 2.0 && currentIntake <= 4.0;
  const isLow = currentIntake < 2.0;
  const isHigh = currentIntake > 4.0;

  const getStatusColor = () => {
    if (isOptimal) return 'text-green-500';
    if (isLow) return 'text-blue-500';
    return 'text-orange-500';
  };

  const getStatusText = () => {
    if (isOptimal) return 'Good';
    if (isLow) return 'Low';
    return 'High';
  };

  const getStatusBg = () => {
    if (isOptimal) return 'bg-green-100 text-green-800';
    if (isLow) return 'bg-blue-100 text-blue-800';
    return 'bg-orange-100 text-orange-800';
  };

  return (
    <div className="bg-card rounded-lg p-6 border border-border">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Droplets className="w-5 h-5 text-blue-500" />
          <h3 className="text-lg font-semibold">Water Intake</h3>
        </div>
        <div className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusBg()}`}>
          {getStatusText()}
        </div>
      </div>

      <div className="space-y-4">
        {/* Water Level Visualization */}
        <div className="relative">
          <div className="w-full h-8 bg-gray-200 rounded-full overflow-hidden">
            <motion.div
              className={`h-full rounded-full ${
                isOptimal ? 'bg-gradient-to-r from-blue-400 to-blue-600' :
                isLow ? 'bg-gradient-to-r from-blue-300 to-blue-500' :
                'bg-gradient-to-r from-orange-400 to-orange-600'
              }`}
              initial={{ width: 0 }}
              animate={{ width: `${Math.min((currentIntake / 4.0) * 100, 100)}%` }}
              transition={{ duration: 1.5, ease: "easeInOut" }}
            />
          </div>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-sm font-medium text-white drop-shadow-sm">
              {currentIntake.toFixed(1)}{unit}
            </span>
          </div>
        </div>

        {/* Current Water Intake Display */}
        <div className="text-center">
          <div className="text-3xl font-bold text-blue-600 mb-2">
            {currentIntake.toFixed(1)}{unit}
          </div>
          <div className="text-sm text-muted-foreground">Daily Water Intake</div>
        </div>

        {/* Status Message */}
        <div className="text-center">
          <p className="text-sm text-muted-foreground">
            {isOptimal ? (
              "Great! You're maintaining good hydration levels."
            ) : isLow ? (
              "Consider increasing your daily water intake for better health."
            ) : (
              "Your water intake is quite high. Make sure it's spread throughout the day."
            )}
          </p>
        </div>
      </div>
    </div>
  );
};

export default WaterIntake;
