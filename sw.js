// CTalk Service Worker
// หน้าที่หลัก: ทำให้ Chrome ยอมรับว่าแอปนี้ "installable" เป็น PWA
// + cache ไฟล์ hsk-data.json (~5000 คำ HSK1-6) ไว้บนเครื่อง ใช้ฟีเจอร์ highlight ได้แม้ offline
// (ส่วน UI หลักยังต้องต่อ internet เพื่อเรียก Claude API อยู่ดี ไม่ใช่ full offline app)

const CACHE_NAME = 'ctalk-cache-v1'; // เปลี่ยนเลขท้ายเวลาอยากบีบให้ cache เก่าถูกล้าง (เช่นถ้า hsk-data.json อัปเดตเนื้อหา)
const CACHE_FILES = ['hsk-data.json'];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(CACHE_FILES))
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  // ล้าง cache เวอร์ชันเก่าที่ไม่ตรงกับ CACHE_NAME ปัจจุบัน
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);

  // เฉพาะ hsk-data.json เท่านั้นที่ใช้กลยุทธ์ cache-first (ไฟล์นิ่ง ไม่เปลี่ยนบ่อย ขนาดใหญ่ ~680KB)
  if (url.pathname.endsWith('hsk-data.json')) {
    event.respondWith(
      caches.match(event.request).then((cached) => {
        if (cached) return cached;
        return fetch(event.request).then((response) => {
          const clone = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
          return response;
        });
      })
    );
    return;
  }

  // ไฟล์อื่นๆทั้งหมด (HTML/API call) ปล่อยให้ network จัดการตามปกติ ไม่ intercept
  return;
});
