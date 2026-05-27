import { useRef } from 'react';

interface ToolbarProps {
    documentName: string;
    unsavedChanges: boolean;
    saveStatus: 'saved' | 'saving' | 'error';
    onNew: () => void;
    onSave: () => void;
    onOpen: () => void;
    onExport: () => void;
    onExportCSV: () => void;
    onImport: (file: File) => void;
    onImportCSV: (file: File) => void;
    onRename: (name: string) => void;
}

export function Toolbar({
    documentName,
    unsavedChanges,
    saveStatus,
    onNew,
    onSave,
    onOpen,
    onExport,
    onExportCSV,
    onImport,
    onImportCSV,
    onRename
}: ToolbarProps) {
    const fileInputRef = useRef<HTMLInputElement>(null);
    const csvInputRef = useRef<HTMLInputElement>(null);

    const handleImportClick = () => {
        fileInputRef.current?.click();
    };

    const handleImportCSVClick = () => {
        csvInputRef.current?.click();
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            onImport(file);
        }
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    const handleCSVFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            onImportCSV(file);
        }
        if (csvInputRef.current) {
            csvInputRef.current.value = '';
        }
    };

    return (
        <div style={{
            display: 'flex',
            gap: '10px',
            padding: '10px 20px',
            borderBottom: '1px solid #ccc',
            alignItems: 'center',
            backgroundColor: '#f9f9f9'
        }}>
            <button onClick={onNew} style={buttonStyle}>
                Новый
            </button>

            <button onClick={onOpen} style={buttonStyle}>
                Открыть
            </button>

            <button onClick={onSave} style={buttonStyle}>
                Сохранить
            </button>

            <div style={{ borderLeft: '1px solid #ccc', height: '30px' }} />

            <button onClick={onExport} style={buttonStyle}>
                Экспорт JSON
            </button>

            <button onClick={onExportCSV} style={buttonStyle}>
                Экспорт CSV
            </button>

            <button onClick={handleImportClick} style={buttonStyle}>
                Импорт JSON
            </button>

            <button onClick={handleImportCSVClick} style={buttonStyle}>
                Импорт CSV
            </button>

            <input
                ref={fileInputRef}
                type="file"
                accept=".json"
                onChange={handleFileChange}
                style={{ display: 'none' }}
            />

            <input
                ref={csvInputRef}
                type="file"
                accept=".csv"
                onChange={handleCSVFileChange}
                style={{ display: 'none' }}
            />

            <div style={{ borderLeft: '1px solid #ccc', height: '30px' }} />

            <input
                type="text"
                value={documentName}
                onChange={(e) => onRename(e.target.value)}
                style={{
                    padding: '5px 10px',
                    border: '1px solid #ccc',
                    borderRadius: '4px',
                    minWidth: '200px'
                }}
            />

            {unsavedChanges && (
                <span style={{ color: '#ff6b6b', fontWeight: 'bold' }}>
                    *
                </span>
            )}

            <span style={{
                padding: '5px 10px',
                borderRadius: '4px',
                fontSize: '12px',
                fontWeight: 'bold',
                backgroundColor: saveStatus === 'saved' ? '#e8f5e9' : saveStatus === 'saving' ? '#fff3e0' : '#ffebee',
                color: saveStatus === 'saved' ? '#2e7d32' : saveStatus === 'saving' ? '#f57c00' : '#c62828'
            }}>
                {saveStatus === 'saved' ? 'Сохранено' : saveStatus === 'saving' ? 'Сохранение...' : 'Ошибка сохранения'}
            </span>
        </div>
    );
}

const buttonStyle: React.CSSProperties = {
    padding: '6px 12px',
    border: '1px solid #ccc',
    borderRadius: '4px',
    backgroundColor: 'white',
    cursor: 'pointer',
    fontSize: '14px'
};