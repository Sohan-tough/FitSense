import { useState, useEffect } from "react";
import Navbar from "@/components/Navbar";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { ArrowRight, ArrowLeft, User, Dumbbell, Activity } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { api, storage } from "@/lib/api";
import { useNavigate } from "react-router-dom";
import workout1 from "@/assets/workout-1.jpg";
import workout2 from "@/assets/workout-2.jpg";
import workout3 from "@/assets/workout-3.jpg";

interface Exercise {
  id: string;
  exercise: string;
  sets: string;
  reps: string;
}

interface FormData {
  name: string;
  age: string;
  gender: string;
  height: string;
  weight: string;
  frequency: string;
  duration: string;
  exercises: Exercise[];
}

const Assessment = () => {
  const [step, setStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [formData, setFormData] = useState<FormData>({
    name: "",
    age: "",
    gender: "",
    height: "",
    weight: "",
    frequency: "",
    duration: "",
    exercises: [
      { id: "1", exercise: "", sets: "", reps: "" },
      { id: "2", exercise: "", sets: "", reps: "" },
      { id: "3", exercise: "", sets: "", reps: "" }
    ],
  });
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    const user = storage.getUser();
    if (!user) {
      navigate("/auth");
      return;
    }
    
    // Validate session with backend
    const validateSession = async () => {
      try {
        await api.validateSession(user.id);
        setCurrentUser(user);
        setFormData(prev => ({ ...prev, name: user.name }));
      } catch (error) {
        // Session is invalid, clear local data and redirect to auth
        storage.clearUser();
        navigate("/auth");
      }
    };
    
    validateSession();
  }, [navigate]);

  const exercises = [
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

  const updateField = (field: keyof FormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const addExercise = () => {
    const newId = (formData.exercises.length + 1).toString();
    setFormData(prev => ({
      ...prev,
      exercises: [...prev.exercises, { id: newId, exercise: "", sets: "", reps: "" }]
    }));
  };

  const removeExercise = (id: string) => {
    if (formData.exercises.length > 1) {
      setFormData(prev => ({
        ...prev,
        exercises: prev.exercises.filter(ex => ex.id !== id)
      }));
    }
  };

  const updateExercise = (id: string, field: keyof Exercise, value: string) => {
    setFormData(prev => ({
      ...prev,
      exercises: prev.exercises.map(ex => 
        ex.id === id ? { ...ex, [field]: value } : ex
      )
    }));
  };

  const nextStep = () => {
    if (step < 4) setStep(step + 1);
  };

  const prevStep = () => {
    if (step > 1) setStep(step - 1);
  };

  const handleSubmit = async () => {
    if (!currentUser) return;
    
    // Validate required fields
    if (!formData.name || !formData.age || !formData.gender || !formData.height || !formData.weight || !formData.frequency || !formData.duration) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }
    
    setIsLoading(true);
    try {
      // Filter out empty exercises but ensure at least one exercise is provided
      const validExercises = formData.exercises.filter(ex => ex.exercise && ex.sets && ex.reps);
      
      if (validExercises.length === 0) {
        toast({
          title: "Exercise Required",
          description: "Please fill in at least one exercise with sets and reps.",
          variant: "destructive",
        });
        setIsLoading(false);
        return;
      }

      const assessmentData = {
        user_id: currentUser.id,
        name: formData.name,
        age: parseInt(formData.age),
        gender: formData.gender,
        height: parseFloat(formData.height),
        weight: parseFloat(formData.weight),
        frequency: parseInt(formData.frequency),
        duration: parseFloat(formData.duration),
        exercises: validExercises
      };

      const response = await api.createAssessment(assessmentData);
      
      toast({
        title: "Assessment Complete! 🎉",
        description: "Your fitness data has been saved successfully.",
      });

      // Navigate to dashboard to view the saved assessment
      navigate("/dashboard");
      
    } catch (error: any) {
      toast({
        title: "Assessment Failed",
        description: error.message || "Something went wrong. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const progress = (step / 4) * 100;

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      {/* Background Workout Images */}
      <div className="fixed inset-0 z-0 opacity-5">
        <div className="absolute top-20 left-10 w-64 h-64 rounded-full overflow-hidden blur-sm">
          <img src={workout1} alt="" className="w-full h-full object-cover" />
        </div>
        <div className="absolute bottom-20 right-10 w-80 h-80 rounded-full overflow-hidden blur-sm">
          <img src={workout2} alt="" className="w-full h-full object-cover" />
        </div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full overflow-hidden blur-lg">
          <img src={workout3} alt="" className="w-full h-full object-cover" />
        </div>
      </div>
      
      <Navbar />
      
      <div className="container mx-auto px-4 pt-32 pb-16 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-3xl mx-auto"
        >
          <div className="mb-8">
            <h1 className="text-4xl font-bold mb-2">Fitness Assessment</h1>
            <p className="text-muted-foreground">Complete your profile to get personalized insights</p>
          </div>

          <Progress value={progress} className="mb-8" />

          <Card className="shadow-card">
            <CardHeader>
              <div className="flex items-center gap-3 mb-2">
                {step === 1 && <User className="w-6 h-6 text-primary" />}
                {step === 2 && <Dumbbell className="w-6 h-6 text-primary" />}
                {step === 3 && <Activity className="w-6 h-6 text-primary" />}
                {step === 4 && <Activity className="w-6 h-6 text-success" />}
                <CardTitle>
                  {step === 1 && "Profile Information"}
                  {step === 2 && "Workout Details"}
                  {step === 3 && "Exercise Routine"}
                  {step === 4 && "Review & Confirm"}
                </CardTitle>
              </div>
              <CardDescription>
                Step {step} of 4 - {step === 4 ? "Almost there!" : "Fill in your details"}
              </CardDescription>
            </CardHeader>

            <CardContent>
              <AnimatePresence mode="wait">
                {step === 1 && (
                  <motion.div
                    key="step1"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="space-y-4"
                  >
                    <div>
                      <Label htmlFor="name">Full Name 💪</Label>
                      <Input
                        id="name"
                        value={formData.name}
                        onChange={(e) => updateField("name", e.target.value)}
                        placeholder="John Doe"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="age">Age</Label>
                        <Input
                          id="age"
                          type="number"
                          value={formData.age}
                          onChange={(e) => updateField("age", e.target.value)}
                          placeholder="25"
                        />
                      </div>
                      <div>
                        <Label htmlFor="gender">Gender</Label>
                        <Select value={formData.gender} onValueChange={(value) => updateField("gender", value)}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="male">Male</SelectItem>
                            <SelectItem value="female">Female</SelectItem>
                            <SelectItem value="other">Other</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="height">Height (m)</Label>
                        <Input
                          id="height"
                          type="number"
                          step="0.01"
                          value={formData.height}
                          onChange={(e) => updateField("height", e.target.value)}
                          placeholder="1.75"
                        />
                      </div>
                      <div>
                        <Label htmlFor="weight">Weight (kg)</Label>
                        <Input
                          id="weight"
                          type="number"
                          value={formData.weight}
                          onChange={(e) => updateField("weight", e.target.value)}
                          placeholder="70"
                        />
                      </div>
                    </div>
                  </motion.div>
                )}

                {step === 2 && (
                  <motion.div
                    key="step2"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="space-y-4"
                  >
                    <div>
                      <Label htmlFor="frequency">Workout Frequency (days/week) 😅</Label>
                      <Input
                        id="frequency"
                        type="number"
                        value={formData.frequency}
                        onChange={(e) => updateField("frequency", e.target.value)}
                        placeholder="3-5"
                        min="1"
                        max="7"
                      />
                    </div>
                    <div>
                      <Label htmlFor="duration">Average Duration (hours/day)</Label>
                      <Input
                        id="duration"
                        type="number"
                        step="0.5"
                        value={formData.duration}
                        onChange={(e) => updateField("duration", e.target.value)}
                        placeholder="1.5"
                      />
                    </div>
                  </motion.div>
                )}

                {step === 3 && (
                  <motion.div
                    key="step3"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="space-y-6"
                  >
                    <div className="flex justify-between items-center">
                      <p className="text-sm text-muted-foreground">Select your exercises and provide details 🧘</p>
                      <Button 
                        type="button" 
                        variant="outline" 
                        size="sm" 
                        onClick={addExercise}
                        className="gap-2"
                      >
                        + Add Exercise
                      </Button>
                    </div>
                    
                    {formData.exercises.map((exercise, index) => (
                      <div key={exercise.id} className="p-4 border border-border rounded-lg space-y-3">
                        <div className="flex justify-between items-center">
                          <Label>Exercise {index + 1}</Label>
                          {formData.exercises.length > 1 && (
                            <Button 
                              type="button" 
                              variant="ghost" 
                              size="sm" 
                              onClick={() => removeExercise(exercise.id)}
                              className="text-destructive hover:text-destructive"
                            >
                              Remove
                            </Button>
                          )}
                        </div>
                        <Select
                          value={exercise.exercise}
                          onValueChange={(value) => updateExercise(exercise.id, 'exercise', value)}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Choose exercise" />
                          </SelectTrigger>
                          <SelectContent>
                            {exercises.map((ex) => (
                              <SelectItem key={ex} value={ex}>
                                {ex}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <Label htmlFor={`sets-${exercise.id}`}>Sets</Label>
                            <Input
                              id={`sets-${exercise.id}`}
                              type="number"
                              value={exercise.sets}
                              onChange={(e) => updateExercise(exercise.id, 'sets', e.target.value)}
                              placeholder="3"
                            />
                          </div>
                          <div>
                            <Label htmlFor={`reps-${exercise.id}`}>Reps</Label>
                            <Input
                              id={`reps-${exercise.id}`}
                              type="number"
                              value={exercise.reps}
                              onChange={(e) => updateExercise(exercise.id, 'reps', e.target.value)}
                              placeholder="10"
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </motion.div>
                )}

                {step === 4 && (
                  <motion.div
                    key="step4"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="space-y-4"
                  >
                    <div className="p-6 bg-muted/30 rounded-lg space-y-3">
                      <h3 className="font-semibold text-lg mb-4">Your Profile Summary</h3>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="text-muted-foreground">Name:</span>
                          <p className="font-medium">{formData.name || "Not provided"}</p>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Age:</span>
                          <p className="font-medium">{formData.age || "Not provided"}</p>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Gender:</span>
                          <p className="font-medium">{formData.gender || "Not provided"}</p>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Height:</span>
                          <p className="font-medium">{formData.height ? `${formData.height} m` : "Not provided"}</p>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Weight:</span>
                          <p className="font-medium">{formData.weight ? `${formData.weight} kg` : "Not provided"}</p>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Workout Days:</span>
                          <p className="font-medium">{formData.frequency ? `${formData.frequency}/week` : "Not provided"}</p>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="flex justify-between mt-8">
                <Button
                  variant="outline"
                  onClick={prevStep}
                  disabled={step === 1}
                  className="gap-2"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Previous
                </Button>
                
                {step < 4 ? (
                  <Button onClick={nextStep} className="gap-2 bg-gradient-primary">
                    Next
                    <ArrowRight className="w-4 h-4" />
                  </Button>
                ) : (
                  <Button 
                    onClick={handleSubmit} 
                    className="gap-2 bg-gradient-primary"
                    disabled={isLoading}
                  >
                    {isLoading ? "Analyzing..." : "Analyze My Fitness"}
                    <ArrowRight className="w-4 h-4" />
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
};

export default Assessment;
