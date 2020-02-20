import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import { TweenLite } from 'gsap/TweenLite'
import { Power1 } from 'gsap/EasePack'

export default class Camera
{
    constructor(_options)
    {
        // Options
        this.time = _options.time
        this.sizes = _options.sizes
        this.renderer = _options.renderer
        this.debug = _options.debug
        this.config = _options.config

        // Set up
        this.target = new THREE.Vector3(0, 0, 0)
        this.targetEased = new THREE.Vector3(0, 0, 0)
        this.easing = 0.15

        // Debug
        if(this.debug)
        {
            this.debugFolder = this.debug.addFolder('camera')
            // this.debugFolder.open()
        }

        this.setAngle()
        this.setInstance()
        this.setZoom()
        this.setOrbitControls()

        // Setup mouse events and raycasting
        this.setUpEvents()
    }

    setAngle()
    {
        // Set up
        this.angle = {}

        // Items
        this.angle.items = {
            // default: new THREE.Vector3(20.135, - 20.45, 20.15), // Robot game
            default: new THREE.Vector3(0, -Math.PI / 4 , 20), // org: (1.135, - 1.45, 1.15)
            projects: new THREE.Vector3(0.38, - 1.4, 1.63)
        }

        // Value
        this.angle.value = new THREE.Vector3()
        this.angle.value.copy(this.angle.items.default)

        // Set method
        this.angle.set = (_name) =>
        {
            const angle = this.angle.items[_name]
            if(typeof angle !== 'undefined')
            {
                TweenLite.to(this.angle.value, 2, { ...angle, ease: Power1.easeInOut })
            }
        }

        // Debug
        if(this.debug)
        {
            this.debugFolder.add(this, 'easing').step(0.0001).min(0).max(1).name('easing')
            this.debugFolder.add(this.angle.value, 'x').step(0.001).min(- 2).max(2).name('invertDirectionX').listen()
            this.debugFolder.add(this.angle.value, 'y').step(0.001).min(- 2).max(2).name('invertDirectionY').listen()
            this.debugFolder.add(this.angle.value, 'z').step(0.001).min(- 2).max(2).name('invertDirectionZ').listen()
        }
    }

    setInstance()
    {
        // Set up. Clipping plane is provided by last two arguments
        this.instance = new THREE.PerspectiveCamera(40, this.sizes.viewport.width / this.sizes.viewport.height, 1, 180)
        // this.instance = new THREE.OrthographicCamera(0, this.sizes.viewport.width, 0, this.sizes.viewport.height, 1, 180)
        this.instance.up.set(0, 0, 1)
        this.instance.rotation.y = 90 * Math.PI / 180
        this.instance.position.copy(this.angle.value)
        this.instance.lookAt(new THREE.Vector3())

        // Resize event
        this.sizes.on('resize', () =>
        {
            this.instance.aspect = this.sizes.viewport.width / this.sizes.viewport.height
            this.instance.updateProjectionMatrix()
        })

        // Time tick
        this.time.on('tick', () =>
        {
            if(!this.orbitControls.enabled)
            {
                this.targetEased.x += (this.target.x - this.targetEased.x) * this.easing
                this.targetEased.y += (this.target.y - this.targetEased.y) * this.easing
                this.targetEased.z += (this.target.z - this.targetEased.z) * this.easing

                this.instance.position.copy(this.targetEased).add(this.angle.value.clone().normalize().multiplyScalar(this.zoom.distance))

                this.instance.lookAt(this.targetEased)
            }
        })
    }

    setZoom()
    {
        // Set up
        this.zoom = {}
        this.zoom.easing = 0.1
        this.zoom.minDistance = 14
        this.zoom.amplitude = 15
        this.zoom.value = this.config.cyberTruck ? 0.3 : 0.5
        this.zoom.targetValue = this.zoom.value
        this.zoom.distance = this.zoom.minDistance + this.zoom.amplitude * this.zoom.value

        // Listen to mousewheel event
        document.addEventListener('mousewheel', (_event) =>
        {
            // this.zoom.targetValue += _event.deltaY * 0.001
            // this.zoom.targetValue = Math.min(Math.max(this.zoom.targetValue, 0), 1)

            // console.log(_event)
            // this.instance.position.x = _event.deltaY * 0.05
            
        }, { passive: true })

        // Time tick event
        this.time.on('tick', () =>
        {
            this.zoom.value += (this.zoom.targetValue - this.zoom.value) * this.zoom.easing
            this.zoom.distance = this.zoom.minDistance + this.zoom.amplitude * this.zoom.value
        })
    }

    setOrbitControls()
    {
        
        // Set up
        this.orbitControls = new OrbitControls(this.instance, this.renderer.domElement)
        // this.orbitControls.enabled = true /* This disables touch devices */
        this.orbitControls.enabled = false /* Only with this as false touch devices work */
        this.orbitControls.enableKeys = false
        this.orbitControls.zoomSpeed = 0.5

        // Constrain orbit angle, vertically. Approximately at a 45 degrees angle
        // this.orbitControls.minPolarAngle = Math.PI/4 // radians
        // this.orbitControls.maxPolarAngle = Math.PI/4 // radians

        this.orbitControls.addEventListener('change', (e) => {
            // var zoomDistance = this.orbitControls.distanceTo( new THREE.Vector3(0, 0, 0) )
            // e.preventDefault()
            // e.stopPropagation()
            console.log(this)
            // console.log(this.zoom.distance)
            // this.instance.position.y -= 1
        })
        
        // No pan
        this.orbitControls.enablePan = false
        // this.orbitControls.enableZoom = false

        // Debug
        if(this.debug)
        {
            this.debugFolder.add(this.orbitControls, 'enabled').name('orbitControlsEnabled')
        }
    }

    setUpEvents() {
        
        // Add raycaster and mouse as 2D vector
        // var raycaster = new THREE.Raycaster()
        // var mouse = new THREE.Vector2()

        // Mouse wheel event
        // window.addEventListener('mousewheel', (_event) =>
        // {
        //     console.log(`event is:`)
        //     console.log(_event)
        //     this.instance.position.x = _event.deltaY * 0.05
        // })

        // Add eventlisteners for mouse and touch devices
        // document.addEventListener('mousedown', this.setTouchAndCursorEvents, false)
        // document.addEventListener('touchstart', this.setTouchAndCursorEvents, false)
    }

    setTouchAndCursorEvents(event) {
        event.preventDefault()
        var clientX = event.touches[0].clienX
        var clientY = event.touches[0].clienY
        console.log(clientX + ', ' + clientY)
    }
}
