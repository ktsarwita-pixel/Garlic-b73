"""Run with procedural-sfx's scripts directory on PYTHONPATH from the repo root."""
import numpy as np
from sfxkit import bp, noise, sweep, norm, env_ad, t_, reseed, write_wav
reseed(605)
def save(name, wave):
    wave[-48:] *= np.linspace(1, 0, 48)
    write_wav('assets/sfx/'+name+'.wav', norm(wave)*.78)
noise(.17)  # Preserve the seed sequence of the existing cutscene recordings.
t=t_(.83)
save('rift', (.62*sweep(110,515,.83)+.30*sweep(112,535,.83)+.35*bp(noise(.83),280,1550))*np.sin(np.pi*t/.83)**1.6)
# Air leads; fracture and low body arrive when the blade reaches the sprite.
t=t_(.84); hit=.19
wave=bp(noise(.84),1550,6700)*np.exp(-((t-.115)/.055)**2)*.78
q=t>=hit; tail=t[q]-hit
wave[q]+= .82*np.sin(2*np.pi*(55*tail+4*(1-np.exp(-tail*30))))*np.exp(-tail*7)+.65*bp(noise(.84),460,3800)[q]*np.exp(-tail*28)
save('fatal',wave)
# Original short voiced 'uh': glottal buzz through two descending vowel resonances.
t=t_(.076);phase=2*np.pi*(99*t+.31*(1-np.exp(-t*45)))
voice=np.zeros_like(t)
for h in range(1,24):
    hz=99*h
    weight=.18/h+.42*np.exp(-((hz-(600-185*t/.076))/165)**2)+.17*np.exp(-((hz-1030)/210)**2)
    voice+=weight*np.sin(h*phase+.13*h)
save('murmur',voice*env_ad(.076,.005,.038)*np.minimum(1,(.076-t)/.012))
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
    raw=sweep(780+130*n,138,d)+.4*bp(noise(d),400,3100)
    addr=i.copy();frozen=(t>.034)&(t<.091);size=[149,97,203][n]
    addr[frozen]=int(.031*sr)+(i[frozen]%size)
    back=(t>=.091)&(t<.134);addr[back]=int(.134*sr)-((i[back]-int(.091*sr))%(size*4))
    stride=np.where(t>.14,24+n*5,7+n);samples=raw[(addr//stride)*stride]
    gate=((t<.088)|((t>.097)&(t<.13))|(t>.151))*np.minimum(t/.003,1)*np.minimum((d-t)/.017,1)
    save(name,np.round(np.tanh(samples*1.6)*7)/7*gate)
