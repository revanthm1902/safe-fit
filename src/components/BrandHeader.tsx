import { motion } from 'framer-motion';
import { Settings, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
interface BrandHeaderProps {
  onSettingsClick?: () => void;
  onRefresh?: () => void;
}
const BrandHeader = ({
  onSettingsClick,
  onRefresh
}: BrandHeaderProps) => {
  const handleSettingsClick = () => {
    console.log('Settings clicked');
    if (onSettingsClick) {
      onSettingsClick();
    }
  };

  const handleRefresh = () => {
    console.log('Refreshing current tab data...');
    if (onRefresh) {
      onRefresh();
    }
  };
  return <div className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-lg border-b border-gray-200 shadow-sm">
      <div className="flex items-center justify-between px-6 py-4">
        <div className="flex-1" />
        
        <motion.div initial={{
        opacity: 0,
        y: -20
      }} animate={{
        opacity: 1,
        y: 0
      }} className="flex-1 flex justify-center">
          <h1 style={{
          fontFamily: 'Inter, system-ui, sans-serif'
        }} className="text-3xl font-black tracking-tight text-green-500">
            Safe<span className="text-safefit-highlight">Fit</span>
          </h1>
        </motion.div>
        
        <div className="flex-1 flex justify-end gap-2">
          <Button variant="ghost" size="sm" onClick={handleRefresh} className="text-safefit-dark hover:bg-gray-100 hover:text-safefit-highlight p-2 rounded-full" title="Refresh App">
            <RefreshCw className="w-6 h-6" />
          </Button>
          <Button variant="ghost" size="sm" onClick={handleSettingsClick} className="text-safefit-dark hover:bg-gray-100 hover:text-safefit-highlight p-2 rounded-full" title="Settings">
            <Settings className="w-6 h-6" />
          </Button>
        </div>
      </div>
    </div>;
};
export default BrandHeader;