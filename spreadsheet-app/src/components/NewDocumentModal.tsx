import { useState } from 'react';

interface NewDocumentModalProps {
    isOpen: boolean;
    onClose: () => void;
    onCreate: (name: string, rows: number, cols: number) => void;
}

export function NewDocumentModal({ isOpen, onClose, onCreate }: NewDocumentModalProps) {
    const [name, setName] = useState('Новый документ');
    const [rows, setRows] = useState(100);
    const [cols, setCols] = useState(26);

    if (!isOpen) {
        return null;
    }

    const handleCreate = () => {
        if (name.trim() && rows > 0 && cols > 0) {
            onCreate(name, rows, cols);
            setName('Новый документ');
            setRows(100);
            setCols(26);
            onClose();
        }
    };

    return (
        <div style={overlayStyle} onClick={onClose}>
            <div style={modalStyle} onClick={(e) => e.stopPropagation()}>
                <h2 style={{ marginTop: 0 }}>Создать новый документ</h2>

                <div style={{ marginBottom: '15px' }}>
                    <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
                        Название:
                    </label>
                    <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        style={inputStyle}
                    />
                </div>

                <div style={{ marginBottom: '15px' }}>
                    <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
                        Количество строк:
                    </label>
                    <input
                        type="number"
                        value={rows}
                        onChange={(e) => setRows(Number(e.target.value))}
                        min="1"
                        max="1000"
                        style={inputStyle}
                    />
                </div>

                <div style={{ marginBottom: '20px' }}>
                    <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
                        Количество столбцов:
                    </label>
                    <input
                        type="number"
                        value={cols}
                        onChange={(e) => setCols(Number(e.target.value))}
                        min="1"
                        max="100"
                        style={inputStyle}
                    />
                </div>

                <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                    <button onClick={onClose} style={cancelButtonStyle}>
                        Отмена
                    </button>
                    <button onClick={handleCreate} style={createButtonStyle}>
                        Создать
                    </button>
                </div>
            </div>
        </div>
    );
}

const overlayStyle: React.CSSProperties = {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000
};

const modalStyle: React.CSSProperties = {
    backgroundColor: 'white',
    padding: '20px',
    borderRadius: '8px',
    minWidth: '400px',
    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
};

const inputStyle: React.CSSProperties = {
    width: '100%',
    padding: '8px',
    border: '1px solid #ccc',
    borderRadius: '4px',
    fontSize: '14px',
    boxSizing: 'border-box'
};

const cancelButtonStyle: React.CSSProperties = {
    padding: '8px 16px',
    border: '1px solid #ccc',
    borderRadius: '4px',
    cursor: 'pointer',
    backgroundColor: '#f5f5f5'
};

const createButtonStyle: React.CSSProperties = {
    padding: '8px 16px',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    backgroundColor: '#4CAF50',
    color: 'white',
    fontWeight: 'bold'
};
