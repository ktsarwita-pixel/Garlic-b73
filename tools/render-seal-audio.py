"""Run with procedural-sfx's scripts directory on PYTHONPATH from the repo root."""
import numpy as np
from sfxkit import bp, noise, sweep, norm, env_ad, t_, reseed, write_wav
reseed(605)
def save(name, wave):
    wave[-48:] *= np.linspace(1, 0, 48)
    write_wav('assets/sfx/'+name+'.wav', norm(wave)*.78)
noise(.17)  # Preserve the seed sequence of the existing cutscene recordings.
noise(.83)  # Keep later combat assets deterministic.
# Air leads; fracture and low body arrive when the blade reaches the sprite.
t=t_(.84); hit=.19
wave=bp(noise(.84),1550,6700)*np.exp(-((t-.115)/.055)**2)*.78
q=t>=hit; tail=t[q]-hit
wave[q]+= .82*np.sin(2*np.pi*(55*tail+4*(1-np.exp(-tail*30))))*np.exp(-tail*7)+.65*bp(noise(.84),460,3800)[q]*np.exp(-tail*28)
save('fatal',wave)
# Three mouth shapes share one low, slightly creaky source; no sampled speech.
for name,f1,f2,d in [('murmur',550,1060,.084),('murmur-open',715,1260,.09),('murmur-round',420,890,.082)]:
    t=t_(d);phase=2*np.pi*(94*t+.18*(1-np.exp(-t*56)))
    voice=np.zeros_like(t)
    for h in range(1,28):
        hz=96*h
        weight=.45/h+.35*np.exp(-((hz-f1*(1-.17*t/d))/145)**2)+.14*np.exp(-((hz-f2)/200)**2)
        voice+=weight*np.sin(h*phase+.15*h)
    save(name,(voice+.13*np.sin(phase*.5))*env_ad(d,.005,.049)*np.minimum(1,(d-t)/.015))
# The slash crosses the center of the drawn heart at ~0.225s. Wind, edge, contact, shards.
for violet,total in [(False,4),(True,5)]:
    for stage in range(1,total+1):
        hit=.22; d=.57+.035*stage; t=t_(d); q=np.maximum(0,t-hit)
        wind=bp(noise(d),620,2250)*np.exp(-((t-.155)/.066)**2)
        edge=sweep(2900,430,d,.53)*np.exp(-((t-.197)/.046)**2)
        body=np.sin(2*np.pi*(q*(99 if violet else 145)+2*(1-np.exp(-q*50))))
        wave=.48*wind+.34*edge+np.minimum(q/.001,1)*(.84*body*np.exp(-q*32)+bp(noise(d),1600,6600)*np.exp(-q*100))
        for k in range(stage+1):
            u=np.maximum(0,q-.018-.023*k); f=(720 if violet else 1680)*(1+.16*k)/(1+.06*stage)
            wave+=.37*np.minimum(u/.001,1)*np.sin(2*np.pi*f*u+.45*np.sin(2*np.pi*f*.57*u))*np.exp(-u*(24 if violet else 39))/(1+.25*k)
        save(('violet' if violet else 'white')+str(stage),wave)

# Broken sample reader: repeat a tiny PCM fragment, read it backwards, then lose clock.
for n,name in enumerate(['seam','seam-slip','seam-freeze']):
    d=.204;t=t_(d);i=np.arange(t.size);sr=round(i.size/d)
    raw=sweep(240+32*n,118,d)+.23*bp(noise(d),240,1050)
    addr=i.copy();frozen=(t>.034)&(t<.091);size=[149,97,203][n]
    addr[frozen]=int(.031*sr)+(i[frozen]%size)
    back=(t>=.091)&(t<.134);addr[back]=int(.134*sr)-((i[back]-int(.091*sr))%(size*4))
    stride=np.where(t>.14,24+n*5,7+n);samples=raw[(addr//stride)*stride]
    gate=((t<.088)|((t>.097)&(t<.13))|(t>.151))*np.minimum(t/.003,1)*np.minimum((d-t)/.017,1)
    # Round the discontinuities; let the broken playback rhythm carry the glitch.
    smooth=np.hanning(101);smooth/=smooth.sum()
    save(name,np.convolve(samples*gate,smooth,mode="same")*np.exp(-t*10))

# Split stone: latch gives way, slabs drag, then settle into the recess.
reseed(194)
d=.91;t=t_(d);grit=bp(noise(d),170,1100); travel=np.sin(np.pi*t/d)**1.35
slip=.68+.32*np.cos(2*np.pi*(11*t-3*t*t))
wave=travel*slip*(.45*grit+.20*sweep(143,72,d))
for at,strength in [(0,.6),(.045,.25),(.73,.32)]:
    u=np.maximum(0,t-at);wave+=strength*np.minimum(u/.003,1)*np.exp(-u*32)*np.sin(2*np.pi*(120*u+.27*(1-np.exp(-u*70))))
save('seal-open',wave)
# Soul crossing: inward breath, two short signal skips, then a hollow trailing note.
d=1.17;t=t_(d);pull=np.sin(np.pi*np.minimum(t/.83,1))**1.7
skip=1-.54*np.exp(-((t-.58)/.016)**2)-.72*np.exp(-((t-.665)/.013)**2)
wave=pull*skip*(.46*bp(noise(d),320,2200)+.28*sweep(173,740,d,1.8))
u=np.maximum(0,t-.74);wave+=np.minimum(u/.025,1)*np.exp(-u*8)*(.24*np.sin(2*np.pi*294*u)+.14*np.sin(2*np.pi*439*u))
save('rift',wave)
