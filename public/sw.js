if(!self.define){let e,s={};const n=(n,a)=>(n=new URL(n+".js",a).href,s[n]||new Promise((s=>{if("document"in self){const e=document.createElement("script");e.src=n,e.onload=s,document.head.appendChild(e)}else e=n,importScripts(n),s()})).then((()=>{let e=s[n];if(!e)throw new Error(`Module ${n} didn’t register its module`);return e})));self.define=(a,c)=>{const i=e||("document"in self?document.currentScript.src:"")||location.href;if(s[i])return;let t={};const r=e=>n(e,i),d={module:{uri:i},exports:t,require:r};s[i]=Promise.all(a.map((e=>d[e]||r(e)))).then((e=>(c(...e),t)))}}define(["./workbox-6316bd60"],(function(e){"use strict";importScripts("fallback-GtbOZAaAkPqSfUfS3cKdI.js"),self.skipWaiting(),e.clientsClaim(),e.precacheAndRoute([{url:"/_next/static/GtbOZAaAkPqSfUfS3cKdI/_buildManifest.js",revision:"df62eaeb2d5240038d248a8475ea3848"},{url:"/_next/static/GtbOZAaAkPqSfUfS3cKdI/_middlewareManifest.js",revision:"fb2823d66b3e778e04a3f681d0d2fb19"},{url:"/_next/static/GtbOZAaAkPqSfUfS3cKdI/_ssgManifest.js",revision:"b6652df95db52feb4daf4eca35380933"},{url:"/_next/static/chunks/185-3f538c813107fc45.js",revision:"3f538c813107fc45"},{url:"/_next/static/chunks/239-80ed4c7202bc54dd.js",revision:"80ed4c7202bc54dd"},{url:"/_next/static/chunks/856-4c5f4915aa9e7fcd.js",revision:"4c5f4915aa9e7fcd"},{url:"/_next/static/chunks/933-35d53cafbbdcb3ee.js",revision:"35d53cafbbdcb3ee"},{url:"/_next/static/chunks/988-48b55eebb161e8d8.js",revision:"48b55eebb161e8d8"},{url:"/_next/static/chunks/framework-a87821de553db91d.js",revision:"a87821de553db91d"},{url:"/_next/static/chunks/main-5a4fee49fa299078.js",revision:"5a4fee49fa299078"},{url:"/_next/static/chunks/pages/404-3750564cd87eee2d.js",revision:"3750564cd87eee2d"},{url:"/_next/static/chunks/pages/_app-5db34d2353ae96f3.js",revision:"5db34d2353ae96f3"},{url:"/_next/static/chunks/pages/_error-1995526792b513b2.js",revision:"1995526792b513b2"},{url:"/_next/static/chunks/pages/_offline-473bb2d090f89828.js",revision:"473bb2d090f89828"},{url:"/_next/static/chunks/pages/account-041fd1601b2caebd.js",revision:"041fd1601b2caebd"},{url:"/_next/static/chunks/pages/campaign/%5Bid%5D-b40eccf6e6ff72b9.js",revision:"b40eccf6e6ff72b9"},{url:"/_next/static/chunks/pages/create-campaign-d887f9820d7c3729.js",revision:"d887f9820d7c3729"},{url:"/_next/static/chunks/pages/faq-6e2623e6f6337917.js",revision:"6e2623e6f6337917"},{url:"/_next/static/chunks/pages/index-123c3f185d725ee1.js",revision:"123c3f185d725ee1"},{url:"/_next/static/chunks/pages/privacy-313dc60170cead85.js",revision:"313dc60170cead85"},{url:"/_next/static/chunks/pages/sign-in-4c65567a6aac23d1.js",revision:"4c65567a6aac23d1"},{url:"/_next/static/chunks/pages/terms-c98b6b36cfe6da19.js",revision:"c98b6b36cfe6da19"},{url:"/_next/static/chunks/pages/why-9847fe219273da51.js",revision:"9847fe219273da51"},{url:"/_next/static/chunks/polyfills-5cd94c89d3acac5f.js",revision:"99442aec5788bccac9b2f0ead2afdd6b"},{url:"/_next/static/chunks/webpack-5752944655d749a0.js",revision:"5752944655d749a0"},{url:"/_next/static/css/46421a0a30ad969c.css",revision:"46421a0a30ad969c"},{url:"/_offline",revision:"GtbOZAaAkPqSfUfS3cKdI"},{url:"/favicon.ico",revision:"24ca946be43c24356cb8b4275f6b190a"},{url:"/images/apple-touch-icon.png",revision:"84dbb8cdcc1b038c00e6d3289e0a7232"},{url:"/images/icon-192x192.png",revision:"711e9598fae91d0ce93a0c739bce42ba"},{url:"/images/icon-256x256.png",revision:"b861d0edc41dcbc353489fc2972547fe"},{url:"/images/icon-384x384.png",revision:"fe0822b14e585dd15d6a7ef2fdae3271"},{url:"/images/icon-512x512.png",revision:"0ba84a159249b5474e1b3458d27716d0"},{url:"/images/icon-96x96.png",revision:"6e413dd42f4e110c7b5cfebcd9fe0584"},{url:"/images/icon.svg",revision:"03f4813686576af1a9183e1802e9a9f0"},{url:"/manifest.json",revision:"6df50c466b37b1a4466baf53306f69ec"}],{ignoreURLParametersMatching:[]}),e.cleanupOutdatedCaches(),e.registerRoute("/",new e.NetworkFirst({cacheName:"start-url",plugins:[{cacheWillUpdate:async({request:e,response:s,event:n,state:a})=>s&&"opaqueredirect"===s.type?new Response(s.body,{status:200,statusText:"OK",headers:s.headers}):s},{handlerDidError:async({request:e})=>self.fallback(e)}]}),"GET"),e.registerRoute(/^https:\/\/fonts\.(?:gstatic)\.com\/.*/i,new e.CacheFirst({cacheName:"google-fonts-webfonts",plugins:[new e.ExpirationPlugin({maxEntries:4,maxAgeSeconds:31536e3}),{handlerDidError:async({request:e})=>self.fallback(e)}]}),"GET"),e.registerRoute(/^https:\/\/fonts\.(?:googleapis)\.com\/.*/i,new e.StaleWhileRevalidate({cacheName:"google-fonts-stylesheets",plugins:[new e.ExpirationPlugin({maxEntries:4,maxAgeSeconds:604800}),{handlerDidError:async({request:e})=>self.fallback(e)}]}),"GET"),e.registerRoute(/\.(?:eot|otf|ttc|ttf|woff|woff2|font.css)$/i,new e.StaleWhileRevalidate({cacheName:"static-font-assets",plugins:[new e.ExpirationPlugin({maxEntries:4,maxAgeSeconds:604800}),{handlerDidError:async({request:e})=>self.fallback(e)}]}),"GET"),e.registerRoute(/\.(?:jpg|jpeg|gif|png|svg|ico|webp)$/i,new e.StaleWhileRevalidate({cacheName:"static-image-assets",plugins:[new e.ExpirationPlugin({maxEntries:64,maxAgeSeconds:86400}),{handlerDidError:async({request:e})=>self.fallback(e)}]}),"GET"),e.registerRoute(/\/_next\/image\?url=.+$/i,new e.StaleWhileRevalidate({cacheName:"next-image",plugins:[new e.ExpirationPlugin({maxEntries:64,maxAgeSeconds:86400}),{handlerDidError:async({request:e})=>self.fallback(e)}]}),"GET"),e.registerRoute(/\.(?:mp3|wav|ogg)$/i,new e.CacheFirst({cacheName:"static-audio-assets",plugins:[new e.RangeRequestsPlugin,new e.ExpirationPlugin({maxEntries:32,maxAgeSeconds:86400}),{handlerDidError:async({request:e})=>self.fallback(e)}]}),"GET"),e.registerRoute(/\.(?:mp4)$/i,new e.CacheFirst({cacheName:"static-video-assets",plugins:[new e.RangeRequestsPlugin,new e.ExpirationPlugin({maxEntries:32,maxAgeSeconds:86400}),{handlerDidError:async({request:e})=>self.fallback(e)}]}),"GET"),e.registerRoute(/\.(?:js)$/i,new e.StaleWhileRevalidate({cacheName:"static-js-assets",plugins:[new e.ExpirationPlugin({maxEntries:32,maxAgeSeconds:86400}),{handlerDidError:async({request:e})=>self.fallback(e)}]}),"GET"),e.registerRoute(/\.(?:css|less)$/i,new e.StaleWhileRevalidate({cacheName:"static-style-assets",plugins:[new e.ExpirationPlugin({maxEntries:32,maxAgeSeconds:86400}),{handlerDidError:async({request:e})=>self.fallback(e)}]}),"GET"),e.registerRoute(/\/_next\/data\/.+\/.+\.json$/i,new e.StaleWhileRevalidate({cacheName:"next-data",plugins:[new e.ExpirationPlugin({maxEntries:32,maxAgeSeconds:86400}),{handlerDidError:async({request:e})=>self.fallback(e)}]}),"GET"),e.registerRoute(/\.(?:json|xml|csv)$/i,new e.NetworkFirst({cacheName:"static-data-assets",plugins:[new e.ExpirationPlugin({maxEntries:32,maxAgeSeconds:86400}),{handlerDidError:async({request:e})=>self.fallback(e)}]}),"GET"),e.registerRoute((({url:e})=>{if(!(self.origin===e.origin))return!1;const s=e.pathname;return!s.startsWith("/api/auth/")&&!!s.startsWith("/api/")}),new e.NetworkFirst({cacheName:"apis",networkTimeoutSeconds:10,plugins:[new e.ExpirationPlugin({maxEntries:16,maxAgeSeconds:86400}),{handlerDidError:async({request:e})=>self.fallback(e)}]}),"GET"),e.registerRoute((({url:e})=>{if(!(self.origin===e.origin))return!1;return!e.pathname.startsWith("/api/")}),new e.NetworkFirst({cacheName:"others",networkTimeoutSeconds:10,plugins:[new e.ExpirationPlugin({maxEntries:32,maxAgeSeconds:86400}),{handlerDidError:async({request:e})=>self.fallback(e)}]}),"GET"),e.registerRoute((({url:e})=>!(self.origin===e.origin)),new e.NetworkFirst({cacheName:"cross-origin",networkTimeoutSeconds:10,plugins:[new e.ExpirationPlugin({maxEntries:32,maxAgeSeconds:3600}),{handlerDidError:async({request:e})=>self.fallback(e)}]}),"GET")}));