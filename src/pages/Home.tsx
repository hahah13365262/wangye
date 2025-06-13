import { useNavigate } from "react-router-dom";
import { FlashText } from "@/components/FlashText";


const Dashboard = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 to-indigo-900 text-white">
      {/* 顶部导航栏 */}
      <nav className="bg-white/10 p-4 flex justify-between items-center backdrop-blur-sm border-b border-white/10">
        <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">绩效平台</h1>
        <div className="flex space-x-4">
          <button 
            onClick={() => navigate('/input')}
            className="px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-500 rounded-lg hover:from-green-600 hover:to-emerald-600 transition shadow-md"
          >
            <i className="fa-solid fa-pen-to-square mr-2"></i>
            数据录入
          </button>
          <button 
            onClick={() => navigate('/details')}
            className="px-4 py-2 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-lg hover:from-blue-600 hover:to-indigo-600 transition shadow-md"
          >
            <i className="fa-solid fa-magnifying-glass mr-2"></i>
            明细查询
          </button>
        </div>
      </nav>

      <div className="container mx-auto p-4 flex items-center justify-center h-[calc(100vh-80px)]">
        <div className="text-center max-w-2xl">
          <h2 className="text-4xl font-bold mb-6 bg-gradient-to-r from-blue-300 to-purple-300 bg-clip-text text-transparent">
            欢迎使用绩效数据平台
          </h2>
          <p className="text-xl mb-8 opacity-90">
            高效管理团队绩效数据，实时追踪业务指标
          </p>
          <div className="flex justify-center gap-4">
            <button 
              onClick={() => navigate('/input')}
              className="px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-500 rounded-xl hover:from-green-600 hover:to-emerald-600 transition shadow-lg flex items-center"
            >
              <i className="fa-solid fa-pen-to-square mr-2"></i>
              开始录入数据
            </button>
            <button 
              onClick={() => navigate('/details')}
              className="px-6 py-3 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-xl hover:from-blue-600 hover:to-indigo-600 transition shadow-lg flex items-center"
            >
              <i className="fa-solid fa-chart-line mr-2"></i>
              查看数据统计
            </button>
          </div>
        </div>
      </div>
      <FlashText />

    </div>
  );
};

export default Dashboard;
