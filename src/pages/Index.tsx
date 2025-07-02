import { Plus, Users, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import RoscaLogo from '@/components/RoscaLogo';
import { useNavigate } from 'react-router-dom';

const Index = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background">
      <div className="flex flex-col items-center justify-center p-4 pt-16 space-y-12">
        {/* Centered ROSCA Logo */}
        <RoscaLogo />
        {/* Action Buttons */}
        <div className="w-full max-w-md space-y-4">
          <Button
            onClick={() => navigate('/my-roscas')}
            className="w-full bg-gradient-to-r from-rose-500 to-peach-400 hover:from-rose-600 hover:to-peach-500 text-white rounded-2xl py-4 text-lg font-medium transition-all duration-200 transform hover:scale-105 shadow-lg"
          >
            <Eye className="w-5 h-5 mr-3" />
            My ROSCAs
          </Button>
          <Button
            onClick={() => navigate('/create')}
            className="w-full bg-gradient-to-r from-rose-500 to-peach-400 hover:from-rose-600 hover:to-peach-500 text-white rounded-2xl py-4 text-lg font-medium transition-all duration-200 transform hover:scale-105 shadow-lg"
          >
            <Plus className="w-5 h-5 mr-3" />
            Create New ROSCA
          </Button>
          <Button
            onClick={() => navigate('/join')}
            variant="outline"
            className="w-full border-2 border-rose-200 hover:border-rose-300 hover:bg-rose-50 text-rose-600 hover:text-rose-700 rounded-2xl py-4 text-lg font-medium transition-all duration-200 transform hover:scale-105"
          >
            <Users className="w-5 h-5 mr-3" />
            Join Existing ROSCA
          </Button>
        </div>
        <div className="pt-8 border-t border-rose-100 max-w-md">
          <p className="text-sm text-muted-foreground leading-relaxed text-center">
            DeROSCA enables groups to save and borrow together in a transparent,
            blockchain-based rotating credit system.
          </p>
        </div>
      </div>
      <footer className="mt-12 text-center text-sm text-muted-foreground">
        Built by <a href="https://github.com/hazim1093" target="_blank" rel="noopener noreferrer" className="text-rose-500 underline">@hazim1093</a>
      </footer>
    </div>
  );
};

export default Index;
