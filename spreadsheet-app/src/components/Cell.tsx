import { useState, useEffect, useRef } from 'react';
import { Cell as CellType } from '../types';

interface CellProps {
    row: number;
    col: number;
    cell?: CellType;
    isSelected: boolean;
    isInRange: boolean;
    onSelect: (shiftKey: boolean) => void;
    onUpdate: (value: string) => void;
}

export function Cell({ row, col, cell, isSelected, isInRange,
    onSelect, onUpdate }: CellProps) {
    const [isEditing, setIsEditing] = useState(false);
    const [editValue, setEditValue] = useState('');
    const inputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (isEditing && inputRef.current) {
            inputRef.current.focus();
        }
    }, [isEditing]);

    useEffect(() => {
        if (isSelected && !isEditing) {
            const handleKeyDown = (e: KeyboardEvent) => {
                if (e.key === 'Enter' && !isEditing) {
                    setIsEditing(true);
                    setEditValue(cell?.value || '');
                }
            };
            window.addEventListener('keydown', handleKeyDown);
            return () => window.removeEventListener('keydown',
                handleKeyDown);
        }
    }, [isSelected, isEditing, cell]);

    const handleDoubleClick = () => {
        setIsEditing(true);
        setEditValue(cell?.value || '');
    };

    const handleBlur = () => {
        setIsEditing(false);
        if (editValue !== (cell?.value || '')) {
            onUpdate(editValue);
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            setIsEditing(false);
            onUpdate(editValue);
        } else if (e.key === 'Escape') {
            setIsEditing(false);
            setEditValue(cell?.value || '');
        }
    };

    const displayValue = cell?.computed !== undefined ?
        String(cell.computed) : '';

    return (
        <div
            className={`cell ${isSelected ? 'selected' : ''}
  ${isInRange ? 'in-range' : ''}`}
            onClick={(e) => onSelect(e.shiftKey)}
            onDoubleClick={handleDoubleClick}
            style={{
                border: '1px solid #ddd',
                padding: '4px 8px',
                height: '100%',
                minHeight: '100%',
                boxSizing: 'border-box',
                backgroundColor: isSelected ? '#e3f2fd' : isInRange ?
                    '#f0f8ff' : 'white',
                cursor: 'pointer'
            }}
        >
            {isEditing ? (
                <input
                    ref={inputRef}
                    type="text"
                    value={editValue}
                    onChange={(e) => setEditValue(e.target.value)}
                    onBlur={handleBlur}
                    onKeyDown={handleKeyDown}
                    style={{
                        width: '100%',
                        border: 'none',
                        outline: 'none',
                        padding: 0,
                        background: 'transparent'
                    }}
                />
            ) : (
                <span>{displayValue}</span>
            )}
        </div>
    );
}