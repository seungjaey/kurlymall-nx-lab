import axios from 'axios';
import ProgressBar from 'progress';
import {pipe, map, toArray, toAsync, split, tap, size, filter} from '@fxts/core';

const str = `public/favicon.ico
public/images/icons/favicon-16x16.png
public/images/icons/icon-192x192.png
public/images/icons/icon-120x120.png
public/images/icons/icon-256x256.png
public/images/icons/icon-180x180.png
public/images/icons/icon-152x152.png
public/images/icons/icon-512x512.png
public/images/icons/icon-144x144.png
public/images/icons/icon-167x167.png
public/images/icons/favicon-32x32.png
public/naverb10f4ad209f76e972ecdbe296e3dba5f.html
public/naver54874ec5cad135aadc7d71e2fa0ebbc2.html
public/sitemap/market_908.xml
public/sitemap/market_075.xml
public/sitemap/market_909.xml
public/sitemap/market_316.xml
public/sitemap/market_249.xml
public/sitemap/market_315.xml
public/sitemap/beauty_307.xml
public/sitemap/market_919.xml
public/sitemap/market_918.xml
public/sitemap/market_228.xml
public/sitemap/beauty_362.xml
public/sitemap/beauty_363.xml
public/sitemap/beauty_375.xml
public/sitemap/others.xml
public/sitemap/beauty_361.xml
public/sitemap/market_001.xml
public/sitemap/market_772.xml
public/sitemap/beauty_360.xml
public/sitemap/market_955.xml
public/sitemap/market_206.xml
public/sitemap/beauty_370.xml
public/sitemap/beauty_364.xml
public/sitemap/beauty_365.xml
public/sitemap/beauty_167.xml
public/sitemap/market_007.xml
public/sitemap/market_991.xml
public/sitemap/beauty_367.xml
public/sitemap/market_990.xml
public/sitemap/market_012.xml
public/sitemap/beauty_170.xml
public/sitemap/index-sitemap.xml
public/sitemap/beauty_168.xml
public/sitemap/market_183.xml
public/sitemap/beauty_354.xml
public/sitemap/beauty_368.xml
public/sitemap/beauty_369.xml
public/sitemap/market_948.xml
public/sitemap/market_233.xml
public/sitemap/market_032.xml
public/sitemap/beauty_353.xml
public/sitemap/market_915.xml
public/sitemap/market_068.xml
public/sitemap/market_726.xml
public/sitemap/market_914.xml
public/sitemap/market_525.xml
public/sitemap/market_916.xml
public/sitemap/market_724.xml
public/sitemap/market_085.xml
public/sitemap/market_907.xml
public/sitemap/market_913.xml
public/sitemap/market_912.xml
public/sitemap/market_251.xml
public/sitemap/market_127.xml
public/sitemap/market_910.xml
public/sitemap/market_722.xml
public/sitemap/market_911.xml
public/naver52c3ccdaccb6018a641b69553e178f8c.html
public/manifest.json
public/naverac8d939c0fc2cf3ebb546bef1413d294.html
public/naverfdf766053b4a08b3174b3895e55fbbf7.html
public/service-worker.js
public/robots.txt
public/naveraa806d568520582afc42d9e78ca54e39.html`;

const DATA = pipe(
  split('\n', str),
  map(path => path.replace('public', '')),
  toArray,
);

async function run(data: string[]) {
  const totalSize = size(data);
  const progressBar = new ProgressBar('Processing [:bar] :percent :current/:total', {
    width: 20,
    total: totalSize,
  })
  const result = await pipe(
    data,
    toAsync,
    map(async path => {
      progressBar.tick()
      try {
        const {status} = await axios.get(`http://localhost${path}`, {
          headers: {
            'user-agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 13_2_3 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/13.0.3 Mobile/15E148 Safari/604.1',
          },
        });
        return [path, status];
      } catch (error) {
        return [path, 'fail'];
      }
    }),
    toArray,
  )

  const failed = pipe(
    result,
    filter(args => {
      const [_, status] = args;
      return status !== 200;
    }),
    toArray,
  )
  console.log(`total ${totalSize} : failed = ${size(failed)}`);
  return result;
}

run(DATA);