// Pyramid interaction and V3 boot
  function initPyramid(){
    let mode='all';
    const draw=()=>{
      const n=+$('#baseN').value;
      $('#baseNV').textContent=n; $('#pyrV').textContent=n+1; $('#pyrE').textContent=2*n; $('#pyrF').textContent=n+1;
      const cx=280,cy=285,rx=175,ry=66,ap=[280,65],pts=[];
      for(let i=0;i<n;i++){const a=-Math.PI/2+2*Math.PI*i/n;pts.push([cx+rx*Math.cos(a),cy+ry*Math.sin(a)]);}
      const poly=pts.map(p=>p.join(',')).join(' '); let svg='';
      if(mode==='faces'||mode==='all'){
        for(let i=0;i<n;i++){const j=(i+1)%n;svg+=`<polygon points="${ap.join(',')} ${pts[i].join(',')} ${pts[j].join(',')}" fill="${i%2?'#dfeafa':'#f9d98f'}" opacity=".48" stroke="none"/>`;}
        svg+=`<polygon points="${poly}" fill="#eef3fb" opacity=".85"/>`;
      }
      svg+=`<polygon points="${poly}" fill="none" stroke="#173b73" stroke-width="${mode==='edges'?5:3}"/>`;
      for(const p of pts) svg+=`<line x1="${ap[0]}" y1="${ap[1]}" x2="${p[0]}" y2="${p[1]}" stroke="#3568b5" stroke-width="${mode==='edges'?5:2.5}"/>`;
      if(mode==='vertices'||mode==='all'){
        for(const p of pts) svg+=`<circle cx="${p[0]}" cy="${p[1]}" r="7" fill="#e9852d" stroke="#fff" stroke-width="2"/>`;
        svg+=`<circle cx="${ap[0]}" cy="${ap[1]}" r="9" fill="#c74d52" stroke="#fff" stroke-width="2"/>`;
      }
      $('#pyrSvg').innerHTML=svg;
      $('#pyrOut').innerHTML=`Base sides = <strong>${n}</strong><br>Vertices = ${n} + 1 = <strong>${n+1}</strong><br>Edges = ${n} base + ${n} side = <strong>${2*n}</strong><br>Faces = ${n} triangular sides + 1 base = <strong>${n+1}</strong>`;
      $('#pyrWhy').innerHTML='Every base vertex connects to the one apex, so the number of <strong>side edges equals the number of base vertices</strong>. That is why edges = n + n.';
      $$('[data-pyrmode]').forEach(b=>b.classList.toggle('active',b.dataset.pyrmode===mode));
    };
    $('#baseN').oninput=draw;
    $$('[data-pyrmode]').forEach(b=>b.onclick=()=>{mode=b.dataset.pyrmode;draw();});
    draw();
  }

renderSkills();
renderParent();
progress();
