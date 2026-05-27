import { useEffect } from 'react';
import { Spreadsheet } from './components/Spreadsheet';
import { Toolbar } from './components/Toolbar';
import { DocumentModal } from './components/DocumentModal';
import { NewDocumentModal } from './components/NewDocumentModal';
import { useAppDispatch, useAppSelector } from './store';
import {
  loadDocumentsList,
  loadDocument,
  saveDocument,
  deleteDocument as deleteDocumentThunk,
  duplicateDocument as duplicateDocumentThunk,
  createNewDocument,
  renameDocument
} from './store/slices/documentsSlice';
import { loadState, undo, redo } from './store/slices/spreadsheetSlice';
import {
  openDocumentModal,
  closeDocumentModal,
  openNewDocumentModal,
  closeNewDocumentModal,
  setSaveStatus
} from './store/slices/uiSlice';
import { exportToJSON, importFromJSON, exportToCSV, importFromCSV, generateId } from './utils/storage';
import { Document, CellMap } from './types';

function App() {
  const dispatch = useAppDispatch();

  const { cells, rows, cols } = useAppSelector(state => state.spreadsheet);
  const { currentDocumentId, currentDocumentName, documentsList } = useAppSelector(state => state.documents);
  const { isDocumentModalOpen, isNewDocumentModalOpen, unsavedChanges, saveStatus } = useAppSelector(state => state.ui);

  useEffect(() => {
    dispatch(loadDocumentsList());
  }, [dispatch]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        handleSave();
      }
      if ((e.ctrlKey || e.metaKey) && e.key === 'z') {
        e.preventDefault();
        dispatch(undo());
      }
      if ((e.ctrlKey || e.metaKey) && e.key === 'y') {
        e.preventDefault();
        dispatch(redo());
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [dispatch, currentDocumentId, currentDocumentName, cells, rows, cols]);

  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (unsavedChanges) {
        e.preventDefault();
        e.returnValue = '';
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [unsavedChanges]);

  const handleNew = () => {
    if (unsavedChanges) {
      if (!confirm('Есть несохраненные изменения. Продолжить?')) {
        return;
      }
    }

    dispatch(openNewDocumentModal());
  };

  const handleCreateNewDocument = (name: string, newRows: number, newCols: number) => {
    dispatch(createNewDocument(name));
    dispatch(loadState({ cells: {}, rows: newRows, cols: newCols }));
    dispatch(closeNewDocumentModal());
  };

  const handleSave = () => {
    if (!currentDocumentId) return;

    dispatch(setSaveStatus('saving'));
    dispatch(saveDocument({
      id: currentDocumentId,
      name: currentDocumentName,
      cells,
      rows,
      cols
    }));
  };

  const handleOpen = () => {
    dispatch(openDocumentModal());
  };

  const handleOpenDocument = async (id: string) => {
    if (unsavedChanges) {
      if (!confirm('Есть несохраненные изменения. Продолжить?')) {
        return;
      }
    }

    const result = await dispatch(loadDocument(id));
    if (loadDocument.fulfilled.match(result)) {
      const doc = result.payload;
      const cellsObj: Record<string, any> = {};
      doc.cells.forEach((cell, key) => {
        cellsObj[key] = cell;
      });
      dispatch(loadState({ cells: cellsObj, rows: doc.rows, cols: doc.cols }));
      dispatch(closeDocumentModal());
    }
  };

  const handleDeleteDocument = (id: string) => {
    dispatch(deleteDocumentThunk(id));
  };

  const handleDuplicateDocument = (id: string) => {
    dispatch(duplicateDocumentThunk(id));
  };

  const handleRename = (newName: string) => {
    dispatch(renameDocument(newName));
  };

  const handleExport = () => {
    const cellMap: CellMap = new Map(Object.entries(cells));
    const doc: Document = {
      id: currentDocumentId || generateId(),
      name: currentDocumentName,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      cells: cellMap,
      rows,
      cols
    };

    const json = exportToJSON(doc);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${currentDocumentName}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleExportCSV = () => {
    const cellMap: CellMap = new Map(Object.entries(cells));
    const csv = exportToCSV(cellMap, rows, cols);
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${currentDocumentName}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImport = async (file: File) => {
    try {
      const reader = new FileReader();
      reader.onload = (e) => {
        const json = e.target?.result as string;
        const doc = importFromJSON(json);

        const cellsObj: Record<string, any> = {};
        doc.cells.forEach((cell, key) => {
          cellsObj[key] = cell;
        });

        dispatch(createNewDocument(doc.name));
        dispatch(loadState({ cells: cellsObj, rows: doc.rows, cols: doc.cols }));
      };
      reader.readAsText(file);
    } catch (error) {
      alert('Ошибка при импорте файла');
      console.error(error);
    }
  };

  const handleImportCSV = async (file: File) => {
    try {
      const reader = new FileReader();
      reader.onload = (e) => {
        const csvText = e.target?.result as string;
        const result = importFromCSV(csvText);

        const cellsObj: Record<string, any> = {};
        result.cells.forEach((cell, key) => {
          cellsObj[key] = cell;
        });

        dispatch(createNewDocument(file.name.replace('.csv', '')));
        dispatch(loadState({ cells: cellsObj, rows: result.rows, cols: result.cols }));
      };
      reader.readAsText(file);
    } catch (error) {
      alert('Ошибка при импорте CSV');
      console.error(error);
    }
  };

  return (
    <div>
      <h1 style={{ textAlign: 'center', margin: '20px 0' }}>
        Табличка
      </h1>

      <Toolbar
        documentName={currentDocumentName}
        unsavedChanges={unsavedChanges}
        saveStatus={saveStatus}
        onNew={handleNew}
        onSave={handleSave}
        onOpen={handleOpen}
        onExport={handleExport}
        onExportCSV={handleExportCSV}
        onImport={handleImport}
        onImportCSV={handleImportCSV}
        onRename={handleRename}
      />

      <Spreadsheet />

      <DocumentModal
        isOpen={isDocumentModalOpen}
        documents={documentsList}
        onClose={() => dispatch(closeDocumentModal())}
        onOpen={handleOpenDocument}
        onDelete={handleDeleteDocument}
        onDuplicate={handleDuplicateDocument}
      />

      <NewDocumentModal
        isOpen={isNewDocumentModalOpen}
        onClose={() => dispatch(closeNewDocumentModal())}
        onCreate={handleCreateNewDocument}
      />
    </div>
  );
}

export default App;
