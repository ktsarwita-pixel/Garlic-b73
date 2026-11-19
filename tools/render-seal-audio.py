"""Run with procedural-sfx's scripts directory on PYTHONPATH from the repo root."""
import numpy as np
from sfxkit import bp, noise, sweep, norm, env_ad, t_, reseed, write_wav
reseed(605)
def save(name, wave):
    wave[-48:] *= np.linspace(1, 0, 48)
    write_wav('assets/sfx/'+name+'.wav', norm(wave)*.78)
# Three irregular dropouts, like a damaged contact rather than a repeating alarm.
t=t_(.17)
save('seam', (bp(noise(.17),900,3400)+.26*np.sign(sweep(780,310,.17)))*env_ad(.17,.003,.07)*((t<.032)|((t>.063)&(t<.082))|(t>.128)))
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
# Growing fracture chains: bright ceramic splinters vs detuned violet resonance.
for violet,total in [(False,4),(True,5)]:
    for stage in range(1,total+1):
        d=.29+.048*stage;t=t_(d);wave=np.zeros_like(t)
        for k in range(stage+1):
            start=.027*k+.004*(k%2);q=np.maximum(0,t-start);freq=(1630 if not violet else 780)*(1+.21*k)/(1+.07*stage)
            grain=bp(noise(d),800,6400)*np.exp(-q*220)
            ring=np.sin(2*np.pi*freq*q+.65*np.sin(2*np.pi*freq*.49*q))*np.exp(-q*(27 if not violet else 17))
            wave+=(grain+.48*ring)*np.minimum(q/.0018,1)/(1+.27*k)
        save(('violet' if violet else 'white')+str(stage),wave)
