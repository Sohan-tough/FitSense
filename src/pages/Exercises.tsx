import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from "react-router-dom";
import { Activity, Edit, Save, X, Plus, Trash2 } from "lucide-react";
import { api, storage } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import Sidebar from "@/components/Sidebar";
import ThemeToggle from "@/components/ThemeToggle";

interface Exercise {
  id: string;
  exercise: string;
  sets: string;
  reps: string;
}

interface UserExercises {
  id: number;
  exercises: Exercise[];
}

const EXERCISES_LIST = [
  'Decline Push-ups', 'Bear Crawls', 'Dips', 'Mountain Climbers',
  'Bicep Curls', 'Leg Press', 'Thrusters', 'Turkish Get-ups',
  'Glute Bridges', 'Step-ups', 'Plank', 'Pull-ups', 'Lunges',
  'Plyo Squats', 'Squats', 'Frog Jumps', 'Deadlifts', 'Prone Cobras',
  'Lat Pulldowns', 'Russian Twists', 'Shoulder Press', 'Tricep Dips',
  'Kettlebell Swings', 'Resistance Band Pull-Aparts', 'Leg Raises',
  'Tricep Extensions', 'Dead Bugs', 'Scissors Kicks',
  'Plyometric Push-ups', 'Push Ups', 'Bench Press', 'Inverted Rows',
  'Seated Rows', 'Calf Raises', 'Reverse Lunges', 'Deadlift',
  'Wall Angels', 'Lateral Raises', 'Face Pulls', 'Burpees',
  'Box Jumps', 'Rows', 'Bird Dogs', 'Dragon Flags',
  'Bicycle Crunches', 'Flutter Kicks', 'Bulgarian Split Squats',
  'Superman', 'Incline Push-ups', 'Jumping Jacks', 'Renegade Rows',
  'Windshield Wipers', 'Zottman Curls', 'Pistol Squats'
];

const Exercises = () => {
  const [user, setUser] = useState<any>(null);
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const currentUser = storage.getUser();
    if (!currentUser) {
      navigate("/auth");
      return;
    }
    
    setUser(currentUser);
    fetchUserExercises(currentUser.id);
  }, [navigate]);

  const fetchUserExercises = async (userId: number) => {
    try {
      const response = await api.getLatestAssessment(userId);
      if (response.assessment && response.assessment.exercises) {
        setExercises(response.assessment.exercises);
      }
    } catch (error) {
      console.error("Failed to fetch exercises:", error);
      toast({
        title: "Error",
        description: "Failed to load your exercise data.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleCancel = () => {
    setIsEditing(false);
    // Reset to original exercises
    fetchUserExercises(user.id);
  };

  const handleSave = async () => {
    if (!user) return;

    setIsSaving(true);
    try {
      // Get the latest assessment data
      const latestAssessment = await api.getLatestAssessment(user.id);
      
      // Update existing assessment with new exercises
      const updatedAssessment = {
        user_id: user.id,
        name: latestAssessment.assessment.name,
        age: latestAssessment.assessment.age,
        gender: latestAssessment.assessment.gender,
        height: latestAssessment.assessment.height,
        weight: latestAssessment.assessment.weight,
        frequency: latestAssessment.assessment.frequency,
        duration: latestAssessment.assessment.duration,
        exercises: exercises
      };

      const response = await api.updateAssessment(updatedAssessment);
      
      toast({
        title: "Exercises Updated! 🎉",
        description: "Your exercise routine and predictions have been updated successfully.",
      });

      setIsEditing(false);
      
    } catch (error: any) {
      toast({
        title: "Update Failed",
        description: error.message || "Failed to update exercises. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const addExercise = () => {
    const newExercise: Exercise = {
      id: Date.now().toString(),
      exercise: "",
      sets: "",
      reps: ""
    };
    setExercises([...exercises, newExercise]);
  };

  const removeExercise = (id: string) => {
    setExercises(exercises.filter(ex => ex.id !== id));
  };

  const updateExercise = (id: string, field: keyof Exercise, value: string) => {
    setExercises(exercises.map(ex => 
      ex.id === id ? { ...ex, [field]: value } : ex
    ));
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-primary/5">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
      <Sidebar user={user} onLogout={() => {}} />
      
      <div className="ml-64 p-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-6xl mx-auto"
        >
          {/* Header */}
          <div className="mb-8">
            <div className="flex justify-between items-start">
              <div>
                <h1 className="text-4xl font-bold mb-2">Your Exercises</h1>
                <p className="text-muted-foreground">
                  Manage your workout routine and exercise details
                </p>
              </div>
              <ThemeToggle />
            </div>
          </div>

          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Activity className="w-5 h-5 text-primary" />
                    Exercise Routine
                  </CardTitle>
                  <CardDescription>
                    Your current workout exercises with sets and reps
                  </CardDescription>
                </div>
                {!isEditing ? (
                  <Button onClick={handleEdit} variant="outline" className="gap-2">
                    <Edit className="w-4 h-4" />
                    Edit Exercises
                  </Button>
                ) : (
                  <div className="flex gap-2">
                    <Button onClick={handleCancel} variant="outline" className="gap-2">
                      <X className="w-4 h-4" />
                      Cancel
                    </Button>
                    <Button 
                      onClick={handleSave} 
                      disabled={isSaving}
                      className="gap-2 bg-gradient-primary"
                    >
                      <Save className="w-4 h-4" />
                      {isSaving ? "Saving..." : "Save Changes"}
                    </Button>
                  </div>
                )}
              </div>
            </CardHeader>
            <CardContent>
              {exercises.length === 0 ? (
                <div className="text-center py-8">
                  <Activity className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No Exercises Yet</h3>
                  <p className="text-muted-foreground mb-4">
                    Add your first exercise to get started with your workout routine.
                  </p>
                  <Button 
                    onClick={() => navigate("/assessment")}
                    className="bg-gradient-primary"
                  >
                    Complete Assessment
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {exercises.map((exercise, index) => (
                    <motion.div
                      key={exercise.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="border rounded-lg p-4 hover:bg-muted/50 transition-colors"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div>
                            <Label>Exercise</Label>
                            {isEditing ? (
                              <Select 
                                value={exercise.exercise} 
                                onValueChange={(value) => updateExercise(exercise.id, "exercise", value)}
                              >
                                <SelectTrigger className="mt-1">
                                  <SelectValue placeholder="Select exercise" />
                                </SelectTrigger>
                                <SelectContent>
                                  {EXERCISES_LIST.map((ex) => (
                                    <SelectItem key={ex} value={ex}>{ex}</SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            ) : (
                              <div className="mt-1 font-medium">{exercise.exercise}</div>
                            )}
                          </div>
                          
                          <div>
                            <Label>Sets</Label>
                            {isEditing ? (
                              <Input
                                type="number"
                                value={exercise.sets}
                                onChange={(e) => updateExercise(exercise.id, "sets", e.target.value)}
                                className="mt-1"
                              />
                            ) : (
                              <div className="mt-1 font-medium">{exercise.sets}</div>
                            )}
                          </div>
                          
                          <div>
                            <Label>Reps</Label>
                            {isEditing ? (
                              <Input
                                type="number"
                                value={exercise.reps}
                                onChange={(e) => updateExercise(exercise.id, "reps", e.target.value)}
                                className="mt-1"
                              />
                            ) : (
                              <div className="mt-1 font-medium">{exercise.reps}</div>
                            )}
                          </div>
                        </div>
                        
                        {isEditing && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => removeExercise(exercise.id)}
                            className="ml-4 text-destructive hover:bg-destructive/10"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        )}
                      </div>
                    </motion.div>
                  ))}
                  
                  {isEditing && (
                    <Button
                      onClick={addExercise}
                      variant="outline"
                      className="w-full gap-2 border-dashed"
                    >
                      <Plus className="w-4 h-4" />
                      Add Exercise
                    </Button>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
};

export default Exercises;
