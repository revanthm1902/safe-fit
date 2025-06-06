import React from 'react';
import { motion } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Heart, Droplets, Activity, Shield, TrendingUp, Crown } from 'lucide-react';
import BrandHeader from './BrandHeader';
const Dashboard = () => {
  const vitalsData = [{
    icon: Heart,
    title: "Heart Rate",
    value: "72",
    unit: "BPM",
    status: "Normal",
    color: "from-red-500 to-pink-500",
    trend: "+2%",
    progress: 85
  }, {
    icon: Droplets,
    title: "SpO2 Level",
    value: "98",
    unit: "%",
    status: "Excellent",
    color: "from-blue-500 to-indigo-500",
    trend: "+1%",
    progress: 98
  }, {
    icon: Activity,
    title: "Steps Today",
    value: "8,234",
    unit: "steps",
    status: "Goal: 10,000",
    color: "from-green-500 to-teal-500",
    trend: "+15%",
    progress: 82
  }, {
    icon: Shield,
    title: "Safety Status",
    value: "Active",
    unit: "",
    status: "All systems OK",
    color: "from-purple-500 to-indigo-500",
    trend: "100%",
    progress: 100
  }];
  return <div className="min-h-screen bg-gradient-to-br from-safefit-dark via-safefit-primary/10 to-safefit-dark">
      <BrandHeader />
      
      <div className="pt-20 pb-24 px-4 bg-gray-50">
        <motion.div initial={{
        opacity: 0,
        y: 20
      }} animate={{
        opacity: 1,
        y: 0
      }} className="mb-8">
          <h1 className="text-3xl font-bold text-safefit-highlight mb-2 font-poppins">Good Morning!</h1>
          <p className="text-safefit-card font-poppins">Here's your health overview for today</p>
        </motion.div>

        {/* Subscription Card */}
        <motion.div initial={{
        opacity: 0,
        y: 20
      }} animate={{
        opacity: 1,
        y: 0
      }} transition={{
        delay: 0.1
      }} className="mb-6">
          <Card className="p-6 bg-gradient-to-r from-safefit-primary/20 to-safefit-highlight/20 backdrop-blur-lg border border-safefit-border/30">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Crown className="w-8 h-8 text-yellow-500" />
                <div>
                  <h3 className="text-lg font-bold text-safefit-highlight font-poppins">Premium Plan</h3>
                  <p className="text-safefit-card text-sm font-poppins">Valid until Dec 31, 2024</p>
                </div>
              </div>
              <Button className="bg-safefit-primary hover:bg-safefit-primary/90 text-white font-poppins">
                See All Plans
              </Button>
            </div>
          </Card>
        </motion.div>

        {/* Vitals Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          {vitalsData.map((item, index) => {
          const Icon = item.icon;
          return <motion.div key={index} initial={{
            opacity: 0,
            y: 20
          }} animate={{
            opacity: 1,
            y: 0
          }} transition={{
            delay: index * 0.1 + 0.2
          }} whileHover={{
            scale: 1.02
          }} whileTap={{
            scale: 0.98
          }}>
                <Card className="p-6 bg-safefit-card/20 backdrop-blur-lg border border-safefit-border/30 hover:bg-safefit-card/30 transition-all cursor-pointer">
                  <div className="flex items-start justify-between mb-4">
                    <div className={`p-3 rounded-full bg-gradient-to-r ${item.color}`}>
                      <Icon className="w-6 h-6 text-white" />
                    </div>
                    <div className="flex items-center text-safefit-primary text-sm font-poppins">
                      <TrendingUp className="w-4 h-4 mr-1" />
                      {item.trend}
                    </div>
                  </div>
                  
                  <div className="mb-4">
                    <h3 className="text-safefit-primary text-sm font-medium font-poppins">{item.title}</h3>
                    <div className="flex items-baseline">
                      <span className="text-3xl font-bold text-safefit-dark font-poppins">{item.value}</span>
                      {item.unit && <span className="text-safefit-primary ml-1 font-poppins">{item.unit}</span>}
                    </div>
                  </div>

                  {/* Progress Ring */}
                  <div className="mb-2">
                    <div className="w-full bg-safefit-border rounded-full h-2">
                      <motion.div initial={{
                    width: 0
                  }} animate={{
                    width: `${item.progress}%`
                  }} transition={{
                    delay: index * 0.1 + 0.5,
                    duration: 0.8
                  }} className={`h-2 rounded-full bg-gradient-to-r ${item.color}`} />
                    </div>
                  </div>
                  
                  <p className="text-safefit-primary text-sm font-poppins">{item.status}</p>
                </Card>
              </motion.div>;
        })}
        </div>

        {/* SafeFit Summary */}
        <motion.div initial={{
        opacity: 0,
        y: 20
      }} animate={{
        opacity: 1,
        y: 0
      }} transition={{
        delay: 0.6
      }}>
          <Card className="p-6 bg-safefit-card/20 backdrop-blur-lg border border-safefit-border/30">
            <h3 className="text-xl font-bold text-safefit-dark mb-4 font-poppins">SafeFit Summary</h3>
            <div className="space-y-3">
              {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day, index) => <div key={day} className="flex items-center justify-between">
                  <span className="text-safefit-primary w-12 font-poppins">{day}</span>
                  <div className="flex-1 mx-4">
                    <div className="w-full bg-safefit-border rounded-full h-2">
                      <motion.div initial={{
                    width: 0
                  }} animate={{
                    width: `${Math.random() * 100}%`
                  }} transition={{
                    delay: index * 0.1 + 0.7,
                    duration: 0.8
                  }} className="bg-gradient-to-r from-safefit-primary to-safefit-highlight h-2 rounded-full" />
                    </div>
                  </div>
                  <span className="text-safefit-primary text-sm font-poppins">{Math.floor(Math.random() * 15000)}</span>
                </div>)}
            </div>
          </Card>
        </motion.div>
      </div>
    </div>;
};
export default Dashboard;