import { useNavigate } from 'react-router-dom';
import JoinRosca from '@/components/JoinRosca';

const JoinRoscaPage = () => {
  const navigate = useNavigate();

  const handleRoscaJoined = (contractAddress: string) => {
    navigate(`/dashboard/${contractAddress}`);
  };

  return (
    <div className="min-h-screen bg-background">
      <JoinRosca onJoin={handleRoscaJoined} />
    </div>
  );
};

export default JoinRoscaPage;
