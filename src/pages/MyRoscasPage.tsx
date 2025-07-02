import { useNavigate } from 'react-router-dom';
import MyRoscas from '@/components/MyRoscas';

const MyRoscasPage = () => {
  const navigate = useNavigate();

  const handleViewRosca = (contractAddress: string) => {
    navigate(`/dashboard/${contractAddress}`);
  };

  return (
    <div className="min-h-screen bg-background">
      <MyRoscas onBack={() => navigate('/')} onViewRosca={handleViewRosca} />
    </div>
  );
};

export default MyRoscasPage;
