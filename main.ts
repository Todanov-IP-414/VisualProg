import { readFile, writeFile } from 'node:fs/promises';

export function csvToJSON(input: string[], delimiter: string): object[] {
    if (input.length === 0) return [];
    
    const header = input[0].split(delimiter);
    const result: any[] = [];

    for (let i = 1; i < input.length; i++) {
        const values = input[i].split(delimiter);
        
        if (values.length !== header.length) {
            throw new Error(`Mismatch in parametr count at row ${i}`);
        }

        const obj: Record<string, any> = {};
        header.forEach((key, index) => {
            const val = values[index];
            const parsedValue = (val !== '' && !isNaN(Number(val))) ? Number(val) : val;
            obj[key] = parsedValue;
        });
        result.push(obj);
    }
    return result;
}

export async function formatCSVFileToJSONFile(input: string, output: string, delimiter: string): Promise<void> {
    try {
        const fileContent = await readFile(input, 'utf-8');
        const lines = fileContent.split(/\r?\n/).filter(line => line.trim() !== '');

        const jsonData = csvToJSON(lines, delimiter);
        await writeFile(output, JSON.stringify(jsonData, null, 2));
    } catch (error: any) {
        throw new Error(`${error.message}`);
    }
}