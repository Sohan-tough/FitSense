import { motion } from "framer-motion";
import { Flame, Droplets, Zap } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const features = [
  {
    icon: Flame,
    title: "Predict Body Fat %",
    description: "Advanced AI algorithms analyze your metrics to predict body fat percentage with high accuracy.",
    gradient: "from-destructive to-warning",
  },
  {
    icon: Droplets,
    title: "Smart Hydration Goals",
    description: "Get personalized water intake recommendations based on your activity level and body composition.",
    gradient: "from-accent to-primary",
  },
  {
    icon: Zap,
    title: "Calorie Burn Insights",
    description: "Track calories burned during workouts and get predictive insights for optimizing your sessions.",
    gradient: "from-secondary to-primary",
  },
];

const Features = () => {
  return (
    <section id="features" className="py-24 bg-card/30">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <h2 className="text-5xl font-bold mb-4">
            Powered by <span className="bg-gradient-primary bg-clip-text text-transparent">AI Analytics</span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Transform your fitness journey with intelligent predictions and data-driven insights
          </p>
        </motion.div>
        
        <div className="grid md:grid-cols-3 gap-8">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.2 }}
              >
                <Card className="h-full border-border/50 bg-card/50 backdrop-blur-sm hover:shadow-glow transition-all duration-300 group">
                  <CardHeader>
                    <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${feature.gradient} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`}>
                      <Icon className="w-8 h-8 text-primary-foreground" />
                    </div>
                    <CardTitle className="text-2xl">{feature.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CardDescription className="text-base leading-relaxed">
                      {feature.description}
                    </CardDescription>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default Features;
