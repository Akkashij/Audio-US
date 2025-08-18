import React, { createContext, useContext, ReactNode, useState } from 'react';

// Modal Context
export interface ModalContextType {
  showModal: (content: ReactNode) => void;
  hideModal: () => void;
}

export const ModalContext = createContext<ModalContextType>({ showModal: () => {}, hideModal: () => {} });

export function useModal() {
  return useContext(ModalContext);
}

export function ModalProvider({ children }: { children: React.ReactNode }) {
  const [modalContent, setModalContent] = useState<ReactNode | null>(null);
  const showModal = (content: ReactNode) => setModalContent(content);
  const hideModal = () => setModalContent(null);

  return (
    <ModalContext.Provider value={{ showModal, hideModal }}>
      {children}
      {modalContent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ backdropFilter: 'blur(8px)' }}>
          <div className="absolute inset-0 bg-black/30" onClick={hideModal}></div>
          <div className="relative z-10">{modalContent}</div>
        </div>
      )}
    </ModalContext.Provider>
  );
} 