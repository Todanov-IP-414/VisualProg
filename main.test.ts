import { describe, it, expect } from "vitest";
import { query, where, sort, groupBy, having } from "./main";

type User = {
  id: number;
  name: string;
  surname: string;
  age: number;
  city: string;
};

const users: User[] = [
  { id: 1, name: "John", surname: "Doe", age: 34, city: "NY" },
  { id: 2, name: "John", surname: "Doe", age: 33, city: "NY" },
  { id: 3, name: "John", surname: "Doe", age: 35, city: "LA" },
  { id: 4, name: "Mike", surname: "Doe", age: 35, city: "LA" },
];

describe("Data Pipeline Queries", () => {
  it("должен фильтровать и сортировать данные", () => {
    const search = query(
      where<User, "name">("name", "John"),
      where("surname", "Doe"),
      sort("age")
    );

    const result = search(users);

    expect(result).toEqual([
      { id: 2, name: "John", surname: "Doe", age: 33, city: "NY" },
      { id: 1, name: "John", surname: "Doe", age: 34, city: "NY" },
      { id: 3, name: "John", surname: "Doe", age: 35, city: "LA" },
    ]);
  });

  it("должен группировать данные и фильтровать по группам", () => {
    const groupAndFilter = query(
      groupBy<User, "city">("city"),
      having((group) => group.items.length > 1)
    );

    const grouped = groupAndFilter(users);

    expect(grouped).toEqual([
      {
        key: "NY",
        items: [
          { id: 1, name: "John", surname: "Doe", age: 34, city: "NY" },
          { id: 2, name: "John", surname: "Doe", age: 33, city: "NY" },
        ],
      },
      {
        key: "LA",
        items: [
          { id: 3, name: "John", surname: "Doe", age: 35, city: "LA" },
          { id: 4, name: "Mike", surname: "Doe", age: 35, city: "LA" },
        ],
      },
    ]);
  });
  
  it("должен выполнять комбинированный конвейер", () => {
    const pipeline = query(
      where<User, "surname">("surname", "Doe"),
      groupBy("city"),
      having((group) => group.items.some((u) => u.age > 34))
    );

    const res = pipeline(users);

    expect(res).toEqual([
      {
        key: "LA",
        items: [
          { id: 3, name: "John", surname: "Doe", age: 35, city: "LA" },
          { id: 4, name: "Mike", surname: "Doe", age: 35, city: "LA" },
        ],
      },
    ]);
  });
});