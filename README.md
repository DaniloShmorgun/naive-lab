---
title: Laboratory 2. NaiveCoin
author:
- Danylo Shmorhun
- Denys Ruban
- Ivan Zhydkevych
---

# Blockchain: Laboratory 2. NaiveCoin

*Danylo Shmorhun, Denys Ruban, Ivan Zhydkevych*

---

- [Walkthrough](#walkthrough)
  - [Installing](#installing)
  - [Wallets](#wallets)
  - [Gen Block](#gen-block)
  - [Peers](#peers)
  - [Mining](#mining)
  - [Transaction](#transaction)
  - [Connecting two networks (forking attack)](#connecting-two-networks)
  - [Blockchain Statistics](#blockchain-statistics)
- [Summary](#summary)

---


Метою даного практикуму є отримання навичок роботи з 
блокчейн-платформою на прикладі системи з відкритим кодом NaiveCoin. 
В процесі практикуму ми розгорнемо віртуальну однорангову мережу на базі системи віртуалізації Docker, встановимо та розгорнемо систему NaiveCoin, проведемо транзакції в системі NaiveCoin 
та проведемо аналіз ефективності блокчейну NaiveCoin.

**Постановка задачі:** Завданням практикуму є вивчення структури блоків, транзакцій, гаманця та адреси на прикладі реалізації блокчейну 
з відкритим кодом NaiveCoin, 
а також дослідження механізму консенсусу.

**Хід виконання роботи:**
Під час виконання практикуму були проведені наступні кроки:
- Ознайомлення зі структурою блоків, транзакцій, гаманця та адреси на прикладі NaiveCoin.
- Дослідження механізму консенсусу Proof of Work.
- Встановлення та налаштування середовища для запуску NaiveCoin на власному комп'ютері.
- Запуск чотирьох вузлів мережі NaiveCoin та проведення взаємодії між ними, додавання блоків та відправлення транзакцій.

Під час виконання роботи виникли такі труднощі:
- Проблеми зі створенням власних транзакцій та блоків.
- Потреба у додаткових знаннях з мережевого програмування та роботи з Docker.

Для подолання труднощів було використано наступні шляхи:
- Аналіз коду додатку та дебаггінг програмних помилок;
- Розробка тестових сценаріїв для перевірки роботи різних компонентів системи;

---

# Walkthrough

## Installing

У власному репозиторії для лабораторної роботи зклонували репозиторій NaiveCoin

```
git submodule add https://github.com/lhartikk/naivecoin/ naivecoin
```

Створили `Dockerfile` для створення контейнеру
```dockerfile
FROM node:8

WORKDIR /app

COPY naivecoin/package*.json ./

RUN npm install

COPY naivecoin .

EXPOSE 3001

CMD [ "npm", "start" ]
```

та для легкого підняття нод та їх конфігурації відповідний `docker-compose.yml`
```yaml
services:
  node1:
    build: .
    container_name: node1
    ports:
      - 5001:3001

  node2:
    build: .
    container_name: node2
    ports:
      - 5002:3001

  node3:
    build: .
    container_name: node3
    ports:
      - 5003:3001

  node4:
    build: .
    container_name: node4
    ports:
      - 5004:3001
```

Для запуску інфраструктури виконуємо
```bash
docker-compose up
```

![](img/2023-04-04-14-37-03.png)

## Wallets

Перевіримо створені гаманці у нод

![](img/2023-04-04-14-39-14.png)

## Gen Block

Перевіримо перший блок

![](img/2023-04-04-14-47-02.png)

Цей вихід представляє блок у блокчейні, що містить одну транзакцію. Блок має індекс 0 та відсутній попередній хеш, що вказує на те, що це початковий блок. Він має мітку часу `1465154705` та унікальний хеш `91a73664bc84c0baa1fc75ea6e4aa6d1d20c5df664c724e3159aefc2e1186627`. Важкість і одноразовий номер (nonce) встановлені на 0.

Транзакція всередині блоку має один вхід та один вихід. Вхід має порожній підпис, `txOutId` та `txOutIndex` рівний 0. 

На другій ноді маємо такий же блок

![](img/2023-04-04-14-51-56.png)

У коді цей блок представлено таким чином:

```typescript
const genesisTransaction = {
    'txIns': [{'signature': '', 'txOutId': '', 'txOutIndex': 0}],
    'txOuts': [{
        'address': '04bfcab8722991ae774db48f934ca79cfb7dd991229153b9f732ba5334aafcd8e7266e47076996b55a14bf9913ee3145ce0cfc1372ada8ada74bd287450313534a',
        'amount': 50
    }],
    'id': 'e655f6a5f26dc9b4cac6e46f52336428287759cf81ef5ff10854f69d68f43fa3'
};

const genesisBlock: Block = new Block(
    0, '91a73664bc84c0baa1fc75ea6e4aa6d1d20c5df664c724e3159aefc2e1186627', '', 1465154705, [genesisTransaction], 0, 0
);
```

Сам блок захардкожений одразу у ланцюг:

```typescript
let blockchain: Block[] = [genesisBlock];
```

## Peers

З самого початку піри не з'єднані

![](img/2023-04-04-15-04-20.png)

![](img/2023-04-04-15-17-30.png)

З'єднуємо першу з третьою, та другу з четвертою.

```mermaid
graph TD;
  1 --> 3
  2 --> 4
```

## Mining

Замайнимо блок на 1 пірі

![](img/2023-04-04-15-22-21.png)

При перевірці балансу бачимо, що на перший пір отримав 50 коінів.

![](img/2023-04-04-15-25-21.png)

При перегляді бачимо, що після майнингу блоку в нас з'явився новий блок в мережі 1-3 пірів та на адресу першого піра прийшло 50 коінів.

![](img/2023-04-04-15-42-18.png)
![](img/2023-04-04-15-44-22.png)
![](img/2023-04-04-15-46-10.png)

Майнимо на другому пірі

![](img/2023-04-04-15-26-59.png)

## Transaction

Проведемо транзакції:

1. Переведемо з першої ноди на третю 20 коінів
2. Перевіримо пул першої та третьої ноди
3. Замайнимо блок на першому пірі
4. Перевіримо пул та блоки

Запишемо адресу гаманця третього піру.
![](img/2023-04-04-16-00-40.png)

Створимо транзакцію переводячи 20 коінів з гаманця першого піра на гаманець другого піра. Фактично надсилаємо дані транзакції (адресу 3 піра та кількість коінів) на перший пір.

![](img/2023-04-04-16-02-27.png)

Як результати транзакції бачимо для виходи на дві адреси: залишок в 30 коінів переходять на адресу першого піра, а 20 коінів на адресу третього.

![](img/2023-04-04-16-02-01.png)

Баланси не змінилися
![](img/2023-04-04-16-11-53.png)

У пулі транзакцій бачимо нашу транзакцію, яка ще не була вписана у блокчейн.
![](img/2023-04-04-16-12-47.png)

Майнимо блок на першому пірі
![](img/2023-04-04-16-16-34.png)

Третій пір отримав свої 20 коінів, а перший залишок та 50 коінів за майнинг.
![](img/2023-04-04-16-17-20.png)
![](img/2023-04-04-16-18-38.png)

## Connecting two networks

Приєднаємо дві мережі нод, що матимуть різні блоки та транзакції.

![](img/2023-04-04-16-28-05.png)

Після команди приєднання першої та другої нод маємо такі логи.

![](img/2023-04-04-16-35-05.png)

Бачимо, що маємо всі однакові блоки на першому та другому пірі.

![](img/2023-04-04-16-37-00.png)

Поточна ситуація по з'єднаннях виглядає так:

```mermaid
graph TD;
  1 --> 3
  2 --> 4
  1 --> 2
```

Як результат маємо такі висновки: наш блокчейн, що був на 1 та третій нодах був
замінений блокчейном другої та четвертої нод. При під'єднанні мереж довжина блокчейну двох мереж була однаковою, тому не відбулося у той момент заміни. Після майнингу блока другою нодою перша та третя замінили свої блоки та транзакції, що були раніше, на блоки та транзакції другої та четвертої нод. Таким чином ми провели форк-атаку.

## Blockchain Statistics

Також ми створили скрипт для автоматичного відправлення запитів на ноди для
створення транзакцій та майнингу блоків. Звичайно, в залежності від скрипта
дані можуть бути різними, але при звичайному рівномірному розподілу на майнинг
та проведення транзакцій отримали такі значення.

![](img/2023-04-04-20-49-55.png)
![](img/stats.png)

# Summary

При аналізі даного блокчейну ми можемо акцентувати увагу на таких пунктах:

- Генерація блоків: Процес генерації блоків використовує алгоритм консенсусу Proof of Work (PoW), який вимагає від майнерів розв'язання криптографічної головоломки для створення нових блоків. Цей підхід може бути ресурсоємним, оскільки майнери повинні виконати багато хеш-обчислень, щоб знайти правильний блок. Для підвищення ефективності можна розглянути більш ефективні алгоритми консенсусу, такі як Proof of Stake (PoS) або Delegated Proof of Stake (DPoS).

- Регулювання складності: Алгоритм регулювання складності в створені блоків в цьому коді спрямований на підтримку постійного інтервалу генерації блоків. Однак імплементована процедура є досить простою і краще застосування може бути при більш складних алгоритмів, які також можуть краще реагувати на зміни в швидкості хешування мережі.

- Валідація транзакцій: Код перевіряє валідність транзакцій перед додаванням їх до пулу транзакцій і перед обробкою в новому блоці. Це гарантує, що недійсні транзакції не будуть поширюватися мережею, зменшуючи непотрібні накладні витрати. Однак можна зробити більше оптимізацій, наприклад, впровадити політику виселення пулу пам'яті для обробки пулів транзакцій з великою кількістю транзакцій, що очікують на обробку.

- Blockchain syncronization: Перед заміною локального ланцюга код перевіряє, чи має *отриманий* блокчейн більшу складність і чи є він дійсним. Це допомагає підтримувати найдовший ланцюжок і гарантує, що вузли дотримуються правил консенсусу. Однак процес перевірки може сповільнюватися, коли блокчейн стає більшим. Для прискорення процесу заміни ланцюжка можна впровадити такі методи, як контрольні точки або паралельна валідація.

- Масштабованість: Ця реалізація обробляє транзакції і зберігає їх у блоках лінійно. Зі збільшенням кількості транзакцій зростає час обробки та вимоги до зберігання даних. Для покращення масштабованості можуть бути впроваджені такі технології, як шардінг, коли блокчейн ділиться на менші, більш керовані частини, або позамережеві транзакції, такі як Lightning Network.

- Криптографія: Для хешування код покладається на бібліотеку CryptoJS. Хоча цього може бути достатньо для простої реалізації, для готових блокчейн-додатків слід розглянути більш надійні та ефективні криптографічні бібліотеки, такі як ті, що надаються криптомодулем Node.js.

Отже, надана реалізація блокчейну є гарною стартовою точкою для розуміння основних концепцій блокчейну. Однак, для підвищення її ефективності, масштабованості та надійності можуть бути зроблені різні оптимізації та вдосконалення.
