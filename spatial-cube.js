// Cube projection interaction
  function initCubeViews(){
    const presets={
      a:[2,0,1,0, 1,3,2,0, 0,1,4,2, 0,0,1,1],
      b:[0,2,0,1, 3,1,0,2, 1,4,2,0, 2,0,1,3]
    };
    let heights=[...presets.a],view='top',rotation=0,revealed=false;
    const h=(x,y)=>heights[y*4+x];

    const profile=()=>{
      if(view==='top') return null;
      if(view==='front') return [0,1,2,3].map(x=>Math.max(...[0,1,2,3].map(y=>h(x,y))));
      if(view==='right') return [3,2,1,0].map(y=>Math.max(...[0,1,2,3].map(x=>h(x,y))));
      return [0,1,2,3].map(y=>Math.max(...[0,1,2,3].map(x=>h(x,y))));
    };
    const countVisible=()=>view==='top'?heights.filter(v=>v>0).length:profile().reduce((a,b)=>a+b,0);

    const winners=()=>{
      const set=new Set();
      if(view==='top') { heights.forEach((v,i)=>{if(v>0)set.add(i)}); return set; }
      if(view==='front'){
        for(let x=0;x<4;x++){
          const m=Math.max(...[0,1,2,3].map(y=>h(x,y)));
          for(let y=0;y<4;y++) if(h(x,y)===m && m>0) set.add(y*4+x);
        }
      } else {
        for(let y=0;y<4;y++){
          const m=Math.max(...[0,1,2,3].map(x=>h(x,y)));
          for(let x=0;x<4;x++) if(h(x,y)===m && m>0) set.add(y*4+x);
        }
      }
      return set;
    };

    const rotatePoint=(x,y)=>rotation===0?[x,y]:rotation===1?[3-y,x]:rotation===2?[3-x,3-y]:[y,3-x];
    const cubePolys=(x,y,z)=>{
      const [rx,ry]=rotatePoint(x,y),dx=43,dy=23,dz=46,ox=310,oy=292;
      const cx=ox+(rx-ry)*dx,ty=oy+(rx+ry)*dy-(z+1)*dz;
      const p1=[cx,ty-dy],p2=[cx+dx,ty],p3=[cx,ty+dy],p4=[cx-dx,ty];
      const q2=[p2[0],p2[1]+dz],q3=[p3[0],p3[1]+dz],q4=[p4[0],p4[1]+dz];
      const pts=a=>a.map(p=>p.join(',')).join(' ');
      return `<polygon points="${pts([p1,p2,p3,p4])}" fill="#f7c65a" stroke="#9b6b19" stroke-width="1.5"/><polygon points="${pts([p4,p3,q3,q4])}" fill="#dbe8fb" stroke="#6f89ad" stroke-width="1.5"/><polygon points="${pts([p2,p3,q3,q2])}" fill="#aac2e4" stroke="#5f789b" stroke-width="1.5"/>`;
    };

    const renderIso=()=>{
      const cubes=[];
      for(let y=0;y<4;y++) for(let x=0;x<4;x++) for(let z=0;z<h(x,y);z++){
        const [rx,ry]=rotatePoint(x,y); cubes.push({x,y,z,d:rx+ry});
      }
      cubes.sort((a,b)=>a.d-b.d||a.z-b.z);
      let svg='<rect x="0" y="0" width="620" height="430" fill="transparent"/>';
      for(const cube of cubes) svg+=cubePolys(cube.x,cube.y,cube.z);
      const label=view.toUpperCase();
      const ax=view==='right'?565:view==='left'?55:310, ay=view==='top'?35:400;
      svg+=`<text x="${ax}" y="${ay}" text-anchor="middle" font-size="20" font-weight="800" fill="#173b73">VIEW: ${label}</text>`;
      $('#cubeIsoSvg').innerHTML=svg;
      $('#observerNote').textContent=`Selected TIMO viewpoint: ${label}. Rotate the model only to inspect the object; the selected projection remains ${label}.`;
    };

    const renderEdit=()=>{
      const win=winners();
      $('#cubeEditGrid').innerHTML=heights.map((v,i)=>`<button class="height-cell ${v===0?'zero':''} ${win.has(i)?'sightwinner':'sighthidden'}" data-i="${i}" aria-label="Stack height ${v}">${v}</button>`).join('');
      $$('#cubeEditGrid .height-cell').forEach(b=>b.onclick=()=>{const i=+b.dataset.i;heights[i]=(heights[i]+1)%5;revealed=false;$('#cubePredict').value='';renderAll()});
      const total=heights.reduce((a,b)=>a+b,0);
      $('#cubeTotals').innerHTML=`Total cubes in the 3D object: <strong>${total}</strong>.<br><span class="muted">That total is usually not the answer to a side-view question.</span>`;
    };

    const renderProjection=()=>{
      const grid=$('#projectionGrid');
      if(!revealed){grid.innerHTML='<div class="muted" style="padding:20px">Projection hidden.<br>Imagine the cubes flattening toward the observer.</div>';grid.style.gridTemplateColumns='1fr';$('#projectionResult').textContent='Projection hidden - predict first.';return;}
      const cells=[];
      if(view==='top'){
        for(let y=0;y<4;y++) for(let x=0;x<4;x++) cells.push(h(x,y)>0);
      } else {
        const p=profile();
        for(let r=4;r>=1;r--) for(let col=0;col<4;col++) cells.push(p[col]>=r);
      }
      grid.style.gridTemplateColumns='repeat(4,42px)';
      grid.innerHTML=cells.map(on=>`<div class="proj-cell ${on?'on':''}"></div>`).join('');
      const ans=countVisible(),raw=$('#cubePredict').value,pred=Number(raw);
      const compare=raw===''?'':pred===ans?' <span class="goodmsg">Correct prediction.</span>':` <span class="badmsg">Your prediction was ${pred}; compare the sight lines again.</span>`;
      $('#projectionResult').innerHTML=`Visible squares from the <strong>${view}</strong> view = <strong>${ans}</strong>.${compare}`;
    };

    const renderRule=()=>{
      const rule=view==='top'?'Top view: each occupied floor position becomes exactly one visible square.':'Side/front view: for each line of sight, keep only the tallest outline; stacks behind it overlap.';
      $('#cubeViewRule').innerHTML=`<strong>${rule}</strong><br><span class="muted">Gold-outlined stacks in the builder set the silhouette for this viewpoint.</span>`;
    };
    const renderAll=()=>{renderEdit();renderIso();renderRule();renderProjection();$$('[data-cubeview]').forEach(b=>b.classList.toggle('active',b.dataset.cubeview===view));};

    $$('[data-cubeview]').forEach(b=>b.onclick=()=>{view=b.dataset.cubeview;revealed=false;$('#cubePredict').value='';renderAll();});
    $('#rotLeft').onclick=()=>{rotation=(rotation+3)%4;renderIso();};
    $('#rotRight').onclick=()=>{rotation=(rotation+1)%4;renderIso();};
    $('#cubePresetA').onclick=()=>{heights=[...presets.a];revealed=false;$('#cubePredict').value='';renderAll();};
    $('#cubePresetB').onclick=()=>{heights=[...presets.b];revealed=false;$('#cubePredict').value='';renderAll();};
    $('#cubeClear').onclick=()=>{heights=Array(16).fill(0);revealed=false;$('#cubePredict').value='';renderAll();};
    $('#revealProjection').onclick=()=>{revealed=true;renderProjection();};
    renderAll();
  }
