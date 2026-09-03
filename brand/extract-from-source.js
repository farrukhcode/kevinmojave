const {PNG}=require('pngjs'); const fs=require('fs');
const S='/private/tmp/claude-502/-Users-farrukhbilal-Documents-mojave/75632ce9-a87a-497b-b621-1f7cd268c269/scratchpad/';
const R=JSON.parse(fs.readFileSync(S+'regions.json','utf8'));
const png=PNG.sync.read(fs.readFileSync(S+'clip.png'));
const W=png.width,H=png.height,D=png.data,bg=R.bg;
const at=(x,y)=>{const i=(y*W+x)*4;return [D[i],D[i+1],D[i+2]];};
const dist=c=>Math.max(Math.abs(c[0]-bg[0]),Math.abs(c[1]-bg[1]),Math.abs(c[2]-bg[2]));

// flood fill background
const OUT=new Uint8Array(W*H); const q=[];
const push=(x,y)=>{const i=y*W+x; if(!OUT[i]&&dist(at(x,y))<=26){OUT[i]=1;q.push(i);} };
for(let x=0;x<W;x++){push(x,0);push(x,H-1);} for(let y=0;y<H;y++){push(0,y);push(W-1,y);}
for(let h=0;h<q.length;h++){const i=q[h],x=i%W,y=(i/W)|0;
  if(x>0)push(x-1,y); if(x<W-1)push(x+1,y); if(y>0)push(x,y-1); if(y<H-1)push(x,y+1);}

// alpha: 0 in background; feathered where ink meets background; opaque elsewhere.
const FEATHER=52;
const alpha=new Uint8Array(W*H), col=new Uint8Array(W*H*3);
const touchesBg=(x,y)=>{for(let dy=-1;dy<=1;dy++)for(let dx=-1;dx<=1;dx++){const nx=x+dx,ny=y+dy;
  if(nx<0||ny<0||nx>=W||ny>=H)continue; if(OUT[ny*W+nx])return true;} return false;};
for(let y=0;y<H;y++)for(let x=0;x<W;x++){
  const i=y*W+x, c=at(x,y);
  if(OUT[i]){alpha[i]=0;col[i*3]=c[0];col[i*3+1]=c[1];col[i*3+2]=c[2];continue;}
  let a=255;
  if(touchesBg(x,y)){ const d=dist(c); if(d<FEATHER) a=Math.max(0,Math.min(255,Math.round(d/FEATHER*255))); }
  alpha[i]=a;
  if(a>0&&a<255){ // unpremultiply against the background so edges do not carry a white halo
    const f=a/255; for(let k=0;k<3;k++) col[i*3+k]=Math.max(0,Math.min(255,Math.round((c[k]-bg[k]*(1-f))/f)));
  } else { for(let k=0;k<3;k++) col[i*3+k]=c[k]; }
}
function cut(x0,y0,w,h,pad,file,recolorText,opts){
  opts=opts||{};
  const PW=w+pad*2, PH=h+pad*2; const o=new PNG({width:PW,height:PH});
  for(let y=0;y<PH;y++)for(let x=0;x<PW;x++){
    const sx=x0-pad+x, sy=y0-pad+y, di=(y*PW+x)*4;
    if(sx<0||sy<0||sx>=W||sy>=H){o.data[di+3]=0;continue;}
    const si=sy*W+sx; let r=col[si*3],g=col[si*3+1],b=col[si*3+2],a=alpha[si];
    if(opts.amberOnly && a>0){ // drop the neighbouring letter stroke; keep only the amber mark
      const mx=Math.max(r,g,b), mn=Math.min(r,g,b);
      if(!(mx-mn>34 && r>=g && g>b)) a=0;
    }
    if(recolorText && a>0 && sx>=opts.textFrom){ const mx=Math.max(r,g,b),mn=Math.min(r,g,b);
      if(mx-mn<26){ const lum=Math.round(.299*r+.587*g+.114*b); const nl=Math.max(0,Math.min(255,Math.round(255-lum*0.72)));
        r=g=b=nl; } }
    o.data[di]=r;o.data[di+1]=g;o.data[di+2]=b;o.data[di+3]=a;
  }
  fs.writeFileSync(file,PNG.sync.write(o));
  let op=0; for(let i=3;i<o.data.length;i+=4) if(o.data[i]>0) op++;
  console.log('  '+file.split('/').pop().padEnd(42), PW+'x'+PH, 'opaque '+(100*op/(PW*PH)).toFixed(0)+'%', fs.statSync(file).size+' bytes');
}
const B='/Users/farrukhbilal/Documents/mojave/brand/';
const sh=R.shield, vi=R.virus, ct=R.content;
console.log('cutouts:');
cut(sh.x0,sh.y0,sh.x1-sh.x0+1,sh.y1-sh.y0+1,4,B+'mojave-medical-emblem.png',false);
// virus: pad to a perfect square so rotation stays centred
const vw=vi.x1-vi.x0+1, vh=vi.y1-vi.y0+1, side=Math.max(vw,vh);
cut(vi.x0-Math.round((side-vw)/2), vi.y0-Math.round((side-vh)/2), side, side, 3, B+'mojave-medical-virus-mark.png',false,{amberOnly:true});
cut(ct.firstCol,ct.firstRow,ct.lastCol-ct.firstCol+1,ct.lastRow-ct.firstRow+1,6,B+'mojave-medical-logo-full.png',false);
cut(ct.firstCol,ct.firstRow,ct.lastCol-ct.firstCol+1,ct.lastRow-ct.firstRow+1,6,B+'mojave-medical-logo-full-dark.png',true,{textFrom:R.sep[1]});
