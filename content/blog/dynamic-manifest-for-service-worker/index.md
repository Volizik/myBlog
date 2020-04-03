---
title: "Динамический manifest для Service Worker"
date: "2020-04-02T18:02:03.284Z"
description: "Однажды возникла задача сделать динамическим поле start_url в файле manifest.json для PWA. В этой статье хочу показать к какому решению я пришел."
---

Создадим несколько необходимых для примера файлов:

_`index.html`_
```html
<!doctype html>
<html>
<head>
   <meta charset="UTF-8">
   <link rel="manifest" id="custom-manifest"> <!--тут указываем id нашему динамическому манифесту-->
   <title>My first PWA</title>
</head>
<body>
   <h1>Index PWA page!</h1>

   <input type="text" id="app_name">
   <button id="generate_manifest">Сгенерировать манифест</button>
   <button id="add_app_to_desktop">Добавить приложение</button>

   <script src="sw.js"></script>
   <script src="script.js"></script>
</body>
</html>
```
<br />

_`sw.js`_
```javascript
self.addEventListener('install', event => self.skipWaiting());
self.addEventListener('activate', event => self.clients.claim());
self.addEventListener('fetch', event => {});
```

Метод `skipWaiting()` в ServiceWorkerGlobalScope принудительно ативирует ожидающий service worker. Этот метод может быть вызван в любой момент работы service worker’a, но будет действовать только в том случае, если есть только что установленный service worker, иначе service worker будет оставаться в состоянии ожидания, поэтому обычно вызывается из обработчика InstallEvent. Этот метод нужно использовать с  `self.clients.claim()` чтобы гарантировать, что обновления базового service worker’a вступают в силу немедленно как для текущего клиента, так и для всех других активных клиентов. В обработчике события fetch мы делать ничего не будет, но сам обработчик нужен, чтобы наш service worker работал корректно.

_`script.js`_
```javascript
function generateManifest(app_name = 'Default application name') {
   const myDynamicManifest = {
       "name": app_name,
       "short_name": "Test app",
       "scope": window.location.origin,
       "start_url": window.location.origin,
       "display": "standalone",
       "icons": [
           {
               "src":"https://via.placeholder.com/48/",
               "sizes": "48x48",
               "type": "image/png"
           },
           {
               "src": "https://via.placeholder.com/144/",
               "sizes": "144x144",
               "type": "image/png"
           },
           {
               "src": "https://via.placeholder.com/196/",
               "sizes": "196x196",
               "type": "image/png"
           }
       ]
   };
   const stringManifest = JSON.stringify(myDynamicManifest);
   const blob = new Blob([stringManifest], {type: 'application/json'});
   const manifestURL = URL.createObjectURL(blob);
   document.querySelector('#custom-manifest').setAttribute('href', manifestURL);
}

```

В функции создаем объект myDynamicManifest, в который помещаем начальные данные нашего приложения. Тот факт, что наш манифест является javascript-объектом, дает нам право делать любое поле динамическим. Объект Blob представляет из себя объект наподобие файла с неизменяемыми, необработанными данными. Blob-ы представляют данные, которые могут быть не в родном формате JavaScript. Интерфейс File основан на Blob, наследует функциональность Blob и расширяет его для поддержки файлов на стороне пользователя. URL.createObjectURL() - статический метод, который создает DOMString, содержащий URL с указанием на объект, заданный как параметр. Время жизни URL связано с document окна в котором он был создан. Новый URL объект может представлять собой File объект или Blob объект. 
В конце назначаем тегу ``<link rel="manifest" id="custom-manifest">`` атрибут href, и указываем ссылку на наш сгенерированный manifest

Далее регистрируем service worker 

_`script.js`_
```javascript
if ('serviceWorker' in navigator) {
   navigator.serviceWorker.register('./sw.js').then(
       (reg) => { console.log('SW registered!') },
       (err) => { console.log('SW not registered!', err) }
   )
}
```
и вешаем обработчик на событие `beforeinstallprompt`

_`script.js`_
```javascript
let promptEvent;
window.addEventListener('beforeinstallprompt', (event) => {
   event.preventDefault();
   promptEvent = event;
}); 
```

В обработчике запрещаем стандартное действие события, и сохраняем событие в глобальную переменную. Теперь в любом другом месте мы можем вызвать метод `prompt()` у переменной `promptEvent`

_`script.js`_
```javascript
window.addEventListener('DOMContentLoaded', () => {
  const generateManifestBtn = document.querySelector('#generate_manifest');
  const addAppToDesktopBtn = document.querySelector('#add_app_to_desktop');
  const input = document.querySelector('#app_name');

  generateManifest();

  generateManifestBtn.addEventListener('click', (e) => {
    e.preventDefault();
    generateManifest(input.value);
  });
  addAppToDesktopBtn.addEventListener('click', (e) => {
    e.preventDefault();
    promptEvent.prompt();
  });

});

```

Для того, что бы запустить код, можно воспользоваться пакетом [http-server](https://www.npmjs.com/package/http-server), или любым другим.
Надеюсь данное решение будет вам полезным!
Полный код вы сможете найти в моем аккаунте на [github](https://github.com/Volizik/dynamicManifest)
