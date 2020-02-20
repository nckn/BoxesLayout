import * as THREE from 'three'
import * as dat from 'dat.gui'

import Sizes from './Utils/Sizes.js'
import Time from './Utils/Time.js'
import World from './World/index.js'
import Resources from './Resources.js'

import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js'
import { ShaderPass } from 'three/examples/jsm/postprocessing/ShaderPass.js'
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js'
import BlurPass from './Passes/Blur.js'
import GlowsPass from './Passes/Glows.js'
import Camera from './Camera.js'

// Niels Konrad
import { radians, map, distance, hexToRgbTreeJs } from './Utils/helpers.js'
import Box from './elements/box'
import Button from './elements/button.js'
import TweenMax from 'gsap'
import Loader from './Utils/Loader.js'
import informationActivitiesSource from '../models/information/static/land-title-1.png'

export default class Application {
  /**
   * Constructor
   */
  constructor (_options) {
    // Options
    this.$canvas = _options.$canvas

    // Konrad Studio
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
    this.startPos = { x: 0, y: 0, z: 0 }

    // Set up
    this.time = new Time()
    this.sizes = new Sizes()
    this.resources = new Resources()

    this.setConfig()
    this.setDebug()
    this.setRenderer()
    this.setCamera()
    this.setPasses()
    this.setWorld()
    this.setTitle()

    // this.loadTextures()
    this.drawGuides()

    setTimeout(() => {
      this.createGrid()
      this.createLights()
      this.setupButtons()
      this.updateBoxes()
    }, 1000)
  }

  // loadTextures () {
  //   var self = this
  //   this.loader = new Loader()
  //   this.items = {}
  //   this.loader.load([
  //     {
  //       name: 'informationActivities',
  //       source: informationActivitiesSource,
  //       type: 'texture'
  //     }
  //   ])
  //   this.loader.on('fileEnd', (_resource, _data) => {
  //     this.items[_resource.name] = _data

  //     // Texture
  //     if (_resource.type === 'texture') {
  //       const texture = new THREE.Texture(_data)
  //       texture.needsUpdate = true

  //       this.items[`${_resource.name}Texture`] = texture
  //     }

  //     // Trigger progress
  //     // this.trigger('progress', [this.loader.loaded / this.loader.toLoad])
  //   })

  //   this.loader.on('end', () => {
  //     // Trigger ready
  //     // this.trigger('ready')
  //     console.log('here they are: ' + JSON.stringify(self.items))
  //   })
  // }

  getTotalRows (col) {
    return col % 2 === 0 ? this.grid.cols : this.grid.cols - 1
  }

  getMesh (geometry, material) {
    const mesh = new THREE.Mesh(geometry, material)

    mesh.castShadow = true
    mesh.receiveShadow = true

    return mesh
  }

  createLights () {
    // A hemisphere light is a gradient colored light;
    // the first parameter is the sky color, the second parameter is the ground color,
    // the third parameter is the intensity of the light
    const hemisphereLight = new THREE.HemisphereLight(0xaaaaaa, 0x000000, 0.9)

    // A directional light shines from a specific direction.
    // It acts like the sun, that means that all the rays produced are parallel.
    const shadowLight = new THREE.DirectionalLight(0xffffff, 0.9)

    // Set the direction of the light
    shadowLight.position.set(150, 350, 350)

    // Allow shadow casting
    shadowLight.castShadow = true

    // define the visible area of the projected shadow
    shadowLight.shadow.camera.left = -400
    shadowLight.shadow.camera.right = 400
    shadowLight.shadow.camera.top = 400
    shadowLight.shadow.camera.bottom = -400
    shadowLight.shadow.camera.near = 1
    shadowLight.shadow.camera.far = 1000

    // define the resolution of the shadow; the higher the better,
    // but also the more expensive and less performant
    shadowLight.shadow.mapSize.width = 2048
    shadowLight.shadow.mapSize.height = 2048

    // an ambient light modifies the global color of a scene and makes the shadows softer
    var ambientLight = new THREE.AmbientLight(0xdc8874, 0.5)
    this.scene.add(ambientLight)

    // to activate the lights, just add them to the scene
    this.scene.add(hemisphereLight)
    this.scene.add(shadowLight)
  }

  createGrid () {
    var self = this
    this.groupMesh = new THREE.Object3D()

    const material = new THREE.MeshPhongMaterial({
      color: 0x68c3c0,
      transparent: true,
      // opacity:.8,
      shading: THREE.FlatShading
    })
    material.receiveShadow = true

    // Bruno
    // var texture = this.items.informationActivitiesTexture
    // texture.magFilter = THREE.NearestFilter
    // texture.minFilter = THREE.LinearFilter

    // // Material
    // var material = new THREE.MeshBasicMaterial({
    //   wireframe: false,
    //   color: 0xffffff,
    //   alphaMap: texture,
    //   transparent: true
    // })
    // Bruno - end

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
            z: 0.5
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
      console.log('setting up buttons')
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

  /**
   * Set config
   */
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

  drawGuides () {
    var axesHelper = new THREE.AxesHelper(5)
    this.scene.add(axesHelper)
  }

  /**
   * Set debug
   */
  setDebug () {
    if (this.config.debug) {
      this.debug = new dat.GUI({ width: 420 })
    }
  }

  /**
   * Set renderer
   */
  setRenderer () {
    // Scene
    this.scene = new THREE.Scene()

    // Renderer
    this.renderer = new THREE.WebGLRenderer({
      canvas: this.$canvas,
      alpha: true
    })
    // this.renderer.setClearColor(0x414141, 1)
    this.renderer.setClearColor(0x000000, 1)
    // this.renderer.setPixelRatio(Math.min(Math.max(window.devicePixelRatio, 1.5), 2))
    this.renderer.setPixelRatio(2)
    this.renderer.setSize(this.sizes.viewport.width, this.sizes.viewport.height)
    this.renderer.physicallyCorrectLights = true
    this.renderer.gammaFactor = 2.2
    this.renderer.gammaOutPut = true
    this.renderer.autoClear = false

    // Resize event
    this.sizes.on('resize', () => {
      this.renderer.setSize(
        this.sizes.viewport.width,
        this.sizes.viewport.height
      )
    })
  }

  /**
   * Set camera
   */
  setCamera () {
    this.camera = new Camera({
      time: this.time,
      sizes: this.sizes,
      renderer: this.renderer,
      debug: this.debug,
      config: this.config
    })

    this.scene.add(this.camera.instance)

    this.time.on('tick', () => {
      if (this.world && this.world.car) {
        this.camera.target.x = this.world.car.chassis.object.position.x
        this.camera.target.y = this.world.car.chassis.object.position.y
      }
    })
  }

  draw () {
    var self = this
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
    // this.raycaster.setFromCamera(this.mouse3D, self.camera.instance)
    // const intersects = this.raycaster.intersectObjects([this.allCubes[0]])

    // if (intersects.length) {
    //   const { x, z } = intersects[0].point
    //   // console.log('intersects: ' + x)
    //   for (let row = 0; row < this.grid.rows; row++) {
    //     for (let index = 0; index < 1; index++) {
    //       const totalCols = this.getTotalRows(row)

    //       for (let col = 0; col < totalCols; col++) {
    //         const obj = new Object()
    //         obj.mesh = this.meshes[row][col].mesh
    //         obj.pos = this.meshes[row][col].positions

    //         const mouseDistance = distance(
    //           x,
    //           z,
    //           obj.mesh.position.x + this.groupMesh.position.x,
    //           obj.mesh.position.z + this.groupMesh.position.z
    //         )
    //         // Position tween happens here - end

    //         // Scale happens here
    //         // const scaleFactor = mesh.position.y / 1.2
    //         // const scale = scaleFactor < 1 ? 1 : scaleFactor
    //         return
    //         const scaleVal = map(mouseDistance, 4, 0, 1, 2)
    //         // console.log(mouseDistance)
    //         // const scale = (1 / y) * 0.1
    //         const scale = scaleVal
    //         TweenMax.to(obj.mesh.scale, 0.3, {
    //           ease: Expo.easeOut,
    //           x: scale,
    //           y: scale,
    //           z: scale
    //         })
    //         // Scale happens here - end

    //         // Rotation happens here
    //         // TweenMax.to(mesh.rotation, 0.7, {
    //         //   ease: Expo.easeOut,
    //         //   x: map(
    //         //     mesh.position.y,
    //         //     -1,
    //         //     1,
    //         //     radians(270),
    //         //     mesh.initialRotation.x
    //         //   ),
    //         //   z: map(
    //         //     mesh.position.y,
    //         //     -1,
    //         //     1,
    //         //     radians(-90),
    //         //     mesh.initialRotation.z
    //         //   ),
    //         //   y: map(
    //         //     mesh.position.y,
    //         //     -1,
    //         //     1,
    //         //     radians(45),
    //         //     mesh.initialRotation.y
    //         //   )
    //         // })
    //         // Rotation happens here - end
    //       }
    //     }
    //   }
    // }
  }

  updateBoxes () {
    this.time.on('tick', () => {
      this.draw()
    })
  }

  setPasses () {
    this.passes = {}

    // Debug
    if (this.debug) {
      this.passes.debugFolder = this.debug.addFolder('postprocess')
      // this.passes.debugFolder.open()
    }

    console.log('logging renderer: ' + JSON.stringify(this.renderer))
    // console.log('logging renderer: ' + this.renderer.width)

    this.passes.composer = new EffectComposer(this.renderer)

    // Create passes
    this.passes.renderPass = new RenderPass(this.scene, this.camera.instance)

    this.passes.horizontalBlurPass = new ShaderPass(BlurPass)
    this.passes.horizontalBlurPass.strength = this.config.touch ? 0 : 1
    this.passes.horizontalBlurPass.material.uniforms.uResolution.value = new THREE.Vector2(
      this.sizes.viewport.width,
      this.sizes.viewport.height
    )
    this.passes.horizontalBlurPass.material.uniforms.uStrength.value = new THREE.Vector2(
      this.passes.horizontalBlurPass.strength,
      0
    )

    this.passes.verticalBlurPass = new ShaderPass(BlurPass)
    this.passes.verticalBlurPass.strength = this.config.touch ? 0 : 1
    this.passes.verticalBlurPass.material.uniforms.uResolution.value = new THREE.Vector2(
      this.sizes.viewport.width,
      this.sizes.viewport.height
    )
    this.passes.verticalBlurPass.material.uniforms.uStrength.value = new THREE.Vector2(
      0,
      this.passes.verticalBlurPass.strength
    )

    // Debug
    if (this.debug) {
      const folder = this.passes.debugFolder.addFolder('blur')
      folder.open()

      folder
        .add(
          this.passes.horizontalBlurPass.material.uniforms.uStrength.value,
          'x'
        )
        .step(0.001)
        .min(0)
        .max(10)
      folder
        .add(
          this.passes.verticalBlurPass.material.uniforms.uStrength.value,
          'y'
        )
        .step(0.001)
        .min(0)
        .max(10)
    }

    this.passes.glowsPass = new ShaderPass(GlowsPass)
    this.passes.glowsPass.color = '#ffcfe0'
    this.passes.glowsPass.material.uniforms.uPosition.value = new THREE.Vector2(
      0,
      0.25
    )
    this.passes.glowsPass.material.uniforms.uRadius.value = 0.7
    this.passes.glowsPass.material.uniforms.uColor.value = new THREE.Color(
      this.passes.glowsPass.color
    )
    // this.passes.glowsPass.material.uniforms.uAlpha.value = 0.55 // Org value: 0.55
    this.passes.glowsPass.material.uniforms.uAlpha.value = 0.0

    // Debug
    if (this.debug) {
      const folder = this.passes.debugFolder.addFolder('glows')
      folder.open()

      folder
        .add(this.passes.glowsPass.material.uniforms.uPosition.value, 'x')
        .step(0.001)
        .min(-1)
        .max(2)
        .name('positionX')
      folder
        .add(this.passes.glowsPass.material.uniforms.uPosition.value, 'y')
        .step(0.001)
        .min(-1)
        .max(2)
        .name('positionY')
      folder
        .add(this.passes.glowsPass.material.uniforms.uRadius, 'value')
        .step(0.001)
        .min(0)
        .max(2)
        .name('radius')
      folder
        .addColor(this.passes.glowsPass, 'color')
        .name('color')
        .onChange(() => {
          this.passes.glowsPass.material.uniforms.uColor.value = new THREE.Color(
            this.passes.glowsPass.color
          )
        })
      folder
        .add(this.passes.glowsPass.material.uniforms.uAlpha, 'value')
        .step(0.001)
        .min(0)
        .max(1)
        .name('alpha')
    }

    // Add passes
    this.passes.composer.addPass(this.passes.renderPass)
    this.passes.composer.addPass(this.passes.horizontalBlurPass)
    this.passes.composer.addPass(this.passes.verticalBlurPass)
    this.passes.composer.addPass(this.passes.glowsPass)

    // Time tick
    this.time.on('tick', () => {
      this.passes.horizontalBlurPass.enabled =
        this.passes.horizontalBlurPass.material.uniforms.uStrength.value.x > 0
      this.passes.verticalBlurPass.enabled =
        this.passes.verticalBlurPass.material.uniforms.uStrength.value.y > 0

      // Renderer
      this.passes.composer.render()
      // this.renderer.domElement.style.background = 'black'
      // this.renderer.render(this.scene, this.camera.instance)
    })

    // Resize event
    this.sizes.on('resize', () => {
      this.renderer.setSize(
        this.sizes.viewport.width,
        this.sizes.viewport.height
      )
      this.passes.composer.setSize(
        this.sizes.viewport.width,
        this.sizes.viewport.height
      )
      this.passes.horizontalBlurPass.material.uniforms.uResolution.value.x = this.sizes.viewport.width
      this.passes.horizontalBlurPass.material.uniforms.uResolution.value.y = this.sizes.viewport.height
      this.passes.verticalBlurPass.material.uniforms.uResolution.value.x = this.sizes.viewport.width
      this.passes.verticalBlurPass.material.uniforms.uResolution.value.y = this.sizes.viewport.height
    })
  }

  /**
   * Set world
   */
  setWorld () {
    this.world = new World({
      config: this.config,
      debug: this.debug,
      resources: this.resources,
      time: this.time,
      sizes: this.sizes,
      camera: this.camera,
      renderer: this.renderer,
      passes: this.passes
    })
    this.scene.add(this.world.container)
  }

  /**
   * Set title
   */
  setTitle () {
    this.title = {}
    this.title.frequency = 300
    this.title.width = 20
    this.title.position = 0
    this.title.$element = document.querySelector('title')
    this.title.absolutePosition = Math.round(this.title.width * 0.25)

    this.time.on('tick', () => {
      if (this.world.physics) {
        this.title.absolutePosition += this.world.physics.car.forwardSpeed

        if (this.title.absolutePosition < 0) {
          this.title.absolutePosition = 0
        }
      }
    })

    window.setInterval(() => {
      this.title.position = Math.round(
        this.title.absolutePosition % this.title.width
      )

      document.title = `${'_'.repeat(
        this.title.width - this.title.position
      )}🚗${'_'.repeat(this.title.position)}`
    }, this.title.frequency)
  }

  /**
   * Destructor
   */
  destructor () {
    this.time.off('tick')
    this.sizes.off('resize')

    this.camera.orbitControls.dispose()
    this.renderer.dispose()
    this.debug.destroy()
  }
}
