// TIMO P2 Foundation Lab V3 spatial-learning extension.
// Adds dedicated cube-projection and pyramid-structure skills without external libraries.
(function(){
  const oldIndex = skills.findIndex(s => s.id === 'view3d');
  if (oldIndex < 0) return;

  const cubeSkill = {
    id:'cubeviews', n:15, group:'Systematic geometry', title:'Cube views & 3D projection', freq:'Repeated strongly',
    subtitle:'Turn an irregular cube structure into its top, front, right or left 2D view.',
    engine:'3D structure -> line of sight -> 2D silhouette',
    learn:`<h3>A view is a projection, not a count of all cubes</h3>
      <div class="rule"><strong>Core idea:</strong> cubes that sit behind one another can overlap from a chosen viewpoint. For each line of sight, the visible silhouette is set by the highest stack along that line.</div>
      <p><strong>Top view:</strong> every occupied floor position becomes one square. <strong>Front / right / left:</strong> compare stacks that lie behind one another and keep the tallest outline.</p>
      <div class="trap"><strong>Common trap:</strong> adding every stack height even when several stacks are directly behind each other.</div>
      <div class="zh">三維積木轉成二維視圖時，同一直線上前後重疊的積木會遮住。俯視看位置有沒有積木；正面／側面要看每條視線上的最高高度。</div>`,
    widget:'cubeviews',
    stories:[['Cube','Three stacks stand behind one another; only the tallest outline matters from the front.'],['Top','From above, height does not matter: occupied positions become squares.'],['Right','From the right, group stacks along right-to-left sight lines.']],
    prompt:'Why can adding more cubes behind a taller stack fail to increase the number of visible squares from that side?'
  };

  const pyramidSkill = {
    id:'pyramid', n:16, group:'Systematic geometry', title:'Pyramid structure: vertices, edges & faces', freq:'Repeated strongly',
    subtitle:'Build the relationships from the base instead of memorising isolated formulas.',
    engine:'n-sided base + one apex -> linked counts',
    learn:`<h3>Start from the base</h3>
      <div class="rule">If the base has <strong>n sides</strong>, it also has n base vertices. Add one apex: vertices = n+1. Each base vertex connects to the apex, so there are n base edges + n side edges = 2n edges. Faces = n triangular side faces + one base = n+1.</div>
      <p>The useful idea is the <strong>structure</strong>: the base controls all three counts.</p>
      <div class="zh">底面有 n 條邊，就有 n 個底面頂點；再加一個尖頂。底邊有 n 條，連去尖頂亦有 n 條，所以棱共有 2n；面共有 n 個側面加 1 個底面。</div>`,
    widget:'pyramid',
    stories:[['Base','A 6-sided base has 6 base vertices plus one apex.'],['Edges','Every base vertex creates one side edge to the apex.'],['Faces','Each base side creates one triangular side face.']],
    prompt:'Why does an n-sided pyramid always have exactly n side edges leading to the apex?'
  };

  skills.splice(oldIndex, 1, cubeSkill, pyramidSkill);
  const optimise = skills.find(s => s.id === 'optimise');
  if (optimise) optimise.n = 17;

  const geomRow = parentRows.findIndex(r => r[1] === 'Systematic geometry');
  if (geomRow >= 0) parentRows[geomRow] = ['14-16','Systematic geometry','Line segments, rectangles, polygon corners, cube projections, pyramids','Very high','Geometry repeats strongly across years; cube projection and pyramid structure are taught separately'];
  const optRow = parentRows.findIndex(r => r[1] === 'Counting & optimisation');
  if (optRow >= 0) parentRows[optRow][0] = '17';

  const originalWidgetHTML = widgetHTML;
  widgetHTML = function(w){
    if(w === 'cubeviews') return `<h3>Build it -> choose a viewpoint -> predict -> reveal</h3>
      <p class="muted">Tap a floor cell to change its stack height. The 3D model updates immediately. The goal is to see how a solid becomes a flat projection.</p>
      <div class="spatial-grid">
        <div class="spatial-card">
          <div class="stage-head"><strong>1 - Build the structure</strong><span class="concept-chip">BACK / FRONT</span></div>
          <div class="preset-buttons" style="margin-top:10px"><button class="mini-btn" id="cubePresetA">Irregular A</button><button class="mini-btn" id="cubePresetB">Irregular B</button><button class="mini-btn" id="cubeClear">Clear</button></div>
          <div class="height-label" style="margin-top:8px">BACK</div>
          <div class="height-grid" id="cubeEditGrid"></div>
          <div class="height-label">FRONT - Tap a cell: 0 -> 1 -> 2 -> 3 -> 4 -> 0. Gold outline marks a stack that sets the silhouette for the selected side.</div>
          <div class="math" id="cubeTotals" style="margin-top:10px"></div>
        </div>
        <div class="spatial-card">
          <div class="stage-head"><strong>Interactive 3D model</strong><div><button class="mini-btn" id="rotLeft">Rotate left</button> <button class="mini-btn" id="rotRight">Rotate right</button></div></div>
          <div class="cube-stage"><svg id="cubeIsoSvg" viewBox="0 0 620 430" role="img" aria-label="Interactive isometric cube structure"></svg></div>
          <div class="observer-note" id="observerNote"></div>
        </div>
      </div>
      <div class="spatial-card" style="margin-top:14px">
        <div class="projection-head"><div><strong>2 - Choose where the observer stands</strong><div class="muted small">Predict the visible-square count before revealing the flattened view.</div></div>
          <div class="view-buttons"><button class="view-btn active" data-cubeview="top">Top</button><button class="view-btn" data-cubeview="front">Front</button><button class="view-btn" data-cubeview="right">Right</button><button class="view-btn" data-cubeview="left">Left</button></div>
        </div>
        <div class="projection-wrap">
          <div><div class="predict-row"><label><strong>Your prediction:</strong> <input id="cubePredict" type="number" min="0" max="64" inputmode="numeric" placeholder="?"></label><button class="btn" id="revealProjection">Reveal view</button></div><div class="math" id="cubeViewRule"></div></div>
          <div><div id="projectionGrid" class="projection-grid"></div><div id="projectionResult" class="math" style="margin-top:10px">Projection hidden - predict first.</div></div>
        </div>
      </div>`;

    if(w === 'pyramid') return `<h3>See how the base controls the whole pyramid</h3>
      <div class="controls"><label>Base sides <input id="baseN" type="range" min="3" max="10" value="6"></label><span id="baseNV"></span></div>
      <div class="pyramid-layout">
        <div class="spatial-card"><div class="pyr-mode-buttons" style="margin-bottom:10px"><button class="mini-btn active" data-pyrmode="all">Whole structure</button><button class="mini-btn" data-pyrmode="vertices">Vertices</button><button class="mini-btn" data-pyrmode="edges">Edges</button><button class="mini-btn" data-pyrmode="faces">Faces</button></div><svg id="pyrSvg" class="pyr-svg" viewBox="0 0 560 390" role="img" aria-label="Interactive pyramid structure"></svg></div>
        <div class="spatial-card"><div class="pyr-stat-grid"><div class="pyr-stat"><span>Vertices</span><strong id="pyrV"></strong></div><div class="pyr-stat"><span>Edges</span><strong id="pyrE"></strong></div><div class="pyr-stat"><span>Faces</span><strong id="pyrF"></strong></div></div><div class="math" id="pyrOut"></div><div class="pyr-why" id="pyrWhy"></div></div>
      </div>`;
    return originalWidgetHTML(w);
  };

  const originalInitWidget = initWidget;
  initWidget = function(w){
    if(w === 'cubeviews') return initCubeViews();
    if(w === 'pyramid') return initPyramid();
    return originalInitWidget(w);
  };
})();
