export const PI = 3.1415926535;

export interface User{
    name: string;
    email?: string
    isActive: boolean;
    id: number;
}

export function createUser(
    name: string,
    id: number,
    isActive: boolean = true,
    email?: string
): User {
    return{
        id,
        name,
        isActive,
        email
    }
}

export interface Book{
    title: string;
    author: string;
    year?: number;
    genre: 'fiction' | 'non-fiction';
}

export function createBook(book: Book) : Book {
    return book;
}

export function calculateArea(shape: 'circle', radius: number) : number;
export function calculateArea(shape: 'square', side: number) : number;
export function calculateArea(
    shape: 'circle' | 'square',
    value: number
) : number {
    if(shape === 'circle'){
        return PI * (value*value);
    }
    return value * value;
}

export type Status = 'active' | 'inactive' | 'new';

export function getStatusColor(status: Status) : string {
    switch(status){
        case 'active':
            return 'Green';
        case 'inactive':
            return 'grey'
        case 'new':
            return 'pink'
    }
}

export type StringFormatter = (
    value: string,
    uppercase?: boolean
) => string;

export const capitalFirst: StringFormatter = (value, uppercase = false) => {
    if(!value) return value;
    const result = value[0].toUpperCase() + value.slice(1);
    return uppercase ? result.toUpperCase() : result;
}

export const probeloobrezat: StringFormatter = (value, uppercase = false) => {
    const trimmed = value.trim();
    return uppercase ? trimmed.toUpperCase() : trimmed;
}

export function getFirstElement<T>(arr: T[]): T | undefined {
    if(arr === undefined) return undefined;
    return arr[0];
}

export interface Hasid{
    id: number;
}

export function findById<T extends Hasid>(items: T[], id: number) : T | undefined{
    if(items === undefined) return undefined;
    return items.find(item => item.id === id);
}

export const user1 = createUser('Dima', 1);
export const user2 = createUser('Andrey', 2, true, 'abvgdeyka@mail.ru');

console.log(user1);
console.log(user2);

export const book1 = createBook({
    title: '198',
    author: 'Tolstoy',
    genre: 'fiction'
});

console.log(book1);

export const book2 = createBook({
    title: '193',
    author: 'Dostoyevski',
    genre: 'non-fiction',
    year: 1935
});

console.log(book2);

console.log(calculateArea('circle', 10));
console.log(calculateArea('square', 6));

console.log(getStatusColor('active'));
console.log(getStatusColor('inactive'));
console.log(getStatusColor('new'));

console.log(capitalFirst('apple'));
console.log(capitalFirst('apple', true));

console.log(probeloobrezat('  probel   '));
console.log(probeloobrezat('  probel   ', true));

console.log(getFirstElement([3,4,7]));

console.log(getFirstElement(['string', 'first', 'apple']));

export const users = [{id: 2, name: 'dima'}, {id: 1, name: 'Andrey'}, {id: 3, name: 'Alex'}];
console.log(findById(users, 2));