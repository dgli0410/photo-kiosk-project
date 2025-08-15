// src/InstitutionModal.jsx
import { useState } from 'react';

export default function InstitutionModal({ institutions, currentFilter, onClose, onComplete }) {
    const [selected, setSelected] = useState(currentFilter);

    const handleBackdropClick = (e) => {
        if (e.target === e.currentTarget) {
            onClose();
        }
    };

    return (
        <div className="modal-backdrop" onClick={handleBackdropClick}>
            <div className="modal-panel">
                <h3 className="modal-title">기관을 선택하세요</h3>
                <div className="modal-button-list">
                    {institutions.map(inst => {
                        const isSelected = selected === inst;
                        const buttonClassName = isSelected ? "inst-button selected" : "inst-button";
                        return (
                            <button key={inst} onClick={() => setSelected(inst)} className={buttonClassName}>
                                {inst}
                            </button>
                        );
                    })}
                </div>
                <div className="modal-footer">
                    <button onClick={onClose} className="close-button">닫기</button>
                    <button onClick={() => onComplete(selected)} className="complete-button">완료</button>
                </div>
            </div>
        </div>
    );
}