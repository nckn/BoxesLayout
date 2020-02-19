// import App from './scripts/app';

export default class Button {
  constructor(_options) {
    this.name = _options.name;
    this.size = 24;
    this.position = [];
    this.color = _options.color;
    this.pos = _options.pos;
    this.img = _options.img;
    this.baseUrl = './src/static/svg/'
    // Run initialization
    this.init();
  }

  setup () {
    var button = document.createElement('div')
    button = document.createElement('div')
    button.setAttribute('name', this.name)
    this.button = button
    document.body.appendChild(button)
    // Apply styling
    this.styling()
    // Setup eventlisteners
    // this.setupEventListeners()
  } 
  
  styling () {
    var btn = this.button
    // btn.style.backgroundColor = this.color
    btn.style.left = this.pos.x
    btn.style.top = this.pos.y
    btn.classList.add('button')
    // Set background image
    btn.style.backgroundImage = `url(${this.baseUrl}${this.img}`;
  }
  
  // handleInteraction(evt) {
  //   evt.preventDefault()
  //   console.log('interacted')
  //   // App.testThisShit()
  // }

  // setupEventListeners () {
  //   var self = this
  //   var el = this.button
  //   el.addEventListener('touchstart', self.handleInteraction)
  //   el.addEventListener('click', self.handleInteraction)
  //   // this.button.addEventListener
  // }

  init () {
    this.setup()
  }
  
  // putPositions (text) {
  //   alert(text)
  // }
  
}
