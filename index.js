const pyfl = require('pyfl').default;
const pinyin = require('pinyin')
const inquirer = require('inquirer');
const fs = require('fs');
const colors = require('colors');
const exec = require('child_process').exec;
const iconv = require('iconv-lite');
const low = require('lowdb');
const FileSync = require('lowdb/adapters/FileSync');

const adapter = new FileSync('db.json');
const db = low(adapter);
const print = console.log;

// 程序主入口
(async function () {
    // 欢迎和初始化数据库
    print('Hello there, enter "exit" to exit.');
    generateDb();

    // 循环体
    while (true) {
        let input = await inquirer.prompt([{
            type: 'input',
            message: 'correct-name',
            name: 'name',
            prefix: '',
            suffix: ' >',
            filter: a => a.toLocaleUpperCase()
        }])
        if (input.name == 'exit') {
            db.set('names', []).write();
            print('Bye!');
            break;
        };
        if (input.name == 'generate') {
            generateDb();
            continue;
        };
        let resultList = db.get('names').filter({ Pinyin: input.name }).map('Name').value();

        switch (resultList.length) {
            case 0:
                print('No name matched'.yellow);
                break;
            case 1:
                copy(resultList[0]);
                print(resultList[0]);
                print('Copied!'.green);
                break;
            default:
                let selected = await inquirer.prompt([{
                    type: 'list',
                    message: 'Choose a name',
                    name: 'name',
                    choices: resultList,
                }]);
                copy(selected.name);
                print('Copied!'.green);
        }
    }

})();

// 将“\n”换成真正的换行符
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

// 生成首字母数据库
function generateDb() {
    let namelist = []
    try {
        namelist = byLine(fs.readFileSync('namelist.txt', { encoding: 'utf8' }));
    } catch (error) {
        fs.writeFileSync('namelist.txt', '\n');
    }
    if (namelist.length != 0) {
        var namepy = []
        for (i of namelist) namepy.push({ Name: i, Pinyin: generatePy(i) });
        db.set('names', namepy).write();
        print('Generate database successed! Now you can use it!'.green)
    }
    else print('Please put some names in "namelist.txt". One line one name.\nThen enter "generate" to generate a database to use.'.red);
}

// 针对不同平台的复制函数
function copy(text) {
    exec('clip').stdin.end(iconv.encode(text, 'gbk'));
}

// 生成一个拼音首字母
function generatePy(i) {
    let py = pyfl(i);
    // let py = pinyin(i, { heteronym: true, style: pinyin.STYLE_FIRST_LETTER })
    return py
}

// 查询一个拼音，返回匹配的列表
function queryName(n) {
    
}
