const pyfl = require('pyfl').default;
const inquirer = require('inquirer');
const fs = require('fs');
const colors = require('colors');
const exec = require('child_process').exec;
const iconv = require('iconv-lite');
const low = require('lowdb');
const FileSync = require('lowdb/adapters/FileSync');
const adapter = new FileSync('db.json');
const db = low(adapter);

(async function () {
    print('Hello there, enter "exit" to exit.');

    generateDb();

    while (true) {
        let input = await inquirer.prompt([{
            type: 'input',
            message: 'correct-name',
            name: 'name',
            prefix: '',
            suffix: ' >'
        }])
        if (input.name == 'exit') {
            db.set('names', []).write();
            print('Bye!');
            break;
        };
        if (input.name == 'generate') {
            generateDb();
            break;
        };
        let queryPy = input.name.toLocaleUpperCase();
        let resultList = db.get('names').filter({ Pinyin: queryPy }).map('Name').value();

        switch (resultList.length) {
            case 0:
                print('No name matched'.yellow);
                break;
            case 1:
                exec('clip').stdin.end(iconv.encode(resultList[0], 'gbk'));
                print(resultList[0]);
                print('Copied!'.green);
                break;
            default:
                let selected = await inquirer.prompt([{
                    type: 'list',
                    message: 'Choose a name',
                    name: 'name',
                    choices: resultList,
                }])
                exec('clip').stdin.end(iconv.encode(selected.name, 'gbk'));
                print('Copied!'.green)
        }
    }

})();

function print(text) {
    console.log(text);
};

function byLine(string) {
    let i = 0;
    let arr = [];
    while (i > -1) {
        var j = i;
        i = string.indexOf('\n', j + 1);
        var raw = string.substring(j, i == -1 ? string.length : i);
        var noReturn = raw.substring(raw.indexOf('\n') == -1 ? 0 : raw.indexOf('\n') + 1, raw.indexOf('\r') == -1 ? raw.length : raw.length - 1)
        if (noReturn) arr.push(noReturn);
    }
    return arr;
}

function generateDb() {
    let namelist = byLine(fs.readFileSync('namelist.txt', { encoding: 'utf8' }));
    if (namelist.length != 0) {
        var namepy = []
        for (i of namelist) namepy.push({ Name: i, Pinyin: pyfl(i) });
        db.set('names', namepy).write();
        print('Generate database successed! Now you can use it!'.green)
    }
    else print('Please put some names in "namelist.txt". One line one name.\nThen enter "generate" to generate a database to use.'.red);
}
