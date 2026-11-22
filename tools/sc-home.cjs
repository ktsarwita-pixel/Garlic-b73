// Screenshot/check loop for the procedurally drawn home and Frisk.
// Requires playwright-core and @sparticuz/chromium. Optionally pass a directory
// to save inspection screenshots; the checks are measurable guards, not an art score.
const http=require('http'),fs=require('fs'),path=require('path'),assert=require('assert');
const {chromium}=require('playwright-core'),bin=require('@sparticuz/chromium'),root=process.cwd();
const server=http.createServer((q,r)=>{const f=path.join(root,new URL(q.url,'http://local').pathname.replace(/^\/$/,'index.html'));try{r.setHeader('Content-Type',f.endsWith('.js')?'text/javascript':f.endsWith('.css')?'text/css':f.endsWith('.html')?'text/html':'application/octet-stream');r.end(fs.readFileSync(f))}catch{r.writeHead(404);r.end()}});
(async()=>{await new Promise(r=>server.listen(0,'127.0.0.1',r));const browser=await chromium.launch({executablePath:await bin.executablePath(),args:bin.args.filter(x=>x!=='--single-process'),headless:true});try{
 const page=await browser.newPage({viewport:{width:1200,height:800}}),errors=[];page.on('pageerror',e=>errors.push(e.message));await page.goto(`http://127.0.0.1:${server.address().port}`);
 const checks=await page.evaluate(()=>{testCommand('home');paused=true;homeAge=2;draw();const checks={};
  checks['home background built']=!!paintedHome;checks['no image asset dependency']=!document.querySelector('img');
  const bg=paintedHome.getContext('2d').getImageData(0,0,1080,672).data;let colors=new Set();for(let i=0;i<bg.length;i+=96)colors.add(`${bg[i]},${bg[i+1]},${bg[i+2]}`);checks['varied room palette']=colors.size>65;
  homeAge=.2;draw();const fireA=g.getImageData(270*3,90*3,45*3,24*3).data;homeAge=.7;draw();const fireB=g.getImageData(270*3,90*3,45*3,24*3).data;
  let fireDiff=0;for(let i=0;i<fireA.length;i+=4)if(fireA[i]!==fireB[i]||fireA[i+1]!==fireB[i+1]||fireA[i+2]!==fireB[i+2])fireDiff++;checks['fire animates']=fireDiff>10;homeAge=2;
  function sprite(facing,walk,motion){homeFacing=facing;homeWalk=walk;homeMotion=motion;draw();return g.getImageData((180-15)*3,(186-42)*3,30*3,45*3).data}
  function diff(a,b){let n=0;for(let i=0;i<a.length;i+=4)if(a[i]!==b[i]||a[i+1]!==b[i+1]||a[i+2]!==b[i+2])n++;return n}
  const front=sprite('down',0,0),back=sprite('up',0,0),left=sprite('left',0,0),right=sprite('right',0,0);
  checks['front/back distinct']=diff(front,back)>100;checks['left/right distinct']=diff(left,right)>100;checks['front/side distinct']=diff(front,left)>100;
  const gaitA=sprite('down',Math.PI/18,1),gaitB=sprite('down',Math.PI/6,1);checks['front stride changes']=diff(gaitA,gaitB)>100;
  checks['side stride changes']=diff(sprite('left',Math.PI/18,1),sprite('left',Math.PI/6,1))>100;
  // Inspect all actual alpha masks, not just two poses: large disconnected
  // islands expose a floating hand, shoe, or detached head in a walk frame.
  function joined(tile){const w=tile.width,h=tile.height,a=tile.getContext('2d').getImageData(0,0,w,h).data,seen=new Uint8Array(w*h);let total=0,max=0;for(let i=0;i<w*h;i++)if(a[4*i+3])total++;for(let i=0;i<w*h;i++){if(seen[i]||!a[4*i+3])continue;let q=[i],n=0;seen[i]=1;while(q.length){const p=q.pop(),xx=p%w,yy=Math.floor(p/w);n++;for(const [dx,dy] of [[1,0],[-1,0],[0,1],[0,-1]]){const nx=xx+dx,ny=yy+dy;if(nx<0||nx>=w||ny<0||ny>=h)continue;const k=nx+ny*w;if(!seen[k]&&a[k*4+3]){seen[k]=1;q.push(k)}}}max=Math.max(max,n)}return max/total}
  checks['side frames connected']=friskSideFrames.every(tile=>joined(tile)>.97);
  checks['front frames connected']=friskFrontFrames.every(tile=>joined(tile)>.97);
  checks['back frames connected']=friskBackFrames.every(tile=>joined(tile)>.97);
  checks['nearest-neighbor sprites']=g.imageSmoothingEnabled===false;
  const masks=friskSideFrames.map(tile=>tile.getContext('2d').getImageData(0,0,tile.width,tile.height).data);
  const grounded=frames=>frames.every(tile=>{const a=tile.getContext('2d').getImageData(0,0,24,42).data;for(let xx=0;xx<24;xx++)if(a[4*(xx+40*24)+3])return true;return false});
  checks['side feet stay grounded']=grounded(friskSideFrames);checks['front/back feet stay grounded']=grounded(friskFrontFrames)&&grounded(friskBackFrames);
  const frameChanges=Array.from({length:8},(_,i)=>diff(masks[i],masks[(i+1)%8]));checks['bounded frame transitions']=Math.max(...frameChanges)<=24*42*.15;
  checks['multiple side poses']=new Set(masks.slice(0,8).map(a=>Array.from(a).join(','))).size>=6;
  let start=x;keys.add('d');for(let i=0;i<30;i++)homeTick(1/60);keys.clear();checks['keyboard movement']=x-start>20;checks['walking stays animated']=homeMotion>.95;
  for(let i=0;i<90;i++)homeTick(1/60);checks['idle settles']=homeMotion<.01;
  drag=true;target=[x-30,y];for(let i=0;i<120;i++)homeTick(1/60);checks['touch target settles']=Math.abs(x-target[0])<3;drag=false;target=null;
  x=345;homeMotion=0;keys.add('d');for(let i=0;i<15;i++)homeTick(1/60);keys.clear();checks['wall does not trigger walking']=homeMotion<.01;
  x=180;y=186;homeAge=2;homeWalk=0;homeMotion=0;homeFacing='down';draw();return checks});
 await page.setViewportSize({width:390,height:844});checks['mobile canvas fits']=await page.evaluate(()=>{const r=c.getBoundingClientRect();return r.left>=-.1&&r.right<=innerWidth+.1&&r.top>=0&&r.bottom<=innerHeight});await page.setViewportSize({width:1200,height:800});
 checks['no browser errors']=errors.length===0;console.table(checks);console.log(`${Object.values(checks).filter(Boolean).length}/${Object.keys(checks).length} functional checks (not a visual-quality score)`);
 if(process.argv[2]){fs.mkdirSync(process.argv[2],{recursive:true});const tiles=await page.evaluate(()=>friskSideFrames.map(c=>c.toDataURL().split(',')[1]));tiles.forEach((img,i)=>fs.writeFileSync(path.join(process.argv[2],`tile-${i}.png`),Buffer.from(img,'base64')));await page.screenshot({path:path.join(process.argv[2],'home.png')});for(const facing of ['down','up','left','right']){await page.evaluate(f=>{homeFacing=f;homeWalk=Math.PI/18;homeMotion=1;draw()},facing);await page.screenshot({path:path.join(process.argv[2],`${facing}.png`)})}}
 assert(Object.values(checks).every(Boolean));
 }finally{await browser.close();server.close()}})().catch(e=>{console.error(e);process.exitCode=1});
