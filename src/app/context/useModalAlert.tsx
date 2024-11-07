import { useState } from 'react';

export default function useModalAlert() {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalMessage, setModalMessage] = useState('');

    const showModalAlert = (message: string) => {
        setModalMessage(message);
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setModalMessage('');
    };

    return {
        isModalOpen,
        modalMessage,
        showModalAlert,
        closeModal,
    };
}
