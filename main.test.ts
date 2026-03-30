import { describe, it } from 'vitest';
import { DeepReadonly, PickedByType, EventHandlers } from './main';

function expectType<T>(value: T) {}

describe('Typescript Lab 6: Type Utilities', () => {

  it('DeepReadonly: should make all levels readonly', () => {
    interface User {
      name: string;
      meta: { age: number };
    }

    type ReadonlyUser = DeepReadonly<User>;
    const user: ReadonlyUser = { name: 'Dmitry', meta: { age: 20 } };

    // @ts-expect-error: Свойство только для чтения
    user.name = 'Alex'; 
    // @ts-expect-error: Вложенное свойство тоже readonly
    user.meta.age = 21; 
  });

  it('PickedByType: should filter keys by value type', () => {
    interface Mixed {
      id: number;
      name: string;
      age: number;
      isAdmin: boolean;
    }

    type OnlyNumbers = PickedByType<Mixed, number>;
    
    const obj: OnlyNumbers = { id: 1, age: 25 };
    
    // @ts-expect-error: Поля 'name' тут быть не должно
    obj.name = 'Test';
    
    expectType<OnlyNumbers>(obj);
  });

  it('EventHandlers: should transform event names to handlers', () => {
    interface MyEvents {
      click: { x: number };
      hover: { element: string };
    }

    type Handlers = EventHandlers<MyEvents>;

    const myHandlers: Handlers = {
      onClick: (e) => console.log(e.x),
      onHover: (e) => console.log(e.element)
    };

    // @ts-expect-error: Обработчик должен называться onClick, а не click
    myHandlers.click = (e: any) => {};
    
    expectType<Handlers>(myHandlers);
  });
});