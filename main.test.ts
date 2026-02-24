import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
    PI,
    createUser,
    createBook,
    calculateArea,
    getStatusColor,
    capitalFirst,
    probeloobrezat,
    getFirstElement,
    findById
} from './main.ts';

describe('Константы', () => {
    it('должен содержать правильное значение PI', () => {
        expect(PI).toBe(3.1415926535);
    });
});

describe('createUser', () => {
    it('должен создавать пользователя с обязательными полями', () => {
        const user = createUser('John', 1);
        
        expect(user).toEqual({
            name: 'John',
            id: 1,
            isActive: true,
            email: undefined
        });
    });

    it('должен создавать пользователя со всеми полями', () => {
        const user = createUser('Jane', 2, false, 'jane@email.com');
        
        expect(user).toEqual({
            name: 'Jane',
            id: 2,
            isActive: false,
            email: 'jane@email.com'
        });
    });

    it('должен создавать пользователя с email и isActive по умолчанию', () => {
        const user = createUser('Bob', 3, true, 'bob@email.com');
        
        expect(user).toEqual({
            name: 'Bob',
            id: 3,
            isActive: true,
            email: 'bob@email.com'
        });
    });

    it('должен возвращать объект правильного типа User', () => {
        const user = createUser('Alice', 4);
        
        expect(user).toHaveProperty('name');
        expect(user).toHaveProperty('id');
        expect(user).toHaveProperty('isActive');
        expect(typeof user.name).toBe('string');
        expect(typeof user.id).toBe('number');
        expect(typeof user.isActive).toBe('boolean');
    });
});

describe('createBook', () => {
    it('должен создавать книгу без года', () => {
        const book = createBook({
            title: '1984',
            author: 'Orwell',
            genre: 'fiction'
        });
        
        expect(book).toEqual({
            title: '1984',
            author: 'Orwell',
            genre: 'fiction',
            year: undefined
        });
    });

    it('должен создавать книгу с годом', () => {
        const book = createBook({
            title: 'Sapiens',
            author: 'Harari',
            genre: 'non-fiction',
            year: 2011
        });
        
        expect(book).toEqual({
            title: 'Sapiens',
            author: 'Harari',
            genre: 'non-fiction',
            year: 2011
        });
    });

    it('должен создавать книгу с жанром fiction', () => {
        const book = createBook({
            title: 'Dune',
            author: 'Herbert',
            genre: 'fiction'
        });
        
        expect(book.genre).toBe('fiction');
    });

    it('должен создавать книгу с жанром non-fiction', () => {
        const book = createBook({
            title: 'Brief History of Time',
            author: 'Hawking',
            genre: 'non-fiction'
        });
        
        expect(book.genre).toBe('non-fiction');
    });

    it('должен возвращать тот же объект, который был передан', () => {
        const bookData = {
            title: 'Test Book',
            author: 'Test Author',
            genre: 'fiction' as const
        };
        
        const book = createBook(bookData);
        expect(book).toBe(bookData);
    });
});

describe('calculateArea', () => {
    describe('для круга', () => {
        it('должен правильно вычислять площадь круга с радиусом 0', () => {
            expect(calculateArea('circle', 0)).toBe(0);
        });

        it('должен правильно вычислять площадь круга с радиусом 1', () => {
            expect(calculateArea('circle', 1)).toBe(PI);
        });

        it('должен правильно вычислять площадь круга с радиусом 10', () => {
            expect(calculateArea('circle', 10)).toBe(PI * 100);
        });

        it('должен правильно вычислять площадь круга с радиусом 2.5', () => {
            expect(calculateArea('circle', 2.5)).toBe(PI * 6.25);
        });
    });

    describe('для квадрата', () => {
        it('должен правильно вычислять площадь квадрата со стороной 0', () => {
            expect(calculateArea('square', 0)).toBe(0);
        });

        it('должен правильно вычислять площадь квадрата со стороной 1', () => {
            expect(calculateArea('square', 1)).toBe(1);
        });

        it('должен правильно вычислять площадь квадрата со стороной 6', () => {
            expect(calculateArea('square', 6)).toBe(36);
        });

        it('должен правильно вычислять площадь квадрата со стороной 2.5', () => {
            expect(calculateArea('square', 2.5)).toBe(6.25);
        });
    });
});

describe('getStatusColor', () => {
    it('должен возвращать Green для статуса active', () => {
        expect(getStatusColor('active')).toBe('Green');
    });

    it('должен возвращать grey для статуса inactive', () => {
        expect(getStatusColor('inactive')).toBe('grey');
    });

    it('должен возвращать pink для статуса new', () => {
        expect(getStatusColor('new')).toBe('pink');
    });

    it('должен обрабатывать все возможные статусы', () => {
        const statuses: ('active' | 'inactive' | 'new')[] = ['active', 'inactive', 'new'];
        const expectedColors = ['Green', 'grey', 'pink'];
        
        statuses.forEach((status, index) => {
            expect(getStatusColor(status)).toBe(expectedColors[index]);
        });
    });
});

describe('StringFormatter', () => {
    describe('capitalFirst', () => {
        it('должен делать первую букву заглавной', () => {
            expect(capitalFirst('hello')).toBe('Hello');
        });

        it('должен возвращать пустую строку при пустом входе', () => {
            expect(capitalFirst('')).toBe('');
        });

        it('должен корректно обрабатывать строку из одной буквы', () => {
            expect(capitalFirst('a')).toBe('A');
        });

        it('должен делать всю строку заглавной при uppercase=true', () => {
            expect(capitalFirst('hello', true)).toBe('HELLO');
        });

        it('не должен изменять уже правильно отформатированную строку', () => {
            expect(capitalFirst('Hello')).toBe('Hello');
        });

        it('должен корректно обрабатывать строки с пробелами в начале', () => {
            expect(capitalFirst('  hello')).toBe('  hello');
        });
    });

    describe('probeloobrezat', () => {
        it('должен удалять пробелы в начале и конце строки', () => {
            expect(probeloobrezat('  hello  ')).toBe('hello');
        });

        it('должен удалять только пробелы по краям, сохраняя внутренние', () => {
            expect(probeloobrezat('  hello world  ')).toBe('hello world');
        });

        it('должен возвращать пустую строку для строки из одних пробелов', () => {
            expect(probeloobrezat('   ')).toBe('');
        });

        it('должен делать строку заглавной при uppercase=true', () => {
            expect(probeloobrezat('  hello  ', true)).toBe('HELLO');
        });

        it('не должен изменять строку без пробелов', () => {
            expect(probeloobrezat('hello')).toBe('hello');
        });

        it('должен обрабатывать табуляцию как пробелы', () => {
            expect(probeloobrezat('\thello\t')).toBe('hello');
        });
    });
});

describe('getFirstElement', () => {
    it('должен возвращать первый элемент числового массива', () => {
        expect(getFirstElement([1, 2, 3])).toBe(1);
    });

    it('должен возвращать первый элемент строкового массива', () => {
        expect(getFirstElement(['a', 'b', 'c'])).toBe('a');
    });

    it('должен возвращать первый элемент смешанного массива', () => {
        expect(getFirstElement([1, 'two', true])).toBe(1);
    });

    it('должен возвращать undefined для пустого массива', () => {
        expect(getFirstElement([])).toBeUndefined();
    });

    it('должен возвращать undefined для undefined массива', () => {
        expect(getFirstElement(undefined as any)).toBeUndefined();
    });

    it('должен работать с массивами объектов', () => {
        const objArray = [{ id: 1 }, { id: 2 }];
        expect(getFirstElement(objArray)).toEqual({ id: 1 });
    });

    it('должен сохранять тип элементов', () => {
        const numbers = getFirstElement([1, 2, 3]);
        expect(typeof numbers).toBe('number');
        
        const strings = getFirstElement(['a', 'b']);
        expect(typeof strings).toBe('string');
    });
});

describe('findById', () => {
    const testItems = [
        { id: 1, name: 'Item 1' },
        { id: 2, name: 'Item 2' },
        { id: 3, name: 'Item 3' }
    ];

    it('должен находить элемент по существующему id', () => {
        const result = findById(testItems, 2);
        expect(result).toEqual({ id: 2, name: 'Item 2' });
    });

    it('должен возвращать undefined для несуществующего id', () => {
        const result = findById(testItems, 99);
        expect(result).toBeUndefined();
    });

    it('должен возвращать undefined для пустого массива', () => {
        expect(findById([], 1)).toBeUndefined();
    });

    it('должен возвращать undefined для undefined массива', () => {
        expect(findById(undefined as any, 1)).toBeUndefined();
    });

    it('должен работать с массивом пользователей', () => {
        const users = [
            { id: 1, name: 'Alice', age: 25 },
            { id: 2, name: 'Bob', age: 30 }
        ];
        
        const result = findById(users, 1);
        expect(result).toEqual({ id: 1, name: 'Alice', age: 25 });
    });

    it('должен быть типобезопасным (возвращать правильный тип)', () => {
        const items = [
            { id: 1, customField: 'test' }
        ];
        
        const result = findById(items, 1);
        expect(result?.customField).toBe('test');
    });

    it('должен корректно сравнивать числовые id', () => {
        const items = [
            { id: 1, name: 'First' },
            { id: 2, name: 'Second' }
        ];
        
        expect(findById(items, 1)?.name).toBe('First');
        expect(findById(items, 2)?.name).toBe('Second');
    });
});

describe('Интеграционные тесты', () => {
    it('должен создавать пользователя и находить его по id', () => {
        const users = [
            createUser('John', 1),
            createUser('Jane', 2),
            createUser('Bob', 3)
        ];
        
        const foundUser = findById(users, 2);
        expect(foundUser).toEqual(expect.objectContaining({
            id: 2,
            name: 'Jane',
            isActive: true
        }));
    });

    it('должен работать с массивом книг', () => {
        const books = [
            createBook({ title: 'Book 1', author: 'Author 1', genre: 'fiction' }),
            createBook({ title: 'Book 2', author: 'Author 2', genre: 'non-fiction', year: 2020 })
        ];
        
        const firstBook = getFirstElement(books);
        expect(firstBook).toEqual({
            title: 'Book 1',
            author: 'Author 1',
            genre: 'fiction',
            year: undefined
        });
    });

    it('должен корректно форматировать строки и использовать их в пользовательских данных', () => {
        const formattedName = capitalFirst('john doe');
        const trimmedEmail = probeloobrezat('  john@email.com  ');
        
        const user = createUser(formattedName, 1, true, trimmedEmail);
        
        expect(user.name).toBe('John doe');
        expect(user.email).toBe('john@email.com');
    });
});

describe('Проверка вывода в консоль', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('должен выводить пользователей в консоль', () => {
        const consoleSpy = vi.spyOn(console, 'log');
        
        const user1 = createUser('Dima', 1);
        const user2 = createUser('Andrey', 2, true, 'abvgdeyka@mail.ru');
        
        console.log(user1);
        console.log(user2);
        
        expect(consoleSpy).toHaveBeenCalledTimes(2);
        expect(consoleSpy).toHaveBeenCalledWith(user1);
        expect(consoleSpy).toHaveBeenCalledWith(user2);
    });
});