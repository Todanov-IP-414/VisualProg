import { vi, describe, it, expect, beforeEach } from 'vitest';
import * as fs from 'node:fs/promises';
import { csvToJSON, formatCSVFileToJSONFile } from './main';

vi.mock('node:fs/promises');

describe('CSV to JSON Logic', () => {
    
    describe('csvToJSON', () => {
        it('должна корректно преобразовывать массив строк в объекты', () => {
            const input = ["id;name", "1;Dima", "2;Andrey"];
            const expected = [
                { id: 1, name: "Dima" },
                { id: 2, name: "Andrey" }
            ];
            expect(csvToJSON(input, ';')).toEqual(expected);
        });

        it('должна возвращать пустой массив, если входные данные пусты', () => {
            expect(csvToJSON([], ';')).toEqual([]);
        });

        it('должна выбрасывать ошибку, если количество колонок не совпадает', () => {
            const input = ["id;name", "1;Dima;Andrey"];
            expect(() => csvToJSON(input, ';')).toThrow(/Mismatch in parametr count at row 1/);
        });
    });

    describe('formatCSVFileToJSONFile', () => {
        const mockedReadFile = vi.mocked(fs.readFile);
        const mockedWriteFile = vi.mocked(fs.writeFile);

        beforeEach(() => {
            vi.clearAllMocks();
        });

        it('должна прочитать файл, вызвать конвертацию и записать результат', async () => {
            const mockCSVContent = "id,city\n10,Moscow";
            const expectedJSON = JSON.stringify([{ id: 10, city: "Moscow" }], null, 2);
            
            mockedReadFile.mockResolvedValue(mockCSVContent);
            mockedWriteFile.mockResolvedValue(undefined);

            await formatCSVFileToJSONFile('test.csv', 'test.json', ',');

            expect(mockedReadFile).toHaveBeenCalledWith('test.csv', 'utf-8');
            expect(mockedWriteFile).toHaveBeenCalledWith('test.json', expectedJSON);
        });

        it('должна пробрасывать ошибку, если чтение файла не удалось', async () => {
            mockedReadFile.mockRejectedValue(new Error('Read error'));

            await expect(formatCSVFileToJSONFile('bad.csv', 'out.json', ','))
                .rejects.toThrow(/Read error/);
        });
    });
});