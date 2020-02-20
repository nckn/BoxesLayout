import 'styles/index.scss'
// import Cone from './elements/cone'
// import Torus from './elements/torus'
// import Cylinder from './elements/cylinder'
import { radians, map, distance, hexToRgbTreeJs } from './helpers'
import Box from '../../../second-demo/src/scripts/elements/box'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import Button from './elements/button'

import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js'
import { ShaderPass } from 'three/examples/jsm/postprocessing/ShaderPass.js'
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js'
import BlurPass from './Passes/Blur.js'

// Utils
import Sizes from './Utils/Sizes.js'

export default class App {

  constructor() {
    // Set up
    // this.time = new Time()
    this.sizes = new Sizes()
    // this.resources = new Resources()
  }

  setup () {
    this.backgroundColor = '#050505'

    // Set up
    // this.time = new Time()

    this.gutter = { size: 4 } // Org 4
    this.meshes = []
    // this.grid = { rows: 20, cols: 20 }
    this.grid = {
      cols: 9,
      rows: 1,
      depth: 1
    }
    this.width = window.innerWidth
    this.height = window.innerHeight
    this.mouse3D = new THREE.Vector2()
    this.geometries = [
      new Box()
      // new Cone(),
      // new Torus(),
      // new Cylinder(),
    ]
    this.allCubes = []
    this.collectFirst = true

    this.positions = []

    this.raycaster = new THREE.Raycaster()

    this.buttons = [
      {
        name: 'horizontal',
        color: 'green',
        pos: { x: 20, y: 20 },
        img: 'icon-center-horizontally.svg'
      },
      {
        name: 'vertical',
        color: 'red',
        pos: { x: 20, y: 60 },
        img: 'icon-center-vertically.svg'
      }
    ]

    this.layout = [true, false]

  }

  setConfig () {
    this.config = {}
    this.config.debug = window.location.hash === '#debug'
    this.config.cyberTruck = window.location.hash === '#cybertruck'
    this.config.touch = false

    window.addEventListener(
      'touchstart',
      () => {
        this.config.touch = true
        // this.world.controls.setTouch()

        this.passes.horizontalBlurPass.strength = 1
        this.passes.horizontalBlurPass.material.uniforms.uStrength.value = new THREE.Vector2(
          this.passes.horizontalBlurPass.strength,
          0
        )
        this.passes.verticalBlurPass.strength = 1
        this.passes.verticalBlurPass.material.uniforms.uStrength.value = new THREE.Vector2(
          0,
          this.passes.verticalBlurPass.strength
        )
      },
      { once: true }
    )
  }

  changeLayout (target) {
    console.log(target.name)
    var name = target.getAttribute('name')
    switch (name) {
      case 'horizontal':
        console.log('line')
        this.layout[1] = false
        this.layout[0] = true
        break
      case 'vertical':
        console.log('grid')
        this.layout[0] = false
        this.layout[1] = true
        break
      default:
    }
    // for (let row = 0; row < this.grid.rows; row++) {
    //   for (let index = 0; index < 1; index++) {
    //     const totalCols = this.getTotalRows(row)
    //     for (let col = 0; col < totalCols; col++) {
    //       const obj = new Object()
    //       obj.mesh = this.meshes[row][col].mesh
    //       obj.pos = this.meshes[row][col].positions
    //       TweenMax.to(obj.mesh.position, 0.3, {
    //         x: obj.pos[1].x,
    //         y: obj.pos[1].y,
    //         z: obj.pos[1].z
    //       })
    //     }
    //   }
    // }
  }

  // buttonWasClicked (evt) {
  //   console.log('interacted')
  //   evt.preventDefault()
  //   this.changeLayout()
  // }

  setupButtons () {
    var self = this
    var bA = this.buttons // Button array
    for (var i = 0; i < bA.length; i++) {
      var button = new Button({
        name: bA[i].name,
        color: bA[i].color,
        pos: bA[i].pos,
        img: bA[i].img
      })
      this.buttons.domElem = button
      var el = this.buttons.domElem.button
      el.addEventListener('click', e => {
        e.preventDefault()
        var target = e.target || e.srcElement
        console.log(target)
        self.changeLayout(target)
      })
      // el.addEventListener('touchstart', self.changeLayout)
      // el.addEventListener('touchstart' || 'click', self.changeLayout)
    }
    // document.body.appendChild(button)
  }

  drawGuides () {
    var axesHelper = new THREE.AxesHelper(5)
    this.scene.add(axesHelper)
  }

  createScene () {
    this.scene = new THREE.Scene()

    // this.scene.background = new THREE.Color(0x000000) // Black background
    this.scene.fog = new THREE.Fog(0x000000, 20, 60)

    this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true })
    this.renderer.setPixelRatio(2)
    this.renderer.setSize(window.innerWidth, window.innerHeight)
    this.renderer.setPixelRatio(window.devicePixelRatio)

    this.renderer.shadowMap.enabled = true
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap

    document.body.appendChild(this.renderer.domElement)
  }

  addControls () {
    this.gui = new dat.GUI()

    const gui = this.gui.addFolder('Background')

    gui.addColor(this, 'backgroundColor').onChange(color => {
      document.body.style.backgroundColor = color
      // this.scene.background = color
    })
  }

  createCamera () {
    this.camera = new THREE.PerspectiveCamera(
      20,
      window.innerWidth / window.innerHeight,
      1
    )
    this.camera.position.set(20, 20, 20)
    this.camera.rotation.x = -1.57

    this.scene.add(this.camera)
  }

  createControls () {
    // Camera and controls
    this.orbitControls = new OrbitControls(
      this.camera,
      this.renderer.domElement
    )
    // this.orbitControls.enabled = true /* This disables touch devices */
    // this.orbitControls.enabled = false /* Only with this as false touch devices work */
    this.orbitControls.enableKeys = false
    this.orbitControls.zoomSpeed = 0.5
    // this.orbitControls.maxPolarAngle = Math.PI / 2 - Math.PI / 32 // Math.PI/2 is at floor
    this.orbitControls.maxPolarAngle = Math.PI / 2 - 0.005 // Math.PI/2 is at floor
    // No pan
    this.orbitControls.enablePan = false
    // this.instance = new THREE.PerspectiveCamera(40, this.sizes.viewport.width / this.sizes.viewport.height, 1, 180)
    // Set max distance
    this.orbitControls.maxDistance = 40
  }

  addAmbientLight () {
    const obj = { color1: '#eed4aa', color2: '#6f78c9' }
    const ambLight = new THREE.AmbientLight(obj.color1, 1)
    const ambLight2 = new THREE.AmbientLight(obj.color2, 1)
    // const light = new THREE.AmbientLight('#ffffff', 1)
    this.scene.add(ambLight)
    this.scene.add(ambLight2)

    // Make gui
    const gui = this.gui.addFolder('Ambient Light 1')
    gui.addColor(obj, 'color1').onChange(color => {
      ambLight.color = hexToRgbTreeJs(color)
    })
    const gui2 = this.gui.addFolder('Ambient Light 2')
    gui2.addColor(obj, 'color2').onChange(color => {
      ambLight2.color = hexToRgbTreeJs(color)
    })
  }

  addSpotLight () {
    // Spot light
    const obj = { color: '#ffffff' }
    // const spLight = new THREE.SpotLight('#7bccd7', 1, 1000)

    // spLight.position.set(0, 27, 0)
    // spLight.castShadow = true

    // this.scene.add(spLight)

    // Point light
    var light = new THREE.PointLight(0xff0000, 1, 1000)
    light.position.set(0, 10, 0)
    // this.scene.add(light)

    const gui = this.gui.addFolder('Spot light')

    gui.addColor(obj, 'color').onChange(color => {
      light.color = hexToRgbTreeJs(color)
    })
  }

  addOtherLight () {
    // Hemispheric light
    var hemiLight = new THREE.HemisphereLight(0xffffff, 0xffffff, 0.6)
    // hemiLight.color.setHSL(0.6, 1, 0.6)
    hemiLight.groundColor.setHSL(0.095, 1, 0.75)
    hemiLight.position.set(0, 50, 0)
    this.scene.add(hemiLight)

    var dirLight = new THREE.DirectionalLight(0xffffff, 1)
    // dirLight.color.setHSL(0.1, 1, 0.95)
    dirLight.position.set(-1, 1.75, 1)
    dirLight.position.multiplyScalar(30)
    this.scene.add(dirLight)

    dirLight.castShadow = true

    var d = 50

    dirLight.shadow.camera.left = -d
    dirLight.shadow.camera.right = d
    dirLight.shadow.camera.top = d
    dirLight.shadow.camera.bottom = -d

    dirLight.shadow.camera.far = 3500
    dirLight.shadow.bias = -0.0001
  }

  addRectLight () {
    const light = new THREE.RectAreaLight('#341212', 1, 2000, 2000)

    light.position.set(5, 50, 50)
    light.lookAt(0, 0, 0)

    this.scene.add(light)
  }

  addPointLight (color, position) {
    const light = new THREE.PointLight(color, 1, 1000, 1)

    light.position.set(position.x, position.y, position.z)

    this.scene.add(light)
  }

  addFloor () {
    const geometry = new THREE.PlaneGeometry(10, 10) // org made floor smaller
    const material = new THREE.ShadowMaterial({ opacity: 0.3 })
    // const material = new <THREE.MeshPhongMaterial({ color: 0x999999, depthWrite: false })

    this.floor = new THREE.Mesh(geometry, material)
    this.floor.position.y = 0
    this.floor.receiveShadow = true
    this.floor.rotateX(-Math.PI / 2)

    // var cylGeometry = new THREE.CylinderGeometry(1, 0, 3, 50, 50, false);
    // var cylMaterial = new THREE.MeshLambertMaterial( { color: 0xffffff } );
    // var cylinder = new THREE.Mesh( cylGeometry, cylMaterial );
    // cylinder.position.set(-1,-2,1);
    // // cylinder.rotation.x = -Math.PI / 2;
    // cylinder.castShadow = true;
    // this.scene.add( cylinder );

    this.scene.add(this.floor)
  }

  // getRandomGeometry () {
  //   return this.geometries[
  //     Math.floor(Math.random() * Math.floor(this.geometries.length))
  //   ]
  // }

  createGrid () {
    var self = this
    this.groupMesh = new THREE.Object3D()

    const material = new THREE.MeshPhysicalMaterial({
      // color: '#3e2917',
      color: '#404040',
      // metalness: 0.58,
      emissive: '#000000',
      roughness: 0.05
    })

    for (let row = 0; row < this.grid.rows; row++) {
      this.meshes[row] = []

      for (let index = 0; index < 1; index++) {
        const totalCol = this.getTotalRows(row)

        for (let col = 0; col < totalCol; col++) {
          // const geometry = this.getRandomGeometry()
          // const geometry = this.geometries[0]
          const geometry = new Box()
          const mesh = this.getMesh(geometry.geom, material)
          // console.log('mesh: ' + geometry.size)
          var boxObject = new Object()
          boxObject = {
            mesh: mesh,
            geometry: geometry,
            positions: []
          }
          self.allCubes.push(boxObject)

          var pos1 = boxObject.positions[0]
          var offset = row - this.grid.rows.length / 2
          pos1 = {
            x: col / 2,
            y: 0,
            z: row - 1 / 2
          }
          var pos2 = boxObject.positions[1]
          pos2 = {
            x: 2,
            y: col / 2,
            z: row / 1
          }
          self.collectFirst = false
          // console.log('mesh: ' + JSON.stringify(mesh))

          // mesh.position.y = 0
          // mesh.position.x = col + col * this.gutter.size + (totalCol === this.grid.cols ? 0 : 2.5)
          // mesh.position.z = row + row * (index + 0.25)

          // this.positions

          mesh.position.y = pos1.x
          mesh.position.x = pos1.y
          mesh.position.z = pos1.z

          // mesh.rotation.x = geometry.rotationX
          // mesh.rotation.y = geometry.rotationY
          // mesh.rotation.z = geometry.rotationZ

          mesh.rotation.x = 0
          mesh.rotation.y = 0
          mesh.rotation.z = 0

          mesh.initialRotation = {
            x: mesh.rotation.x,
            y: mesh.rotation.y,
            z: mesh.rotation.z
          }

          this.groupMesh.add(mesh)

          this.meshes[row][col] = { mesh: mesh, positions: [pos1, pos2] }
        }
      }
    }

    // const centerX = -(this.grid.cols / 2) * this.gutter.size - 1
    // const centerZ = -(this.grid.rows / 2) - 0.8

    const centerX = -this.grid.cols / 4
    const centerZ = -this.grid.rows / 4

    this.groupMesh.position.set(centerX, 0, centerZ)

    this.scene.add(this.groupMesh)
  }

  draw () {
    var self = this
    // console.log('floor type of: ' + this.floor)
    // console.log('box 1 type of: ' + this.allCubes[0])
    // const intersects = this.raycaster.intersectObjects([this.allCubes[0]])

    // Decide which layout
    if (self.layout[0]) {
      // console.log('intersects: ' + x)
      for (let row = 0; row < this.grid.rows; row++) {
        for (let index = 0; index < 1; index++) {
          const totalCols = this.getTotalRows(row)

          for (let col = 0; col < totalCols; col++) {
            const obj = new Object()
            obj.mesh = this.meshes[row][col].mesh
            obj.pos = this.meshes[row][col].positions

            // Position tween happens here
            // cons/t y = map(mouseDistance, 7, 0, 0, 6) // Org
            // const y = map(mouseDistance, 4, 0, 0, 4)
            // TweenMax.to(mesh.position, 0.3, { y: y < 1 ? 1 : y })
            TweenMax.to(obj.mesh.position, 0.3, {
              x: obj.pos[0].x,
              y: obj.pos[0].y,
              z: obj.pos[0].z
            })
            // Position tween happens here - end

            // Rotation happens here
            // TweenMax.to(mesh.rotation, 0.7, {
            //   ease: Expo.easeOut,
            //   x: map(
            //     mesh.position.y,
            //     -1,
            //     1,
            //     radians(270),
            //     mesh.initialRotation.x
            //   ),
            //   z: map(
            //     mesh.position.y,
            //     -1,
            //     1,
            //     radians(-90),
            //     mesh.initialRotation.z
            //   ),
            //   y: map(
            //     mesh.position.y,
            //     -1,
            //     1,
            //     radians(45),
            //     mesh.initialRotation.y
            //   )
            // })
            // Rotation happens here - end
          }
        }
      }
    }
    // No intersections
    else if (self.layout[1]) {
      // console.log('nope')
      for (let row = 0; row < this.grid.rows; row++) {
        for (let index = 0; index < 1; index++) {
          const totalCols = this.getTotalRows(row)
          for (let col = 0; col < totalCols; col++) {
            const obj = new Object()
            obj.mesh = this.meshes[row][col].mesh
            obj.pos = this.meshes[row][col].positions
            TweenMax.to(obj.mesh.position, 0.3, {
              x: obj.pos[1].x,
              y: obj.pos[1].y,
              z: obj.pos[1].z
            })
          }
        }
      }
    }

    // Intersections
    this.raycaster.setFromCamera(this.mouse3D, self.camera)
    const intersects = this.raycaster.intersectObjects([this.floor])

    if (intersects.length) {
      const { x, z } = intersects[0].point
      // console.log('intersects: ' + x)
      for (let row = 0; row < this.grid.rows; row++) {
        for (let index = 0; index < 1; index++) {
          const totalCols = this.getTotalRows(row)

          for (let col = 0; col < totalCols; col++) {
            const obj = new Object()
            obj.mesh = this.meshes[row][col].mesh
            obj.pos = this.meshes[row][col].positions

            const mouseDistance = distance(
              x,
              z,
              obj.mesh.position.x + this.groupMesh.position.x,
              obj.mesh.position.z + this.groupMesh.position.z
            )
            // Position tween happens here - end

            // Scale happens here
            // const scaleFactor = mesh.position.y / 1.2
            // const scale = scaleFactor < 1 ? 1 : scaleFactor
            return
            const scaleVal = map(mouseDistance, 4, 0, 1, 2)
            // console.log(mouseDistance)
            // const scale = (1 / y) * 0.1
            const scale = scaleVal
            TweenMax.to(obj.mesh.scale, 0.3, {
              ease: Expo.easeOut,
              x: scale,
              y: scale,
              z: scale
            })
            // Scale happens here - end

            // Rotation happens here
            // TweenMax.to(mesh.rotation, 0.7, {
            //   ease: Expo.easeOut,
            //   x: map(
            //     mesh.position.y,
            //     -1,
            //     1,
            //     radians(270),
            //     mesh.initialRotation.x
            //   ),
            //   z: map(
            //     mesh.position.y,
            //     -1,
            //     1,
            //     radians(-90),
            //     mesh.initialRotation.z
            //   ),
            //   y: map(
            //     mesh.position.y,
            //     -1,
            //     1,
            //     radians(45),
            //     mesh.initialRotation.y
            //   )
            // })
            // Rotation happens here - end
          }
        }
      }
    }
  }

  getTotalRows (col) {
    return col % 2 === 0 ? this.grid.cols : this.grid.cols - 1
  }

  getMesh (geometry, material) {
    const mesh = new THREE.Mesh(geometry, material)

    mesh.castShadow = true
    mesh.receiveShadow = true

    return mesh
  }

  init () {
    this.setup()

    this.createScene()

    this.setConfig()

    this.addControls()

    this.createCamera()

    this.createControls()

    this.createGrid()

    this.addFloor()

    this.addAmbientLight()

    this.addOtherLight()

    this.addSpotLight()

    this.addRectLight()

    this.addPointLight(0xfff000, { x: 0, y: 10, z: -100 })

    this.addPointLight(0x79573e, { x: 100, y: 10, z: 0 })

    this.addPointLight(0xc27439, { x: 20, y: 5, z: 20 })

    this.animate()

    window.addEventListener('resize', this.onResize.bind(this))

    window.addEventListener('mousemove', this.onMouseMove.bind(this), false)

    this.onMouseMove({ clientX: 0, clientY: 0 })
    // Draw guides
    // this.drawGuides()
    // Apply buttons
    this.setupButtons()

    this.setPasses()
  }

  onMouseMove ({ clientX, clientY }) {
    this.mouse3D.x = (clientX / this.width) * 2 - 1
    this.mouse3D.y = -(clientY / this.height) * 2 + 1
  }

  onResize () {
    this.width = window.innerWidth
    this.height = window.innerHeight

    this.camera.aspect = this.width / this.height
    this.camera.updateProjectionMatrix()
    this.renderer.setSize(this.width, this.height)
  }

  animate () {
    this.draw()

    // console.log('camera pos: ' + JSON.stringify(this.camera.position))

    this.renderer.render(this.scene, this.camera)

    requestAnimationFrame(this.animate.bind(this))
  }

  setPasses()
    {
        this.passes = {}

        // Debug
        if(this.debug)
        {
            this.passes.debugFolder = this.debug.addFolder('postprocess')
            // this.passes.debugFolder.open()
        }

        // console.log('logging renderer: ' + JSON.stringify(this.renderer))
        console.log('logging renderer: ' + this.renderer.width)

        this.passes.composer = new EffectComposer(this.renderer)

        // Create passes
        this.passes.renderPass = new RenderPass(this.scene, this.camera.instance)

        this.passes.horizontalBlurPass = new ShaderPass(BlurPass)
        this.passes.horizontalBlurPass.strength = this.config.touch ? 0 : 1
        this.passes.horizontalBlurPass.material.uniforms.uResolution.value = new THREE.Vector2(this.sizes.viewport.width, this.sizes.viewport.height)
        this.passes.horizontalBlurPass.material.uniforms.uStrength.value = new THREE.Vector2(this.passes.horizontalBlurPass.strength, 0)

        this.passes.verticalBlurPass = new ShaderPass(BlurPass)
        this.passes.verticalBlurPass.strength = this.config.touch ? 0 : 1
        this.passes.verticalBlurPass.material.uniforms.uResolution.value = new THREE.Vector2(this.sizes.viewport.width, this.sizes.viewport.height)
        this.passes.verticalBlurPass.material.uniforms.uStrength.value = new THREE.Vector2(0, this.passes.verticalBlurPass.strength)

        // Debug
        if(this.debug)
        {
            const folder = this.passes.debugFolder.addFolder('blur')
            folder.open()

            folder.add(this.passes.horizontalBlurPass.material.uniforms.uStrength.value, 'x').step(0.001).min(0).max(10)
            folder.add(this.passes.verticalBlurPass.material.uniforms.uStrength.value, 'y').step(0.001).min(0).max(10)
        }

        // this.passes.glowsPass = new ShaderPass(GlowsPass)
        // this.passes.glowsPass.color = '#ffcfe0'
        // this.passes.glowsPass.material.uniforms.uPosition.value = new THREE.Vector2(0, 0.25)
        // this.passes.glowsPass.material.uniforms.uRadius.value = 0.7
        // this.passes.glowsPass.material.uniforms.uColor.value = new THREE.Color(this.passes.glowsPass.color)
        // // this.passes.glowsPass.material.uniforms.uAlpha.value = 0.55 // Org value: 0.55 
        // this.passes.glowsPass.material.uniforms.uAlpha.value = 0.0

        // Debug
        if(this.debug)
        {
            const folder = this.passes.debugFolder.addFolder('glows')
            folder.open()

            folder.add(this.passes.glowsPass.material.uniforms.uPosition.value, 'x').step(0.001).min(- 1).max(2).name('positionX')
            folder.add(this.passes.glowsPass.material.uniforms.uPosition.value, 'y').step(0.001).min(- 1).max(2).name('positionY')
            folder.add(this.passes.glowsPass.material.uniforms.uRadius, 'value').step(0.001).min(0).max(2).name('radius')
            folder.addColor(this.passes.glowsPass, 'color').name('color').onChange(() =>
            {
                this.passes.glowsPass.material.uniforms.uColor.value = new THREE.Color(this.passes.glowsPass.color)
            })
            folder.add(this.passes.glowsPass.material.uniforms.uAlpha, 'value').step(0.001).min(0).max(1).name('alpha')
        }

        // Add passes
        this.passes.composer.addPass(this.passes.renderPass)
        this.passes.composer.addPass(this.passes.horizontalBlurPass)
        this.passes.composer.addPass(this.passes.verticalBlurPass)
        this.passes.composer.addPass(this.passes.glowsPass)

        // Time tick
        this.time.on('tick', () =>
        {
            this.passes.horizontalBlurPass.enabled = this.passes.horizontalBlurPass.material.uniforms.uStrength.value.x > 0
            this.passes.verticalBlurPass.enabled = this.passes.verticalBlurPass.material.uniforms.uStrength.value.y > 0

            // Renderer
            this.passes.composer.render()
            // this.renderer.domElement.style.background = 'black'
            // this.renderer.render(this.scene, this.camera.instance)
        })

        // Resize event
        this.sizes.on('resize', () =>
        {
            this.renderer.setSize(this.sizes.viewport.width, this.sizes.viewport.height)
            this.passes.composer.setSize(this.sizes.viewport.width, this.sizes.viewport.height)
            this.passes.horizontalBlurPass.material.uniforms.uResolution.value.x = this.sizes.viewport.width
            this.passes.horizontalBlurPass.material.uniforms.uResolution.value.y = this.sizes.viewport.height
            this.passes.verticalBlurPass.material.uniforms.uResolution.value.x = this.sizes.viewport.width
            this.passes.verticalBlurPass.material.uniforms.uResolution.value.y = this.sizes.viewport.height
        })
    }
}
