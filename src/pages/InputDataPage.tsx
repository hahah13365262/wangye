import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Legend } from "recharts";
import { toast } from "sonner";
import { FlashText } from "@/components/FlashText";


type UserData = {
  name: string;
  date: string;
  websites: number;
  orders: number;
  mainProducts: number;
  acCount: number;
  tbtAmount: number;
};

export default function InputDataPage() {
  const navigate = useNavigate();
  const [userData, setUserData] = useState<UserData>({
    name: "",
    date: new Date().toISOString().split('T')[0],
    websites: 0,
    orders: 0,
    mainProducts: 0,
    acCount: 0,
    tbtAmount: 0
  });
  const [allUsersData, setAllUsersData] = useState<UserData[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const savedData = localStorage.getItem("userData");
    if (savedData) {
      try {
        const parsedData = JSON.parse(savedData);
        setAllUsersData(Array.isArray(parsedData) ? parsedData : [parsedData]);
      } catch (error) {
        console.error("解析数据失败:", error);
      }
    }
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    // 对于数字字段，只允许数字输入
    if (name !== "name" && !/^\d*$/.test(value)) return;
    
    setUserData(prev => ({
      ...prev,
      [name]: name === "name" ? value : Math.max(0, Number(value))
    }));
  };

  const handleNumberChange = (name: keyof UserData, delta: number) => {
    setUserData(prev => ({
      ...prev,
      [name]: Math.max(0, (prev[name] as number) + delta)
    }));
  };

  const handleSubmit = async () => {
    if (!userData.name.trim()) {
      toast.error("请输入姓名");
      return;
    }

    setIsSubmitting(true);
    
    const newEntry = {
      name: userData.name.trim(),
      websites: Number(userData.websites),
      orders: Number(userData.orders),
      mainProducts: Number(userData.mainProducts),
      acCount: Number(userData.acCount),
      tbtAmount: Number(userData.tbtAmount)
    };

    try {
      const newData = [...allUsersData.filter(item => item.name !== userData.name), newEntry];
      localStorage.setItem("userData", JSON.stringify(newData));
      setAllUsersData(newData);
      toast.success("数据保存成功!");
      setUserData({
        name: "",
        websites: 0,
        orders: 0,
        mainProducts: 0,
        acCount: 0,
        tbtAmount: 0
      });
    } catch (error) {
      toast.error("保存数据失败");
      console.error("保存数据错误:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // 计算CR(转化率)
  const cr = userData.websites > 0 ? (userData.orders / userData.websites * 100).toFixed(1) : 0;
  
  // 计算AC占比
  const acPercentage = userData.mainProducts > 0 ? (userData.acCount / userData.mainProducts * 100).toFixed(1) : 0;

  // 准备图表数据
  const pieData = [
    { name: "转化率", value: parseFloat(cr) },
    { name: "未转化", value: 100 - parseFloat(cr) }
  ];

  const barData = [
    { name: "官网", value: userData.websites },
    { name: "订单", value: userData.orders },
    { name: "主产品", value: userData.mainProducts },
    { name: "AC", value: userData.acCount }
  ];

  const COLORS = ['#6366f1', '#8b5cf6', '#ec4899', '#f43f5e'];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900/95 to-indigo-900/95 text-white p-6">
      <div className="container mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
            数据录入
          </h1>
          <button 
            onClick={() => navigate("/")}
            className="px-6 py-3 bg-white/20 rounded-xl hover:bg-white/30 transition flex items-center gap-2"
          >
            <i className="fa-solid fa-arrow-left"></i>
            返回首页
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* 数据输入表单 */}
           <div className="bg-gradient-to-br from-blue-800/20 to-indigo-800/20 rounded-2xl p-8 backdrop-blur-sm border border-white/10 shadow-2xl relative transition-all hover:shadow-[0_10px_30px_-5px_rgba(99,102,241,0.3)]">
             <div className="absolute top-4 right-4 bg-blue-500/20 px-3 py-1 rounded-full text-sm">
               当前日期: {userData.date}
             </div>
            <h2 className="text-2xl font-semibold mb-6">请输入您的数据</h2>
            <div className="space-y-5">
              <div>
                <label className="block text-sm font-medium mb-2 opacity-90">姓名</label>
                <input
                  type="text"
                  name="name"
                  value={userData.name}
                  onChange={handleInputChange}
                  className="w-full p-3 rounded-xl bg-white/10 border border-white/20 focus:ring-2 focus:ring-blue-400 focus:border-transparent"
                  placeholder="请输入姓名"
                />
              </div>
              
              {['websites', 'orders', 'mainProducts', 'acCount', 'tbtAmount'].map((field) => (
                <div key={field}>
                  <label className="block text-sm font-medium mb-2 opacity-90">
                    {{
                      websites: '官网数量',
                      orders: '订单数量',
                      mainProducts: '主产品数量',
                      acCount: 'AC数量',
                      tbtAmount: 'BTB金额'
                    }[field]}
                  </label>
                  <input
                    type="text"
                    name={field}
                    value={userData[field as keyof UserData]}
                    onChange={handleInputChange}
                    className="w-full p-3 rounded-xl bg-white/10 border border-white/20 focus:ring-2 focus:ring-blue-400 focus:border-transparent"
                    inputMode="numeric"
                    pattern="[0-9]*"
                  />
                </div>
              ))}

              <button
                onClick={handleSubmit}
                disabled={isSubmitting}
                className={`w-full py-3 rounded-xl transition mt-6 flex items-center justify-center gap-2 ${
                  isSubmitting 
                    ? 'bg-blue-400/50 cursor-not-allowed' 
                    : 'bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600'
                }`}
              >
                {isSubmitting ? (
                  <>
                    <i className="fa-solid fa-spinner animate-spin"></i>
                    保存中...
                  </>
                ) : (
                  <>
                    <i className="fa-solid fa-save"></i>
                    保存数据
                  </>
                )}
              </button>
            </div>
          </div>

          {/* 个人统计图表 */}
           <div className="bg-gradient-to-br from-indigo-500/10 to-purple-500/10 rounded-2xl p-8 backdrop-blur-sm border border-white/10 shadow-2xl transition-all hover:shadow-[0_10px_30px_-5px_rgba(168,85,247,0.3)]">
            <h2 className="text-2xl font-semibold mb-6">数据统计</h2>
            <div className="space-y-8">
              <div>
                <h3 className="text-lg font-medium mb-4">转化率: <span className="text-blue-300">{cr}%</span></h3>
                <div className="h-48">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={pieData}
                        cx="50%"
                        cy="50%"
                        innerRadius={50}
                        outerRadius={80}
                        paddingAngle={2}
                        dataKey="value"
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      >
                        <Cell fill={COLORS[0]} />
                        <Cell fill="#374151" />
                      </Pie>
                      <Legend />
                      <Tooltip 
                        formatter={(value) => [`${value}%`]}
                        contentStyle={{
                          backgroundColor: 'rgba(0,0,0,0.7)',
                          border: 'none',
                          borderRadius: '8px',
                          backdropFilter: 'blur(4px)'
                        }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>
              
              <div>
                <h3 className="text-lg font-medium mb-4">数据对比</h3>
                <div className="h-48">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={barData}>
                      <XAxis 
                        dataKey="name" 
                        stroke="#fff" 
                        tick={{ fontSize: 12 }}
                      />
                      <YAxis 
                        stroke="#fff" 
                        tick={{ fontSize: 12 }}
                      />
                      <Tooltip 
                        contentStyle={{
                          backgroundColor: 'rgba(0,0,0,0.7)',
                          border: 'none',
                          borderRadius: '8px',
                          backdropFilter: 'blur(4px)'
                        }}
                      />
                      <Bar 
                        dataKey="value" 
                        fill={COLORS[1]}
                        radius={[4, 4, 0, 0]}
                        animationDuration={1500}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-white/5 p-4 rounded-xl border border-white/10">
                  <p className="text-sm opacity-80 mb-1">AC占比</p>
                  <p className="text-2xl font-bold text-purple-300">{acPercentage}%</p>
                </div>
                <div className="bg-white/5 p-4 rounded-xl border border-white/10">
                  <p className="text-sm opacity-80 mb-1">BTB金额</p>
                  <p className="text-2xl font-bold text-pink-300">¥{userData.tbtAmount.toLocaleString()}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
        <FlashText />


        {allUsersData.length > 0 && (
          <div className="mt-8 bg-gradient-to-br from-green-500/10 to-emerald-500/10 rounded-2xl p-6 backdrop-blur-sm border border-white/10 shadow-xl">
            <div className="flex items-center gap-4">
              <i className="fa-solid fa-circle-check text-green-400 text-2xl"></i>
              <div>
                <h2 className="text-xl font-medium">数据已保存</h2>
                <p className="text-sm opacity-80 mt-1">
                  您可以在"明细查询"页面查看所有用户的汇总数据
                </p>
              </div>
              <button
                onClick={() => navigate('/details')}
                className="ml-auto px-4 py-2 bg-white/20 rounded-lg hover:bg-white/30 transition flex items-center gap-2"
              >
                <i className="fa-solid fa-chart-line"></i>
                查看明细
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}