// 급식 시간 알라미 — 오프라인 실행용 서비스 워커
// 앱 파일을 바꾸면 VERSION 숫자를 올려야 폰에 새 버전이 들어간다
const VERSION = 'lunch-v1';
const FILES = [
  './', 'index.html', 'manifest.webmanifest',
  'icons/apple-touch-icon.png', 'icons/icon-192.png', 'icons/icon-512.png', 'icons/maskable-192.png', 'icons/maskable-512.png', 
  'img/baesik.jpg', 'img/black.jpg', 'img/broccoli.jpg', 'img/brown.jpg', 'img/choco.jpg', 'img/creampuff.jpg', 'img/dakgangjeong.jpg', 'img/danmuji.jpg', 'img/donkatsu.jpg', 'img/eomukguk.jpg', 'img/gyul.jpg', 'img/jangjorim.jpg', 'img/jeyuk.jpg', 'img/jjajang.jpg', 'img/jjamppong.jpg', 'img/kimchi.jpg', 'img/kimchijjigae.jpg', 'img/kkakdugi.jpg', 'img/kongnamul.jpg', 'img/millet.jpg', 'img/miyeokguk.jpg', 'img/oimuchim.jpg', 'img/pudding.jpg', 'img/sigeumchi.jpg', 'img/sorghum.jpg', 'img/sundubu.jpg', 'img/tangsuyuk.jpg', 'img/yogurt.jpg', 
];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(VERSION).then(c => c.addAll(FILES)).then(() => self.skipWaiting()));
});
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys()
    .then(keys => Promise.all(keys.filter(k => k !== VERSION).map(k => caches.delete(k))))
    .then(() => self.clients.claim()));
});
self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;
  const url = new URL(e.request.url);
  // 구글 폰트: 받아둔 게 있으면 먼저 쓰고 뒤에서 새로 받기
  if (url.hostname.endsWith('fonts.googleapis.com') || url.hostname.endsWith('fonts.gstatic.com')) {
    e.respondWith(caches.open(VERSION).then(async c => {
      const hit = await c.match(e.request);
      const net = fetch(e.request).then(r => { c.put(e.request, r.clone()); return r; }).catch(() => hit);
      return hit || net;
    }));
    return;
  }
  // 앱 파일: 캐시 먼저, 없으면 네트워크
  if (url.origin === location.origin) {
    e.respondWith(caches.match(e.request, { ignoreSearch: true }).then(hit => hit || fetch(e.request)));
  }
});
