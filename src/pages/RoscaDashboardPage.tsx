import { useNavigate, useParams } from 'react-router-dom';
import RoscaDashboard from '@/components/RoscaDashboard';

const RoscaDashboardPage = () => {
  const navigate = useNavigate();
  const { contractAddress } = useParams<{ contractAddress: string }>();

  const handleWalletDisconnected = () => {
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-background">
      <RoscaDashboard roscaInfo={contractAddress ? { contractAddress } : null} onWalletDisconnected={handleWalletDisconnected} />
    </div>
  );
};

export default RoscaDashboardPage;
