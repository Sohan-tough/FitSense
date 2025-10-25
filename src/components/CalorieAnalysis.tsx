import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Slider } from '@/components/ui/slider';
import { Button } from '@/components/ui/button';
import { Flame, Target, TrendingUp, Zap, Calendar, RefreshCw, BarChart3 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { api } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';

interface CalorieAnalysisProps {
  calorieData: {
    total_calories_per_session: number;
    weekly_calories: number;
    current_fat_percentage: number;
    ideal_fat_percentage: number;
    current_fat_mass: number;
    ideal_fat_mass: number;
    fat_to_lose: number;
    calories_to_burn_total: number;
    extra_calories_per_session: number;
    exercise_analysis: Array<{
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
    }>;
  };
  assessmentData?: any;
  predictions?: any;
}

const CalorieAnalysis: React.FC<CalorieAnalysisProps> = ({ calorieData, assessmentData, predictions }) => {
  const [durationDays, setDurationDays] = useState(30);
  const [currentCalorieData, setCurrentCalorieData] = useState(calorieData);
  const [isRecalculating, setIsRecalculating] = useState(false);
  const [showVisualization, setShowVisualization] = useState(false);
  const { toast } = useToast();

  const {
    total_calories_per_session,
    weekly_calories,
    current_fat_percentage,
    ideal_fat_percentage,
    current_fat_mass,
    ideal_fat_mass,
    fat_to_lose,
    calories_to_burn_total,
    extra_calories_per_session,
    exercise_analysis
  } = currentCalorieData;

  const fat_progress = ideal_fat_mass > 0 ? (current_fat_mass / ideal_fat_mass) * 100 : 0;
  const is_above_ideal = fat_to_lose > 0;

  const handleRecalculate = async () => {
    if (!assessmentData || !predictions) {
      toast({
        title: "Cannot Recalculate",
        description: "Assessment data is required for recalculation.",
        variant: "destructive",
      });
      return;
    }

    setIsRecalculating(true);
    try {
      const response = await api.recalculateCalorieAnalysis(assessmentData, predictions, durationDays);
      setCurrentCalorieData(response.calorie_analysis);
      toast({
        title: "Analysis Updated! 🎯",
        description: `Recalculated for ${durationDays} days duration.`,
      });
    } catch (error: any) {
      toast({
        title: "Recalculation Failed",
        description: error.message || "Something went wrong. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsRecalculating(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Main Calorie Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-4">
          <CardContent className="p-0">
            <div className="flex items-center gap-3">
              <Flame className="w-8 h-8 text-orange-500" />
              <div>
                <p className="text-2xl font-bold text-foreground">
                  {total_calories_per_session}
                </p>
                <p className="text-sm text-muted-foreground">Calories/Session</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="p-4">
          <CardContent className="p-0">
            <div className="flex items-center gap-3">
              <TrendingUp className="w-8 h-8 text-blue-500" />
              <div>
                <p className="text-2xl font-bold text-foreground">
                  {weekly_calories}
                </p>
                <p className="text-sm text-muted-foreground">Calories/Week</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="p-4">
          <CardContent className="p-0">
            <div className="flex items-center gap-3">
              <Target className="w-8 h-8 text-green-500" />
              <div>
                <p className="text-2xl font-bold text-foreground">
                  {Math.abs(fat_to_lose).toFixed(1)} kg
                </p>
                <p className="text-sm text-muted-foreground">
                  {is_above_ideal ? 'Fat to Lose' : 'Fat Mass'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Fat Mass Analysis */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="w-5 h-5 text-primary" />
            Fat Mass Analysis
          </CardTitle>
          <CardDescription>
            Current vs Ideal Body Fat Mass
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-muted-foreground mb-1">Current Fat Mass</p>
              <p className="text-2xl font-bold text-foreground">
                {current_fat_mass} kg
              </p>
              <p className="text-sm text-muted-foreground">
                ({current_fat_percentage}% of body weight)
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground mb-1">Ideal Fat Mass</p>
              <p className="text-2xl font-bold text-success">
                {ideal_fat_mass} kg
              </p>
              <p className="text-sm text-muted-foreground">
                ({ideal_fat_percentage}% of body weight)
              </p>
            </div>
          </div>


          {is_above_ideal && (
            <div className="p-4 bg-warning/10 border border-warning/20 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Zap className="w-5 h-5 text-warning" />
                <h4 className="font-semibold text-warning">Calorie Deficit Needed</h4>
              </div>
              <p className="text-sm text-muted-foreground mb-2">
                To reach your ideal fat percentage, you need to burn:
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-lg font-bold text-foreground">
                    {calories_to_burn_total.toLocaleString()} kcal
                  </p>
                  <p className="text-sm text-muted-foreground">Total calories to burn</p>
                </div>
                <div>
                  <p className="text-lg font-bold text-foreground">
                    {extra_calories_per_session} kcal
                  </p>
                  <p className="text-sm text-muted-foreground">Extra per session</p>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Duration Slider Section */}
      {assessmentData && predictions && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="w-5 h-5 text-primary" />
              Goal Timeline
            </CardTitle>
            <CardDescription>
              Adjust how many days you want to spread your rep increases across
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Duration: {durationDays} days</span>
                <Button
                  onClick={handleRecalculate}
                  disabled={isRecalculating}
                  size="sm"
                  className="gap-2"
                >
                  {isRecalculating ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      Recalculating...
                    </>
                  ) : (
                    <>
                      <RefreshCw className="w-4 h-4" />
                      Update Plan
                    </>
                  )}
                </Button>
              </div>
              <Slider
                value={[durationDays]}
                onValueChange={(value) => setDurationDays(value[0])}
                min={7}
                max={180}
                step={1}
                className="w-full"
              />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>1 week</span>
                <span>6 months</span>
              </div>
            </div>
            
            <div className="p-3 bg-muted/50 rounded-lg">
              <p className="text-sm text-muted-foreground">
                💡 <strong>Tip:</strong> Shorter durations mean more reps per day but faster results. 
                Longer durations mean gradual, sustainable progress.
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Exercise Recommendations */}
      {exercise_analysis && exercise_analysis.length > 0 && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="w-5 h-5 text-primary" />
                  Exercise Recommendations
                </CardTitle>
                <CardDescription>
                  Optimize your workout to reach your fat loss goals
                </CardDescription>
              </div>
              <Button
                onClick={() => setShowVisualization(!showVisualization)}
                variant="outline"
                size="sm"
                className="gap-2"
              >
                <BarChart3 className="w-4 h-4" />
                {showVisualization ? 'Show Text' : 'Visualise'}
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {!showVisualization ? (
              // Text Analytics View
              <div className="space-y-4">
                {exercise_analysis.map((exercise, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="p-4 border border-border rounded-lg space-y-3"
                  >
                    <div className="flex justify-between items-start">
                      <h4 className="font-semibold text-foreground">
                        {exercise.exercise}
                      </h4>
                      <Badge variant="outline" className="text-xs">
                        {exercise.calories_burned} kcal
                      </Badge>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <p className="text-muted-foreground">Current</p>
                        <p className="font-semibold">
                          {exercise.current_sets} sets × {exercise.current_reps} reps
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Total: {exercise.total_reps || (exercise.current_sets * exercise.current_reps)} reps
                        </p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Daily Increase</p>
                        <p className="font-semibold text-primary">
                          +{exercise.daily_increase || 0} reps/day
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Over {durationDays} days
                        </p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Target Total</p>
                        <p className="font-semibold text-success">
                          {exercise.target_total_reps || exercise.new_total_reps || (exercise.current_sets * exercise.current_reps)} reps
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Final goal
                        </p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Calories/Rep</p>
                        <p className="font-semibold text-blue-600">
                          {exercise.cal_per_rep?.toFixed(3) || 'N/A'} kcal
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Efficiency
                        </p>
                      </div>
                    </div>

                    {exercise.extra_calories_target > 0 && (
                      <div className="p-2 bg-primary/10 rounded text-xs text-primary">
                        Target: +{exercise.extra_calories_target} kcal per session
                      </div>
                    )}
                  </motion.div>
                ))}
              </div>
            ) : (
              // Visualization View
              <div className="space-y-6">
                {exercise_analysis.map((exercise, index) => {
                  const currentTotalReps = exercise.total_reps || (exercise.current_sets * exercise.current_reps);
                  const dailyIncrease = exercise.daily_increase || 0;
                  const sumReps = currentTotalReps + dailyIncrease; // Sum of current + daily increase
                  const maxValue = Math.max(currentTotalReps, sumReps);
                  const currentPercentage = (currentTotalReps / maxValue) * 100;
                  const sumPercentage = (sumReps / maxValue) * 100;

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
                            <span>Sum: {sumReps} reps</span>
                          </div>
                        </div>
                      </div>

                      {/* Enhanced Bar Chart */}
                      <div className="space-y-3">
                        <div className="flex items-center justify-between text-sm text-muted-foreground">
                          <span>Current Reps vs Sum (Current + Daily)</span>
                          <span>Max: {maxValue} reps</span>
                        </div>
                        
                        <div className="flex items-end gap-6 h-24">
                          {/* Current Reps Bar */}
                          <div className="flex-1 flex flex-col items-center">
                            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-lg overflow-hidden h-20 relative">
                              <motion.div
                                className="absolute bottom-0 left-0 w-full bg-gradient-to-t from-blue-500 to-blue-400 flex items-end justify-center pb-2 rounded-lg"
                                initial={{ height: 0 }}
                                animate={{ height: `${currentPercentage}%` }}
                                transition={{ duration: 1, delay: index * 0.1 }}
                              >
                                <span className="text-white text-sm font-bold">
                                  {currentTotalReps}
                                </span>
                              </motion.div>
                            </div>
                            <div className="text-sm font-medium text-blue-600 mt-2">Current Reps</div>
                          </div>

                          {/* Sum Bar */}
                          <div className="flex-1 flex flex-col items-center">
                            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-lg overflow-hidden h-20 relative">
                              <motion.div
                                className="absolute bottom-0 left-0 w-full bg-gradient-to-t from-green-500 to-green-400 flex items-end justify-center pb-2 rounded-lg"
                                initial={{ height: 0 }}
                                animate={{ height: `${sumPercentage}%` }}
                                transition={{ duration: 1, delay: index * 0.1 + 0.3 }}
                              >
                                <span className="text-white text-sm font-bold">
                                  {sumReps}
                                </span>
                              </motion.div>
                            </div>
                            <div className="text-sm font-medium text-green-600 mt-2">Sum (Current + Daily)</div>
                          </div>
                        </div>

                        {/* Summary Cards */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                          <div className="text-center p-3 bg-blue-50 dark:bg-blue-950/20 rounded-lg">
                            <p className="text-muted-foreground">Current Total</p>
                            <p className="font-semibold text-blue-600 text-lg">
                              {currentTotalReps} reps
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {exercise.current_sets} sets × {exercise.current_reps} reps
                            </p>
                          </div>
                          
                          <div className="text-center p-3 bg-green-50 dark:bg-green-950/20 rounded-lg">
                            <p className="text-muted-foreground">Sum (Current + Daily)</p>
                            <p className="font-semibold text-green-600 text-lg">
                              {sumReps} reps
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {currentTotalReps} + {dailyIncrease}
                            </p>
                          </div>
                          
                          <div className="text-center p-3 bg-primary/10 rounded-lg">
                            <p className="text-muted-foreground">Target Total</p>
                            <p className="font-semibold text-primary text-lg">
                              {exercise.target_total_reps || exercise.new_total_reps || currentTotalReps} reps
                            </p>
                            <p className="text-xs text-muted-foreground">
                              Final goal
                            </p>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* No Exercises Message */}
      {(!exercise_analysis || exercise_analysis.length === 0) && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="w-5 h-5 text-primary" />
              Exercise Recommendations
            </CardTitle>
            <CardDescription>
              Complete your assessment with exercises to get personalized recommendations
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8">
              <Zap className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No Exercise Data</h3>
              <p className="text-muted-foreground mb-4">
                Add exercises to your assessment to get personalized rep increase recommendations.
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default CalorieAnalysis;
