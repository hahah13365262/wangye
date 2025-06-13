import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
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

type Standard = {
  cr: number;
  ac: number;
  tbt: number;
};

export default function DetailsPage() {
  const navigate = useNavigate();
  const [allUsersData, setAllUsersData] = useState<UserData[]>([]);
  const [standards, setStandards] = useState<Standard>({
    cr: 30,
    ac: 50,
    tbt: 1000
  });
  const [searchName, setSearchName] = useState("");
  const [searchDate, setSearchDate] = useState("");
  const [sortConfig, setSortConfig] = useState<{key: string; direction: 'asc' | 'desc'} | null>(null);
  const [nameSuggestions, setNameSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      try {
        const savedData = localStorage.getItem("userData");
        if (savedData) {
          let parsedData;
          try {
            parsedData = JSON.parse(savedData);
          } catch (e) {
            throw new Error("数据解析失败");
          }

          if (!Array.isArray(parsedData)) {
            if (typeof parsedData === 'object' && parsedData !== null) {
              parsedData = [parsedData];
            } else {
              throw new Error("无效的数据格式");
            }
          }
          
          const validatedData = parsedData.map((item: any) => ({
            name: item.name || '未知',
            date: item.date || new Date().toISOString().split('T')[0],
            websites: Number(item.websites) || 0,
            orders: Number(item.orders) || 0,
            mainProducts: Number(item.mainProducts) || 0,
            acCount: Number(item.acCount) || 0,
            tbtAmount: Number(item.tbtAmount) || 0
          }));
          
          if (validatedData.length > 0) {
            setAllUsersData(validatedData);
            // 初始化姓名建议列表
            const names = Array.from(new Set(validatedData.map(item => item.name)));
            setNameSuggestions(names);
          } else {
            toast.error("没有有效数据，请重新录入");
          }
        } else {
          toast.info("暂无数据，请先录入数据");
        }
      } catch (error) {
        toast.error("读取数据失败，请检查数据格式");
        console.error("数据读取错误:", error);
        setAllUsersData([]);
      }
    };
    
    loadData();
  }, []);

  // 合并相同姓名和日期的数据
  const mergedData = useMemo(() => {
    const merged: Record<string, UserData> = {};
    
    allUsersData.forEach(item => {
      const key = `${item.name}_${item.date}`;
      if (!merged[key]) {
        merged[key] = { ...item };
      } else {
        merged[key] = {
          ...merged[key],
          websites: merged[key].websites + item.websites,
          orders: merged[key].orders + item.orders,
          mainProducts: merged[key].mainProducts + item.mainProducts,
          acCount: merged[key].acCount + item.acCount,
          tbtAmount: merged[key].tbtAmount + item.tbtAmount
        };
      }
    });
    
    return Object.values(merged);
  }, [allUsersData]);

  // 筛选数据
  const filteredData = useMemo(() => {
    let result = [...mergedData];
    
    // 按日期筛选
    if (searchDate) {
      result = result.filter(item => item.date === searchDate);
    }
    
    // 按姓名筛选
    if (searchName) {
      result = result.filter(item => 
        item.name.toLowerCase().includes(searchName.toLowerCase())
      );
    }
    
    return result;
  }, [mergedData, searchDate, searchName]);

  // 排序数据
  const sortedData = useMemo(() => {
    if (!sortConfig) return filteredData;
    
    return [...filteredData].sort((a, b) => {
      const aValue = sortConfig.key === 'cr' ? calculateCR(a) : 
                    sortConfig.key === 'ac' ? calculateACPercentage(a) : 
                    a[sortConfig.key as keyof UserData];
      
      const bValue = sortConfig.key === 'cr' ? calculateCR(b) : 
                    sortConfig.key === 'ac' ? calculateACPercentage(b) : 
                    b[sortConfig.key as keyof UserData];

      if (aValue < bValue) {
        return sortConfig.direction === 'asc' ? -1 : 1;
      }
      if (aValue > bValue) {
        return sortConfig.direction === 'asc' ? 1 : -1;
      }
      return 0;
    });
  }, [filteredData, sortConfig]);

  // 计算CR
  const calculateCR = (user: UserData) => {
    return user.websites > 0 ? (user.orders / user.websites * 100) : 0;
  };

  // 计算AC占比
  const calculateACPercentage = (user: UserData) => {
    return user.mainProducts > 0 ? (user.acCount / user.mainProducts * 100) : 0;
  };

  // 计算汇总数据
  const calculateSummary = () => {
    const totalUsers = filteredData.length;
    return {
      totalUsers,
      totalWebsites: filteredData.reduce((sum, user) => sum + user.websites, 0),
      totalOrders: filteredData.reduce((sum, user) => sum + user.orders, 0),
      totalMainProducts: filteredData.reduce((sum, user) => sum + user.mainProducts, 0),
      totalAC: filteredData.reduce((sum, user) => sum + user.acCount, 0),
      totalBTB: filteredData.reduce((sum, user) => sum + user.tbtAmount, 0),
      avgCR: filteredData.reduce((sum, user) => sum + calculateCR(user), 0) / (totalUsers || 1),
      avgAC: filteredData.reduce((sum, user) => sum + calculateACPercentage(user), 0) / (totalUsers || 1),
      avgBTB: filteredData.reduce((sum, user) => sum + user.tbtAmount, 0) / (totalUsers || 1)
    };
  };

  const summary = calculateSummary();

  // 准备图表数据
  const barChartData = [
    { name: "官网", value: summary.totalWebsites },
    { name: "订单", value: summary.totalOrders },
    { name: "主产品", value: summary.totalMainProducts },
    { name: "AC", value: summary.totalAC }
  ];

  const pieChartData = [
    { name: "达标", value: filteredData.filter(user => calculateCR(user) >= standards.cr).length },
    { name: "未达标", value: filteredData.filter(user => calculateCR(user) < standards.cr).length }
  ];

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

  const handleStandardChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setStandards(prev => ({
      ...prev,
      [name]: Number(value)
    }));
  };

  const requestSort = (key: string) => {
    let direction: 'asc' | 'desc' = 'asc';
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const handleNameSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchName(value);
    setShowSuggestions(value.length > 0);
  };

  const selectSuggestion = (name: string) => {
    setSearchName(name);
    setShowSuggestions(false);
  };

  return (
     <div className="min-h-screen bg-gradient-to-br from-blue-900/95 to-indigo-900/95 text-white">
      {/* 顶部导航栏 */}
      <nav className="bg-white/10 p-4 flex justify-between items-center backdrop-blur-sm">
        <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">绩效平台</h1>
        <div className="flex space-x-4">
          <button 
            onClick={() => navigate('/')}
            className="px-4 py-2 bg-white/20 rounded-lg hover:bg-white/30 transition"
          >
            数据看板
          </button>
          <button 
            onClick={() => navigate('/input')}
            className="px-4 py-2 bg-green-500/80 rounded-lg hover:bg-green-500 transition"
          >
            数据录入
          </button>
        </div>
      </nav>

      <div className="container mx-auto p-4">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* 标准设置区 */}
           <div className="bg-gradient-to-br from-blue-800/20 to-indigo-800/20 rounded-xl p-6 backdrop-blur-sm shadow-2xl border border-white/10 transition-all hover:shadow-[0_10px_30px_-5px_rgba(99,102,241,0.3)]">
            <h2 className="text-xl font-semibold mb-6">绩效标准设置</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm mb-2 opacity-80">CR标准(%)</label>
                <input
                  type="number"
                  name="cr"
                  value={standards.cr}
                  onChange={handleStandardChange}
                  className="w-full p-3 rounded-lg bg-white/10 border border-white/20 focus:ring-2 focus:ring-blue-400"
                />
              </div>
              <div>
                <label className="block text-sm mb-2 opacity-80">AC占比标准(%)</label>
                <input
                  type="number"
                  name="ac"
                  value={standards.ac}
                  onChange={handleStandardChange}
                  className="w-full p-3 rounded-lg bg-white/10 border border-white/20 focus:ring-2 focus:ring-blue-400"
                />
              </div>
              <div>
                <label className="block text-sm mb-2 opacity-80">BTB标准(元)</label>
                <input
                  type="number"
                  name="tbt"
                  value={standards.tbt}
                  onChange={handleStandardChange}
                  className="w-full p-3 rounded-lg bg-white/10 border border-white/20 focus:ring-2 focus:ring-blue-400"
                />
              </div>
            </div>

            {/* 汇总统计卡片 */}
            <div className="mt-8">
              <h3 className="text-lg font-medium mb-4">汇总统计</h3>
              <div className="bg-gradient-to-br from-blue-500/10 to-purple-500/10 p-4 rounded-lg border border-white/10">
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-white/5 p-3 rounded-lg">
                    <p className="text-xs opacity-80">总人数</p>
                    <p className="text-xl font-bold">{summary.totalUsers}</p>
                  </div>
                  <div className="bg-white/5 p-3 rounded-lg">
                    <p className="text-xs opacity-80">总官网</p>
                    <p className="text-xl font-bold">{summary.totalWebsites}</p>
                  </div>
                  <div className="bg-white/5 p-3 rounded-lg">
                    <p className="text-xs opacity-80">总订单</p>
                    <p className="text-xl font-bold">{summary.totalOrders}</p>
                  </div>
                  <div className="bg-white/5 p-3 rounded-lg">
                    <p className="text-xs opacity-80">平均CR</p>
                    <p className="text-xl font-bold">{summary.avgCR.toFixed(1)}%</p>
                  </div>
                  <div className="bg-white/5 p-3 rounded-lg">
                    <p className="text-xs opacity-80">平均AC</p>
                    <p className="text-xl font-bold">{summary.avgAC.toFixed(1)}%</p>
                  </div>
                  <div className="bg-white/5 p-3 rounded-lg">
                    <p className="text-xs opacity-80">总BTB</p>
                    <p className="text-xl font-bold">¥{summary.totalBTB.toLocaleString()}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* 数据展示区 */}
           <div className="lg:col-span-3 space-y-6 animate-fade-in">
            {/* 搜索栏 */}
            <div className="bg-gradient-to-br from-blue-500/10 to-purple-500/10 rounded-xl p-4 backdrop-blur-sm shadow-lg border border-white/10">
              <div className="flex items-center space-x-4">
                <input
                  type="date"
                  value={searchDate}
                  onChange={(e) => setSearchDate(e.target.value)}
                  className="p-3 rounded-lg bg-white/10 border border-white/20 focus:ring-2 focus:ring-blue-400"
                />
                <button 
                  onClick={() => {
                    toast.custom((t) => (
                      <div className="bg-white/20 backdrop-blur-sm p-4 rounded-lg shadow-lg border border-white/10">
                        <p className="mb-4">确定要删除所有数据吗？请输入密码确认</p>
                        <input
                          type="password"
                          placeholder="请输入密码"
                          className="w-full p-2 mb-4 rounded bg-white/10 border border-white/20"
                        />
                        <div className="flex justify-end space-x-2">
                          <button
                            onClick={() => toast.dismiss(t)}
                            className="px-3 py-1 bg-white/10 rounded hover:bg-white/20"
                          >
                            取消
                          </button>
                          <button
                            onClick={() => {
                              const passwordInput = document.querySelector('input[type="password"]') as HTMLInputElement;
                              if (passwordInput.value === '923') {
                                localStorage.removeItem("userData");
                                setAllUsersData([]);
                                toast.dismiss(t);
                                toast.success("所有数据已删除");
                              } else {
                                toast.error("密码错误");
                              }
                            }}
                            className="px-3 py-1 bg-red-500/80 rounded hover:bg-red-500"
                          >
                            确认删除
                          </button>
                        </div>
                      </div>
                    ));
                  }}
                  className="px-4 py-3 bg-red-500/80 rounded-lg hover:bg-red-500 transition"
                >
                  <i className="fa-solid fa-trash-can"></i> 删除所有数据
                </button>
                <div className="relative flex-1">
                  <input
                    type="text"
                    placeholder="搜索姓名..."
                    value={searchName}
                    onChange={handleNameSearchChange}
                    className="w-full p-3 rounded-lg bg-white/10 border border-white/20 focus:ring-2 focus:ring-blue-400"
                  />
                  {showSuggestions && nameSuggestions.length > 0 && (
                    <div className="absolute z-10 mt-1 w-full bg-white/20 backdrop-blur-sm rounded-lg shadow-lg border border-white/20 max-h-60 overflow-auto">
                      {nameSuggestions
                        .filter(name => name.toLowerCase().includes(searchName.toLowerCase()))
                        .map((name, index) => (
                          <div
                            key={index}
                            className="p-3 hover:bg-white/30 cursor-pointer transition"
                            onClick={() => selectSuggestion(name)}
                          >
                            {name}
                          </div>
                        ))}
                    </div>
                  )}
                </div>
                <button 
                  onClick={() => {
                    setSearchName("");
                    setSearchDate("");
                    toast.success('筛选条件已重置');
                  }}
                  className="px-4 py-3 bg-blue-500 rounded-lg hover:bg-blue-600 transition"
                >
                  <i className="fa-solid fa-rotate"></i>
                </button>
              </div>
            </div>

            {/* 数据图表区 */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-gradient-to-br from-blue-500/10 to-purple-500/10 rounded-xl p-6 backdrop-blur-sm shadow-lg border border-white/10">
                <h3 className="text-lg mb-4">数据分布</h3>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={barChartData}>
                      <XAxis dataKey="name" stroke="#fff" />
                      <YAxis stroke="#fff" />
                      <Tooltip 
                        contentStyle={{ backgroundColor: 'rgba(0,0,0,0.7)', border: 'none', borderRadius: '8px' }}
                      />
                      <Bar dataKey="value" fill="#8884d8" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
              <div className="bg-gradient-to-br from-blue-500/10 to-purple-500/10 rounded-xl p-6 backdrop-blur-sm shadow-lg border border-white/10">
                <h3 className="text-lg mb-4">CR达标情况</h3>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={pieChartData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={80}
                        paddingAngle={5}
                        dataKey="value"
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      >
                        <Cell fill="#4ade80" />
                        <Cell fill="#f87171" />
                      </Pie>
                      <Tooltip 
                        contentStyle={{ backgroundColor: 'rgba(0,0,0,0.7)', border: 'none', borderRadius: '8px' }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>

            {/* 数据表格 */}
            <div className="bg-gradient-to-br from-blue-500/10 to-purple-500/10 rounded-xl overflow-hidden backdrop-blur-sm shadow-lg border border-white/10">
              {/* 表头 */}
              <div className="grid grid-cols-12 bg-white/20 p-4 font-bold text-sm">
                <div 
                  className="col-span-3 cursor-pointer flex items-center" 
                  onClick={() => requestSort('name')}
                >
                  姓名
                  {sortConfig?.key === 'name' && (
                    <i className={`fa-solid fa-arrow-${sortConfig.direction === 'asc' ? 'up' : 'down'} ml-2 text-xs`}></i>
                  )}
                </div>
                <div 
                  className="col-span-2 cursor-pointer" 
                  onClick={() => requestSort('websites')}
                >
                  官网
                  {sortConfig?.key === 'websites' && (
                    <i className={`fa-solid fa-arrow-${sortConfig.direction === 'asc' ? 'up' : 'down'} ml-2 text-xs`}></i>
                  )}
                </div>
                <div 
                  className="col-span-2 cursor-pointer" 
                  onClick={() => requestSort('orders')}
                >
                  订单
                  {sortConfig?.key === 'orders' && (
                    <i className={`fa-solid fa-arrow-${sortConfig.direction === 'asc' ? 'up' : 'down'} ml-2 text-xs`}></i>
                  )}
                </div>
                <div 
                  className="col-span-2 cursor-pointer" 
                  onClick={() => requestSort('cr')}
                >
                  CR
                  {sortConfig?.key === 'cr' && (
                    <i className={`fa-solid fa-arrow-${sortConfig.direction === 'asc' ? 'up' : 'down'} ml-2 text-xs`}></i>
                  )}
                </div>
                <div 
                  className="col-span-2 cursor-pointer" 
                  onClick={() => requestSort('ac')}
                >
                  AC占比
                  {sortConfig?.key === 'ac' && (
                    <i className={`fa-solid fa-arrow-${sortConfig.direction === 'asc' ? 'up' : 'down'} ml-2 text-xs`}></i>
                  )}
                </div>
                <div 
                  className="col-span-1 cursor-pointer" 
                  onClick={() => requestSort('tbtAmount')}
                >
                  BTB
                  {sortConfig?.key === 'tbtAmount' && (
                    <i className={`fa-solid fa-arrow-${sortConfig.direction === 'asc' ? 'up' : 'down'} ml-2 text-xs`}></i>
                  )}
                </div>
              </div>

              {/* 表格内容 */}
              <div className="max-h-[500px] overflow-y-auto">
                {sortedData.length > 0 ? (
                  <>
                    {/* 汇总行 */}
                    <div className="grid grid-cols-12 p-4 text-sm items-center bg-blue-500/20 font-bold">
                      <div className="col-span-3">汇总</div>
                      <div className="col-span-2">{summary.totalWebsites}</div>
                      <div className="col-span-2">{summary.totalOrders}</div>
                      <div className="col-span-2">
                        {summary.avgCR.toFixed(1)}%
                      </div>
                      <div className="col-span-2">
                        {summary.avgAC.toFixed(1)}%
                      </div>
                      <div className="col-span-1">
                        ¥{summary.totalBTB.toLocaleString()}
                      </div>
                    </div>

                    {/* 数据行 */}
                    {sortedData.map((user, index) => {
                      const cr = calculateCR(user);
                      const acPercentage = calculateACPercentage(user);
                      const isCRMet = cr >= standards.cr;
                      const isACMet = acPercentage >= standards.ac;
                      const isBTBMet = user.tbtAmount >= standards.tbt;

                      return (
                        <div 
                          key={`${user.name}_${user.date}_${index}`}
                          className={`grid grid-cols-12 p-4 text-sm items-center hover:bg-white/10 transition ${index % 2 === 0 ? 'bg-white/5' : 'bg-white/10'}`}
                        >
                          <div className="col-span-3 font-medium">
                            {user.name}
                            <div className="text-xs opacity-70 mt-1">{user.date}</div>
                          </div>
                          <div className="col-span-2">{user.websites}</div>
                          <div className="col-span-2">{user.orders}</div>
                          <div className={`col-span-2 ${!isCRMet ? 'text-red-400 font-bold' : 'text-green-400'}`}>
                            {cr.toFixed(1)}%
                          </div>
                          <div className={`col-span-2 ${!isACMet ? 'text-red-400 font-bold' : 'text-green-400'}`}>
                            {acPercentage.toFixed(1)}%
                          </div>
                          <div className={`col-span-1 ${!isBTBMet ? 'text-red-400 font-bold' : 'text-green-400'}`}>
                            ¥{user.tbtAmount.toLocaleString()}
                          </div>
                          <div className="col-span-1 flex justify-center">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                toast.custom((t) => (
                                  <div className="bg-white/20 backdrop-blur-sm p-4 rounded-lg shadow-lg border border-white/10">
                                    <p className="mb-4">确定要删除 {user.name} 在 {user.date} 的数据吗？</p>
                                    <div className="flex justify-end space-x-2">
                                      <button
                                        onClick={() => toast.dismiss(t)}
                                        className="px-3 py-1 bg-white/10 rounded hover:bg-white/20"
                                      >
                                        取消
                                      </button>
                                      <button
                                        onClick={() => {
                                          const newData = allUsersData.filter(
                                            item => !(item.name === user.name && item.date === user.date)
                                          );
                                          localStorage.setItem("userData", JSON.stringify(newData));
                                          setAllUsersData(newData);
                                          toast.dismiss(t);
                                          toast.success("数据删除成功");
                                        }}
                                        className="px-3 py-1 bg-red-500/80 rounded hover:bg-red-500"
                                      >
                                        删除
                                      </button>
                                    </div>
                                  </div>
                                ));
                              }}
                              className="p-2 text-red-400 hover:text-red-300 transition"
                            >
                              <i className="fa-solid fa-trash"></i>
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </>
                ) : (
                  <div className="p-8 text-center text-gray-400">
                    <i className="fa-solid fa-database text-4xl mb-4"></i>
                    <p>暂无数据，请先录入数据</p>
                    <button 
                      onClick={() => navigate('/input')}
                      className="mt-4 px-4 py-2 bg-blue-500 rounded-lg hover:bg-blue-600 transition"
                    >
                      去录入数据
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
      <FlashText />

    </div>
  );
}
