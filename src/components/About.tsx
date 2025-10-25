import { motion } from "framer-motion";
import { BarChart3, Brain, Target } from "lucide-react";

const About = () => {
  return (
    <section id="about" className="py-24">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="max-w-4xl mx-auto text-center"
        >
          <h2 className="text-5xl font-bold mb-6">
            About <span className="bg-gradient-primary bg-clip-text text-transparent">FitSense</span>
          </h2>
          <p className="text-xl text-muted-foreground mb-12 leading-relaxed">
            FitSense combines cutting-edge AI technology with fitness science to provide you with actionable insights. 
            Our predictive models analyze your workout patterns, body metrics, and lifestyle factors to help you reach your goals faster.
          </p>
          
          <div className="grid md:grid-cols-3 gap-8 mt-16">
            {[
              { icon: Brain, title: "AI-Powered", description: "Machine learning algorithms trained on thousands of fitness profiles" },
              { icon: BarChart3, title: "Data-Driven", description: "Real-time analytics and predictive modeling for better decisions" },
              { icon: Target, title: "Goal-Oriented", description: "Personalized recommendations tailored to your fitness objectives" },
            ].map((item, index) => {
              const Icon = item.icon;
              return (
                <motion.div
                  key={item.title}
                  initial={{ opacity: 0, scale: 0.9 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: index * 0.15 }}
                  className="p-6"
                >
                  <Icon className="w-12 h-12 mx-auto mb-4 text-primary" />
                  <h3 className="text-xl font-semibold mb-2">{item.title}</h3>
                  <p className="text-muted-foreground">{item.description}</p>
                </motion.div>
              );
            })}
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default About;
