import 'styles/index.scss'
// import Cone from './elements/cone'
// import Torus from './elements/torus'
// import Cylinder from './elements/cylinder'
import { radians, map, distance, hexToRgbTreeJs } from './helpers'
import Box from '../../../second-demo/src/scripts/elements/box'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'

export default class App {
  setup () {
    this.backgroundColor = '#191919'

    this.gutter = { size: 4 } // Org 4
    this.meshes = []
    this.grid = { rows: 20, cols: 20 }
    // this.grid = { cols: 1, rows: 10 }
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

    this.raycaster = new THREE.Raycaster()
  }

  createScene () {
    this.scene = new THREE.Scene()

    this.scene.background = new THREE.Color(0x000000) // Black background
    this.scene.fog = new THREE.Fog(0x000000, 20, 60)

    this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true })
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
    const obj = { color1: '#eed4aa', color2: '#fb985c' }
    const ambLight = new THREE.AmbientLight(obj.color1, 1)
    const ambLight2 = new THREE.AmbientLight(obj.color2, 1)
    // const light = new THREE.AmbientLight('#ffffff', 1)
    this.scene.add(ambLight)
    this.scene.add(ambLight2)

    const gui = this.gui.addFolder('Ambient Light 1')

    gui.addColor(obj, 'color1').onChange(color => {
      ambLight.color = hexToRgbTreeJs(color)
    })
  }

  addSpotLight () {
    // Spot light
    // const spLight = new THREE.SpotLight('#7bccd7', 1, 1000)

    // spLight.position.set(0, 27, 0)
    // spLight.castShadow = true

    // this.scene.add(spLight)

    // Point light
    var light = new THREE.PointLight(0xff0000, 1, 1000)
    light.position.set(0, 10, 0)
    this.scene.add(light)
  }

  addOtherLight () {
    // Hemispheric light
    var hemiLight = new THREE.HemisphereLight(0xffffff, 0xffffff, 0.6)
    hemiLight.color.setHSL(0.6, 1, 0.6)
    hemiLight.groundColor.setHSL(0.095, 1, 0.75)
    hemiLight.position.set(0, 50, 0)
    this.scene.add(hemiLight)

    var dirLight = new THREE.DirectionalLight(0xffffff, 1)
    dirLight.color.setHSL(0.1, 1, 0.95)
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
    this.floor.position.y = -1
    this.floor.receiveShadow = true;
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
          const geometry = this.geometries[0]
          const mesh = this.getMesh(geometry.geom, material)
          self.allCubes.push(mesh)

          // mesh.position.y = 0
          // mesh.position.x = col + col * this.gutter.size + (totalCol === this.grid.cols ? 0 : 2.5)
          // mesh.position.z = row + row * (index + 0.25)

          mesh.position.y = 0
          mesh.position.x = col / 2
          mesh.position.z = row / 2

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

          this.meshes[row][col] = mesh
        }
      }
    }

    // const centerX = -(this.grid.cols / 2) * this.gutter.size - 1
    // const centerZ = -(this.grid.rows / 2) - 0.8

    const centerX = -this.grid.cols / 4
    const centerZ = -this.grid.rows / 4

    this.groupMesh.position.set(centerX, -0.75, centerZ)

    this.scene.add(this.groupMesh)
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

  draw () {
    var self = this
    this.raycaster.setFromCamera(this.mouse3D, self.camera)

    const intersects = this.raycaster.intersectObjects([this.floor])
    // console.log('floor type of: ' + this.floor)
    // console.log('box 1 type of: ' + this.allCubes[0])
    // const intersects = this.raycaster.intersectObjects([this.allCubes[0]])

    if (intersects.length) {
      const { x, z } = intersects[0].point
      
      // console.log('intersects: ' + x)
      for (let row = 0; row < this.grid.rows; row++) {
        for (let index = 0; index < 1; index++) {
          const totalCols = this.getTotalRows(row)

          for (let col = 0; col < totalCols; col++) {
            const mesh = this.meshes[row][col]

            const mouseDistance = distance(
              x,
              z,
              mesh.position.x + this.groupMesh.position.x,
              mesh.position.z + this.groupMesh.position.z
            )
            
            // Position tween happens here
            // const y = map(mouseDistance, 7, 0, 0, 6) // Org
            // const y = map(mouseDistance, 4, 0, 0, 4)
            // TweenMax.to(mesh.position, 0.3, { y: y < 1 ? 1 : y })
            // Position tween happens here - end
            
            // Scale happens here
            // const scaleFactor = mesh.position.y / 1.2
            // const scale = scaleFactor < 1 ? 1 : scaleFactor
            const scaleVal = map(mouseDistance, 4, 0, 1, 2)
            console.log(mouseDistance)
            // const scale = (1 / y) * 0.1
            const scale = scaleVal
            TweenMax.to(mesh.scale, 0.3, {
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

  init () {
    this.setup()

    this.createScene()

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
}
