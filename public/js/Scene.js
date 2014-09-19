
var Scene = function(conquerors,
                     initialShips){

  this._numConquerors = conquerors.length;
  this._conquerors = conquerors.reduce(function(conqs, c){
    conqs[c.name] = c;
    return conqs;
  }, {});
  this._initialShips = initialShips;
  this._initialPlanetRatio = 5;
  this._planets = this.generatePlanets(conquerors,
                                       this._initialPlanetRatio,
                                       this._initialShips);
  this._fleets = [];
  this._speed = 0.02;

  this.initRenderer();
};

Scene.prototype.initRenderer = function () {
  this.scene = new THREE.Scene();
  this.sceneCube = new THREE.Scene();
  this.clock = new THREE.Clock();

  this.camera = new THREE.PerspectiveCamera(
        45,
        window.innerWidth / window.innerHeight,
        1,
        15000
  );

  this.camera.position.z = 300;
  this.camera.position.y = 400;
  this.camera.lookAt(new THREE.Vector3(0,0,0));
  this.camera.updateMatrixWorld();
  this.cameraCube = this.camera.clone();

  this.controls = new THREE.OrbitControls(this.camera);
  this.controls.damping = 0.2;
  this.controls.addEventListener('change', this.updateLabelPositions.bind(this));

  var light01 = new THREE.DirectionalLight(0xffffff, 1.0);
  light01.position.set(1, 1, 1);
  this.scene.add(light01);

  var light02 = new THREE.DirectionalLight(0xffffff, 0.9);
  light02.position.set(-1, -1, 1);
  // this.scene.add(light02);

  var hemiLight = new THREE.HemisphereLight(0xffffff, 0xffffff, 0.4);
  hemiLight.color.setHSL(0.6, 1, 0.6);
  hemiLight.groundColor.setHSL(0.095, 1, 0.75);
  hemiLight.position.set(0, 500, 0);
  this.scene.add(hemiLight);

  // this.scene.add(new THREE.AmbientLight(0x333333));
  this.projector = new THREE.Projector();

  var urls = [
    'px.jpg', 'nx.jpg',
    'py.jpg', 'ny.jpg',
    'pz.jpg', 'nz.jpg'
  ].map(function(e) {
    return 'assets/env/' + e;
  });

  this.environmentMap = THREE.ImageUtils.loadTextureCube(urls);

  var shader = THREE.ShaderLib['cube'];
  shader.uniforms['tCube'].value = this.environmentMap;

  var material = new THREE.ShaderMaterial({
    fragmentShader: shader.fragmentShader,
    vertexShader: shader.vertexShader,
    uniforms: shader.uniforms,
    depthWrite: false,
    side: THREE.BackSide
  });

  var skyBox = new THREE.Mesh(new THREE.BoxGeometry(5200, 5200, 5200), material);
  this.sceneCube.add(skyBox);

  var planetShininess = 40;
  this.planetMaterials = [
    new THREE.MeshPhongMaterial({
      map: new THREE.ImageUtils.loadTexture('assets/earthmap1k.jpg'),
      bumpMap: new THREE.ImageUtils.loadTexture('assets/earthbump1k.jpg'),
      shininess: planetShininess,
    }),
    new THREE.MeshPhongMaterial({
      map: new THREE.ImageUtils.loadTexture('assets/jupitermap.jpg'),
      shininess: planetShininess,
    }),
    new THREE.MeshPhongMaterial({
      map: new THREE.ImageUtils.loadTexture('assets/mars_1k_color.jpg'),
      bumpMap: new THREE.ImageUtils.loadTexture('assets/marsbump1k.jpg'),
      shininess: planetShininess,
    }),
    new THREE.MeshPhongMaterial({
      map: new THREE.ImageUtils.loadTexture('assets/mercurymap.jpg'),
      bumpMap: new THREE.ImageUtils.loadTexture('assets/mercurybump.jpg'),
      shininess: planetShininess,
    }),
    new THREE.MeshPhongMaterial({
      map: new THREE.ImageUtils.loadTexture('assets/neptunemap.jpg'),
      shininess: planetShininess,
    }),
    new THREE.MeshPhongMaterial({
      map: new THREE.ImageUtils.loadTexture('assets/plutomap1k.jpg'),
      bumpMap: new THREE.ImageUtils.loadTexture('assets/plutobump1k.jpg'),
      shininess: planetShininess,
    }),
    new THREE.MeshPhongMaterial({
      map: new THREE.ImageUtils.loadTexture('assets/saturnmap.jpg'),
      shininess: planetShininess,
    }),
    new THREE.MeshPhongMaterial({
      map: new THREE.ImageUtils.loadTexture('assets/venusmap.jpg'),
      bumpMap: new THREE.ImageUtils.loadTexture('assets/venusbump.jpg'),
      shininess: planetShininess,
    }),
    new THREE.MeshPhongMaterial({
      map: new THREE.ImageUtils.loadTexture('assets/planet_1_d.jpg'),
      shininess: planetShininess,
    }),
    new THREE.MeshPhongMaterial({
      map: new THREE.ImageUtils.loadTexture('assets/planet_2_d.jpg'),
      shininess: planetShininess,
    }),
    new THREE.MeshPhongMaterial({
      map: new THREE.ImageUtils.loadTexture('assets/planet_3_d.jpg'),
      shininess: planetShininess,
    }),
    new THREE.MeshPhongMaterial({
      map: new THREE.ImageUtils.loadTexture('assets/planet_4_d.jpg'),
      shininess: planetShininess,
    }),
    new THREE.MeshPhongMaterial({
      map: new THREE.ImageUtils.loadTexture('assets/planet_5_d.jpg'),
      shininess: planetShininess,
    }),
    new THREE.MeshPhongMaterial({
      map: new THREE.ImageUtils.loadTexture('assets/planet_7_d.jpg'),
      shininess: planetShininess,
    }),
    new THREE.MeshPhongMaterial({
      map: new THREE.ImageUtils.loadTexture('assets/Planet_Avalon_1600.jpg'),
      shininess: planetShininess,
    }),
    new THREE.MeshPhongMaterial({
      map: new THREE.ImageUtils.loadTexture('assets/planet_Dagobah1200.jpg'),
      shininess: planetShininess,
    }),
    new THREE.MeshPhongMaterial({
      map: new THREE.ImageUtils.loadTexture('assets/planet_Dam-Ba-Da1200.jpg'),
      shininess: planetShininess,
    }),
    new THREE.MeshPhongMaterial({
      map: new THREE.ImageUtils.loadTexture('assets/planet_Jinx1200.jpg'),
      shininess: planetShininess,
    }),
    new THREE.MeshPhongMaterial({
      map: new THREE.ImageUtils.loadTexture('assets/planet_Klendathu1200.jpg'),
      shininess: planetShininess,
    }),
    new THREE.MeshPhongMaterial({
      map: new THREE.ImageUtils.loadTexture('assets/planet_Terminus1200.jpg'),
      shininess: planetShininess,
    }),
  ];

  this.renderer = new THREE.WebGLRenderer({
    antialias: true,
    alpha: true,
    preserveDrawingBuffer: true
  });

  var randomizePlanetMaterials = Math.round(Math.random() * this.planetMaterials.length);
  this._planets.forEach(function (planet, i) {
    var radius = planet.ratio * 5;
    planet.mesh = new THREE.Mesh(
      new THREE.SphereGeometry(radius, 32, 32),
      this.planetMaterials[(i + randomizePlanetMaterials) % this.planetMaterials.length]
    );

    planet.mesh.position.x = planet.x;
    planet.mesh.position.z = planet.y;
    // planet.mesh.position.y = radius;
    // planet.mesh.position.z = Math.random() * 400 - 200;

    this.scene.add(planet.mesh);

    var pos2d = this.toXYCoords(planet.mesh.position);

    var text = document.createElement('div');
    text.className = 'planetLabel';
    text.innerHTML = this.getLabels(planet);
    text.style.top = parseInt(pos2d.y) + 'px';
    text.style.left = parseInt(pos2d.x) + 'px';
    document.body.appendChild(text);

    planet.text = text;
  }.bind(this));

  this.renderer.setSize(window.innerWidth, window.innerHeight);
  this.renderer.setClearColor(0x000000);
  this.animate();

  document.body.appendChild(this.renderer.domElement);
  window.addEventListener('resize', this.onWindowResize.bind(this), false);
};

Scene.prototype.toXYCoords = function (pos) {
  var vector = this.projector.projectVector(pos.clone(), this.camera);
  vector.x = (vector.x + 1)/2 * window.innerWidth;
  vector.y = -(vector.y - 1)/2 * window.innerHeight;
  return vector;
};

Scene.prototype.updateLabelPositions = function () {
  this._planets.forEach(function (planet) {
    var pos2d = this.toXYCoords(planet.mesh.position);

    planet.text.style.top = parseInt(pos2d.y) + 'px';
    planet.text.style.left = parseInt(pos2d.x) + 'px';
  }.bind(this));
};

Scene.prototype.onWindowResize = function () {
  this.camera.aspect = window.innerWidth / window.innerHeight;
  this.camera.updateProjectionMatrix();
  this.cameraCube.aspect = this.camera.aspect;
  this.cameraCube.updateProjectionMatrix();

  this.renderer.setSize(window.innerWidth, window.innerHeight);
  this.updateLabelPositions();
};

Scene.prototype.generatePlanets = function(conquerors,
                                           conquerorsRatio,
                                           conquerorsShips){
  //TODO create more maps
  var maps =  [
    [
      { x: -20, y: -20, ratio: 5, ships: 3 },
      { x: -80, y: 155, ratio: 5, ships: 25 },
      { x: -100, y: -160, ratio: 5, ships: 45 },
      { x: 100,  y: 220, ratio: 1, ships: 1 },
      { x: 100, y: 80, ratio: 2, ships: 10 },
      { x: 180, y: -110, ratio: 3, ships: 200 },
      { x: -280, y: -190, ratio: 4, ships: 1 },
      { x: -200, y: 100, ratio: 5, ships: 3 },
    ]
  ];

  //TODO test this
  var mapPos = Math.floor(Math.random() * maps.length)
    , map = maps[mapPos]

  //Put the players in the first planets
  conquerors.forEach(function(conq, i){
    map[i].owner = conq.name;
    map[i].ratio = conquerorsRatio;
    map[i].ships = conquerorsShips;
  });

  return map;
};

Scene.prototype.updateLabels = function () {
  for(var i in this._planets){
    var p = this._planets[i];
    p.ships += p.ratio;
    p.text.innerHTML = this.getLabels(p);
  }
};

Scene.prototype.growRatios = function(){
  for(var i in this._planets){
    var p = this._planets[i];
    p.ships += p.ratio;
  }

  this.updateLabels();
};

Scene.prototype.getLabels = function (planet) {
  var labels = '';
  labels += '<label class="ships">' + planet.ships + '</label>';

  if(planet.owner) {
    var color = new THREE.Color(this.getConquerorColor(planet.owner));
    var colorCss = 'background-color: rgba(' + color.r*255 + ', ' + color.g*255 + ', ' + color.b*255 + ', 0.35);';

    labels += '<label class="owner" style="' + colorCss + '">' + planet.owner + '</label>';
  }

  return labels;
};

/**
 * Returns the planets array
 */
Scene.prototype.getPlanets = function(){
  this.updateFleets();
  return this._planets;
};

/**
 * Returns the fleets array
 */
Scene.prototype.getFleets = function(){
  this.updateFleets();
  return this._fleets;
};

/**
 * Return the color established for the given conqueror
 *
 * @param <String> conqId - Id of the requested conqueror
 * @return <String> color
 */
Scene.prototype.getConquerorColor = function(conqId){
  return !conqId
           ? 'gray'
           : this._conquerors[conqId].color || 'gray';
};

/**
 * Renders the 3d scene with Three.js
 * @param <float> dt - elapsed time since last frame
 */
Scene.prototype.render = function (dt) {
  this.cameraCube.rotation.copy(this.camera.rotation);
  this.cameraCube.position.copy(this.camera.position);

  this.renderer.autoClear = false;
  this.renderer.clear();

  this.renderer.render(this.sceneCube, this.cameraCube);
  this.renderer.render(this.scene, this.camera);
};

Scene.prototype.animate = function () {
  requestAnimationFrame(this.animate.bind(this));
  var dt = this.clock.getDelta();

  TWEEN.update();

  this._planets.forEach(function (p) {
    p.mesh.rotation.y += 0.15 * dt;
  });

  this.render(dt);
};

/**
 * Removes the fleets that have already got to their destination
 */
Scene.prototype.updateFleets = function(){

    var t = new Date()
      , fleet;

    for(var i in this._fleets){
      fleet = this._fleets[i];

      var dist = getDistance(fleet.origin, fleet.dest)

        // Trip time
        , tt = dist / this._speed

        // Elapsed time
        , elapsed = t - fleet.start

        // Percent travelled
        , pTravelled = elapsed / tt;


      // If travelled 100% percent of the trip
      if(elapsed >= tt){

        // Add ships to the new planet
        if(fleet.owner != fleet.dest.owner){
          fleet.dest.ships -= fleet.ships;

          // If fleet contained more ships than the planet
          if(fleet.dest.ships < 0){
            fleet.dest.ships *= -1;

            // Planet Conquered!!
            fleet.dest.owner = fleet.owner;
          }

        }else{
          fleet.dest.ships += fleet.ships;
        }

        // Remove fleet from fleets list
        this._fleets.splice(i, 1);

      }

    }

};

Scene.prototype.createShip = function (origin, dest, maxY) {
  var color = this.getConquerorColor(origin.owner);

  var box = new THREE.BoxGeometry(0.7, 0.7, 5);
  var material = new THREE.MeshPhongMaterial({color: color, shininess: 50});
  var mesh = new THREE.Mesh(box, material);

  mesh.position.copy(origin.mesh.position);
  mesh.position.x += Math.random() * 8 - 4;
  mesh.position.y += Math.random() * 8 - 4;
  // mesh.position.z = 20;

  var target = dest.mesh.position.clone();
  target.x += Math.random() * 12 - 6;
  target.z += Math.random() * 12 - 6;

  var dist = mesh.position.distanceTo(target);
  var tt = dist / this._speed;

  var lineMaterial = new THREE.LineBasicMaterial({
    color: color,
    transparent: true,
    opacity: 0.3
  });

  var spline = new THREE.SplineCurve3([
    origin.mesh.position.clone(),
    new THREE.Vector3(target.x / 2, target.y / 2 + maxY, target.z / 2),
    target
  ]);

  var geometry = new THREE.Geometry();
  var splinePoints = spline.getPoints(32);

  for(var i = 0; i < splinePoints.length; i++)
    geometry.vertices.push(splinePoints[i]);

  var line = new THREE.Line(geometry, lineMaterial);

  this.scene.add(line);

  var tween = new TWEEN.Tween(mesh.position.clone())
    .to(target, tt)
    .easing(TWEEN.Easing.Linear.None)
    .interpolation(TWEEN.Interpolation.Bezier)
    .onUpdate(function (t) {
      // mesh.rotation.copy(spline.getTangent(t));
      mesh.position.copy(spline.getPoint(t));
      mesh.lookAt(spline.getPoint(t+0.001));
    })
    .onComplete(function () {
      this.updateFleets();
      this.scene.remove(mesh);
      this.scene.remove(line);

      dest.text.innerHTML = this.getLabels(dest);
    }.bind(this))
    .start();

  this.scene.add(mesh);

  return mesh;
};

Scene.prototype.sendFleet = function (origin, dest, ships){

  // Check it's not trying to send more ships than the available
  if(origin.ships < ships) return false;

  // Substract the ships to be sent
  origin.ships -= ships;

  // Generate tiny 3d ships
  var maxY = Math.random() * 50 - 50;
  var meshes = [];
  for(var i = 0; i < ships; i++)
    meshes.push(this.createShip(origin, dest, maxY));

  // Add the fleet to the fleets array
  this._fleets.push({
    origin: origin,
    dest: dest,
    owner: origin.owner,
    ships: ships,
    start: new Date(),
    meshes: meshes
  });

  return true;

};


/**
 * Calculates the distance between two planets
 * @param <Object> origin
 * @param <Object> dest
 * @return <Number>
 */
function getDistance(origin, dest){
  return Math.sqrt(  Math.pow(origin.x - dest.x, 2)
                   + Math.pow(origin.y - dest.y, 2));
}


