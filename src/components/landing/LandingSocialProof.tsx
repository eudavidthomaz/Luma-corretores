import { motion } from "framer-motion";
import { Camera, FileText, Clock, Users } from "lucide-react";
import { useEffect, useState } from "react";

interface SocialProofStat {
  value: number;
  suffix: string;
  label: string;
  icon: React.ElementType;
  gradient: string;
}

const stats: SocialProofStat[] = [
  {
    value: 50000,
    suffix: "+",
    label: "Fotógrafos",
    icon: Camera,
    gradient: "from-primary to-violet-600",
  },
  {
    value: 2,
    suffix: "M+",
    label: "Em propostas",
    icon: FileText,
    gradient: "from-secondary to-cyan-600",
  },
  {
    value: 24,
    suffix: "h",
    label: "Funcionando",
    icon: Clock,
    gradient: "from-amber-500 to-orange-600",
  },
  {
    value: 1,
    suffix: "º",
    label: "Comunidade BR",
    icon: Users,
    gradient: "from-emerald-500 to-green-600",
  },
];

function AnimatedCounter({ 
  value, 
  suffix, 
  duration = 2 
}: { 
  value: number; 
  suffix: string; 
  duration?: number;
}) {
  const [count, setCount] = useState(0);
  const [hasAnimated, setHasAnimated] = useState(false);

  useEffect(() => {
    if (hasAnimated) return;

    let startTime: number;
    let animationFrame: number;

    const animate = (currentTime: number) => {
      if (!startTime) startTime = currentTime;
      const progress = Math.min((currentTime - startTime) / (duration * 1000), 1);
      
      // Easing function for smooth deceleration
      const easeOut = 1 - Math.pow(1 - progress, 3);
      setCount(Math.floor(easeOut * value));

      if (progress < 1) {
        animationFrame = requestAnimationFrame(animate);
      } else {
        setHasAnimated(true);
      }
    };

    // Start animation when component is in view
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !hasAnimated) {
          animationFrame = requestAnimationFrame(animate);
        }
      },
      { threshold: 0.5 }
    );

    const element = document.getElementById(`counter-${value}`);
    if (element) observer.observe(element);

    return () => {
      if (animationFrame) cancelAnimationFrame(animationFrame);
      observer.disconnect();
    };
  }, [value, duration, hasAnimated]);

  // Format number with proper separators
  const formatNumber = (num: number) => {
    if (num >= 1000000) {
      return `R$${(num / 1000000).toFixed(0)}`;
    }
    if (num >= 1000) {
      return num.toLocaleString("pt-BR");
    }
    return num.toString();
  };

  return (
    <span id={`counter-${value}`} className="tabular-nums">
      {formatNumber(count)}{suffix}
    </span>
  );
}

export function LandingSocialProof() {
  return (
    <section className="relative z-10 px-4 sm:px-6 py-8 md:py-12">
      <motion.div
        className="max-w-4xl mx-auto"
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        viewport={{ once: true }}
      >
        <div className="glass rounded-2xl border border-luma-glass-border p-4 sm:p-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
            {stats.map((stat, index) => (
              <motion.div
                key={stat.label}
                className="text-center"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: index * 0.1 }}
                viewport={{ once: true }}
              >
                <div className={`inline-flex p-2.5 rounded-xl bg-gradient-to-br ${stat.gradient} mb-3`}>
                  <stat.icon className="h-5 w-5 text-white" />
                </div>
                <div className="text-2xl sm:text-3xl font-bold text-foreground">
                  <AnimatedCounter value={stat.value} suffix={stat.suffix} />
                </div>
                <p className="text-xs sm:text-sm text-muted-foreground mt-1">
                  {stat.label}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.div>
    </section>
  );
}
