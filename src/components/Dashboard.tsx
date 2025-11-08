import { motion } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { Heart, Droplets, Activity, Shield, TrendingUp } from 'lucide-react';
import BrandHeader from './BrandHeader';
import { useHealthMetrics } from '@/hooks/useHealthMetrics';

interface DashboardProps {
  user?: {
    email?: string;
    user_metadata?: {
      name?: string;
      full_name?: string;
    };
  };
}

const Dashboard = ({ user }: DashboardProps) => {
  const { currentMetrics, loading } = useHealthMetrics();

  // Get user's first name from metadata or email
  const fullName = user?.user_metadata?.name || 
                   user?.user_metadata?.full_name || 
                   (user?.email ? user.email.split('@')[0] : 'User');
  
  // Extract first name only
  const firstName = fullName.split(' ')[0];

  // Check if IoT system is connected (has recent sensor data)
  const isIoTConnected = !loading && currentMetrics && (
    currentMetrics.heartRate > 0 || 
    currentMetrics.spo2 > 0 || 
    currentMetrics.steps > 0
  );

  // Use real data from Supabase instead of fake data
  const vitalsData = [
    {
      icon: Heart,
      title: "Heart Rate",
      value: currentMetrics?.heartRate || "-",
      unit: currentMetrics?.heartRate ? "BPM" : "",
      status: currentMetrics?.heartRate ? (currentMetrics.heartRate < 60 ? "Low" : currentMetrics.heartRate > 100 ? "High" : "Normal") : "No data",
      color: "from-red-500 to-pink-500",
      trend: currentMetrics?.heartRate ? "+2%" : "--",
      progress: currentMetrics?.heartRate ? Math.min((currentMetrics.heartRate / 100) * 100, 100) : 0
    },
    {
      icon: Droplets,
      title: "SpO2 Level",
      value: currentMetrics?.spo2 || "-",
      unit: currentMetrics?.spo2 ? "%" : "",
      status: currentMetrics?.spo2 ? (currentMetrics.spo2 >= 95 ? "Excellent" : currentMetrics.spo2 >= 90 ? "Good" : "Low") : "No data",
      color: "from-blue-500 to-indigo-500",
      trend: currentMetrics?.spo2 ? "+1%" : "--",
      progress: currentMetrics?.spo2 || 0
    },
    {
      icon: Activity,
      title: "Steps Today",
      value: currentMetrics?.steps ? currentMetrics.steps.toLocaleString() : "-",
      unit: currentMetrics?.steps ? "steps" : "",
      status: `Goal: 10,000`,
      color: "from-green-500 to-teal-500",
      trend: currentMetrics?.steps ? `${Math.round((currentMetrics.steps / 10000) * 100)}%` : "--",
      progress: Math.min(((currentMetrics?.steps || 0) / 10000) * 100, 100)
    },
    {
      icon: Shield,
      title: "Safety Status",
      value: isIoTConnected ? "Active" : "Disconnected",
      unit: "",
      status: isIoTConnected ? "All systems OK" : "IoT device not connected",
      color: isIoTConnected ? "from-purple-500 to-indigo-500" : "from-orange-500 to-red-500",
      trend: isIoTConnected ? "100%" : "0%",
      progress: isIoTConnected ? 100 : 0
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-safefit-dark via-safefit-primary/10 to-safefit-dark">
      <BrandHeader />
      
      <div className="pt-20 pb-24 px-4 bg-gray-50">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <h1 className="text-3xl font-bold text-safefit-highlight mb-2 font-poppins">
            Hello {firstName}!
          </h1>
          <p className="text-safefit-card font-poppins">Here's your health overview for today</p>
          {loading && (
            <p className="text-sm text-gray-500 mt-2">Loading health data...</p>
          )}
          {!loading && (!currentMetrics || currentMetrics.heartRate === 0) && (
            <p className="text-sm text-yellow-600 mt-2">
              ⚠️ No sensor data available. Connect your device to start tracking.
            </p>
          )}
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
    </div>
  );
};

export default Dashboard;