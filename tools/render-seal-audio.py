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
