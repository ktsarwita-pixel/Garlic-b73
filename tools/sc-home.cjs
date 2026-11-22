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
  let start=x;keys.add('d');for(let i=0;i<30;i++)homeTick(1/60);keys.clear();checks['keyboard movement']=x-start>20;checks['walking stays animated']=homeMotion>.95;
  for(let i=0;i<90;i++)homeTick(1/60);checks['idle settles']=homeMotion<.01;
  drag=true;target=[x-30,y];for(let i=0;i<120;i++)homeTick(1/60);checks['touch target settles']=Math.abs(x-target[0])<3;drag=false;target=null;
  x=345;homeMotion=0;keys.add('d');for(let i=0;i<15;i++)homeTick(1/60);keys.clear();checks['wall does not trigger walking']=homeMotion<.01;
  x=180;y=186;homeAge=2;homeWalk=0;homeMotion=0;homeFacing='down';draw();return checks});
 await page.setViewportSize({width:390,height:844});checks['mobile canvas fits']=await page.evaluate(()=>{const r=c.getBoundingClientRect();return r.left>=-.1&&r.right<=innerWidth+.1&&r.top>=0&&r.bottom<=innerHeight});await page.setViewportSize({width:1200,height:800});
 checks['no browser errors']=errors.length===0;console.table(checks);console.log(`${Object.values(checks).filter(Boolean).length}/${Object.keys(checks).length} functional checks (not a visual-quality score)`);
 if(process.argv[2]){fs.mkdirSync(process.argv[2],{recursive:true});await page.screenshot({path:path.join(process.argv[2],'home.png')});for(const facing of ['down','up','left','right']){await page.evaluate(f=>{homeFacing=f;homeWalk=Math.PI/18;homeMotion=1;draw()},facing);await page.screenshot({path:path.join(process.argv[2],`${facing}.png`)})}}
 assert(Object.values(checks).every(Boolean));
 }finally{await browser.close();server.close()}})().catch(e=>{console.error(e);process.exitCode=1});
