import { motion, MotionValue } from "framer-motion";

interface LandingBackgroundProps {
  auroraY1: MotionValue<number>;
  auroraY2: MotionValue<number>;
  auroraY3: MotionValue<number>;
}

export function LandingBackground({ auroraY1, auroraY2, auroraY3 }: LandingBackgroundProps) {
  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden">
      <motion.div
        className="absolute top-0 left-1/4 w-[400px] md:w-[800px] h-[300px] md:h-[600px] bg-primary/20 rounded-full blur-[80px] md:blur-[100px] aurora-orb"
        style={{ y: auroraY1 }}
        animate={{ x: [0, 100, 0], scale: [1, 1.1, 1] }}
        transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute top-1/4 right-1/4 w-[300px] md:w-[600px] h-[250px] md:h-[500px] bg-secondary/15 rounded-full blur-[80px] md:blur-[100px] aurora-orb"
        style={{ y: auroraY2 }}
        animate={{ x: [0, -80, 0], scale: [1, 1.2, 1] }}
        transition={{ duration: 25, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute bottom-1/4 left-1/3 w-[250px] md:w-[500px] h-[200px] md:h-[400px] bg-primary/10 rounded-full blur-[60px] md:blur-[80px] aurora-orb"
        style={{ y: auroraY3 }}
        animate={{ x: [0, 60, 0] }}
        transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }}
      />
    </div>
  );
}
