import { useNavigate } from 'react-router-dom';
import CreateRosca from '@/components/CreateRosca';

const CreateRoscaPage = () => {
  const navigate = useNavigate();

  const handleRoscaDeployed = ({ contractAddress }: { contractAddress: string }) => {
    navigate(`/dashboard/${contractAddress}`);
  };

  return (
    <div className="min-h-screen bg-background">
      <CreateRosca onDeploy={handleRoscaDeployed} />
    </div>
  );
};

export default CreateRoscaPage;
