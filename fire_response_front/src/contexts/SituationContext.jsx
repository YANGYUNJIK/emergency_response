import React, { createContext, useContext, useState } from "react";

// Context 생성
const SituationContext = createContext();

// Provider 정의
export const SituationProvider = ({ children }) => {
  const [mode, setMode] = useState("normal"); // 'normal' 또는 'disaster'

  return (
    <SituationContext.Provider value={{ mode, setMode }}>
      {children}
    </SituationContext.Provider>
  );
};

// 커스텀 훅으로 내보내기
export const useSituation = () => useContext(SituationContext);
