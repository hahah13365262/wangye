import { useEffect, useState } from "react";

export function FlashText() {
  const [visible, setVisible] = useState(false);
  const [count, setCount] = useState(0);
  
  useEffect(() => {
    if (count >= 5) return;
    
    const interval = setInterval(() => {
      setVisible(v => !v);
      if (!visible) {
        setCount(c => c + 1);
      }
    }, 2000);
    
    return () => clearInterval(interval);
  }, [count, visible]);

  if (count >= 5) return null;

  return (
    <div className={`fixed bottom-2 right-2 text-xs opacity-70 transition-colors duration-1000 ${
      visible ? 'text-transparent' : 'text-purple-400'
    }`}>
      Maik.LI最帅
    </div>
  );
}
