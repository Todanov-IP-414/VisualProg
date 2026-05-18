import { ContextMenuState } from '../types';

interface ContextMenuProps {
    menu: ContextMenuState;
    onClose: () => void;
    onInsertRowAbove: () => void;
    onInsertRowBelow: () => void;
    onDeleteRow: () => void;
    onInsertColumnLeft: () => void;
    onInsertColumnRight: () => void;
    onDeleteColumn: () => void;
}

export function ContextMenu({
    menu,
    onClose,
    onInsertRowAbove,
    onInsertRowBelow,
    onDeleteRow,
    onInsertColumnLeft,
    onInsertColumnRight,
    onDeleteColumn
}: ContextMenuProps) {
    if (!menu.visible) return null;

    return (
        <>
            <div
                style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    zIndex: 999
                }}
                onClick={onClose}
            />
            <div
                style={{
                    position: 'fixed',
                    top: menu.y,
                    left: menu.x,
                    backgroundColor: 'white',
                    border: '1px solid #ccc',
                    borderRadius: '4px',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
                    zIndex: 1000,
                    minWidth: '180px'
                }}
            >
                <div
                    onClick={() => { onInsertRowAbove(); onClose(); }}
                    style={{
                        padding: '8px 12px',
                        cursor: 'pointer',
                        borderBottom: '1px solid #eee'
                    }}
                    onMouseEnter={(e) =>
                        e.currentTarget.style.backgroundColor = '#f0f0f0'}
                    onMouseLeave={(e) =>
                        e.currentTarget.style.backgroundColor = 'white'}
                >
                    Вставить строку выше
                </div>
                <div
                    onClick={() => { onInsertRowBelow(); onClose(); }}
                    style={{
                        padding: '8px 12px',
                        cursor: 'pointer',
                        borderBottom: '1px solid #eee'
                    }}
                    onMouseEnter={(e) =>
                        e.currentTarget.style.backgroundColor = '#f0f0f0'}
                    onMouseLeave={(e) =>
                        e.currentTarget.style.backgroundColor = 'white'}
                >
                    Вставить строку ниже
                </div>
                <div
                    onClick={() => { onDeleteRow(); onClose(); }}
                    style={{
                        padding: '8px 12px',
                        cursor: 'pointer',
                        borderBottom: '1px solid #eee',
                        color: '#d32f2f'
                    }}
                    onMouseEnter={(e) =>
                        e.currentTarget.style.backgroundColor = '#f0f0f0'}
                    onMouseLeave={(e) =>
                        e.currentTarget.style.backgroundColor = 'white'}
                >
                    Удалить строку
                </div>
                <div
                    onClick={() => { onInsertColumnLeft(); onClose(); }}
                    style={{
                        padding: '8px 12px',
                        cursor: 'pointer',
                        borderBottom: '1px solid #eee'
                    }}
                    onMouseEnter={(e) =>
                        e.currentTarget.style.backgroundColor = '#f0f0f0'}
                    onMouseLeave={(e) =>
                        e.currentTarget.style.backgroundColor = 'white'}
                >
                    Вставить столбец слева
                </div>
                <div
                    onClick={() => { onInsertColumnRight(); onClose(); }}
                    style={{
                        padding: '8px 12px',
                        cursor: 'pointer',
                        borderBottom: '1px solid #eee'
                    }}
                    onMouseEnter={(e) =>
                        e.currentTarget.style.backgroundColor = '#f0f0f0'}
                    onMouseLeave={(e) =>
                        e.currentTarget.style.backgroundColor = 'white'}
                >
                    Вставить столбец справа
                </div>
                <div
                    onClick={() => { onDeleteColumn(); onClose(); }}
                    style={{
                        padding: '8px 12px',
                        cursor: 'pointer',
                        color: '#d32f2f'
                    }}
                    onMouseEnter={(e) =>
                        e.currentTarget.style.backgroundColor = '#f0f0f0'}
                    onMouseLeave={(e) =>
                        e.currentTarget.style.backgroundColor = 'white'}
                >
                    Удалить столбец
                </div>
            </div>
        </>
    );
}