const C="reportes-1.0.0";
const REQ=["./","index.html"],OPT=["manifest.webmanifest","icon-192.png","icon-512.png"];
self.addEventListener("install",e=>{e.waitUntil((async()=>{
  const c=await caches.open(C);
  for(const f of REQ){const r=await fetch(f,{cache:"reload"});if(!r.ok)throw new Error("no se pudo bajar "+f);await c.put(f,r)}
  for(const f of OPT){try{const r=await fetch(f,{cache:"reload"});if(r.ok)await c.put(f,r)}catch(x){}}
  self.skipWaiting()})())});
self.addEventListener("activate",e=>{e.waitUntil((async()=>{
  for(const k of await caches.keys())if(k!==C)await caches.delete(k);
  await self.clients.claim()})())});
self.addEventListener("fetch",e=>{
  const rq=e.request;if(rq.method!=="GET")return;
  const same=new URL(rq.url).origin===self.location.origin;
  e.respondWith((async()=>{
    const c=await caches.open(C);
    if(same){
      /* con internet: siempre lo más nuevo. Sin internet: la copia guardada */
      try{const r=await fetch(rq.url,{cache:"no-cache"});if(r&&r.ok)c.put(rq.url,r.clone());return r}
      catch(x){
        const m=await c.match(rq.url,{ignoreSearch:true});if(m)return m;
        if(rq.mode==="navigate"){const i=await c.match("index.html");if(i)return i}
        throw x}
    }
    const m=await c.match(rq);if(m)return m;
    const r=await fetch(rq);if(r&&(r.ok||r.type==="opaque"))c.put(rq,r.clone());return r;
  })())});
