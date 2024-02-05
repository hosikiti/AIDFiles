import { extractFunction } from "./llm.mjs";

describe('extract function', () => {
    test('should return null if no function found', () => {
        expect(extractFunction("")).toBe(null);
    })

    test('should return function parameters', () => {
        const input = `<FUNCTIONS>{"arguments":{"fromPath":"file1","toPath":"dir1"}}</FUNCTIONS>`;
        const expected = {"arguments":{"fromPath":"file1","toPath":"dir1"}};
        expect(extractFunction(input)).toEqual(expected);
    })
});