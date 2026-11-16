/* hostile-map test: force water/maze tiles and make sure pathing + AI still function */
const fs=require('fs'),path=require('path'),vm=require('vm');
const sandbox={window:{},console,Math,Date,performance:{now:()=>Date.now()}};const ctx=vm.createContext(sandbox);
for(const f of ['lib.js','data.js','sprite.js','map.js','game.js']) vm.runInContext(fs.readFileSync(path.join(__dirname,'..','js',f),'utf8'),ctx,{filename:f});
const RTS=sandbox.window.RTS;
const U=RTS.util;
let failures=0;
for (const seed of [1,2,3,77,12345,99999]) {
  const g=new RTS.Game({seed,difficulty:'veteran',mission:'skirmish',playerFaction:'ashden'?'ashen':'everglen',enemyFaction:'mirefen'});
  // count walkable reachable area from both bases
  const reach=(sx,sy)=>{const seen=new Uint8Array(g.MW*g.MH);const q=[[Math.floor(sx/16),Math.floor(sy/16)]];seen[q[0][1]*g.MW+q[0][0]]=1;let n=0;
    while(q.length){const [x,y]=q.pop();n++;for(const [dx,dy] of [[1,0],[-1,0],[0,1],[0,-1]]){const nx=x+dx,ny=y+dy;if(nx<0||ny<0||nx>=g.MW||ny>=g.MH)continue;const i=ny*g.MW+nx;if(seen[i]||g.blockedTile(nx,ny))continue;seen[i]=1;q.push([nx,ny]);}}
    return {n,seen};};
  const a=reach(g.map.startP1.x,g.map.startP1.y);
  const b=reach(g.map.startP2.x,g.map.startP2.y);
  const connected = a.seen[Math.floor(g.map.startP2.y/16)*g.MW+Math.floor(g.map.startP2.x/16)]===1;
  // path between bases
  const keepA=g.buildings.find(x=>x.owner===0&&x.type==='keep');
  const keepB=g.buildings.find(x=>x.owner===1&&x.type==='keep');
  let paths=0;
  for(let i=0;i<40;i++){
    const u=g.units.filter(x=>x.owner===0&&x.type==='worker')[0];
    const p=g.findPath(u.x,u.y,g.map.startP2.x+(i%5-2)*20,g.map.startP2.y+(i%7-3)*20);
    if(p) paths++;
  }
  // run sim
  const dt=1/30;
  for(let i=0;i<Math.round(240/dt);i++) g.update(dt);
  const eWorkers=g.units.filter(u=>u.owner===1&&u.type==='worker');
  const gathering=eWorkers.filter(u=>u.carry>0||u.gatherState==='harvest'||u.gatherState==='return').length;
  const enemyBuildings=g.buildings.filter(b=>b.owner===1).length;
  const playerAlive=g.buildings.filter(b=>b.owner===0).length;
  const ok = connected && paths>30 && enemyBuildings>=2 && playerAlive>=1;
  if(!ok) failures++;
  console.log(`seed=${seed} connected=${connected} paths=${paths}/40 reachable=${a.n}/${b.n} | after240s enemyBuildings=${enemyBuildings} gathering=${gathering}/${eWorkers.length} playerBuildings=${playerAlive} -> ${ok?'OK':'FAIL'}`);
}
console.log(failures? failures+' FAILURES':'all maps OK');
process.exit(failures?1:0);
