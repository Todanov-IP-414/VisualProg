import { CellAddress, CellMap } from '../types';
import { parseAddress, parseRange, getCellKey } from './helpers';

type FormulaToken =
    | string
    | number
    | boolean
    | CellAddress
    | CellAddress[];

export function parseFormula(formula: string): {
    dependencies: CellAddress[];
    tokens: FormulaToken[];
} {
    const dependencies: CellAddress[] = [];
    const tokens: FormulaToken[] = [];

    const expr = formula.startsWith('=')
        ? formula.slice(1).trim()
        : formula.trim();

    const regex =
        /(SUM|AVERAGE)\(([A-Z]+\d+:[A-Z]+\d+)\)|([A-Z]+\d+)|([+\-*/()])|(\d+\.?\d*)|(true|false)/gi;

    let match: RegExpExecArray | null;
    let lastIndex = 0;

    while ((match = regex.exec(expr)) !== null) {
        const skipped = expr.slice(lastIndex, match.index).trim();

        if (skipped.length > 0) {
            throw new Error(`Invalid token: ${skipped}`);
        }

        lastIndex = regex.lastIndex;

        if (match[1] && match[2]) {
            const funcName = match[1].toUpperCase();
            const range = parseRange(match[2]);

            if (!range) {
                throw new Error(`Invalid range: ${match[2]}`);
            }

            dependencies.push(...range);

            tokens.push(funcName);
            tokens.push(range);

            continue;
        }

        if (match[3]) {
            const addr = parseAddress(match[3]);

            if (!addr) {
                throw new Error(`Invalid address: ${match[3]}`);
            }

            dependencies.push(addr);
            tokens.push(addr);

            continue;
        }

        if (match[4]) {
            tokens.push(match[4]);
            continue;
        }

        if (match[5]) {
            tokens.push(Number(match[5]));
            continue;
        }

        if (match[6]) {
            tokens.push(match[6].toLowerCase() === 'true');
        }
    }

    // Проверка хвоста строки
    const remaining = expr.slice(lastIndex).trim();

    if (remaining.length > 0) {
        throw new Error(`Invalid expression: ${remaining}`);
    }

    return { dependencies, tokens };
}

export function evaluateFormula(
    tokens: FormulaToken[],
    cellMap: CellMap
): number | string | boolean {
    try {
        const values: string[] = [];

        for (let i = 0; i < tokens.length; i++) {
            const token = tokens[i];

            if (typeof token === 'number') {
                values.push(String(token));
                continue;
            }

            if (typeof token === 'boolean') {
                values.push(token ? 'true' : 'false');
                continue;
            }

            if (typeof token === 'string') {
                if (token === 'SUM' || token === 'AVERAGE') {
                    const range = tokens[i + 1];

                    if (!Array.isArray(range)) {
                        return '#ERROR!';
                    }

                    const nums = range.map(addr => {
                        const key = getCellKey(addr.row, addr.col);
                        const cell = cellMap.get(key);

                        return typeof cell?.computed === 'number'
                            ? cell.computed
                            : 0;
                    });

                    if (token === 'SUM') {
                        const sum = nums.reduce((a, b) => a + b, 0);
                        values.push(String(sum));
                    } else {
                        const sum = nums.reduce((a, b) => a + b, 0);
                        const avg = nums.length > 0 ? sum / nums.length : 0;

                        values.push(String(avg));
                    }

                    i++;
                } else {
                    values.push(token);
                }

                continue;
            }

            if (Array.isArray(token)) {
                continue;
            }

            const key = getCellKey(token.row, token.col);
            const cell = cellMap.get(key);

            if (
                !cell ||
                cell.computed === null ||
                cell.computed === undefined
            ) {
                values.push('0');
            } else if (typeof cell.computed === 'boolean') {
                values.push(cell.computed ? 'true' : 'false');
            } else {
                values.push(String(cell.computed));
            }
        }

        const expression = values.join('');

        if (expression === 'true') return true;
        if (expression === 'false') return false;

        const result = eval(expression);

        if (typeof result === 'boolean') {
            return result;
        }

        if (
            typeof result !== 'number' ||
            Number.isNaN(result) ||
            !Number.isFinite(result)
        ) {
            return '#ERROR!';
        }

        return result;
    } catch {
        return '#ERROR!';
    }
}