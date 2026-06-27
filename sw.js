// CTalk Service Worker — minimal version
// หน้าที่หลัก: ทำให้ Chrome ยอมรับว่าแอปนี้ "installable" เป็น PWA
// (ไม่ได้ cache ไฟล์ใดๆ เพราะแอปต้องต่อ internet เพื่อเรียก Claude API อยู่แล้ว)

self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  self.clients.claim();
});

// ต้องมี fetch listener อย่างน้อย 1 ตัว ถึงจะนับเป็น installable PWA
self.addEventListener('fetch', (event) => {
  // ปล่อยให้ network จัดการตามปกติ ไม่ intercept อะไร
  return;
});
