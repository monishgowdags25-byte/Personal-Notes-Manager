import React from 'react';
import { motion } from 'framer-motion';
import { 
  BookOpen, 
  Users, 
  Target,
  Lightbulb,
  Award,
  Heart
} from 'lucide-react';

const About = () => {
  return (
    <div className="min-h-screen bg-[#e4eef0] text-[#16232a]">
      {/* Hero Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-[#16232a] to-[#0a1929]">
        <div className="max-w-7xl mx-auto">
          <motion.div
            className="text-center max-w-3xl mx-auto"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
          >
            <motion.h1 
              className="text-4xl md:text-6xl font-bold mb-6"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.8 }}
            >
              <span className="block text-[#e4eef0]">About</span>
              <span className="block bg-gradient-to-r from-[#075056] to-[#ff5b04] bg-clip-text text-transparent">
                NoteFlow
              </span>
            </motion.h1>
            
            <motion.p 
              className="text-xl text-[#e4eef0] mb-10 max-w-2xl mx-auto"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4, duration: 0.8 }}
            >
              Empowering students and educators with innovative tools for academic success.
            </motion.p>
          </motion.div>
        </div>
      </section>

      {/* Our Story */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-[#e4eef0]">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7 }}
            >
              <h2 className="text-3xl md:text-4xl font-bold text-[#16232a] mb-6">Our Story</h2>
              <p className="text-lg text-gray-700 mb-6">
                NoteFlow was born from a simple idea: making academic resources more accessible and organized 
                for students everywhere. What started as a personal project to solve our own note-taking challenges 
                has evolved into a comprehensive platform used by thousands of students.
              </p>
              <p className="text-lg text-gray-700 mb-6">
                Our team of passionate educators and developers recognized the need for a more intuitive, 
                collaborative approach to learning. We've combined cutting-edge technology with pedagogical 
                insights to create tools that truly enhance the learning experience.
              </p>
              <p className="text-lg text-gray-700">
                Today, NoteFlow continues to grow, driven by our commitment to educational excellence and 
                our belief that everyone deserves access to high-quality learning tools.
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Mission & Vision */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-[#16232a] mb-4">Mission & Vision</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Our core principles drive everything we create and how we support our community.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            <motion.div
              className="bg-[#e4eef0] rounded-2xl p-8"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7 }}
            >
              <div className="w-16 h-16 rounded-full bg-[#075056]/20 flex items-center justify-center text-[#075056] mb-6">
                <Target className="w-8 h-8" />
              </div>
              <h3 className="text-2xl font-bold text-[#16232a] mb-4">Our Mission</h3>
              <p className="text-gray-700">
                To provide intuitive, powerful tools that help students organize their academic lives, 
                collaborate effectively, and achieve their educational goals with confidence.
              </p>
            </motion.div>
            
            <motion.div
              className="bg-[#e4eef0] rounded-2xl p-8"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7, delay: 0.2 }}
            >
              <div className="w-16 h-16 rounded-full bg-[#ff5b04]/20 flex items-center justify-center text-[#ff5b04] mb-6">
                <Lightbulb className="w-8 h-8" />
              </div>
              <h3 className="text-2xl font-bold text-[#16232a] mb-4">Our Vision</h3>
              <p className="text-gray-700">
                To create a world where every student has access to personalized learning tools that 
                adapt to their unique needs and empower them to reach their full potential.
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-[#e4eef0]">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-[#16232a] mb-4">Our Values</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              The principles that guide our work and relationships.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { icon: Heart, title: "Student-Centered", description: "Everything we do is focused on enhancing the student learning experience." },
              { icon: Users, title: "Community", description: "We believe in the power of collaboration and building supportive learning communities." },
              { icon: Award, title: "Excellence", description: "We strive for the highest quality in our tools, support, and educational resources." }
            ].map((value, index) => (
              <motion.div
                key={index}
                className="bg-white rounded-2xl p-8 shadow-lg text-center"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.7, delay: index * 0.1 }}
              >
                <div className="w-16 h-16 rounded-full bg-[#075056]/20 flex items-center justify-center text-[#075056] mx-auto mb-6">
                  <value.icon className="w-8 h-8" />
                </div>
                <h3 className="text-2xl font-bold text-[#16232a] mb-4">{value.title}</h3>
                <p className="text-gray-700">{value.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default About;