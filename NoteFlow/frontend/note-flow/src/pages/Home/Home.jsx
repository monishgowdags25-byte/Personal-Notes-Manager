import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, useAnimation } from 'framer-motion';
import Navbar from '../../components/Navbar/Navbar';
import { 
  BookOpen, 
  Zap, 
  Lock, 
  Search,
  FileText,
  Tag,
  Calendar,
  Star,
  Brain,
  Lightbulb,
  Rocket,
  CheckCircle,
  ChevronRight,
  Play,
  Sparkles,
  Twitter,
  Linkedin,
  Github,
  ArrowRight,
  PenTool,
  Layers,
  TrendingUp,
  Menu,
  X
} from 'lucide-react';

const Home = () => {
  const [activeFeature, setActiveFeature] = useState(0);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const controls = useAnimation();
  const navigate = useNavigate();

  useEffect(() => {
    const handleMouseMove = (e) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };
    
    window.addEventListener('mousemove', handleMouseMove);
    
    const interval = setInterval(() => {
      setActiveFeature(prev => (prev + 1) % 4);
    }, 4000);
    
    // Animate floating cards continuously
    controls.start({
      y: [0, -15, 0],
      rotate: [0, 2, 0],
      transition: {
        duration: 6,
        repeat: Infinity,
        ease: "easeInOut"
      }
    });
    
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      clearInterval(interval);
    };
  }, [controls]);

  const features = [
    {
      icon: <Brain className="w-8 h-8" />,
      title: "AI-Powered Organization",
      description: "Smart categorization and tagging powered by artificial intelligence."
    },
    {
      icon: <Layers className="w-8 h-8" />,
      title: "Visual Flow System",
      description: "Transform ideas into visual workflows with our intuitive drag-and-drop interface."
    },
    {
      icon: <Zap className="w-8 h-8" />,
      title: "Lightning Fast Sync",
      description: "Real-time synchronization across all your devices, instantly."
    }
  ];

  const flowSteps = [
    { id: 1, title: "Capture", description: "Jot down ideas as they come", icon: <PenTool className="w-6 h-6" /> },
    { id: 2, title: "Organize", description: "Structure with AI assistance", icon: <Layers className="w-6 h-6" /> },
    { id: 3, title: "Connect", description: "Link related concepts", icon: <Zap className="w-6 h-6" /> },
    { id: 4, title: "Create", description: "Turn ideas into action", icon: <TrendingUp className="w-6 h-6" /> }
  ];

  return (
    <div className="min-h-screen bg-[#16232a] text-white overflow-hidden">
      {/* Navbar */}
      <Navbar />

      {/* Animated Background */}
      <div className="fixed inset-0 z-0">
        {/* Animated gradient blobs */}
        <motion.div 
          className="absolute top-1/4 left-1/4 w-96 h-96 bg-[#075056]/20 rounded-full blur-3xl"
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.5, 0.3]
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        ></motion.div>
        <motion.div 
          className="absolute top-1/3 right-1/4 w-80 h-80 bg-[#ff5b04]/10 rounded-full blur-3xl"
          animate={{
            scale: [1, 1.3, 1],
            opacity: [0.2, 0.4, 0.2]
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 1
          }}
        ></motion.div>
        <motion.div 
          className="absolute bottom-1/4 left-1/3 w-72 h-72 bg-[#e4eef0]/5 rounded-full blur-3xl"
          animate={{
            scale: [1, 1.1, 1],
            opacity: [0.1, 0.3, 0.1]
          }}
          transition={{
            duration: 12,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 2
          }}
        ></motion.div>
        
        {/* Subtle grid pattern */}
        <div className="absolute inset-0 opacity-5" style={{
          backgroundImage: `radial-gradient(circle at 15% 50%, #075056 1px, transparent 1px),
                            radial-gradient(circle at 85% 30%, #ff5b04 1px, transparent 1px),
                            radial-gradient(circle at 50% 70%, #075056 1px, transparent 1px)`,
          backgroundSize: '60px 60px'
        }}></div>
      </div>

      {/* Mouse Follower */}
      <motion.div 
        className="fixed w-96 h-96 rounded-full bg-gradient-radial from-[#075056]/10 to-transparent blur-3xl z-0 pointer-events-none"
        animate={{
          x: mousePosition.x - 192,
          y: mousePosition.y - 192,
        }}
        transition={{ type: "spring", stiffness: 50, damping: 20 }}
      />

      {/* Main Content */}
      <div className="relative z-10">
        {/* Hero Section - Minimal Aesthetic Layout with Illustration */}
        <section className="min-h-screen flex flex-col justify-center py-0 px-4 sm:px-6 lg:px-8 relative overflow-hidden pt-32">
          {/* Enhanced Background Elements */}
          <div className="absolute inset-0 z-0">
            {/* Subtle gradient background with more depth */}
            <div className="absolute inset-0 bg-gradient-to-br from-[#075056]/10 via-[#16232a] to-[#16232a]"></div>
            
            {/* Enhanced floating elements with better styling */}
            <motion.div 
              className="absolute top-1/4 left-10 w-32 h-32 rounded-full border border-[#075056]/20 backdrop-blur-sm"
              animate={{ y: [0, -15, 0] }}
              transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
            >
              <div className="w-full h-full rounded-full border border-[#ff5b04]/10"></div>
            </motion.div>
            
            <motion.div 
              className="absolute bottom-1/4 right-10 w-28 h-28 rounded-xl border border-[#ff5b04]/20 backdrop-blur-sm"
              animate={{ y: [0, 15, 0], rotate: [0, 5, 0] }}
              transition={{ duration: 9, repeat: Infinity, ease: "easeInOut" }}
            ></motion.div>
            
            {/* Subtle grid pattern for texture */}
            <div className="absolute inset-0 opacity-5" style={{
              backgroundImage: `radial-gradient(circle at 15% 50%, #075056 1px, transparent 1px),
                                radial-gradient(circle at 85% 30%, #ff5b04 1px, transparent 1px)`,
              backgroundSize: '40px 40px'
            }}></div>
          </div>
          
          <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 items-center relative z-10 pt-16">
            {/* Left Content - Minimal Aesthetic Layout */}
            <motion.div
              initial={{ opacity: 0, x: -40 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.7 }}
              className="text-center lg:text-left z-10"
            >
              {/* Enhanced headline with better spacing */}
              <div className="mb-8">
                <motion.h1 
                  className="text-4xl md:text-6xl font-bold leading-tight text-[#e4eef0] mb-2"
                  initial={{ opacity: 0, y: 25 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                >
                  Transform Your Ideas
                </motion.h1>
                <motion.h1 
                  className="text-4xl md:text-6xl font-bold leading-tight bg-gradient-to-r from-[#ff5b04] to-[#075056] bg-clip-text text-transparent"
                  initial={{ opacity: 0, y: 25 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.25 }}
                >
                  Into Action
                </motion.h1>
              </div>
              
              {/* Enhanced subtitle with better typography */}
              <motion.div 
                className="mb-12"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
              >
                <p className="text-xl text-[#e4eef0] max-w-2xl mx-auto lg:mx-0 font-light leading-relaxed">
                  NoteFlow helps you capture, organize, and execute your ideas with AI-powered insights.
                </p>
              </motion.div>
              
              {/* Enhanced CTA buttons with better styling */}
              <motion.div 
                className="flex flex-col sm:flex-row justify-center lg:justify-start space-y-4 sm:space-y-0 sm:space-x-8 mb-12"
                initial={{ opacity: 0, y: 25 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
              >
                <motion.div
                  whileHover={{ scale: 1.05, y: -3 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Link 
                    to="/signup"
                    className="px-9 py-4 bg-gradient-to-r from-[#ff5b04] to-[#075056] text-white rounded-xl text-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-300 text-center block"
                  >
                    Start Organising Today
                  </Link>
                </motion.div>
                
                <motion.div
                  whileHover={{ scale: 1.05, y: -3 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Link 
                    to="/login"
                    className="px-9 py-4 bg-transparent text-[#e4eef0] rounded-xl text-lg font-semibold border-2 border-[#e4eef0] hover:bg-[#e4eef0]/10 transition-all duration-300 text-center block"
                  >
                    Sign In
                  </Link>
                </motion.div>
              </motion.div>
            </motion.div>

            {/* Right Side - Minimal Aesthetic Illustration */}
            <motion.div
              className="relative z-10 hidden lg:block"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3, duration: 0.7 }}
            >
              {/* Minimal Illustration */}
              <div className="relative flex items-center justify-center">
                <div className="relative w-80 h-80">
                  {/* Outer circle */}
                  <motion.div 
                    className="absolute inset-0 rounded-full border-2 border-[#075056]/30"
                    animate={{ 
                      scale: [1, 1.05, 1],
                      rotate: [0, 10, 0]
                    }}
                    transition={{ 
                      duration: 10, 
                      repeat: Infinity, 
                      ease: "easeInOut"
                    }}
                  ></motion.div>
                  
                  {/* Middle circle */}
                  <motion.div 
                    className="absolute inset-4 rounded-full border-2 border-[#ff5b04]/30"
                    animate={{ 
                      scale: [1, 1.03, 1],
                      rotate: [0, -15, 0]
                    }}
                    transition={{ 
                      duration: 8, 
                      repeat: Infinity, 
                      ease: "easeInOut",
                      delay: 0.5
                    }}
                  ></motion.div>
                  
                  {/* Inner circle */}
                  <motion.div 
                    className="absolute inset-8 rounded-full border-2 border-[#e4eef0]/30"
                    animate={{ 
                      scale: [1, 1.07, 1],
                      rotate: [0, 5, 0]
                    }}
                    transition={{ 
                      duration: 12, 
                      repeat: Infinity, 
                      ease: "easeInOut",
                      delay: 1
                    }}
                  ></motion.div>
                  
                  {/* Central icon */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <motion.div
                      className="w-20 h-20 rounded-full bg-gradient-to-br from-[#075056] to-[#ff5b04] flex items-center justify-center shadow-lg"
                      whileHover={{ scale: 1.1 }}
                      animate={{ 
                        y: [0, -10, 0],
                        boxShadow: [
                          "0 0 0 0 rgba(7, 80, 86, 0.7)",
                          "0 0 0 15px rgba(7, 80, 86, 0)",
                          "0 0 0 0 rgba(7, 80, 86, 0)"
                        ]
                      }}
                      transition={{ 
                        duration: 3, 
                        repeat: Infinity,
                        ease: "easeInOut"
                      }}
                    >
                      <Layers className="w-10 h-10 text-white" />
                    </motion.div>
                  </div>
                  
                  {/* Floating elements around */}
                  <motion.div 
                    className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-[#075056] flex items-center justify-center shadow-md"
                    animate={{ y: [0, -15, 0] }}
                    transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                  >
                    <Lightbulb className="w-6 h-6 text-white" />
                  </motion.div>
                  
                  <motion.div 
                    className="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-1/2 w-12 h-12 rounded-full bg-[#ff5b04] flex items-center justify-center shadow-md"
                    animate={{ y: [0, 15, 0] }}
                    transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
                  >
                    <CheckCircle className="w-6 h-6 text-white" />
                  </motion.div>
                  
                  <motion.div 
                    className="absolute top-1/2 left-0 transform -translate-y-1/2 -translate-x-1/2 w-12 h-12 rounded-full bg-[#e4eef0] flex items-center justify-center shadow-md"
                    animate={{ x: [0, -15, 0] }}
                    transition={{ duration: 6, repeat: Infinity, ease: "easeInOut", delay: 1 }}
                  >
                    <Zap className="w-6 h-6 text-[#16232a]" />
                  </motion.div>
                  
                  <motion.div 
                    className="absolute top-1/2 right-0 transform -translate-y-1/2 translate-x-1/2 w-12 h-12 rounded-full bg-[#075056] flex items-center justify-center shadow-md"
                    animate={{ x: [0, 15, 0] }}
                    transition={{ duration: 7, repeat: Infinity, ease: "easeInOut", delay: 1.5 }}
                  >
                    <Rocket className="w-6 h-6 text-white" />
                  </motion.div>
                </div>
              </div>
            </motion.div>
          </div>
          
          {/* Enhanced scroll indicator */}
          <motion.div 
            className="absolute bottom-10 left-1/2 transform -translate-x-1/2 flex flex-col items-center"
            initial={{ opacity: 0, y: 25 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.2 }}
          >
            <motion.div 
              className="relative w-8 h-12 rounded-full border-2 border-[#e4eef0] flex justify-center p-1"
              animate={{ y: [0, 5, 0] }}
              transition={{ repeat: Infinity, duration: 1.5 }}
            >
              <motion.div 
                className="w-2 h-2 rounded-full bg-[#ff5b04]"
                animate={{ y: [0, 12, 0] }}
                transition={{ repeat: Infinity, duration: 1.5 }}
              ></motion.div>
            </motion.div>
            <motion.p 
              className="text-xs text-[#e4eef0] mt-3 tracking-widest uppercase"
              animate={{ opacity: [0.6, 1, 0.6] }}
              transition={{ repeat: Infinity, duration: 2 }}
            >
              Scroll to explore
            </motion.p>
          </motion.div>
        </section>

        {/* Features Section */}
        <section className="py-20 px-4 sm:px-6 lg:px-8 bg-[#e4eef0]">
          <div className="max-w-7xl mx-auto">
            <motion.div
              className="text-center mb-16"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
            >
              <motion.h2 
                className="text-4xl font-bold text-[#16232a] mb-4"
                whileHover={{ scale: 1.02 }}
              >
                Powerful Features
              </motion.h2>
              <p className="text-xl text-gray-700 max-w-3xl mx-auto">
                Everything you need to organize your thoughts and boost your productivity
              </p>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {features.map((feature, index) => (
                <motion.div
                  key={index}
                  className="bg-[#e4eef0]/80 backdrop-blur-md rounded-2xl p-8 border border-white/50 shadow-lg hover:shadow-xl transition-all duration-300"
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  whileHover={{ y: -10, scale: 1.02 }}
                >
                  <motion.div 
                    className="w-16 h-16 rounded-full bg-[#075056]/10 flex items-center justify-center text-[#075056] mb-6"
                    whileHover={{ rotate: 360 }}
                    transition={{ duration: 0.5 }}
                  >
                    {feature.icon}
                  </motion.div>
                  <motion.h3 
                    className="text-2xl font-bold text-[#16232a] mb-4"
                    whileHover={{ color: "#ff5b04" }}
                  >
                    {feature.title}
                  </motion.h3>
                  <p className="text-gray-700">{feature.description}</p>
                  <motion.div 
                    className="mt-6 w-12 h-1 bg-[#075056] rounded-full"
                    initial={{ width: 0 }}
                    whileInView={{ width: 48 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.8, delay: 0.5 }}
                  ></motion.div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Interactive Flow Section - Redesigned */}
        <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-[#16232a] to-[#0a1929]">
          <div className="max-w-7xl mx-auto">
            <motion.div
              className="text-center mb-16"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
            >
              <h2 className="text-4xl font-bold text-[#e4eef0] mb-4">The Journey of Ideas</h2>
              <p className="text-xl text-gray-300 max-w-3xl mx-auto">
                From spark to masterpiece - see how NoteFlow transforms your thoughts
              </p>
            </motion.div>

            <div className="relative">
              {/* Central Timeline */}
              <div className="absolute left-1/2 transform -translate-x-1/2 h-full w-1 bg-gradient-to-b from-[#075056] to-[#ff5b04] z-0"></div>
              
              {/* Flow Steps - Vertical Timeline with Uniform Animations */}
              <div className="relative space-y-12 z-10">
                {flowSteps.map((step, index) => (
                  <motion.div
                    key={step.id}
                    className={`flex items-center ${index % 2 === 0 ? 'flex-row' : 'flex-row-reverse'} gap-8`}
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ 
                      duration: 0.6,
                      delay: index * 0.15,
                      ease: "easeOut"
                    }}
                  >
                    <div className={`flex-1 ${index % 2 === 0 ? 'text-right' : 'text-left'}`}>
                      <motion.div 
                        className="inline-block bg-[#e4eef0]/10 backdrop-blur-md rounded-2xl p-6 border border-white/10"
                        whileHover={{ 
                          y: -8,
                          scale: 1.02,
                          transition: { duration: 0.3 }
                        }}
                        transition={{ 
                          type: "spring",
                          stiffness: 400,
                          damping: 17
                        }}
                      >
                        <h3 className="text-2xl font-bold text-[#e4eef0] mb-2">{step.title}</h3>
                        <p className="text-gray-300">{step.description}</p>
                      </motion.div>
                    </div>
                    
                    <div className="relative">
                      <motion.div 
                        className="w-16 h-16 rounded-full bg-gradient-to-r from-[#075056] to-[#ff5b04] flex items-center justify-center text-white shadow-lg z-10 relative"
                        whileHover={{ 
                          scale: 1.15,
                          backgroundColor: "#ff5b04",
                          transition: { duration: 0.3 }
                        }}
                        animate={{ 
                          scale: [1, 1.1, 1],
                          boxShadow: [
                            "0 0 0 0 rgba(255, 91, 4, 0.7)",
                            "0 0 0 10px rgba(255, 91, 4, 0)",
                            "0 0 0 0 rgba(255, 91, 4, 0)"
                          ]
                        }}
                        transition={{ 
                          duration: 2, 
                          repeat: Infinity,
                          ease: "easeInOut"
                        }}
                      >
                        {step.icon}
                      </motion.div>
                    </div>
                    
                    <div className="flex-1"></div>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Footer - Simplified */}
        <footer className="bg-[#e4eef0] py-12 px-4 sm:px-6 lg:px-8 border-t border-white/10">
          <div className="max-w-7xl mx-auto">
            <div className="flex flex-col md:flex-row justify-between items-center">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5 }}
              >
                <h2 className="text-2xl font-bold text-[#ff5b04]">NoteFlow</h2>
                <p className="text-gray-400 mt-2">Organize your thoughts, elevate your productivity</p>
              </motion.div>
              <motion.div
                className="flex space-x-6 mt-6 md:mt-0"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.2 }}
              >
                <Link to="/about" className="text-gray-400 hover:text-[#ff5b04] transition-colors">About Us</Link>
                <Link to="/contact" className="text-gray-400 hover:text-[#ff5b04] transition-colors">Contact</Link>
              </motion.div>
            </div>
            <motion.div 
              className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-500 text-sm"
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
            >
              <p>© {new Date().getFullYear()} NoteFlow. All rights reserved.</p>
            </motion.div>
          </div>
        </footer>
      </div>
    </div>
  );
};

export default Home;