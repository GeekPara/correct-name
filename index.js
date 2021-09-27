import pinyin from 'pinyin';
import inquirer from 'inquirer';
import { readFileSync, writeFileSync } from 'fs';
import { exec } from 'child_process';
import iconv from 'iconv-lite';
import low from 'lowdb';
import FileSync from 'lowdb/adapters/FileSync.js';
import msg from './message.js'

const adapter = new FileSync('db.json');
const db = low(adapter);
const print = console.log;

// 程序主入口
(async function () {
  // 欢迎和初始化数据库
  print(msg.title);
  print(msg.greet);
  generateDb();

  // 循环体
  while (true) {
    let input = await inquirer.prompt([
      {
        type: 'input',
        message: 'correct-name',
        name: 'name',
        prefix: '',
        suffix: ' >',
        filter: a => a.toLocaleLowerCase(),
      },
    ]);

    if (input.name == ':e') {
      db.set('names', []).write();
      print(msg.bye);
      break;
    }
    if (input.name == ':g') {
      generateDb();
      continue;
    }
    if (input.name == ':h') {
      print(msg.help)
      continue;
    }

    let resultList = queryName(input.name);

    switch (resultList.length) {
      case 0:
        print(msg.noNameMatched);
        break;
      case 1:
        copy(resultList[0]);
        print(resultList[0]);
        print('Copied!'.green);
        break;
      default:
        let selected = await inquirer.prompt([
          {
            type: 'list',
            message: msg.chooseName,
            name: 'name',
            choices: resultList,
          },
        ]);
        copy(selected.name);
        print(msg.copied);
    }
  }
})();

// 逐行读取文件到数组
function byLine(string) {
  let i = 0;
  let arr = [];
  while (i > -1) {
    var j = i;
    i = string.indexOf('\n', j + 1);
    var raw = string.substring(j, i == -1 ? string.length : i);
    var noReturn = raw.substring(
      raw.indexOf('\n') == -1 ? 0 : raw.indexOf('\n') + 1,
      raw.indexOf('\r') == -1 ? raw.length : raw.length - 1
    );
    if (noReturn) arr.push(noReturn);
  }
  return arr;
}

// 生成首字母数据库
function generateDb() {
  let namelist = [];
  try {
    namelist = byLine(readFileSync('namelist.txt', { encoding: 'utf8' }));
  } catch (error) {
    writeFileSync('namelist.txt', '\n');
  }
  if (namelist.length != 0) {
    var namepy = [];
    for (let i of namelist) namepy.push({ Name: i, Pinyin: generatePy(i) });
    db.set('names', namepy).write();
    print(msg.dbSuccess);
  } else
    print(msg.dbFaild);
}

// 针对不同平台的复制函数
function copy(text) {
  exec('clip').stdin.end(iconv.encode(text, 'gbk')); // Windows 复制
}

// 生成一个拼音首字母
function generatePy(i) {
  let py = pinyin(i, {
    heteronym: true,
    style: pinyin.STYLE_FIRST_LETTER,
  });
  return py;
}

// 查询一个拼音，返回匹配的列表
function queryName(n) {
  let a = n.split('');
  let query = db
    .read()
    .get('names')
    .filter(item => {
      if (item.Pinyin[0].indexOf(a[0]) >= 0) return true;
      else return false;
    })
    .value();
  if (a.length >= 2) {
    for (const i in a) {
      let tempArry = [];
      query.forEach(element => {
        if (element.Pinyin.length < a.length) return false;
        if (element.Pinyin[i].indexOf(a[i]) >= 0) tempArry.push(element);
      });
      query = tempArry;
    }
  }
  let names = [];
  query.forEach(element => {
    names.push(element.Name);
  });
  let rtn = names.sort((a, b) => {
    if (a.length < b.length) return -1;
    if (a.length > b.length) return 1;
    else return pinyin.compare(a, b);
  });
  // print(rtn)
  return rtn;
}
