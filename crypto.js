const crypto = require('crypto');
const fs = require('fs');
const util = require('util')


const cipherData = fs.readFileSync(`${__dirname}/cipher.json`)
const { key, algorithm } = JSON.parse(cipherData)

//Получение возможных шифров и  хешей
console.log(crypto.getCiphers())
console.log(crypto.getHashes())



// Функция для createCipher
function encryptDeprecated(string) {
  //создаем объект шифра с нашим алгоритмом и ключом 
  const cipher = crypto.createCipher(algorithm, key)

  //обновляет наш объект шифра данными:  первый параметр - данные, второй - формат входных данных, третий - формат выходных данных
  let encrypted = cipher.update(string, 'utf8', 'hex');
  //оканчиваем шифрование и преобразоваем результат в hex - шестнадцатеричную систему исчисления 
  encrypted += cipher.final('hex')
  return encrypted

  /* 
   Не получится сделать после cipher.final():
   cipher.update(string, 'utf8', 'hex') 
   cipher.final()
  */
}

const encryptedString = encryptDeprecated('Oleg is cool guy! He is really awesome!')

function decryptDeprecated(string) {
  //создаем объект дешифратора с нашим алгоритмом и ключом 
  const decipher = crypto.createDecipher(algorithm, key)

  //обновляет наш объект дешифратора данными: первый параметр - данные, второй - формат входных данных, третий - формат выходных данных
  let decrypted = decipher.update(string, 'hex', 'utf8')
  //оканчиваем дешифрование. 
  decrypted += decipher.final('utf8')
  return decrypted
}

console.log(decryptDeprecated(encryptedString))


function encrypt(string) {
  const iv = crypto.randomBytes(8).toString('hex')
  const cipher = crypto.createCipheriv(algorithm, key, iv)

  //обновляет наш объект шифра данными:  первый параметр - данные, второй - формат входных данных, третий - формат выходных данных
  let encrypted = cipher.update(string, 'utf8', 'hex');
  encrypted += cipher.final('hex')
  //оканчиваем шифрование и преобразоваем результат в hex - шестнадцатеричную систему исчисления 
  return { string: encrypted, iv }
}

/* const encryptedObj = encrypt('Привет! Как дела?') */


function decrypt({ string, iv }) {
  //создаем объект дешифратора с нашим алгоритмом и ключом 
  const decipher = crypto.createDecipheriv(algorithm, key, iv)

  //обновляет наш объект дешифратора данными: первый параметр - данные, второй - формат входных данных, третий - формат выходных данных
  let decrypted = decipher.update(string, 'hex', 'utf8')
  decrypted += decipher.final('utf8')

  return decrypted
}

//оканчиваем дешифрование и преобразовываем результат в кодировку utf8

/* console.log(decrypt(encryptedObj)) */

// Hash
const stringForHash = 'test string'
const hash = crypto.createHash('sha512').update(stringForHash).digest('hex')
const hash2 = crypto.createHash('sha512').update(stringForHash).digest('hex')
/* console.log(hash === hash2) */


// Scrypt
async function scryptHash(string, salt) {
  // Выбираем соль. Если соль есть - используем ее(нужно для сопоставления уже имеющихся данных), если нет - генерируем сами и возвращаем
  const saltInUse = salt || crypto.randomBytes(16).toString('hex')
  // Создаем хеш. Первый параметр scrypt - данные, второй - соль, третий - выходная длина хеша
  const hashBuffer = await util.promisify(crypto.scrypt)(string, saltInUse, 32)
  // Хеш переделываем в строку
  return `${(hashBuffer).toString('hex')}:${saltInUse}`
}

async function scryptVerify(testString, hashAndSalt) {
  const [, salt] = hashAndSalt.split(':')
  return await scryptHash(testString, salt) === hashAndSalt
}

scryptHash('foobar foobar foobar').then(hash => console.log(hash))
scryptVerify('foobar foobar foobar', 'b3da2d16e11dedad639a2e0972beff49131fa032364e9190275994eaaaca2ad1:a43c139bdac1a5b7f6ca18e550b1ea4e').then(isEqual => console.log(isEqual))


