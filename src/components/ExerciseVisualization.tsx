import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { X, BarChart3, TrendingUp, Calendar, RefreshCw } from 'lucide-react';
import { api } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';

interface ExerciseData {
  exercise: string;
  current_sets: number;
  current_reps: number;
  calories_burned: number;
  new_reps: number;
  rep_increase: number;
  extra_calories_target: number;
  cal_per_rep?: number;
  total_reps?: number;
  extra_reps_total?: number;
  daily_increase?: number;
  target_total_reps?: number;
  weight?: number;
}

interface ExerciseVisualizationProps {
  exercises: ExerciseData[];
  durationDays: number;
  isOpen: boolean;
  onClose: () => void;
  assessmentData?: any;
  predictions?: any;
}

const ExerciseVisualization: React.FC<ExerciseVisualizationProps> = ({
  exercises,
  durationDays,
  isOpen,
  onClose,
  assessmentData,
  predictions
}) => {
  const [currentDurationDays, setCurrentDurationDays] = useState(durationDays);
  const [currentExercises, setCurrentExercises] = useState(exercises);
  const [isRecalculating, setIsRecalculating] = useState(false);
  const { toast } = useToast();

  // Update local state when props change
  useEffect(() => {
    setCurrentDurationDays(durationDays);
    setCurrentExercises(exercises);
  }, [durationDays, exercises]);

  const handleDurationChange = async (newDuration: number) => {
    setCurrentDurationDays(newDuration);
    
    // If we have assessment data and predictions, recalculate
    if (assessmentData && predictions) {
      setIsRecalculating(true);
      try {
        const response = await api.recalculateCalorieAnalysis(assessmentData, predictions, newDuration);
        setCurrentExercises(response.calorie_analysis.exercise_analysis || []);
      } catch (error: any) {
        toast({
          title: "Recalculation Failed",
          description: error.message || "Failed to recalculate exercise data.",
          variant: "destructive",
        });
      } finally {
        setIsRecalculating(false);
      }
    }
  };

  if (!isOpen) return null;

  const getMaxReps = () => {
    return Math.max(
      ...currentExercises.map(ex => 
        Math.max(
          ex.total_reps || (ex.current_sets * ex.current_reps),
          ex.target_total_reps || (ex.current_sets * ex.current_reps)
        )
      )
    );
  };

  const maxReps = getMaxReps();

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-background rounded-lg border border-border w-full max-w-6xl max-h-[90vh] overflow-hidden"
      >
        <Card className="h-full flex flex-col">
          <CardHeader className="flex-shrink-0">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="w-5 h-5 text-primary" />
                  Exercise Progress Visualization
                </CardTitle>
                <CardDescription>
                  Visual representation of current vs target reps over {currentDurationDays} days
                </CardDescription>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={onClose}
                className="gap-2"
              >
                <X className="w-4 h-4" />
                Close
              </Button>
            </div>
            
            {/* Timeline Slider */}
            <div className="mt-4 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-primary" />
                  <span className="text-sm font-medium">Timeline: {currentDurationDays} days</span>
                  {isRecalculating && (
                    <RefreshCw className="w-4 h-4 animate-spin text-primary" />
                  )}
                </div>
                <div className="text-xs text-muted-foreground">
                  Adjust to see how daily increases change
                </div>
              </div>
              <Slider
                value={[currentDurationDays]}
                onValueChange={(value) => handleDurationChange(value[0])}
                min={7}
                max={180}
                step={1}
                className="w-full"
                disabled={isRecalculating}
              />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>1 week</span>
                <span>6 months</span>
              </div>
            </div>
          </CardHeader>
          
          <CardContent className="flex-1 overflow-y-auto">
            <div className="space-y-6">
              {currentExercises.map((exercise, index) => {
                const currentTotalReps = exercise.total_reps || (exercise.current_sets * exercise.current_reps);
                const targetTotalReps = exercise.target_total_reps || currentTotalReps;
                const currentPercentage = (currentTotalReps / maxReps) * 100;
                const targetPercentage = (targetTotalReps / maxReps) * 100;

                return (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="p-6 border border-border rounded-lg space-y-4"
                  >
                    <div className="flex items-center justify-between">
                      <h3 className="text-xl font-semibold text-foreground">
                        {exercise.exercise}
                      </h3>
                      <div className="flex items-center gap-4 text-sm">
                        <div className="flex items-center gap-2">
                          <div className="w-3 h-3 bg-blue-500 rounded"></div>
                          <span>Current: {currentTotalReps} reps</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="w-3 h-3 bg-green-500 rounded"></div>
                          <span>Target: {targetTotalReps} reps</span>
                        </div>
                      </div>
                    </div>

                    {/* Joint Bar Chart - Side by Side */}
                    <div className="space-y-3">
                      <div className="flex items-center justify-between text-sm text-muted-foreground">
                        <span>Reps Comparison</span>
                        <span>Max: {maxReps} reps</span>
                      </div>
                      
                      <div className="flex items-end gap-4 h-20">
                        {/* Current Reps Bar */}
                        <div className="flex-1 flex flex-col items-center">
                          <div className="w-full bg-muted/30 rounded-t-lg overflow-hidden h-16 relative">
                            <motion.div
                              className="absolute bottom-0 left-0 w-full bg-gradient-to-t from-blue-400 to-blue-600 flex items-end justify-center pb-1"
                              initial={{ height: 0 }}
                              animate={{ height: `${currentPercentage}%` }}
                              transition={{ duration: 1, delay: index * 0.1 }}
                            >
                              <span className="text-white text-xs font-medium">
                                {currentTotalReps}
                              </span>
                            </motion.div>
                          </div>
                          <div className="text-xs text-muted-foreground mt-1">Current</div>
                        </div>

                        {/* Target Reps Bar */}
                        <div className="flex-1 flex flex-col items-center">
                          <div className="w-full bg-muted/30 rounded-t-lg overflow-hidden h-16 relative">
                            <motion.div
                              className="absolute bottom-0 left-0 w-full bg-gradient-to-t from-green-400 to-green-600 flex items-end justify-center pb-1"
                              initial={{ height: 0 }}
                              animate={{ height: `${targetPercentage}%` }}
                              transition={{ duration: 1, delay: index * 0.1 + 0.3 }}
                            >
                              <span className="text-white text-xs font-medium">
                                {targetTotalReps}
                              </span>
                            </motion.div>
                          </div>
                          <div className="text-xs text-muted-foreground mt-1">Target</div>
                        </div>
                      </div>

                      {/* Progress Details */}
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                        <div className="text-center p-3 bg-blue-50 dark:bg-blue-950/20 rounded-lg">
                          <p className="text-muted-foreground">Current</p>
                          <p className="font-semibold text-blue-600">
                            {exercise.current_sets} sets × {exercise.current_reps} reps
                          </p>
                          <p className="text-xs text-muted-foreground">
                            Total: {currentTotalReps} reps
                          </p>
                        </div>
                        
                        <div className="text-center p-3 bg-primary/10 rounded-lg">
                          <p className="text-muted-foreground">Daily Increase</p>
                          <p className="font-semibold text-primary">
                            +{exercise.daily_increase || 0} reps/day
                          </p>
                          <p className="text-xs text-muted-foreground">
                            Over {currentDurationDays} days
                          </p>
                        </div>
                        
                        <div className="text-center p-3 bg-green-50 dark:bg-green-950/20 rounded-lg">
                          <p className="text-muted-foreground">Target Total</p>
                          <p className="font-semibold text-green-600">
                            {targetTotalReps} reps
                          </p>
                          <p className="text-xs text-muted-foreground">
                            Final goal
                          </p>
                        </div>
                      </div>

                      {/* Additional Metrics */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                        <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                          <span className="text-muted-foreground">Calories/Rep</span>
                          <span className="font-semibold text-blue-600">
                            {exercise.cal_per_rep?.toFixed(3) || 'N/A'} kcal
                          </span>
                        </div>
                        <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                          <span className="text-muted-foreground">Total Increase</span>
                          <span className="font-semibold text-primary">
                            +{exercise.extra_reps_total || 0} reps
                          </span>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};

export default ExerciseVisualization;
