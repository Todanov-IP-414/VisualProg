import { DocumentListItem } from '../types';
import { getDocumentPreview } from '../utils/storage';

interface DocumentModalProps {
    isOpen: boolean;
    documents: DocumentListItem[];
    onClose: () => void;
    onOpen: (id: string) => void;
    onDelete: (id: string) => void;
    onDuplicate: (id: string) => void;
}

export function DocumentModal({
    isOpen,
    documents,
    onClose,
    onOpen,
    onDelete,
    onDuplicate
}: DocumentModalProps) {
    if (!isOpen) {
        return null;
    }

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleString('ru-RU');
    };

    const renderPreview = (docId: string) => {
        const preview = getDocumentPreview(docId);
        return (
            <table style={{ fontSize: '10px', borderCollapse: 'collapse', margin: '5px 0' }}>
                <tbody>
                    {preview.map((row, r) => (
                        <tr key={r}>
                            {row.map((cell, c) => (
                                <td key={c} style={{
                                    border: '1px solid #ddd',
                                    padding: '2px 4px',
                                    maxWidth: '50px',
                                    overflow: 'hidden',
                                    textOverflow: 'ellipsis',
                                    whiteSpace: 'nowrap'
                                }}>
                                    {cell}
                                </td>
                            ))}
                        </tr>
                    ))}
                </tbody>
            </table>
        );
    };

    return (
        <div style={overlayStyle} onClick={onClose}>
            <div style={modalStyle} onClick={(e) => e.stopPropagation()}>
                <h2 style={{ marginTop: 0 }}>Мои документы</h2>

                {documents.length === 0 ? (
                    <p style={{ color: '#666', textAlign: 'center', padding: '20px' }}>
                        Нет сохраненных документов
                    </p>
                ) : (
                    <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                            <thead>
                                <tr style={{ borderBottom: '2px solid #ddd' }}>
                                    <th style={thStyle}>Название</th>
                                    <th style={thStyle}>Превью</th>
                                    <th style={thStyle}>Создан</th>
                                    <th style={thStyle}>Изменен</th>
                                    <th style={thStyle}>Действия</th>
                                </tr>
                            </thead>
                            <tbody>
                                {documents.map((doc) => (
                                    <tr key={doc.id} style={{ borderBottom: '1px solid #eee' }}>
                                        <td style={tdStyle}>{doc.name}</td>
                                        <td style={tdStyle}>{renderPreview(doc.id)}</td>
                                        <td style={tdStyle}>{formatDate(doc.createdAt)}</td>
                                        <td style={tdStyle}>{formatDate(doc.updatedAt)}</td>
                                        <td style={tdStyle}>
                                            <button
                                                onClick={() => {
                                                    onOpen(doc.id);
                                                    onClose();
                                                }}
                                                style={actionButtonStyle}
                                            >
                                                Открыть
                                            </button>
                                            <button
                                                onClick={() => {
                                                    onDuplicate(doc.id);
                                                }}
                                                style={actionButtonStyle}
                                            >
                                                Копировать
                                            </button>
                                            <button
                                                onClick={() => {
                                                    if (confirm(`Удалить документ "${doc.name}"?`)) {
                                                        onDelete(doc.id);
                                                    }
                                                }}
                                                style={{
                                                    ...actionButtonStyle, backgroundColor:
                                                        '#ff6b6b', color: 'white'
                                                }}
                                            >
                                                Удалить
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}

                <div style={{ marginTop: '20px', textAlign: 'right' }}>
                    <button onClick={onClose} style={closeButtonStyle}>
                        Закрыть
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
    minWidth: '700px',
    maxWidth: '90%',
    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
};

const thStyle: React.CSSProperties = {
    padding: '10px',
    textAlign: 'left',
    fontWeight: 'bold'
};

const tdStyle: React.CSSProperties = {
    padding: '10px'
};

const actionButtonStyle: React.CSSProperties = {
    padding: '5px 10px',
    marginRight: '5px',
    border: '1px solid #ccc',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '12px'
};

const closeButtonStyle: React.CSSProperties = {
    padding: '8px 16px',
    border: '1px solid #ccc',
    borderRadius: '4px',
    cursor: 'pointer',
    backgroundColor: '#f5f5f5'
};