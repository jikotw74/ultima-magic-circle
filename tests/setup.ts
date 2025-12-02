import { vi } from 'vitest';

// Create a more comprehensive WebGL2 mock
const createMockWebGL2Context = () => {
  const canvas = { width: 800, height: 600 };

  return {
    // Version and parameters
    getParameter: vi.fn((param: number) => {
      if (param === 0x1F02) return 'WebGL 2.0'; // GL_VERSION
      if (param === 0x8B8C) return 16; // MAX_VERTEX_TEXTURE_IMAGE_UNITS
      if (param === 0x8872) return 16; // MAX_TEXTURE_IMAGE_UNITS
      if (param === 0x0D33) return 16384; // MAX_TEXTURE_SIZE
      if (param === 0x851C) return 16384; // MAX_CUBE_MAP_TEXTURE_SIZE
      if (param === 0x8869) return 16; // MAX_VERTEX_ATTRIBS
      if (param === 0x8DFB) return 1024; // MAX_VARYING_VECTORS
      if (param === 0x8B4A) return 256; // MAX_VERTEX_UNIFORM_VECTORS
      if (param === 0x8DFD) return 256; // MAX_FRAGMENT_UNIFORM_VECTORS
      if (param === 0x84E8) return 16; // MAX_COMBINED_TEXTURE_IMAGE_UNITS
      if (param === 0x8B4D) return 2048; // MAX_VERTEX_UNIFORM_COMPONENTS
      if (param === 0x8B49) return 2048; // MAX_FRAGMENT_UNIFORM_COMPONENTS
      if (param === 0x0B73) return 4; // MAX_VIEWPORT_DIMS
      if (param === 0x846E) return 16; // MAX_TEXTURE_MAX_ANISOTROPY_EXT
      if (param === 0x9125) return 16; // MAX_SAMPLES
      if (param === 0x8D57) return 8; // MAX_COLOR_ATTACHMENTS
      if (param === 0x8824) return 8; // MAX_DRAW_BUFFERS
      return 0;
    }),
    getExtension: vi.fn((name: string) => {
      if (name === 'WEBGL_debug_renderer_info') return null;
      if (name === 'EXT_color_buffer_float') return {};
      if (name === 'EXT_texture_filter_anisotropic') return {};
      return {};
    }),
    getSupportedExtensions: vi.fn(() => []),

    // Shader related
    createShader: vi.fn(() => ({})),
    shaderSource: vi.fn(),
    compileShader: vi.fn(),
    getShaderParameter: vi.fn(() => true),
    getShaderInfoLog: vi.fn(() => ''),
    deleteShader: vi.fn(),

    // Program related
    createProgram: vi.fn(() => ({})),
    attachShader: vi.fn(),
    linkProgram: vi.fn(),
    getProgramParameter: vi.fn(() => true),
    getProgramInfoLog: vi.fn(() => ''),
    useProgram: vi.fn(),
    deleteProgram: vi.fn(),
    validateProgram: vi.fn(),

    // Buffer related
    createBuffer: vi.fn(() => ({})),
    bindBuffer: vi.fn(),
    bufferData: vi.fn(),
    bufferSubData: vi.fn(),
    deleteBuffer: vi.fn(),

    // Vertex attributes
    enableVertexAttribArray: vi.fn(),
    disableVertexAttribArray: vi.fn(),
    vertexAttribPointer: vi.fn(),
    vertexAttribDivisor: vi.fn(),
    getAttribLocation: vi.fn(() => 0),
    bindAttribLocation: vi.fn(),

    // Uniforms
    getUniformLocation: vi.fn(() => ({})),
    uniformMatrix4fv: vi.fn(),
    uniformMatrix3fv: vi.fn(),
    uniform1f: vi.fn(),
    uniform1i: vi.fn(),
    uniform2f: vi.fn(),
    uniform2i: vi.fn(),
    uniform3f: vi.fn(),
    uniform3i: vi.fn(),
    uniform4f: vi.fn(),
    uniform4i: vi.fn(),
    uniform1fv: vi.fn(),
    uniform2fv: vi.fn(),
    uniform3fv: vi.fn(),
    uniform4fv: vi.fn(),

    // Drawing
    drawArrays: vi.fn(),
    drawElements: vi.fn(),
    drawArraysInstanced: vi.fn(),
    drawElementsInstanced: vi.fn(),

    // State
    clear: vi.fn(),
    clearColor: vi.fn(),
    clearDepth: vi.fn(),
    clearStencil: vi.fn(),
    enable: vi.fn(),
    disable: vi.fn(),
    blendFunc: vi.fn(),
    blendFuncSeparate: vi.fn(),
    blendEquation: vi.fn(),
    blendEquationSeparate: vi.fn(),
    depthFunc: vi.fn(),
    depthMask: vi.fn(),
    depthRange: vi.fn(),
    colorMask: vi.fn(),
    cullFace: vi.fn(),
    frontFace: vi.fn(),
    lineWidth: vi.fn(),
    polygonOffset: vi.fn(),
    scissor: vi.fn(),
    viewport: vi.fn(),
    stencilFunc: vi.fn(),
    stencilMask: vi.fn(),
    stencilOp: vi.fn(),
    stencilFuncSeparate: vi.fn(),
    stencilMaskSeparate: vi.fn(),
    stencilOpSeparate: vi.fn(),

    // Textures
    createTexture: vi.fn(() => ({})),
    bindTexture: vi.fn(),
    texImage2D: vi.fn(),
    texSubImage2D: vi.fn(),
    texParameteri: vi.fn(),
    texParameterf: vi.fn(),
    generateMipmap: vi.fn(),
    deleteTexture: vi.fn(),
    activeTexture: vi.fn(),
    pixelStorei: vi.fn(),

    // Framebuffer
    createFramebuffer: vi.fn(() => ({})),
    bindFramebuffer: vi.fn(),
    framebufferTexture2D: vi.fn(),
    framebufferRenderbuffer: vi.fn(),
    checkFramebufferStatus: vi.fn(() => 0x8CD5), // FRAMEBUFFER_COMPLETE
    deleteFramebuffer: vi.fn(),
    readPixels: vi.fn(),
    drawBuffers: vi.fn(),

    // Renderbuffer
    createRenderbuffer: vi.fn(() => ({})),
    bindRenderbuffer: vi.fn(),
    renderbufferStorage: vi.fn(),
    renderbufferStorageMultisample: vi.fn(),
    deleteRenderbuffer: vi.fn(),

    // VAO (WebGL2)
    createVertexArray: vi.fn(() => ({})),
    bindVertexArray: vi.fn(),
    deleteVertexArray: vi.fn(),

    // UBO (WebGL2)
    createTransformFeedback: vi.fn(() => ({})),
    bindTransformFeedback: vi.fn(),
    bindBufferBase: vi.fn(),
    getUniformBlockIndex: vi.fn(() => 0),
    uniformBlockBinding: vi.fn(),

    // Query
    createQuery: vi.fn(() => ({})),
    beginQuery: vi.fn(),
    endQuery: vi.fn(),
    deleteQuery: vi.fn(),
    getQueryParameter: vi.fn(() => true),

    // Sync
    fenceSync: vi.fn(() => ({})),
    clientWaitSync: vi.fn(() => 0x911A), // ALREADY_SIGNALED
    deleteSync: vi.fn(),

    // Misc
    getError: vi.fn(() => 0),
    flush: vi.fn(),
    finish: vi.fn(),
    isContextLost: vi.fn(() => false),
    getContextAttributes: vi.fn(() => ({
      alpha: true,
      antialias: true,
      depth: true,
      stencil: false,
      premultipliedAlpha: true,
      preserveDrawingBuffer: false,
      powerPreference: 'default',
    })),
    getShaderPrecisionFormat: vi.fn(() => ({
      rangeMin: 127,
      rangeMax: 127,
      precision: 23,
    })),

    // Properties
    canvas,
    drawingBufferWidth: canvas.width,
    drawingBufferHeight: canvas.height,

    // Constants (WebGL2)
    ARRAY_BUFFER: 0x8892,
    ELEMENT_ARRAY_BUFFER: 0x8893,
    STATIC_DRAW: 0x88E4,
    DYNAMIC_DRAW: 0x88E8,
    FLOAT: 0x1406,
    UNSIGNED_SHORT: 0x1403,
    UNSIGNED_INT: 0x1405,
    TRIANGLES: 0x0004,
    POINTS: 0x0000,
    LINES: 0x0001,
    TEXTURE_2D: 0x0DE1,
    TEXTURE_CUBE_MAP: 0x8513,
    RGBA: 0x1908,
    RGB: 0x1907,
    UNSIGNED_BYTE: 0x1401,
    FRAMEBUFFER: 0x8D40,
    RENDERBUFFER: 0x8D41,
    DEPTH_COMPONENT16: 0x81A5,
    DEPTH_COMPONENT24: 0x81A6,
    STENCIL_INDEX8: 0x8D48,
    COLOR_ATTACHMENT0: 0x8CE0,
    DEPTH_ATTACHMENT: 0x8D00,
    STENCIL_ATTACHMENT: 0x8D20,
    DEPTH_STENCIL_ATTACHMENT: 0x821A,
    VERTEX_SHADER: 0x8B31,
    FRAGMENT_SHADER: 0x8B30,
    COMPILE_STATUS: 0x8B81,
    LINK_STATUS: 0x8B82,
    NEAREST: 0x2600,
    LINEAR: 0x2601,
    TEXTURE_MAG_FILTER: 0x2800,
    TEXTURE_MIN_FILTER: 0x2801,
    TEXTURE_WRAP_S: 0x2802,
    TEXTURE_WRAP_T: 0x2803,
    CLAMP_TO_EDGE: 0x812F,
    REPEAT: 0x2901,
    BLEND: 0x0BE2,
    DEPTH_TEST: 0x0B71,
    CULL_FACE: 0x0B44,
    SRC_ALPHA: 0x0302,
    ONE_MINUS_SRC_ALPHA: 0x0303,
    ONE: 1,
    ZERO: 0,
    LESS: 0x0201,
    LEQUAL: 0x0203,
    BACK: 0x0405,
    CCW: 0x0901,
  };
};

const mockWebGLContext = createMockWebGL2Context();

// Mock HTMLCanvasElement.getContext
HTMLCanvasElement.prototype.getContext = vi.fn((contextType: string) => {
  if (contextType === 'webgl' || contextType === 'webgl2') {
    return mockWebGLContext;
  }
  if (contextType === '2d') {
    return {
      save: vi.fn(),
      restore: vi.fn(),
      scale: vi.fn(),
      drawImage: vi.fn(),
      fillRect: vi.fn(),
      clearRect: vi.fn(),
    };
  }
  return null;
}) as unknown as typeof HTMLCanvasElement.prototype.getContext;

// Mock requestAnimationFrame
globalThis.requestAnimationFrame = vi.fn((callback) => {
  return setTimeout(callback, 16) as unknown as number;
});

globalThis.cancelAnimationFrame = vi.fn((id) => {
  clearTimeout(id);
});

// Mock ResizeObserver
globalThis.ResizeObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
})) as unknown as typeof ResizeObserver;

// Mock MediaPipe Hands
vi.mock('@mediapipe/hands', () => ({
  Hands: vi.fn().mockImplementation(() => ({
    setOptions: vi.fn(),
    onResults: vi.fn(),
    send: vi.fn().mockResolvedValue(undefined),
    close: vi.fn(),
  })),
  HAND_CONNECTIONS: [],
}));

// Mock MediaPipe Camera Utils
vi.mock('@mediapipe/camera_utils', () => ({
  Camera: vi.fn().mockImplementation(() => ({
    start: vi.fn().mockResolvedValue(undefined),
    stop: vi.fn(),
  })),
}));

// Mock navigator.mediaDevices
Object.defineProperty(navigator, 'mediaDevices', {
  value: {
    getUserMedia: vi.fn().mockResolvedValue({
      getTracks: () => [{ stop: vi.fn() }],
    }),
    enumerateDevices: vi.fn().mockResolvedValue([]),
  },
  writable: true,
});

// Suppress console warnings during tests
vi.spyOn(console, 'warn').mockImplementation(() => {});
vi.spyOn(console, 'error').mockImplementation(() => {});
