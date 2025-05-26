# TicTacToe

Игра "Крестики-Нолики" с возможностью играть через Websockets.

## Instalation

- склонировать репозиторий себе на ПК
- запустить Docker
- перейти в корень проекта
- в консоли запустить: ```docker-compose up --build -d```
- ожидать окончание сборки

## Usage

После успешной установки можно перейти на главную страницу:
- http://localhost:3000

Для совместной игры на одной устройстве нужно использовать **разные браузеры**.

![Главная страница](<Снимок экрана (2130).png>)

## Technologies

* [FastAPI](https://fastapi.tiangolo.com/) - Фреймворк для backend части.
* [NextJS](https://nextjs.org/) - Фреймворк для frontend части.
* [Tortoise ORM](https://tortoise.github.io/) - ORM.

## Documentation

Документация backend части приложения доступна [тут](http://localhost:8080/docs).

Красивая схема базы данных доступна [тут](https://liambx.com/erd/p/github.com/FREDY129053/TicTacToe/blob/main/backend/ttt_schema.sql).

## Acknowledgments

* [Алина Нестеренко](https://github.com/kobra-kid)
* [Илья Иванов](https://github.com/mnhtrk)
