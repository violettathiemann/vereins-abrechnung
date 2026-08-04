const CACHE_NAME='vereins-abrechnung-v1';
const APP_FILES=[
  './',
  './index.html',
  './manifest.webmanifest',
  './icon-192.svg',
  './icon-512.svg'
];

self.addEventListener('install',event=>{
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache=>cache.addAll(APP_FILES))
  );
  self.skipWaiting();
});

self.addEventListener('activate',event=>{
  event.waitUntil(
    caches.keys().then(keys=>
      Promise.all(keys.filter(key=>key!==CACHE_NAME).map(key=>caches.delete(key)))
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch',event=>{
  const url=new URL(event.request.url);

  // Google Apps Script niemals cachen.
  if(url.hostname.includes('script.google.com') || url.hostname.includes('googleusercontent.com')){
    return;
  }

  if(event.request.method!=='GET'){
    return;
  }

  event.respondWith(
    fetch(event.request)
      .then(response=>{
        const copy=response.clone();
        caches.open(CACHE_NAME).then(cache=>cache.put(event.request,copy));
        return response;
      })
      .catch(()=>caches.match(event.request))
  );
});
