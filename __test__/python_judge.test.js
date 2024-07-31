const {runTestCase} = require('../judges/python')
const fs = require('fs');
const path = require('path');


describe('output test python', () => {
    test('primitive passed', () => {
        return expect(runTestCase("codes/1.py","1\n1\n","1",1)).resolves.toEqual("Test case passed");
    });

    test('primitive failed', () => {
        return expect(runTestCase("codes/1.py","1\n1\n","2",1)).rejects.toThrow("Test case failed");
    });

    test('primitive passed', () => {
        return expect(runTestCase("codes/1.py","2\n1\n2\n","1\n2",1)).resolves.toEqual("Test case passed");
    });

    test('primitive failed', () => {
        return expect(runTestCase("codes/1.py","3\n1\n2\n3","1\n2\n100",1)).rejects.toThrow("Test case failed");
    });
    test('primitive passed', () => {
        return expect(runTestCase("codes/1.py","5\n1\n2\n3\n4\n5","1\n2\n3\n4\n5",1)).resolves.toEqual("Test case passed");
    });

    test('primitive failed', () => {
        return expect(runTestCase("codes/1.py","5\n1\n2\n3\n4\n5","1\n2\n3\n4\n6",1)).rejects.toThrow("Test case failed");
    });

    test('multiline passed', () => {
        const inputPath = path.join(__dirname, 'test_raw/test_case_2_large.txt');
        const input = fs.readFileSync(inputPath, 'utf8');
        const outputPath = path.join(__dirname, 'output_raw/test_case_2_large.txt');
        const output = fs.readFileSync(outputPath, 'utf8');
        return expect(runTestCase("codes/2.py",input,output,1)).resolves.toEqual("Test case passed");
    });

    test('multiline failed', () => {
        const inputPath = path.join(__dirname, 'test_raw/test_case_3_large.txt');
        const input = fs.readFileSync(inputPath, 'utf8');
        const outputPath = path.join(__dirname, 'output_raw/test_case_3_large.txt');
        const output = fs.readFileSync(outputPath, 'utf8');
        return expect(runTestCase("codes/2.py",input,output,1)).rejects.toThrow("Test case failed");
    });
});

