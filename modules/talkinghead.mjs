import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { FBXLoader } from 'three/addons/loaders/FBXLoader.js';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';

/**
* @class Talking Head speaking Finnish
* @author Mika Suominen
*/
class TalkingHead {

  /**
  * Avatar.
  * @typedef {Object} Avatar
  * @property {string} url URL for the GLB file
  * @property {string} [body] Body form 'M' or 'F'
  * @property {string} [ttsLang] Language name, e.g. "fi-FI"
  * @property {voice} [ttsVoice] Voice name.
  * @property {numeric} [ttsRate] Voice rate.
  * @property {numeric} [ttsPitch] Voice pitch.
  * @property {numeric} [ttsVolume] Voice volume.
  * @property {string} [avatarMood] Initial mood.
  * @property {boolean} [avatarMute] If true, muted.
  */

  /**
  * Avatars.
  * @typedef {Object} Avatars
  * @property {Avatar.<string>} name Unique name of the avatar.
  */

  /**
  * Loading progress.
  * @callback progressfn
  * @param {string} url URL of the resource
  * @param {Object} event Progress event
  * @param {boolean} event.lengthComputable If false, total is not known
  * @param {number} event.loaded Number of loaded items
  * @param {number} event.total Number of total items
  */

  /**
  * Callback when new subtitles have been written to the DOM node.
  * @callback subtitlesfn
  * @param {Object} node DOM node
  */

  /**
  * @constructor
  * @param {Object} node DOM element of the avatar
  * @param {Object} [opt=null] Default/global options
  */
  constructor(node, opt = null ) {
    this.nodeAvatar = node;
    this.opt = {
      jwtGet: null, // Function to get JSON Web Token
      ttsEndpoint: null,
      ttsApikey: null,
      ttsTrimStart: 0,
      ttsTrimEnd: 300,
      ttsLang: "fi-FI",
      ttsVoice: "fi-FI-Standard-A",
      ttsRate: 0.95,
      ttsPitch: 0,
      ttsVolume: 0,
      modelPixelRatio: 1,
      modelFPS: 30,
      cameraView: 'full',
      cameraDistance: 0,
      cameraX: 0,
      cameraY: 0,
      cameraRotateX: 0,
      cameraRotateY: 0,
      cameraRotateEnable: true,
      cameraPanEnable: false,
      cameraZoomEnable: false,
      avatarMood: "neutral",
      avatarMute: false,
      markedOptions: { mangle:false, headerIds:false, breaks: true }
    };
    Object.assign( this.opt, opt || {} );


    // Pose templates
    // NOTE: The body weight on each pose should be on left foot
    // for most natural result.
    this.poseTemplates = {
      'side': {
        'Hips.position':{x:0, y:1, z:0}, 'Hips.rotation':{x:-0.003, y:-0.017, z:0.1}, 'Spine.rotation':{x:-0.103, y:-0.002, z:-0.063}, 'Spine1.rotation':{x:0.042, y:-0.02, z:-0.069}, 'Spine2.rotation':{x:0.131, y:-0.012, z:-0.065}, 'Neck.rotation':{x:0.027, y:0.006, z:0}, 'Head.rotation':{x:0.077, y:-0.065, z:0}, 'LeftShoulder.rotation':{x:1.599, y:0.084, z:-1.77}, 'LeftArm.rotation':{x:1.364, y:0.052, z:-0.044}, 'LeftForeArm.rotation':{x:0.002, y:-0.007, z:0.331}, 'LeftHand.rotation':{x:0.104, y:-0.067, z:-0.174}, 'LeftHandThumb1.rotation':{x:0.231, y:0.258, z:0.355}, 'LeftHandThumb2.rotation':{x:-0.106, y:-0.339, z:-0.454}, 'LeftHandThumb3.rotation':{x:-0.02, y:-0.142, z:-0.004}, 'LeftHandIndex1.rotation':{x:0.148, y:0.032, z:-0.069}, 'LeftHandIndex2.rotation':{x:0.326, y:-0.049, z:-0.029}, 'LeftHandIndex3.rotation':{x:0.247, y:-0.053, z:-0.073}, 'LeftHandMiddle1.rotation':{x:0.238, y:-0.057, z:-0.089}, 'LeftHandMiddle2.rotation':{x:0.469, y:-0.036, z:-0.081}, 'LeftHandMiddle3.rotation':{x:0.206, y:-0.015, z:-0.017}, 'LeftHandRing1.rotation':{x:0.187, y:-0.118, z:-0.157}, 'LeftHandRing2.rotation':{x:0.579, y:0.02, z:-0.097}, 'LeftHandRing3.rotation':{x:0.272, y:0.021, z:-0.063}, 'LeftHandPinky1.rotation':{x:0.405, y:-0.182, z:-0.138}, 'LeftHandPinky2.rotation':{x:0.613, y:0.128, z:-0.144}, 'LeftHandPinky3.rotation':{x:0.268, y:0.094, z:-0.081}, 'RightShoulder.rotation':{x:1.541, y:0.192, z:1.775}, 'RightArm.rotation':{x:1.273, y:-0.352, z:-0.067}, 'RightForeArm.rotation':{x:-0.011, y:-0.031, z:-0.357}, 'RightHand.rotation':{x:-0.008, y:0.312, z:-0.028}, 'RightHandThumb1.rotation':{x:0.23, y:-0.258, z:-0.355}, 'RightHandThumb2.rotation':{x:-0.107, y:0.339, z:0.454}, 'RightHandThumb3.rotation':{x:-0.02, y:0.142, z:0.004}, 'RightHandIndex1.rotation':{x:0.148, y:-0.031, z:0.069}, 'RightHandIndex2.rotation':{x:0.326, y:0.049, z:0.029}, 'RightHandIndex3.rotation':{x:0.247, y:0.053, z:0.073}, 'RightHandMiddle1.rotation':{x:0.237, y:0.057, z:0.089}, 'RightHandMiddle2.rotation':{x:0.469, y:0.036, z:0.081}, 'RightHandMiddle3.rotation':{x:0.206, y:0.015, z:0.017}, 'RightHandRing1.rotation':{x:0.204, y:0.086, z:0.135}, 'RightHandRing2.rotation':{x:0.579, y:-0.02, z:0.098}, 'RightHandRing3.rotation':{x:0.272, y:-0.021, z:0.063}, 'RightHandPinky1.rotation':{x:0.404, y:0.182, z:0.137}, 'RightHandPinky2.rotation':{x:0.613, y:-0.128, z:0.144}, 'RightHandPinky3.rotation':{x:0.268, y:-0.094, z:0.081}, 'LeftUpLeg.rotation':{x:0.096, y:0.209, z:2.983}, 'LeftLeg.rotation':{x:-0.053, y:0.042, z:-0.017}, 'LeftFoot.rotation':{x:1.091, y:0.15, z:0.026}, 'LeftToeBase.rotation':{x:0.469, y:-0.07, z:-0.015}, 'RightUpLeg.rotation':{x:-0.307, y:-0.219, z:2.912}, 'RightLeg.rotation':{x:-0.359, y:0.164, z:0.015}, 'RightFoot.rotation':{x:1.035, y:0.11, z:0.005}, 'RightToeBase.rotation':{x:0.467, y:0.07, z:0.015}, 'LeftShoulder.position':{x:0.062, y:0.105, z:-0.012}, 'RightShoulder.position':{x:-0.062, y:0.105, z:-0.012}
      },

      'hip':{
        'Hips.position':{x:0,y:1,z:0}, 'Hips.rotation':{x:-0.036,y:0.09,z:0.135}, 'Spine.rotation':{x:0.076,y:-0.035,z:0.01}, 'Spine1.rotation':{x:-0.096,y:0.013,z:-0.094}, 'Spine2.rotation':{x:-0.014,y:0.002,z:-0.097}, 'Neck.rotation':{x:0.034,y:-0.051,z:-0.075}, 'Head.rotation':{x:0.298,y:-0.1,z:0.154}, 'LeftShoulder.rotation':{x:1.694,y:0.011,z:-1.68}, 'LeftArm.rotation':{x:1.343,y:0.177,z:-0.153}, 'LeftForeArm.rotation':{x:-0.049,y:0.134,z:0.351}, 'LeftHand.rotation':{x:0.057,y:-0.189,z:-0.026}, 'LeftHandThumb1.rotation':{x:0.368,y:-0.066,z:0.438}, 'LeftHandThumb2.rotation':{x:-0.156,y:0.029,z:-0.369}, 'LeftHandThumb3.rotation':{x:0.034,y:-0.009,z:0.016}, 'LeftHandIndex1.rotation':{x:0.157,y:-0.002,z:-0.171}, 'LeftHandIndex2.rotation':{x:0.099,y:0,z:0}, 'LeftHandIndex3.rotation':{x:0.1,y:0,z:0}, 'LeftHandMiddle1.rotation':{x:0.222,y:-0.019,z:-0.16}, 'LeftHandMiddle2.rotation':{x:0.142,y:0,z:0}, 'LeftHandMiddle3.rotation':{x:0.141,y:0,z:0}, 'LeftHandRing1.rotation':{x:0.333,y:-0.039,z:-0.174}, 'LeftHandRing2.rotation':{x:0.214,y:0,z:0}, 'LeftHandRing3.rotation':{x:0.213,y:0,z:0}, 'LeftHandPinky1.rotation':{x:0.483,y:-0.069,z:-0.189}, 'LeftHandPinky2.rotation':{x:0.312,y:0,z:0}, 'LeftHandPinky3.rotation':{x:0.309,y:0,z:0}, 'RightShoulder.rotation':{x:1.597,y:0.012,z:1.816}, 'RightArm.rotation':{x:0.618,y:-1.274,z:-0.266}, 'RightForeArm.rotation':{x:-0.395,y:-0.097,z:-1.342}, 'RightHand.rotation':{x:-0.816,y:-0.057,z:-0.976}, 'RightHandThumb1.rotation':{x:0.42,y:0.23,z:-1.172}, 'RightHandThumb2.rotation':{x:-0.027,y:0.361,z:0.122}, 'RightHandThumb3.rotation':{x:0.076,y:0.125,z:-0.371}, 'RightHandIndex1.rotation':{x:-0.158,y:-0.045,z:0.033}, 'RightHandIndex2.rotation':{x:0.391,y:0.051,z:0.025}, 'RightHandIndex3.rotation':{x:0.317,y:0.058,z:0.07}, 'RightHandMiddle1.rotation':{x:0.486,y:0.066,z:0.014}, 'RightHandMiddle2.rotation':{x:0.718,y:0.055,z:0.07}, 'RightHandMiddle3.rotation':{x:0.453,y:0.019,z:0.013}, 'RightHandRing1.rotation':{x:0.591,y:0.241,z:0.11}, 'RightHandRing2.rotation':{x:1.014,y:0.023,z:0.097}, 'RightHandRing3.rotation':{x:0.708,y:0.008,z:0.066}, 'RightHandPinky1.rotation':{x:1.02,y:0.305,z:0.051}, 'RightHandPinky2.rotation':{x:1.187,y:-0.028,z:0.191}, 'RightHandPinky3.rotation':{x:0.872,y:-0.031,z:0.121}, 'LeftUpLeg.rotation':{x:-0.095,y:-0.058,z:-3.338}, 'LeftLeg.rotation':{x:-0.366,y:0.287,z:-0.021}, 'LeftFoot.rotation':{x:1.131,y:0.21,z:0.176}, 'LeftToeBase.rotation':{x:0.739,y:-0.068,z:-0.001}, 'RightUpLeg.rotation':{x:-0.502,y:0.362,z:3.153}, 'RightLeg.rotation':{x:-1.002,y:0.109,z:0.008}, 'RightFoot.rotation':{x:0.626,y:-0.097,z:-0.194}, 'RightToeBase.rotation':{x:1.33,y:0.288,z:-0.078}
      },

      'turn':{
        'Hips.position':{x:0,y:1,z:0}, 'Hips.rotation':{x:-0.07,y:-0.604,z:-0.004}, 'Spine.rotation':{x:-0.007,y:0.003,z:0.071}, 'Spine1.rotation':{x:-0.053,y:0.024,z:-0.06}, 'Spine2.rotation':{x:0.074,y:0.013,z:-0.068}, 'Neck.rotation':{x:0.03,y:0.186,z:-0.077}, 'Head.rotation':{x:0.045,y:0.243,z:-0.086}, 'LeftShoulder.rotation':{x:1.717,y:-0.085,z:-1.761}, 'LeftArm.rotation':{x:1.314,y:0.07,z:-0.057}, 'LeftForeArm.rotation':{x:-0.151,y:0.714,z:0.302}, 'LeftHand.rotation':{x:-0.069,y:0.003,z:-0.118}, 'LeftHandThumb1.rotation':{x:0.23,y:0.258,z:0.354}, 'LeftHandThumb2.rotation':{x:-0.107,y:-0.338,z:-0.455}, 'LeftHandThumb3.rotation':{x:-0.015,y:-0.142,z:0.002}, 'LeftHandIndex1.rotation':{x:0.145,y:0.032,z:-0.069}, 'LeftHandIndex2.rotation':{x:0.323,y:-0.049,z:-0.028}, 'LeftHandIndex3.rotation':{x:0.249,y:-0.053,z:-0.074}, 'LeftHandMiddle1.rotation':{x:0.235,y:-0.057,z:-0.088}, 'LeftHandMiddle2.rotation':{x:0.468,y:-0.036,z:-0.081}, 'LeftHandMiddle3.rotation':{x:0.203,y:-0.015,z:-0.017}, 'LeftHandRing1.rotation':{x:0.185,y:-0.118,z:-0.157}, 'LeftHandRing2.rotation':{x:0.578,y:0.02,z:-0.097}, 'LeftHandRing3.rotation':{x:0.27,y:0.021,z:-0.063}, 'LeftHandPinky1.rotation':{x:0.404,y:-0.182,z:-0.138}, 'LeftHandPinky2.rotation':{x:0.612,y:0.128,z:-0.144}, 'LeftHandPinky3.rotation':{x:0.267,y:0.094,z:-0.081}, 'RightShoulder.rotation':{x:1.605,y:0.17,z:1.625}, 'RightArm.rotation':{x:1.574,y:-0.655,z:0.388}, 'RightForeArm.rotation':{x:-0.36,y:-0.849,z:-0.465}, 'RightHand.rotation':{x:0.114,y:0.416,z:-0.069}, 'RightHandThumb1.rotation':{x:0.486,y:0.009,z:-0.492}, 'RightHandThumb2.rotation':{x:-0.073,y:-0.01,z:0.284}, 'RightHandThumb3.rotation':{x:-0.054,y:-0.006,z:0.209}, 'RightHandIndex1.rotation':{x:0.245,y:-0.014,z:0.052}, 'RightHandIndex2.rotation':{x:0.155,y:0,z:0}, 'RightHandIndex3.rotation':{x:0.153,y:0,z:0}, 'RightHandMiddle1.rotation':{x:0.238,y:0.004,z:0.028}, 'RightHandMiddle2.rotation':{x:0.15,y:0,z:0}, 'RightHandMiddle3.rotation':{x:0.149,y:0,z:0}, 'RightHandRing1.rotation':{x:0.267,y:0.012,z:0.007}, 'RightHandRing2.rotation':{x:0.169,y:0,z:0}, 'RightHandRing3.rotation':{x:0.167,y:0,z:0}, 'RightHandPinky1.rotation':{x:0.304,y:0.018,z:-0.021}, 'RightHandPinky2.rotation':{x:0.192,y:0,z:0}, 'RightHandPinky3.rotation':{x:0.19,y:0,z:0}, 'LeftUpLeg.rotation':{x:-0.001,y:-0.058,z:-3.238}, 'LeftLeg.rotation':{x:-0.29,y:0.058,z:-0.021}, 'LeftFoot.rotation':{x:1.288,y:0.168,z:0.183}, 'LeftToeBase.rotation':{x:0.363,y:-0.09,z:-0.01}, 'RightUpLeg.rotation':{x:-0.100,y:0.36,z:3.062}, 'RightLeg.rotation':{x:-0.67,y:-0.304,z:0.043}, 'RightFoot.rotation':{x:1.195,y:-0.159,z:-0.294}, 'RightToeBase.rotation':{x:0.737,y:0.164,z:-0.002}
      },

      'bend':{
        'Hips.position':{x:-0.007, y:0.943, z:-0.001}, 'Hips.rotation':{x:1.488, y:-0.633, z:1.435}, 'Spine.rotation':{x:-0.126, y:0.007, z:-0.057}, 'Spine1.rotation':{x:-0.134, y:0.009, z:0.01}, 'Spine2.rotation':{x:-0.019, y:0, z:-0.002}, 'Neck.rotation':{x:-0.159, y:0.572, z:-0.108}, 'Head.rotation':{x:-0.064, y:0.716, z:-0.257}, 'RightShoulder.rotation':{x:1.625, y:-0.043, z:1.382}, 'RightArm.rotation':{x:0.746, y:-0.96, z:-1.009}, 'RightForeArm.rotation':{x:-0.199, y:-0.528, z:-0.38}, 'RightHand.rotation':{x:-0.261, y:-0.043, z:-0.027}, 'RightHandThumb1.rotation':{x:0.172, y:-0.138, z:-0.445}, 'RightHandThumb2.rotation':{x:-0.158, y:0.327, z:0.545}, 'RightHandThumb3.rotation':{x:-0.062, y:0.138, z:0.152}, 'RightHandIndex1.rotation':{x:0.328, y:-0.005, z:0.132}, 'RightHandIndex2.rotation':{x:0.303, y:0.049, z:0.028}, 'RightHandIndex3.rotation':{x:0.241, y:0.046, z:0.077}, 'RightHandMiddle1.rotation':{x:0.309, y:0.074, z:0.089}, 'RightHandMiddle2.rotation':{x:0.392, y:0.036, z:0.081}, 'RightHandMiddle3.rotation':{x:0.199, y:0.014, z:0.019}, 'RightHandRing1.rotation':{x:0.239, y:0.143, z:0.091}, 'RightHandRing2.rotation':{x:0.275, y:-0.02, z:0.097}, 'RightHandRing3.rotation':{x:0.248, y:-0.023, z:0.061}, 'RightHandPinky1.rotation':{x:0.211, y:0.154, z:0.029}, 'RightHandPinky2.rotation':{x:0.348, y:-0.128, z:0.144}, 'RightHandPinky3.rotation':{x:0.21, y:-0.091, z:0.065}, 'LeftShoulder.rotation':{x:1.626, y:-0.027, z:-1.367}, 'LeftArm.rotation':{x:1.048, y:0.737, z:0.712}, 'LeftForeArm.rotation':{x:-0.508, y:0.879, z:0.625}, 'LeftHand.rotation':{x:0.06, y:-0.243, z:-0.079}, 'LeftHandThumb1.rotation':{x:0.187, y:-0.072, z:0.346}, 'LeftHandThumb2.rotation':{x:-0.066, y:0.008, z:-0.256}, 'LeftHandThumb3.rotation':{x:-0.085, y:0.014, z:-0.334}, 'LeftHandIndex1.rotation':{x:-0.1, y:0.016, z:-0.058}, 'LeftHandIndex2.rotation':{x:0.334, y:0, z:0}, 'LeftHandIndex3.rotation':{x:0.281, y:0, z:0}, 'LeftHandMiddle1.rotation':{x:-0.056, y:0, z:0}, 'LeftHandMiddle2.rotation':{x:0.258, y:0, z:0}, 'LeftHandMiddle3.rotation':{x:0.26, y:0, z:0}, 'LeftHandRing1.rotation':{x:-0.067, y:-0.002, z:0.008}, 'LeftHandRing2.rotation':{x:0.259, y:0, z:0}, 'LeftHandRing3.rotation':{x:0.276, y:0, z:0}, 'LeftHandPinky1.rotation':{x:-0.128, y:-0.007, z:0.042}, 'LeftHandPinky2.rotation':{x:0.227, y:0, z:0}, 'LeftHandPinky3.rotation':{x:0.145, y:0, z:0}, 'RightUpLeg.rotation':{x:-1.507, y:0.2, z:-3.043}, 'RightLeg.rotation':{x:-0.689, y:-0.124, z:0.017}, 'RightFoot.rotation':{x:0.909, y:0.008, z:-0.093}, 'RightToeBase.rotation':{x:0.842, y:0.075, z:-0.008}, 'LeftUpLeg.rotation':{x:-1.449, y:-0.2, z:3.018}, 'LeftLeg.rotation':{x:-0.74, y:-0.115, z:-0.008}, 'LeftFoot.rotation':{x:1.048, y:-0.058, z:0.117}, 'LeftToeBase.rotation':{x:0.807, y:-0.067, z:0.003}
      },

      'back':{
        'Hips.position':{x:0,y:1,z:0}, 'Hips.rotation':{x:-0.732,y:-1.463,z:-0.637}, 'Spine.rotation':{x:-0.171,y:0.106,z:0.157}, 'Spine1.rotation':{x:-0.044,y:0.138,z:-0.059}, 'Spine2.rotation':{x:0.082,y:0.133,z:-0.074}, 'Neck.rotation':{x:0.39,y:0.591,z:-0.248}, 'Head.rotation':{x:-0.001,y:0.596,z:-0.057}, 'LeftShoulder.rotation':{x:1.676,y:0.007,z:-1.892}, 'LeftArm.rotation':{x:-5.566,y:1.188,z:-0.173}, 'LeftForeArm.rotation':{x:-0.673,y:-0.105,z:1.702}, 'LeftHand.rotation':{x:-0.469,y:-0.739,z:0.003}, 'LeftHandThumb1.rotation':{x:0.876,y:0.274,z:0.793}, 'LeftHandThumb2.rotation':{x:0.161,y:-0.23,z:-0.172}, 'LeftHandThumb3.rotation':{x:0.078,y:0.027,z:0.156}, 'LeftHandIndex1.rotation':{x:-0.085,y:-0.002,z:0.009}, 'LeftHandIndex2.rotation':{x:0.176,y:0,z:-0.002}, 'LeftHandIndex3.rotation':{x:-0.036,y:0.001,z:-0.035}, 'LeftHandMiddle1.rotation':{x:0.015,y:0.144,z:-0.076}, 'LeftHandMiddle2.rotation':{x:0.378,y:-0.007,z:-0.077}, 'LeftHandMiddle3.rotation':{x:-0.141,y:-0.001,z:0.031}, 'LeftHandRing1.rotation':{x:0.039,y:0.02,z:-0.2}, 'LeftHandRing2.rotation':{x:0.25,y:-0.002,z:-0.073}, 'LeftHandRing3.rotation':{x:0.236,y:0.006,z:-0.075}, 'LeftHandPinky1.rotation':{x:0.172,y:-0.033,z:-0.275}, 'LeftHandPinky2.rotation':{x:0.216,y:0.043,z:-0.054}, 'LeftHandPinky3.rotation':{x:0.325,y:0.078,z:-0.13}, 'RightShoulder.rotation':{x:2.015,y:-0.168,z:1.706}, 'RightArm.rotation':{x:0.203,y:-1.258,z:-0.782}, 'RightForeArm.rotation':{x:-0.658,y:-0.133,z:-1.401}, 'RightHand.rotation':{x:-1.504,y:0.375,z:-0.005}, 'RightHandThumb1.rotation':{x:0.413,y:-0.158,z:-1.121}, 'RightHandThumb2.rotation':{x:-0.142,y:-0.008,z:0.209}, 'RightHandThumb3.rotation':{x:-0.091,y:0.021,z:0.142}, 'RightHandIndex1.rotation':{x:-0.167,y:0.014,z:-0.072}, 'RightHandIndex2.rotation':{x:0.474,y:0.009,z:0.051}, 'RightHandIndex3.rotation':{x:0.115,y:0.006,z:0.047}, 'RightHandMiddle1.rotation':{x:0.385,y:0.019,z:0.144}, 'RightHandMiddle2.rotation':{x:0.559,y:0.035,z:0.101}, 'RightHandMiddle3.rotation':{x:0.229,y:0,z:0.027}, 'RightHandRing1.rotation':{x:0.48,y:0.026,z:0.23}, 'RightHandRing2.rotation':{x:0.772,y:0.038,z:0.109}, 'RightHandRing3.rotation':{x:0.622,y:0.039,z:0.106}, 'RightHandPinky1.rotation':{x:0.767,y:0.288,z:0.353}, 'RightHandPinky2.rotation':{x:0.886,y:0.049,z:0.122}, 'RightHandPinky3.rotation':{x:0.662,y:0.044,z:0.113}, 'LeftUpLeg.rotation':{x:-0.206,y:-0.268,z:-3.343}, 'LeftLeg.rotation':{x:-0.333,y:0.757,z:-0.043}, 'LeftFoot.rotation':{x:1.049,y:0.167,z:0.287}, 'LeftToeBase.rotation':{x:0.672,y:-0.069,z:-0.004}, 'RightUpLeg.rotation':{x:0.055,y:-0.226,z:3.037}, 'RightLeg.rotation':{x:-0.559,y:0.39,z:-0.001}, 'RightFoot.rotation':{x:1.2,y:0.133,z:0.085}, 'RightToeBase.rotation':{x:0.92,y:0.093,z:-0.013}
      },

      'straight':{
        'Hips.position':{x:0, y:0.989, z:0.001}, 'Hips.rotation':{x:0.047, y:0.007, z:-0.007}, 'Spine.rotation':{x:-0.143, y:-0.007, z:0.005}, 'Spine1.rotation':{x:-0.043, y:-0.014, z:0.012}, 'Spine2.rotation':{x:0.072, y:-0.013, z:0.013}, 'Neck.rotation':{x:0.048, y:-0.003, z:0.012}, 'Head.rotation':{x:0.05, y:-0.02, z:-0.017}, 'LeftShoulder.rotation':{x:1.62, y:-0.166, z:-1.605}, 'LeftArm.rotation':{x:1.275, y:0.544, z:-0.092}, 'LeftForeArm.rotation':{x:0, y:0, z:0.302}, 'LeftHand.rotation':{x:-0.225, y:-0.154, z:0.11}, 'LeftHandThumb1.rotation':{x:0.435, y:-0.044, z:0.457}, 'LeftHandThumb2.rotation':{x:-0.028, y:0.002, z:-0.246}, 'LeftHandThumb3.rotation':{x:-0.236, y:-0.025, z:0.113}, 'LeftHandIndex1.rotation':{x:0.218, y:0.008, z:-0.081}, 'LeftHandIndex2.rotation':{x:0.165, y:-0.001, z:-0.017}, 'LeftHandIndex3.rotation':{x:0.165, y:-0.001, z:-0.017}, 'LeftHandMiddle1.rotation':{x:0.235, y:-0.011, z:-0.065}, 'LeftHandMiddle2.rotation':{x:0.182, y:-0.002, z:-0.019}, 'LeftHandMiddle3.rotation':{x:0.182, y:-0.002, z:-0.019}, 'LeftHandRing1.rotation':{x:0.316, y:-0.017, z:0.008}, 'LeftHandRing2.rotation':{x:0.253, y:-0.003, z:-0.026}, 'LeftHandRing3.rotation':{x:0.255, y:-0.003, z:-0.026}, 'LeftHandPinky1.rotation':{x:0.336, y:-0.062, z:0.088}, 'LeftHandPinky2.rotation':{x:0.276, y:-0.004, z:-0.028}, 'LeftHandPinky3.rotation':{x:0.276, y:-0.004, z:-0.028}, 'RightShoulder.rotation':{x:1.615, y:0.064, z:1.53}, 'RightArm.rotation':{x:1.313, y:-0.424, z:0.131}, 'RightForeArm.rotation':{x:0, y:0, z:-0.317}, 'RightHand.rotation':{x:-0.158, y:-0.639, z:-0.196}, 'RightHandThumb1.rotation':{x:0.44, y:0.048, z:-0.549}, 'RightHandThumb2.rotation':{x:-0.056, y:-0.008, z:0.274}, 'RightHandThumb3.rotation':{x:-0.258, y:0.031, z:-0.095}, 'RightHandIndex1.rotation':{x:0.169, y:-0.011, z:0.105}, 'RightHandIndex2.rotation':{x:0.134, y:0.001, z:0.011}, 'RightHandIndex3.rotation':{x:0.134, y:0.001, z:0.011}, 'RightHandMiddle1.rotation':{x:0.288, y:0.014, z:0.092}, 'RightHandMiddle2.rotation':{x:0.248, y:0.003, z:0.02}, 'RightHandMiddle3.rotation':{x:0.249, y:0.003, z:0.02}, 'RightHandRing1.rotation':{x:0.369, y:0.019, z:0.006}, 'RightHandRing2.rotation':{x:0.321, y:0.004, z:0.026}, 'RightHandRing3.rotation':{x:0.323, y:0.004, z:0.026}, 'RightHandPinky1.rotation':{x:0.468, y:0.085, z:-0.03}, 'RightHandPinky2.rotation':{x:0.427, y:0.007, z:0.034}, 'RightHandPinky3.rotation':{x:0.142, y:0.001, z:0.012}, 'LeftUpLeg.rotation':{x:-0.077, y:-0.058, z:3.126}, 'LeftLeg.rotation':{x:-0.252, y:0.001, z:-0.018}, 'LeftFoot.rotation':{x:1.315, y:-0.064, z:0.315}, 'LeftToeBase.rotation':{x:0.577, y:-0.07, z:-0.009}, 'RightUpLeg.rotation':{x:-0.083, y:-0.032, z:3.124}, 'RightLeg.rotation':{x:-0.272, y:-0.003, z:0.021}, 'RightFoot.rotation':{x:1.342, y:0.076, z:-0.222}, 'RightToeBase.rotation':{x:0.44, y:0.069, z:0.016}
      },

      'wide':{
        'Hips.position':{x:0, y:1.017, z:0.016}, 'Hips.rotation':{x:0.064, y:-0.048, z:0.059}, 'Spine.rotation':{x:-0.123, y:0, z:-0.018}, 'Spine1.rotation':{x:0.014, y:0.003, z:-0.006}, 'Spine2.rotation':{x:0.04, y:0.003, z:-0.007}, 'Neck.rotation':{x:0.101, y:0.007, z:-0.035}, 'Head.rotation':{x:-0.091, y:-0.049, z:0.105}, 'RightShoulder.rotation':{x:1.831, y:0.017, z:1.731}, 'RightArm.rotation':{x:-1.673, y:-1.102, z:-3.132}, 'RightForeArm.rotation':{x:0.265, y:0.23, z:-0.824}, 'RightHand.rotation':{x:-0.52, y:0.345, z:-0.061}, 'RightHandThumb1.rotation':{x:0.291, y:0.056, z:-0.428}, 'RightHandThumb2.rotation':{x:0.025, y:0.005, z:0.166}, 'RightHandThumb3.rotation':{x:-0.089, y:0.009, z:0.068}, 'RightHandIndex1.rotation':{x:0.392, y:-0.015, z:0.11}, 'RightHandIndex2.rotation':{x:0.391, y:0.001, z:0.004}, 'RightHandIndex3.rotation':{x:0.326, y:0, z:0.003}, 'RightHandMiddle1.rotation':{x:0.285, y:0.068, z:0.081}, 'RightHandMiddle2.rotation':{x:0.519, y:0.004, z:0.011}, 'RightHandMiddle3.rotation':{x:0.252, y:0, z:0.001}, 'RightHandRing1.rotation':{x:0.207, y:0.133, z:0.146}, 'RightHandRing2.rotation':{x:0.597, y:0.004, z:0.004}, 'RightHandRing3.rotation':{x:0.292, y:0.002, z:0.012}, 'RightHandPinky1.rotation':{x:0.338, y:0.182, z:0.136}, 'RightHandPinky2.rotation':{x:0.533, y:0.002, z:0.004}, 'RightHandPinky3.rotation':{x:0.194, y:0, z:0.002}, 'LeftShoulder.rotation':{x:1.83, y:-0.063, z:-1.808}, 'LeftArm.rotation':{x:-1.907, y:1.228, z:-2.959}, 'LeftForeArm.rotation':{x:-0.159, y:0.268, z:0.572}, 'LeftHand.rotation':{x:0.069, y:-0.498, z:-0.025}, 'LeftHandThumb1.rotation':{x:0.738, y:0.123, z:0.178}, 'LeftHandThumb2.rotation':{x:-0.26, y:0.028, z:-0.477}, 'LeftHandThumb3.rotation':{x:-0.448, y:0.093, z:-0.661}, 'LeftHandIndex1.rotation':{x:1.064, y:0.005, z:-0.13}, 'LeftHandIndex2.rotation':{x:1.55, y:-0.143, z:-0.136}, 'LeftHandIndex3.rotation':{x:0.722, y:-0.076, z:-0.127}, 'LeftHandMiddle1.rotation':{x:1.095, y:-0.091, z:0.006}, 'LeftHandMiddle2.rotation':{x:1.493, y:-0.174, z:-0.151}, 'LeftHandMiddle3.rotation':{x:0.651, y:-0.031, z:-0.087}, 'LeftHandRing1.rotation':{x:1.083, y:-0.224, z:0.072}, 'LeftHandRing2.rotation':{x:1.145, y:-0.107, z:-0.195}, 'LeftHandRing3.rotation':{x:1.208, y:-0.134, z:-0.158}, 'LeftHandPinky1.rotation':{x:0.964, y:-0.383, z:0.128}, 'LeftHandPinky2.rotation':{x:1.457, y:-0.146, z:-0.159}, 'LeftHandPinky3.rotation':{x:1.019, y:-0.102, z:-0.141}, 'RightUpLeg.rotation':{x:-0.221, y:-0.233, z:2.87}, 'RightLeg.rotation':{x:-0.339, y:-0.043, z:-0.041}, 'RightFoot.rotation':{x:1.081, y:0.177, z:0.114}, 'RightToeBase.rotation':{x:0.775, y:0, z:0}, 'LeftUpLeg.rotation':{x:-0.185, y:0.184, z:3.131}, 'LeftLeg.rotation':{x:-0.408, y:0.129, z:0.02}, 'LeftFoot.rotation':{x:1.167, y:-0.002, z:-0.007}, 'LeftToeBase.rotation':{x:0.723, y:0, z:0}, 'LeftShoulder.position':{x:0.062, y:0.105, z:-0.012}, 'RightShoulder.position':{x:-0.062, y:0.105, z:-0.012}
      },

      'oneknee':{
        'Hips.position':{x:-0.005, y:0.415, z:-0.017}, 'Hips.rotation':{x:-0.25, y:0.04, z:-0.238}, 'Spine.rotation':{x:0.037, y:0.043, z:0.047}, 'Spine1.rotation':{x:0.317, y:0.103, z:0.066}, 'Spine2.rotation':{x:0.433, y:0.109, z:0.054}, 'Neck.rotation':{x:-0.156, y:-0.092, z:0.059}, 'Head.rotation':{x:-0.398, y:-0.032, z:0.018}, 'RightShoulder.rotation':{x:1.546, y:0.119, z:1.528}, 'RightArm.rotation':{x:0.896, y:-0.247, z:-0.512}, 'RightForeArm.rotation':{x:0.007, y:0, z:-1.622}, 'RightHand.rotation':{x:1.139, y:-0.853, z:0.874}, 'RightHandThumb1.rotation':{x:0.176, y:0.107, z:-0.311}, 'RightHandThumb2.rotation':{x:-0.047, y:-0.003, z:0.12}, 'RightHandThumb3.rotation':{x:0, y:0, z:0}, 'RightHandIndex1.rotation':{x:0.186, y:0.005, z:0.125}, 'RightHandIndex2.rotation':{x:0.454, y:0.005, z:0.015}, 'RightHandIndex3.rotation':{x:0, y:0, z:0}, 'RightHandMiddle1.rotation':{x:0.444, y:0.035, z:0.127}, 'RightHandMiddle2.rotation':{x:0.403, y:-0.006, z:-0.04}, 'RightHandMiddle3.rotation':{x:0, y:0, z:0}, 'RightHandRing1.rotation':{x:0.543, y:0.074, z:0.121}, 'RightHandRing2.rotation':{x:0.48, y:-0.018, z:-0.063}, 'RightHandRing3.rotation':{x:0, y:0, z:0}, 'RightHandPinky1.rotation':{x:0.464, y:0.086, z:0.113}, 'RightHandPinky2.rotation':{x:0.667, y:-0.06, z:-0.128}, 'RightHandPinky3.rotation':{x:0, y:0, z:0}, 'LeftShoulder.rotation':{x:1.545, y:-0.116, z:-1.529}, 'LeftArm.rotation':{x:0.799, y:0.631, z:0.556}, 'LeftForeArm.rotation':{x:-0.002, y:0.007, z:0.926}, 'LeftHand.rotation':{x:-0.508, y:0.439, z:0.502}, 'LeftHandThumb1.rotation':{x:0.651, y:-0.035, z:0.308}, 'LeftHandThumb2.rotation':{x:-0.053, y:0.008, z:-0.11}, 'LeftHandThumb3.rotation':{x:0, y:0, z:0}, 'LeftHandIndex1.rotation':{x:0.662, y:-0.053, z:-0.116}, 'LeftHandIndex2.rotation':{x:0.309, y:-0.004, z:-0.02}, 'LeftHandIndex3.rotation':{x:0, y:0, z:0}, 'LeftHandMiddle1.rotation':{x:0.501, y:-0.062, z:-0.12}, 'LeftHandMiddle2.rotation':{x:0.144, y:-0.002, z:0.016}, 'LeftHandMiddle3.rotation':{x:0, y:0, z:0}, 'LeftHandRing1.rotation':{x:0.397, y:-0.029, z:-0.143}, 'LeftHandRing2.rotation':{x:0.328, y:0.01, z:0.059}, 'LeftHandRing3.rotation':{x:0, y:0, z:0}, 'LeftHandPinky1.rotation':{x:0.194, y:0.008, z:-0.164}, 'LeftHandPinky2.rotation':{x:0.38, y:0.031, z:0.128}, 'LeftHandPinky3.rotation':{x:0, y:0, z:0}, 'RightUpLeg.rotation':{x:-1.594, y:-0.251, z:2.792}, 'RightLeg.rotation':{x:-2.301, y:-0.073, z:0.055}, 'RightFoot.rotation':{x:1.553, y:-0.207, z:-0.094}, 'RightToeBase.rotation':{x:0.459, y:0.069, z:0.016}, 'LeftUpLeg.rotation':{x:-0.788, y:-0.236, z:-2.881}, 'LeftLeg.rotation':{x:-2.703, y:0.012, z:-0.047}, 'LeftFoot.rotation':{x:2.191, y:-0.102, z:0.019}, 'LeftToeBase.rotation':{x:1.215, y:-0.027, z:0.01}
      },

      'kneel':{
        'Hips.position':{x:0, y:0.532, z:-0.002}, 'Hips.rotation':{x:0.018, y:-0.008, z:-0.017}, 'Spine.rotation':{x:-0.139, y:-0.01, z:0.002}, 'Spine1.rotation':{x:0.002, y:-0.002, z:0.001}, 'Spine2.rotation':{x:0.028, y:-0.002, z:0.001}, 'Neck.rotation':{x:-0.007, y:0, z:-0.002}, 'Head.rotation':{x:-0.02, y:-0.008, z:-0.004}, 'LeftShoulder.rotation':{x:1.77, y:-0.428, z:-1.588}, 'LeftArm.rotation':{x:0.911, y:0.343, z:0.083}, 'LeftForeArm.rotation':{x:0, y:0, z:0.347}, 'LeftHand.rotation':{x:0.033, y:-0.052, z:-0.105}, 'LeftHandThumb1.rotation':{x:0.508, y:-0.22, z:0.708}, 'LeftHandThumb2.rotation':{x:-0.323, y:-0.139, z:-0.56}, 'LeftHandThumb3.rotation':{x:-0.328, y:0.16, z:-0.301}, 'LeftHandIndex1.rotation':{x:0.178, y:0.248, z:0.045}, 'LeftHandIndex2.rotation':{x:0.236, y:-0.002, z:-0.019}, 'LeftHandIndex3.rotation':{x:-0.062, y:0, z:0.005}, 'LeftHandMiddle1.rotation':{x:0.123, y:-0.005, z:-0.019}, 'LeftHandMiddle2.rotation':{x:0.589, y:-0.014, z:-0.045}, 'LeftHandMiddle3.rotation':{x:0.231, y:-0.002, z:-0.019}, 'LeftHandRing1.rotation':{x:0.196, y:-0.008, z:-0.091}, 'LeftHandRing2.rotation':{x:0.483, y:-0.009, z:-0.038}, 'LeftHandRing3.rotation':{x:0.367, y:-0.005, z:-0.029}, 'LeftHandPinky1.rotation':{x:0.191, y:-0.269, z:-0.246}, 'LeftHandPinky2.rotation':{x:0.37, y:-0.006, z:-0.029}, 'LeftHandPinky3.rotation':{x:0.368, y:-0.005, z:-0.029}, 'RightShoulder.rotation':{x:1.73, y:0.434, z:1.715}, 'RightArm.rotation':{x:0.841, y:-0.508, z:-0.155}, 'RightForeArm.rotation':{x:0, y:0, z:-0.355}, 'RightHand.rotation':{x:0.091, y:0.137, z:0.197}, 'RightHandThumb1.rotation':{x:0.33, y:0.051, z:-0.753}, 'RightHandThumb2.rotation':{x:-0.113, y:0.075, z:0.612}, 'RightHandThumb3.rotation':{x:-0.271, y:-0.166, z:0.164}, 'RightHandIndex1.rotation':{x:0.073, y:0.001, z:-0.093}, 'RightHandIndex2.rotation':{x:0.338, y:0.006, z:0.034}, 'RightHandIndex3.rotation':{x:0.131, y:0.001, z:0.013}, 'RightHandMiddle1.rotation':{x:0.13, y:0.005, z:-0.017}, 'RightHandMiddle2.rotation':{x:0.602, y:0.018, z:0.058}, 'RightHandMiddle3.rotation':{x:-0.031, y:0, z:-0.003}, 'RightHandRing1.rotation':{x:0.351, y:0.019, z:0.045}, 'RightHandRing2.rotation':{x:0.19, y:0.002, z:0.019}, 'RightHandRing3.rotation':{x:0.21, y:0.002, z:0.021}, 'RightHandPinky1.rotation':{x:0.256, y:0.17, z:0.118}, 'RightHandPinky2.rotation':{x:0.451, y:0.01, z:0.045}, 'RightHandPinky3.rotation':{x:0.346, y:0.006, z:0.035}, 'LeftUpLeg.rotation':{x:-0.06, y:0.1, z:-2.918}, 'LeftLeg.rotation':{x:-1.933, y:-0.01, z:0.011}, 'LeftFoot.rotation':{x:0.774, y:-0.162, z:-0.144}, 'LeftToeBase.rotation':{x:1.188, y:0, z:0}, 'RightUpLeg.rotation':{x:-0.099, y:-0.057, z:2.922}, 'RightLeg.rotation':{x:-1.93, y:0.172, z:-0.02}, 'RightFoot.rotation':{x:0.644, y:0.251, z:0.212}, 'RightToeBase.rotation':{x:0.638, y:-0.034, z:-0.001}, 'LeftShoulder.position':{x:0.062, y:0.105, z:-0.012}, 'RightShoulder.position':{x:-0.062, y:0.105, z:-0.012}
      },

      'sitting': {
        'Hips.position':{x:0, y:0.117, z:0.005}, 'Hips.rotation':{x:-0.411, y:-0.049, z:0.056}, 'Spine.rotation':{x:0.45, y:-0.039, z:-0.116}, 'Spine1.rotation':{x:0.092, y:-0.076, z:0.08}, 'Spine2.rotation':{x:0.073, y:0.035, z:0.066}, 'Neck.rotation':{x:0.051, y:0.053, z:-0.079}, 'Head.rotation':{x:-0.169, y:0.009, z:0.034}, 'LeftShoulder.rotation':{x:1.756, y:-0.037, z:-1.301}, 'LeftArm.rotation':{x:-0.098, y:0.016, z:1.006}, 'LeftForeArm.rotation':{x:-0.089, y:0.08, z:0.837}, 'LeftHand.rotation':{x:0.262, y:-0.399, z:0.3}, 'LeftHandThumb1.rotation':{x:0.149, y:-0.043, z:0.452}, 'LeftHandThumb2.rotation':{x:0.032, y:0.006, z:-0.162}, 'LeftHandThumb3.rotation':{x:-0.086, y:-0.005, z:-0.069}, 'LeftHandIndex1.rotation':{x:0.145, y:0.032, z:-0.069}, 'LeftHandIndex2.rotation':{x:0.325, y:-0.001, z:-0.004}, 'LeftHandIndex3.rotation':{x:0.253, y:0, z:-0.003}, 'LeftHandMiddle1.rotation':{x:0.186, y:-0.051, z:-0.091}, 'LeftHandMiddle2.rotation':{x:0.42, y:-0.003, z:-0.011}, 'LeftHandMiddle3.rotation':{x:0.153, y:0.001, z:-0.001}, 'LeftHandRing1.rotation':{x:0.087, y:-0.19, z:-0.078}, 'LeftHandRing2.rotation':{x:0.488, y:-0.004, z:-0.005}, 'LeftHandRing3.rotation':{x:0.183, y:-0.001, z:-0.012}, 'LeftHandPinky1.rotation':{x:0.205, y:-0.262, z:0.051}, 'LeftHandPinky2.rotation':{x:0.407, y:-0.002, z:-0.004}, 'LeftHandPinky3.rotation':{x:0.068, y:0, z:-0.002}, 'RightShoulder.rotation':{x:1.619, y:-0.139, z:1.179}, 'RightArm.rotation':{x:0.17, y:-0.037, z:-1.07}, 'RightForeArm.rotation':{x:-0.044, y:-0.056, z:-0.665}, 'RightHand.rotation':{x:0.278, y:0.454, z:-0.253}, 'RightHandThumb1.rotation':{x:0.173, y:0.089, z:-0.584}, 'RightHandThumb2.rotation':{x:-0.003, y:-0.004, z:0.299}, 'RightHandThumb3.rotation':{x:-0.133, y:-0.002, z:0.235}, 'RightHandIndex1.rotation':{x:0.393, y:-0.023, z:0.108}, 'RightHandIndex2.rotation':{x:0.391, y:0.001, z:0.004}, 'RightHandIndex3.rotation':{x:0.326, y:0, z:0.003}, 'RightHandMiddle1.rotation':{x:0.285, y:0.062, z:0.086}, 'RightHandMiddle2.rotation':{x:0.519, y:0.003, z:0.011}, 'RightHandMiddle3.rotation':{x:0.252, y:-0.001, z:0.001}, 'RightHandRing1.rotation':{x:0.207, y:0.122, z:0.155}, 'RightHandRing2.rotation':{x:0.597, y:0.004, z:0.005}, 'RightHandRing3.rotation':{x:0.292, y:0.001, z:0.012}, 'RightHandPinky1.rotation':{x:0.338, y:0.171, z:0.149}, 'RightHandPinky2.rotation':{x:0.533, y:0.002, z:0.004}, 'RightHandPinky3.rotation':{x:0.194, y:0, z:0.002}, 'LeftUpLeg.rotation':{x:-1.957, y:0.083, z:-2.886}, 'LeftLeg.rotation':{x:-1.46, y:0.123, z:0.005}, 'LeftFoot.rotation':{x:-0.013, y:0.016, z:0.09}, 'LeftToeBase.rotation':{x:0.744, y:0, z:0}, 'RightUpLeg.rotation':{x:-1.994, y:0.125, z:2.905}, 'RightLeg.rotation':{x:-1.5, y:-0.202, z:-0.006}, 'RightFoot.rotation':{x:-0.012, y:-0.065, z:0.081}, 'RightToeBase.rotation':{x:0.758, y:0, z:0}, 'LeftShoulder.position':{x:0.062, y:0.105, z:-0.012}, 'RightShoulder.position':{x:-0.062, y:0.105, z:-0.012}
      }
    };

    // Pose deltas
    // NOTE: This should include all the used delta properties.
    this.poseDelta = {
      'Hips.rotation':{x:0, y:0, z:0},'Spine.rotation':{x:0, y:0, z:0}, 'Spine1.rotation':{x:0, y:0, z:0}, 'Neck.rotation':{x:0, y:0, z:0}, 'Head.rotation':{x:0, y:0, z:0}, 'LeftUpLeg.rotation':{x:0, y:0, z:0}, 'RightUpLeg.rotation':{x:0, y:0, z:0}, 'LeftLeg.rotation':{x:0, y:0, z:0}, 'RightLeg.rotation':{x:0, y:0, z:0}, 'Spine1.scale':{x:0, y:0, z:0}, 'Neck.scale':{x:0, y:0, z:0}, 'LeftArm.scale':{x:0, y:0, z:0}, 'RightArm.scale':{x:0, y:0, z:0}, 'LeftShoulder.position':{x:0, y:0, z:0}, 'RightShoulder.position':{x:0, y:0, z:0}
    };

    // Dynamically pick up all the property names that we need in the code
    const names = new Set();
    Object.values(this.poseTemplates).forEach( x => {
      Object.keys(x).forEach( y => names.add(y) );
    });
    Object.keys(this.poseDelta).forEach( x => {
      names.add(x)
    });
    this.posePropNames = [...names];

    // Use "side" as the first pose, weight on left leg
    this.poseName = "side"; // First pose
    this.poseWeightOnLeft = true; // Initial weight on left leg
    this.posePrev = null;
    this.poseBase = this.poseFactory( this.poseTemplates[this.poseName] );
    this.poseTarget = this.poseFactory( this.poseTemplates[this.poseName] );
    this.poseAvatar = null; // Set when avatar has been loaded


    // Animation templates
    //
    // baseline: Describes morph target baseline. Values can be either float or
    //           an array [start,end,skew] describing a probability distribution.
    // speech  : Describes voice rate, pitch and volume as deltas to the values
    //           set as options.
    // anims   : Animations for breathing, pose, etc. To be used animation
    //           sequence is selected in the following order:
    //           1. State (idle, talking)
    //           2. Mood (moodX, moodY)
    //           3. Pose (poseX, poseY)
    //           5. View (full, upper, head)
    //           6. Body form ('M','F')
    //           7. Alt (sequence of objects with propabilities p. If p is not
    //              specified, the remaining part is shared equivally among
    //              the rest.)
    //           8. Current object
    // object  : delay, delta times dt and values vs.
    //
    this.animMoods = {
      'neutral' : {
        baseline: { eyesLookDown: 0.1 },
        speech: { deltaRate: 0, deltaPitch: 0, deltaVolume: 0 },
        anims: [
          { name: 'breathing', delay: 1500, dt: [ 1200,500,1000 ], vs: { chestInhale: [0.5,0.5,0] } },
          { name: 'pose', alt: [
            { p: 0.4, delay: [5000,20000], vs: { pose: ['side'] } },
            { p: 0.4, delay: [5000,20000], vs: { pose: ['hip'] },
              'M': { delay: [5000,20000], vs: { pose: ['wide'] } }
            },
            { delay: [5000,20000], vs: { pose: ['straight'] } }
          ]},
          { name: 'head', delay: [0,1000], dt: [ [200,5000] ], vs: { headRotateX: [[-0.04,0.10]], headRotateY: [[-0.3,0.3]], headRotateZ: [[-0.08,0.08]] } },
          { name: 'eyes', delay: [200,5000], dt: [ [100,500],[100,5000,2] ], vs: { eyesRotateY: [[-0.6,0.6]], eyesRotateX: [[-0.2,0.6]] } },
          { name: 'blink', delay: [2000,10000], dt: [50,[100,300],100], vs: { eyeBlinkLeft: [1,1,0], eyeBlinkRight: [1,1,0] } },
          { name: 'mouth', delay: [1000,5000], dt: [ [100,500],[100,5000,2] ], vs : { mouthRollLower: [[0,0.3,2]], mouthRollUpper: [[0,0.3,2]], mouthStretchLeft: [[0,0.3]], mouthStretchRight: [[0,0.3]], mouthPucker: [[0,0.3]] } },
          { name: 'misc', delay: [100,5000], dt: [ [100,500],[100,5000,2] ], vs : { eyeSquintLeft: [[0,0.3,3]], eyeSquintRight: [[0,0.3,3]], browInnerUp: [[0,0.3]], browOuterUpLeft: [[0,0.3]], browOuterUpRight: [[0,0.3]] } }
        ]
      },
      'happy' : {
        baseline: { mouthSmile: 0.3, eyesLookDown: 0.1 },
        speech: { deltaRate: 0, deltaPitch: 0.1, deltaVolume: 0 },
        anims: [
          { name: 'breathing', delay: 1500, dt: [ 1200,500,1000 ], vs: { chestInhale: [0.5,0.5,0] } },
          { name: 'pose',
            idle: {
              alt: [
                { p: 0.6, delay: [5000,20000], vs: { pose: ['side'] } },
                { p: 0.2, delay: [5000,20000], vs: { pose: ['hip'] },
                  'M': { delay: [5000,20000], vs: { pose: ['side'] } }
                },
                { p: 0.1, delay: [5000,20000], vs: { pose: ['straight'] } },
                { delay: [5000,10000], vs: { pose: ['wide'] } },
                { delay: [1000,3000], vs: { pose: ['turn'] } },
              ]
            },
            talking: {
              alt: [
                { p: 0.4, delay: [5000,20000], vs: { pose: ['side'] } },
                { p: 0.4, delay: [5000,20000], vs: { pose: ['straight'] } },
                { delay: [5000,20000], vs: { pose: ['hip'] },
                  'M': { delay: [5000,20000], vs: { pose: ['wide'] } }
                },
              ]
            }
          },
          { name: 'head', dt: [ [1000,5000] ], vs: { headRotateX: [[-0.04,0.10]], headRotateY: [[-0.3,0.3]], headRotateZ: [[-0.08,0.08]] } },
          { name: 'eyes', delay: [100,5000], dt: [ [100,500],[100,5000,2] ], vs: { eyesRotateY: [[-0.6,0.6]], eyesRotateX: [[-0.2,0.6]] } },
          { name: 'blink', delay: [2000,10000], dt: [50,[100,300],100], vs: { eyeBlinkLeft: [1,1,0], eyeBlinkRight: [1,1,0] } },
          { name: 'mouth', delay: [1000,5000], dt: [ [100,500],[100,5000,2] ], vs : { mouthLeft: [[0,0.3,2]], mouthSmile: [[0,0.2,3]], mouthRollLower: [[0,0.3,2]], mouthRollUpper: [[0,0.3,2]], mouthStretchLeft: [[0,0.3]], mouthStretchRight: [[0,0.3]], mouthPucker: [[0,0.3]] } },
          { name: 'misc', delay: [100,5000], dt: [ [100,500],[100,5000,2] ], vs : { eyeSquintLeft: [[0,0.3,3]], eyeSquintRight: [[0,0.3,3]], browInnerUp: [[0,0.3]], browOuterUpLeft: [[0,0.3]], browOuterUpRight: [[0,0.3]] } }
        ]
      },
      'angry' : {
        baseline: { eyesLookDown: 0.1, browDownLeft: 0.7, browDownRight: 0.7, jawForward: 0.3, mouthFrownLeft: 0.8, mouthFrownRight: 0.8, mouthRollLower: 0.3, mouthShrugLower: 0.4 },
        speech: { deltaRate: -0.2, deltaPitch: 0.2, deltaVolume: 0 },
        anims: [
          { name: 'breathing', delay: 500, dt: [ 1000,500,1000 ], vs: { chestInhale: [0.7,0.7,0] } },
          { name: 'pose', alt: [
            { p: 0.4, delay: [5000,20000], vs: { pose: ['side'] } },
            { p: 0.4, delay: [5000,20000], vs: { pose: ['straight'] } },
            { p: 0.2, delay: [5000,20000], vs: { pose: ['hip'] },
              'M': { delay: [5000,20000], vs: { pose: ['wide'] } }
            },
          ]},
          { name: 'head', delay: [100,500], dt: [ [200,5000] ], vs: { headRotateX: [[-0.04,0.10]], headRotateY: [[-0.2,0.2]], headRotateZ: [[-0.08,0.08]] } },
          { name: 'eyes', delay: [100,5000], dt: [ [100,500],[100,5000,2] ], vs: { eyesRotateY: [[-0.6,0.6]], eyesRotateX: [[-0.2,0.6]] } },
          { name: 'blink', delay: [2000,10000], dt: [50,[100,300],100], vs: { eyeBlinkLeft: [1,1,0], eyeBlinkRight: [1,1,0] } },
          { name: 'mouth', delay: [1000,5000], dt: [ [100,500],[100,5000,2] ], vs : { mouthRollLower: [[0,0.3,2]], mouthRollUpper: [[0,0.3,2]], mouthStretchLeft: [[0,0.3]], mouthStretchRight: [[0,0.3]], mouthPucker: [[0,0.3]] } },
          { name: 'misc', delay: [100,5000], dt: [ [100,500],[100,5000,2] ], vs : { eyeSquintLeft: [[0,0.3,3]], eyeSquintRight: [[0,0.3,3]], browInnerUp: [[0,0.3]], browOuterUpLeft: [[0,0.3]], browOuterUpRight: [[0,0.3]] } }
        ]
      },
      'sad' : {
        baseline: { eyesLookDown: 0.2, browDownRight: 0.1, browInnerUp: 0.7, browOuterUpRight: 0.2, eyeSquintLeft: 0.8, eyeSquintRight: 0.8, mouthFrownLeft: 1, mouthFrownRight: 1, mouthLeft: 0.2, mouthPucker: 0.5, mouthRollLower: 0.2, mouthRollUpper: 0.2, mouthShrugLower: 0.2, mouthShrugUpper: 0.2, mouthStretchLeft: 0.5 },
        speech: { deltaRate: -0.2, deltaPitch: -0.2, deltaVolume: 0 },
        anims: [
          { name: 'breathing', delay: 1500, dt: [ 1000,500,1000 ], vs: { chestInhale: [0.3,0.3,0] } },
          { name: 'pose', alt: [
            { p: 0.4, delay: [5000,20000], vs: { pose: ['side'] } },
            { p: 0.4, delay: [5000,20000], vs: { pose: ['straight'] } },
            { delay: [5000,10000], vs: { pose: ['side'] },
              full: { delay: [5000,10000], vs: { pose: ['oneknee'] } }
            },
          ]},
          { name: 'head', delay: [100,500], dt: [ [200,5000] ], vs: { headRotateX: [[-0.04,0.10]], headRotateY: [[-0.2,0.2]], headRotateZ: [[-0.08,0.08]] } },
          { name: 'eyes', delay: [100,5000], dt: [ [100,500],[100,5000,2] ], vs: { eyesRotateY: [[-0.6,0.6]], eyesRotateX: [[-0.2,0.6]] } },
          { name: 'blink', delay: [2000,10000], dt: [50,[100,300],100], vs: { eyeBlinkLeft: [1,1,0], eyeBlinkRight: [1,1,0] } },
          { name: 'mouth', delay: [1000,5000], dt: [ [100,500],[100,5000,2] ], vs : { mouthRollLower: [[0,0.3,2]], mouthRollUpper: [[0,0.3,2]], mouthStretchLeft: [[0,0.3]], mouthStretchRight: [[0,0.3]], mouthPucker: [[0,0.3]] } },
          { name: 'misc', delay: [100,5000], dt: [ [100,500],[100,5000,2] ], vs : { eyeSquintLeft: [[0,0.3,3]], eyeSquintRight: [[0,0.3,3]], browInnerUp: [[0,0.3]], browOuterUpLeft: [[0,0.3]], browOuterUpRight: [[0,0.3]] } }
        ]
      },
      'fear' : {
        baseline: { browInnerUp: 0.8, eyeSquintLeft: 0.5, eyeSquintRight: 0.5, eyeWideLeft: 0.7, eyeWideRight: 0.7, mouthClose: 0.1, mouthFunnel: 0.3, mouthShrugLower: 0.6, mouthShrugUpper: 0.6 },
        speech: { deltaRate: -0.2, deltaPitch: 0, deltaVolume: 0 },
        anims: [
          { name: 'breathing', delay: 500, dt: [ 1000,500,1000 ], vs: { chestInhale: [0.7,0.7,0] } },
          { name: 'pose', alt: [
            { p: 0.8, delay: [5000,20000], vs: { pose: ['side'] } },
            { delay: [5000,20000], vs: { pose: ['straight'] } },
            { delay: [5000,10000], vs: { pose: ['wide'] } },
            { delay: [5000,10000], vs: { pose: ['side'] },
              full: { delay: [5000,10000], vs: { pose: ['oneknee'] } }
            },
          ]},
          { name: 'head', delay: [100,500], dt: [ [200,3000] ], vs: { headRotateX: [[-0.06,0.12]], headRotateY: [[-0.7,0.7]], headRotateZ: [[-0.1,0.1]] } },
          { name: 'eyes', delay: [100,2000], dt: [ [100,500],[100,5000,2] ], vs: { eyesRotateY: [[-1,1]], eyesRotateX: [[-0.2,0.6]] } },
          { name: 'blink', delay: [4000,10000], dt: [50,[100,300],100], vs: { eyeBlinkLeft: [1,1,0], eyeBlinkRight: [1,1,0] } },
          { name: 'mouth', delay: [1000,5000], dt: [ [100,500],[100,5000,2] ], vs : { mouthRollLower: [[0,0.3,2]], mouthRollUpper: [[0,0.3,2]], mouthStretchLeft: [[0,0.3]], mouthStretchRight: [[0,0.3]], mouthPucker: [[0,0.3]] } },
          { name: 'misc', delay: [100,5000], dt: [ [100,500],[100,5000,2] ], vs : { eyeSquintLeft: [[0,0.3,3]], eyeSquintRight: [[0,0.3,3]], browInnerUp: [[0,0.3]], browOuterUpLeft: [[0,0.3]], browOuterUpRight: [[0,0.3]] } }
        ]
      },
      'disgust' : {
        baseline: { browDownLeft: 0.9, browDownRight: 0.1, browInnerUp: 0.3, eyeSquintLeft: 1, eyeSquintRight: 1, eyeWideLeft: 0.5, eyeWideRight: 0.5, eyesRotateX: 0.05, mouthLeft: 0.4, mouthPressLeft: 0.3, mouthRollLower: 0.4, mouthShrugLower: 0.4, mouthShrugUpper: 1, mouthUpperUpLeft: 0.3, noseSneerLeft: 1, noseSneerRight: 0.7 },
        speech: { deltaRate: -0.2, deltaPitch: 0, deltaVolume: 0 },
        anims: [
          { name: 'breathing', delay: 1500, dt: [ 1000,500,1000 ], vs: { chestInhale: [0.5,0.5,0] } },
          { name: 'pose', alt: [
            { delay: [5000,10000], vs: { pose: ['side'] } },
          ]},
          { name: 'head', delay: [100,500], dt: [ [200,5000] ], vs: { headRotateX: [[-0.04,0.10]], headRotateY: [[-0.2,0.2]], headRotateZ: [[-0.08,0.08]] } },
          { name: 'eyes', delay: [100,5000], dt: [ [100,500],[100,5000,2] ], vs: { eyesRotateY: [[-0.6,0.6]], eyesRotateX: [[-0.2,0.6]] } },
          { name: 'blink', delay: [2000,10000], dt: [50,[100,300],100], vs: { eyeBlinkLeft: [1,1,0], eyeBlinkRight: [1,1,0] } },
          { name: 'mouth', delay: [1000,5000], dt: [ [100,500],[100,5000,2] ], vs : { mouthRollLower: [[0,0.3,2]], mouthRollUpper: [[0,0.3,2]], mouthStretchLeft: [[0,0.3]], mouthStretchRight: [[0,0.3]], mouthPucker: [[0,0.3]] } },
          { name: 'misc', delay: [100,5000], dt: [ [100,500],[100,5000,2] ], vs : { eyeSquintLeft: [[0,0.3,3]], eyeSquintRight: [[0,0.3,3]], browInnerUp: [[0,0.3]], browOuterUpLeft: [[0,0.3]], browOuterUpRight: [[0,0.3]] } }
        ]
      },
      'love' : {
        baseline: { browInnerUp: 0.5, browOuterUpLeft: 0.2, browOuterUpRight: 0.2, mouthSmile: 0.2, eyeBlinkLeft: 0.6, eyeBlinkRight: 0.6, eyeWideLeft: 0.8, eyeWideRight: 0.8, headRotateX: 0.1, mouthDimpleLeft: 0.1, mouthDimpleRight: 0.1, mouthPressLeft: 0.2, mouthShrugUpper: 0.2, mouthUpperUpLeft: 0.1, mouthUpperUpRight: 0.1 },
        speech: { deltaRate: -0.1, deltaPitch: -0.7, deltaVolume: 0 },
        anims: [
          { name: 'breathing', delay: 1500, dt: [ 1500,500,1500 ], vs: { chestInhale: [0.8,0.8,0] } },
          { name: 'pose', alt: [
            { p: 0.4, delay: [5000,20000], vs: { pose: ['side'] } },
            { p: 0.2, delay: [5000,20000], vs: { pose: ['straight'] } },
            { p: 0.2, delay: [5000,20000], vs: { pose: ['hip'] },
              'M': { delay: [5000,20000], vs: { pose: ['side'] } }
            },
            { delay: [5000,10000], vs: { pose: ['side'] },
              full: { delay: [5000,10000], vs: { pose: ['kneel'] } }
            },
            { delay: [1000,3000], vs: { pose: ['turn'] },
              'M': { delay: [1000,3000], vs: { pose: ['wide'] } }
            },
            { delay: [1000,3000], vs: { pose: ['back'] },
              'M': { delay: [1000,3000], vs: { pose: ['wide'] } }
            },
            { delay: [5000,20000], vs: { pose: ['side'] },
              'M': { delay: [5000,20000], vs: { pose: ['side'] } },
              full: { delay: [5000,20000], vs: { pose: ['bend'] } }
            },
            { delay: [1000,3000], vs: { pose: ['side'] },
              full: { delay: [5000,10000], vs: { pose: ['oneknee'] } }
            },
          ]},
          { name: 'head', dt: [ [1000,5000] ], vs: { headRotateX: [[-0.04,0.10]], headRotateY: [[-0.3,0.3]], headRotateZ: [[-0.08,0.08]] } },
          { name: 'eyes', delay: [300,5000], dt: [ [100,500],[100,5000,2] ], vs: { eyesRotateY: [[-0.6,0.6]], eyesRotateX: [[-0.2,0.6]] } },
          { name: 'blink', delay: [2000,10000], dt: [50,[200,300],100], vs: { eyeBlinkLeft: [0.6,0.6,0], eyeBlinkRight: [0.6,0.6,0] } },
          { name: 'mouth', delay: [1000,5000], dt: [ [100,500],[100,5000,2] ], vs : { mouthLeft: [[0,0.3,2]], mouthRollLower: [[0,0.3,2]], mouthRollUpper: [[0,0.3,2]], mouthStretchLeft: [[0,0.3]], mouthStretchRight: [[0,0.3]], mouthPucker: [[0,0.3]] } },
          { name: 'misc', delay: [100,5000], dt: [ [500,1000],[1000,5000,2] ], vs : { eyeSquintLeft: [[0,0.3,3]], eyeSquintRight: [[0,0.3,3]], browInnerUp: [[0.3,0.6]], browOuterUpLeft: [[0.1,0.3]], browOuterUpRight: [[0.1,0.3]] } }
        ]
      },
      'sleep' : {
        baseline: { eyesClosed: 1, eyeBlinkLeft: 1, eyeBlinkRight: 1 },
        speech: { deltaRate: 0, deltaPitch: -0.2, deltaVolume: 0 },
        anims: [
          { name: 'breathing', delay: 1500, dt: [ 1000,500,1000 ], vs: { chestInhale: [0.6,0.6,0] } },
          { name: 'pose', alt: [
            { delay: [5000,20000], vs: { pose: ['side'] } }
          ]},
          { name: 'head', delay: [1000,5000], dt: [ [2000,10000] ], vs: { headRotateX: [[0,0.4]], headRotateY: [[-0.1,0.1]], headRotateZ: [[-0.04,0.04]] } },
          { name: 'eyes', delay: 1000, dt: [], vs: {} },
          { name: 'blink', delay: 1000, dt: [], vs: {} },
          { name: 'mouth', delay: 1000, dt: [], vs: {} },
          { name: 'misc', delay: 1000, dt: [], vs: {} }
        ]
      }
    };
    this.moodName = this.opt.avatarMood || "neutral";
    this.mood = this.animMoods[ this.moodName ];
    if ( !this.mood ) {
      this.moodName = "neutral";
      this.mood = this.animMoods["neutral"];
    }

    // Animation templates for emojis
    this.animEmojis = {

      '😐': { mood: 'neutral', dt: [300,2000], vs: { pose: ['straight'], browInnerUp: [0.4], eyeWideLeft: [0.7], eyeWideRight: [0.7], mouthPressLeft: [0.6], mouthPressRight: [0.6], mouthRollLower: [0.3], mouthStretchLeft: [1], mouthStretchRight: [1] } },
      '😶': { link:  '😐' },
      '😏': { mood: 'happy', dt: [300,2000], vs: { browDownRight: [0.1], browInnerUp: [0.7], browOuterUpRight: [0.2], eyeLookInRight: [0.7], eyeLookOutLeft: [0.7], eyeSquintLeft: [1], eyeSquintRight: [0.8], eyesRotateY: [0.7], mouthLeft: [0.4], mouthPucker: [0.4], mouthShrugLower: [0.3], mouthShrugUpper: [0.2], mouthSmile: [0.2], mouthSmileLeft: [0.4], mouthSmileRight: [0.2], mouthStretchLeft: [0.5], mouthUpperUpLeft: [0.6], noseSneerLeft: [0.7] } },
      '🙂': { mood: 'happy', dt: [300,2000], vs: { mouthSmile: [0.5] } },
      '🙃': { link:  '🙂' },
      '😊': { mood: 'happy', dt: [300,2000], vs: { browInnerUp: [0.6], eyeSquintLeft: [1], eyeSquintRight: [1], mouthSmile: [0.7], noseSneerLeft: [0.7], noseSneerRight: [0.7] } },
      '😇': { link:  '😊' },
      '😀': { mood: 'happy', dt: [300,2000], vs: { browInnerUp: [0.6], jawOpen: [0.1], mouthDimpleLeft: [0.2], mouthDimpleRight: [0.2], mouthOpen: [0.3], mouthPressLeft: [0.3], mouthPressRight: [0.3], mouthRollLower: [0.4], mouthShrugUpper: [0.4], mouthSmile: [0.7], mouthUpperUpLeft: [0.3], mouthUpperUpRight: [0.3], noseSneerLeft: [0.4], noseSneerRight: [0.4] }},
      '😃': { mood: 'happy', dt: [300,2000], vs: { browInnerUp: [0.6], eyeWideLeft: [0.7], eyeWideRight: [0.7], jawOpen: [0.1], mouthDimpleLeft: [0.2], mouthDimpleRight: [0.2], mouthOpen: [0.3], mouthPressLeft: [0.3], mouthPressRight: [0.3], mouthRollLower: [0.4], mouthShrugUpper: [0.4], mouthSmile: [0.7], mouthUpperUpLeft: [0.3], mouthUpperUpRight: [0.3], noseSneerLeft: [0.4], noseSneerRight: [0.4] } },
      '😄': { mood: 'happy', dt: [300,2000], vs: { browInnerUp: [0.3], eyeSquintLeft: [1], eyeSquintRight: [1], jawOpen: [0.2], mouthDimpleLeft: [0.2], mouthDimpleRight: [0.2], mouthOpen: [0.3], mouthPressLeft: [0.3], mouthPressRight: [0.3], mouthRollLower: [0.4], mouthShrugUpper: [0.4], mouthSmile: [0.7], mouthUpperUpLeft: [0.3], mouthUpperUpRight: [0.3], noseSneerLeft: [0.4], noseSneerRight: [0.4] } },
      '😁': { mood: 'happy', dt: [300,2000], vs: { browInnerUp: [0.3], eyeSquintLeft: [1], eyeSquintRight: [1], jawOpen: [0.3], mouthDimpleLeft: [0.2], mouthDimpleRight: [0.2], mouthPressLeft: [0.5], mouthPressRight: [0.5], mouthShrugUpper: [0.4], mouthSmile: [0.7], mouthUpperUpLeft: [0.3], mouthUpperUpRight: [0.3], noseSneerLeft: [0.4], noseSneerRight: [0.4] } },
      '😆': { mood: 'happy', dt: [300,2000], vs: { browInnerUp: [0.3], eyeSquintLeft: [1], eyeSquintRight: [1], eyesClosed: [0.6], jawOpen: [0.3], mouthDimpleLeft: [0.2], mouthDimpleRight: [0.2], mouthPressLeft: [0.5], mouthPressRight: [0.5], mouthShrugUpper: [0.4], mouthSmile: [0.7], mouthUpperUpLeft: [0.3], mouthUpperUpRight: [0.3], noseSneerLeft: [0.4], noseSneerRight: [0.4] } },
      '😝': { mood: 'happy', dt: [300,100,1500,500,500], vs: { browInnerUp: [0.8], eyesClosed: [1], jawOpen: [0.7], mouthFunnel: [0.5], mouthSmile: [1], tongueOut: [0,1,1,0] } },
      '😋': { link:  '😝' }, '😛': { link:  '😝' }, '😛': { link:  '😝' }, '😜': { link:  '😝' }, '🤪': { link:  '😝' },
      '😂': { mood: 'happy', dt: [300,2000], vs: { browInnerUp: [0.3], eyeSquintLeft: [1], eyeSquintRight: [1], eyesClosed: [0.6], jawOpen: [0.3], mouthDimpleLeft: [0.2], mouthDimpleRight: [0.2], mouthPressLeft: [0.5], mouthPressRight: [0.5], mouthShrugUpper: [0.4], mouthSmile: [0.7], mouthUpperUpLeft: [0.3], mouthUpperUpRight: [0.3], noseSneerLeft: [0.4], noseSneerRight: [0.4] } },
      '🤣': { link:  '😂' }, '😅': { link:  '😂' },
      '😉': { mood: 'happy', dt: [500,200,500,500], vs: { mouthSmile: [0.5], mouthOpen: [0.2], mouthSmileLeft: [0,0.5,0], eyeBlinkLeft: [0,0.7,0], eyeBlinkRight: [0,0,0], headRotateX: [0.05,0.05,0.05,0], headRotateZ: [-0.05,-0.05,-0.05,0], browDownLeft: [0,0.7,0], cheekSquintLeft: [0,0.7,0], eyeSquintLeft: [0,1,0], eyesClosed: [0] } },

      '😭': { mood: 'sad', dt: [1000,1000], vs: { browInnerUp: [1], eyeSquintLeft: [1], eyeSquintRight: [1], eyesClosed: [0.1], jawOpen: [0], mouthFrownLeft: [1], mouthFrownRight: [1], mouthOpen: [0.5], mouthPucker: [0.5], mouthUpperUpLeft: [0.6], mouthUpperUpRight: [0.6] } },
      '🥺': { mood: 'sad', dt: [1000,1000], vs: { browDownLeft: [0.2], browDownRight: [0.2], browInnerUp: [1], eyeWideLeft: [0.9], eyeWideRight: [0.9], eyesClosed: [0.1], mouthClose: [0.2], mouthFrownLeft: [1], mouthFrownRight: [1], mouthPressLeft: [0.4], mouthPressRight: [0.4], mouthPucker: [1], mouthRollLower: [0.6], mouthRollUpper: [0.2], mouthUpperUpLeft: [0.8], mouthUpperUpRight: [0.8] } },
      '😞': { mood: 'sad', dt: [1000,1000], vs: { browInnerUp: [0.7], eyeSquintLeft: [1], eyeSquintRight: [1], eyesClosed: [0.5], headRotateX: [0.3], mouthClose: [0.2], mouthFrownLeft: [1], mouthFrownRight: [1], mouthPucker: [1], mouthRollLower: [1], mouthShrugLower: [0.2], mouthUpperUpLeft: [0.8], mouthUpperUpRight: [0.8] } },
      '😔': { mood: 'sad', dt: [1000,1000], vs: { browInnerUp: [1], eyeSquintLeft: [1], eyeSquintRight: [1], eyesClosed: [0.5], headRotateX: [0.3], mouthClose: [0.2], mouthFrownLeft: [1], mouthFrownRight: [1], mouthPressLeft: [0.4], mouthPressRight: [0.4], mouthPucker: [1], mouthRollLower: [0.6], mouthRollUpper: [0.2], mouthUpperUpLeft: [0.8], mouthUpperUpRight: [0.8] } },
      '😳': { mood: 'sad', dt: [1000,1000], vs: { browInnerUp: [1], eyeWideLeft: [0.5], eyeWideRight: [0.5], eyesRotateY: [0.05], eyesRotateX: [0.05], mouthClose: [0.2], mouthFunnel: [0.5], mouthPucker: [0.4], mouthRollLower: [0.4], mouthRollUpper: [0.4] } },
      '☹️': { mood: 'sad', dt: [500,1500], vs: { mouthFrownLeft: [1], mouthFrownRight: [1], mouthPucker: [0.1], mouthRollLower: [0.8] } },

      '😚': { mood: 'love', dt: [500,1000,1000], vs: { browInnerUp: [0.6], eyeBlinkLeft: [1], eyeBlinkRight: [1], eyeSquintLeft: [1], eyeSquintRight: [1], mouthPucker: [0,0.5], noseSneerLeft: [0,0.7], noseSneerRight: [0,0.7], viseme_U: [0,1] } },
      '😘': { mood: 'love', dt: [500,500,200,500], vs: { browInnerUp: [0.6], eyeBlinkLeft: [0,0,1,0], eyeBlinkRight: [0], eyesRotateY: [0], headRotateY: [0], headRotateX: [0,0.05,0.05,0], headRotateZ: [0,-0.05,-0.05,0], eyeSquintLeft: [1], eyeSquintRight: [1], mouthPucker: [0,0.5,0], noseSneerLeft: [0,0.7], noseSneerRight: [0.7], viseme_U: [0,1] } },
      '🥰': { mood: 'love', dt: [1000,1000], vs: { browInnerUp: [0.6], eyeSquintLeft: [1], eyeSquintRight: [1], mouthSmile: [0.7], noseSneerLeft: [0.7], noseSneerRight: [0.7] } },
      '😍': { mood: 'love', dt: [1000,1000], vs: { browInnerUp: [0.6], jawOpen: [0.1], mouthDimpleLeft: [0.2], mouthDimpleRight: [0.2], mouthOpen: [0.3], mouthPressLeft: [0.3], mouthPressRight: [0.3], mouthRollLower: [0.4], mouthShrugUpper: [0.4], mouthSmile: [0.7], mouthUpperUpLeft: [0.3], mouthUpperUpRight: [0.3], noseSneerLeft: [0.4], noseSneerRight: [0.4] } },
      '🤩': { link:  '😍' },

      '😡': { mood: 'angry', dt: [1000,1500], vs: { browDownLeft: [1], browDownRight: [1], eyesLookUp: [0.2], jawForward: [0.3], mouthFrownLeft: [1], mouthFrownRight: [1], headRotateX: [0.15] } },
      '😠': { mood: 'angry', dt: [1000,1500], vs: { browDownLeft: [1], browDownRight: [1], eyesLookUp: [0.2], jawForward: [0.3], mouthFrownLeft: [1], mouthFrownRight: [1], headRotateX: [0.15] } },
      '🤬': { link:  '😠' },
      '😒': { mood: 'angry', dt: [1000,1000], vs: { browDownRight: [0.1], browInnerUp: [0.7], browOuterUpRight: [0.2], eyeLookInRight: [0.7], eyeLookOutLeft: [0.7], eyeSquintLeft: [1], eyeSquintRight: [0.8], eyesRotateY: [0.7], mouthFrownLeft: [1], mouthFrownRight: [1], mouthLeft: [0.2], mouthPucker: [0.5], mouthRollLower: [0.2], mouthRollUpper: [0.2], mouthShrugLower: [0.2], mouthShrugUpper: [0.2], mouthStretchLeft: [0.5] } },

      '😱': { mood: 'fear', dt: [500,1500], vs: { browInnerUp: [0.8], eyeWideLeft: [0.5], eyeWideRight: [0.5], jawOpen: [0.7], mouthFunnel: [0.5] } },
      '😬': { dt: [500,1500], vs: { browDownLeft: [1], browDownRight: [1], browInnerUp: [1], mouthDimpleLeft: [0.5], mouthDimpleRight: [0.5], mouthLowerDownLeft: [1], mouthLowerDownRight: [1], mouthPressLeft: [0.4], mouthPressRight: [0.4], mouthPucker: [0.5], mouthSmile: [0.1], mouthSmileLeft: [0.2], mouthSmileRight: [0.2], mouthStretchLeft: [1], mouthStretchRight: [1], mouthUpperUpLeft: [1], mouthUpperUpRight: [1] } },
      '🙄': { dt: [500,1500], vs: { browInnerUp: [0.8], eyeWideLeft: [1], eyeWideRight: [1], eyesRotateX: [-0.8], headRotateX: [0.15], mouthPucker: [0.5], mouthRollLower: [0.6], mouthRollUpper: [0.5], mouthShrugLower: [0], mouthSmile: [0] } },
      '🤔': { dt: [500,1500], vs: { browDownLeft: [1], browOuterUpRight: [1], eyeSquintLeft: [0.6], headRotateY: [-0.2], headRotateX: [-0.1], mouthFrownLeft: [0.7], mouthFrownRight: [0.7], mouthLowerDownLeft: [0.3], mouthPressRight: [0.4], mouthPucker: [0.1], mouthRight: [0.5], mouthRollLower: [0.5], mouthRollUpper: [0.2] } },
      '👀': { dt: [500,1500], vs: { eyesRotateY: [-0.8] } },

      '😴': { mood: 'sleep', dt: [5000,5000], vs:{ eyesClosed: [1], eyeBlinkLeft: [1], eyeBlinkRight: [1], headRotateX: [0.2], headRotateZ: [0.1] } }
    };

    // Baseline/fixed morph targets
    this.animBaseline = {};
    this.animFixed = {};

    // Anim queues
    this.animQueue = [];
    this.animClips = [];
    this.animPoses = [];

    // Clock
    this.animFrameDur = 1000/ this.opt.modelFPS;
    this.animClock = 0;
    this.animSlowdownRate = 1;
    this.animTimeLast = 0;
    this.easing = this.sigmoidFactory(5); // Ease in and out

    // Finnish letters to visemes. And yes, it is this simple in Finnish!
    this.visemes = {
      'a': 'aa', 'e': 'E', 'i': 'I', 'o': 'O', 'u': 'U', 'y': 'Y', 'ä': 'aa',
      'ö': 'O', 'b': 'PP', 'c': 'SS', 'd': 'DD', 'f': 'FF', 'g': 'kk',
      'h': 'O', 'j': 'I', 'k': 'kk', 'l': 'nn', 'm': 'PP', 'n': 'nn',
      'p': 'PP', 'q': 'kk', 'r': 'RR','s': 'SS', 't': 'DD', 'v': 'FF',
      'w': 'FF', 'x': 'SS', 'z': 'SS', ' ': 'sil', ',': 'sil', '-': 'sil'
    };
    this.pauses = { ',': 3, '-':0.5 }; // Pauses in relative units to visemes

    // Audio context and playlist
    this.audioCtx = new AudioContext();
    this.audioSource = this.audioCtx.createBufferSource();
    this.audioReverbNode = this.audioCtx.createConvolver();
    this.setReverb(null); // Set dry impulse
    this.audioGainNode = this.audioCtx.createGain();
    this.audioPlaylist = [];

    // Create a lookup table for base64 decoding
    const b64Chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
    this.b64Lookup = typeof Uint8Array === 'undefined' ? [] : new Uint8Array(256);
    for (let i = 0; i < b64Chars.length; i++) this.b64Lookup[b64Chars.charCodeAt(i)] = i;

    // Speech queue
    this.stateName = 'idle';
    this.speechQueue = [];
    this.isSpeaking = false;

    // Setup Google text-to-speech
    if ( this.opt.ttsEndpoint ) {
      let audio = new Audio();
      if (audio.canPlayType("audio/ogg")) {
        this.ttsAudioEncoding = "OGG-OPUS";
      } else if (audio.canPlayType("audio/mp3")) {
        this.ttsAudioEncoding = "MP3";
      } else {
        throw new Error("There was no support for either OGG or MP3 audio.");
      }
    } else {
      throw new Error("You must provide some Google-compliant Text-To-Speech Endpoint.");
    }


    // Setup 3D Animation
    this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    this.renderer.setPixelRatio( this.opt.modelPixelRatio * window.devicePixelRatio );
    this.renderer.setSize(this.nodeAvatar.clientWidth, this.nodeAvatar.clientHeight);
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    this.renderer.outputEncoding = THREE.sRGBEncoding;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.useLegacyLights = false;
    this.renderer.shadowMap.enabled = false;
    this.nodeAvatar.appendChild( this.renderer.domElement );
    this.camera = new THREE.PerspectiveCamera( 10, 1, 1, 2000 );
    this.scene = new THREE.Scene();
    const pmremGenerator = new THREE.PMREMGenerator( this.renderer );
    pmremGenerator.compileEquirectangularShader();
    this.scene.environment = pmremGenerator.fromScene( new RoomEnvironment() ).texture;
    new ResizeObserver(this.onResize.bind(this)).observe(this.nodeAvatar);

    this.controls = new OrbitControls( this.camera, this.renderer.domElement );
    this.controls.enableZoom = this.opt.cameraZoomEnable;
    this.controls.enableRotate = this.opt.cameraRotateEnable;
    this.controls.enablePan = this.opt.cameraPanEnable;
    this.controls.minDistance = 2;
    this.controls.maxDistance = 2000;
    this.controls.autoRotateSpeed = 0;
    this.controls.autoRotate = false;
    this.controls.update();
    this.cameraClock = null;
  }

  /**
  * Convert an array of Base64 MP3 chunks to ArrayBuffer.
  * @param {string[]} chunks Array of Base64 encoded strings
  * @return {ArrayBuffer} ArrayBuffer
  */
  b64ChunksToArrayBuffer(chunks) {

    // Calculate the needed total buffer length
    let bufLen = 0;
    chunks.forEach( x => {
      bufLen += 3 * x.length / 4;
      if (x[x.length - 1] === '=') {
        bufLen--;
        if (x[x.length - 2] === '=') {
          bufLen--;
        }
      }
    });

    // Create the ArrayBuffer
    const arrBuf = new ArrayBuffer(bufLen);
    const arr = new Uint8Array(arrBuf);
    let i, p = 0, c1, c2, c3, c4;

    // Populate the buffer
    chunks.forEach( x => {
      for (i = 0; i < x.length; i += 4) {
        c1 = this.b64Lookup[x.charCodeAt(i)];
        c2 = this.b64Lookup[x.charCodeAt(i+1)];
        c3 = this.b64Lookup[x.charCodeAt(i+2)];
        c4 = this.b64Lookup[x.charCodeAt(i+3)];
        arr[p++] = (c1 << 2) | (c2 >> 4);
        arr[p++] = ((c2 & 15) << 4) | (c3 >> 2);
        arr[p++] = ((c3 & 3) << 6) | (c4 & 63);
      }
    });

    return arrBuf;
  }

  /**
  * Clear 3D object.
  * @param {Object} obj Object
  */
  clearThree(obj){
    while( obj.children.length ){
      this.clearThree(obj.children[0]);
      obj.remove(obj.children[0]);
    }
    if ( obj.geometry ) obj.geometry.dispose();

    if ( obj.material ) {
      Object.keys(obj.material).forEach( x => {
        if ( obj.material[x] && obj.material[x] !== null && typeof obj.material[x].dispose === 'function' ) {
          obj.material[x].dispose();
        }
      });
      obj.material.dispose();
    }
  }

  /**
  * Loader for 3D avatar model.
  * @param {string} avatar Avatar object with 'url' property to GLTF/GLB file.
  * @param {progressfn} [onprogress=null] Callback for progress
  */
  async showAvatar(avatar, onprogress=null ) {

    // Checkt the avatar parameter
    if ( !avatar || !avatar.hasOwnProperty('url') ) {
      throw new Error("Invalid parameter. The avatar must have at least 'url' specified.");
    }

    // Loader
    const loader = new GLTFLoader();
    let gltf = await loader.loadAsync( avatar.url, onprogress );

    // Check the gltf
    const required = ['Armature','EyeLeft','EyeRight','Wolf3D_Head','Wolf3D_Teeth'];
    this.posePropNames.forEach( x => required.push( x.split('.')[0] ) );
    required.forEach( x => {
      if ( !gltf.scene.getObjectByName(x) ) {
        throw new Error('Avatar object ' + x + ' not found');
      }
    });

    this.stop();
    this.avatar = avatar;

    // Clear previous scene, if avatar was previously loaded
    this.mixer = null;
    if ( this.armature ) {
      this.clearThree( this.scene );
    }

    // Avatar full-body
    this.armature = gltf.scene.getObjectByName("Armature"); // Full-body
    this.armature.scale.setScalar(1);

    // Morph targets
    this.morphs = ['EyeLeft','EyeRight','Wolf3D_Head','Wolf3D_Teeth'].map( x => {
      return this.armature.getObjectByName( x );
    });

    // Objects for needed properties
    this.poseAvatar = {};
    this.posePropNames.forEach( x => {
      const ids = x.split('.');
      const o = this.armature.getObjectByName(ids[0]);
      if ( ids[1] === 'rotation' ) ids[1] = 'quaternion';
      this.poseAvatar[x] = o[ids[1]];
      if ( this.poseBase.hasOwnProperty(x) ) {
        this.poseAvatar[x].copy( this.poseBase[x] );
      } else {
        this.poseBase[x] = this.poseAvatar[x].clone();
      }

      // Make sure target has the delta properties, because we need it as a basis
      if ( this.poseDelta.hasOwnProperty(x) && !this.poseTarget.hasOwnProperty(x) ) {
        this.poseTarget[x] = this.poseAvatar[x].clone();
      }
    });

    // Light 1
    const light1 = new THREE.SpotLight( 0x2244cc, 4, 0, 0.1, 0.7 );
    light1.castShadow = true;
    light1.position.set(-3, 4, -1);
    light1.target = this.armature.getObjectByName('Head');
    this.scene.add( light1 );

    // Light 2
    const light2 = new THREE.SpotLight( 0x8888aa, 3, 0, 0.1, 0.5  );
    light2.castShadow = true;
    light2.position.set(2, 3.2, -1.5);
    light2.target = this.armature.getObjectByName('Head');
    this.scene.add( light2 );

    // Add avatar to scene
    this.scene.add(this.armature);

    // Set pose, view and start animation
    if ( !this.viewName ) this.setView( this.opt.cameraView );
    this.setMood( this.moodName || this.avatar.avatarMood || this.opt.avatarMood );
    this.posePeriod = 1500;
    this.poseTime = this.animClock + this.animFrameDur;
    this.start();

  }

  /**
  * Get view names.
  * @return {string[]} Supported view names.
  */
  getViewNames() {
    return ['full','upper', 'head'];
  }

  /**
  * Get current view.
  * @return {string} View name.
  */
  getView() {
    return this.viewName;
  }

  /**
  * Fit 3D object to the view.
  * @param {string} [view=null] Camera view. If null, reset current view
  * @param {Object} [opt=null] Options
  */
  setView(view, opt = null) {
    if ( view !== 'full' && view !== 'upper' && view !== 'head' ) return;
    if ( !this.armature ) {
      this.opt.cameraView = view;
      return;
    }

    this.viewName = view || this.viewName;
    opt = opt || {};

    const boundingBox = new THREE.Box3().setFromObject( this.armature );
    const size = new THREE.Vector3();
    boundingBox.getSize(size);
    const fov = this.camera.fov * ( Math.PI / 180 );
    let x = - (opt.cameraX || this.opt.cameraX) * Math.tan( fov / 2 );
    let y = ( 1 - (opt.cameraY || this.opt.cameraY)) * Math.tan( fov / 2 );
    let z = (opt.cameraDistance || this.opt.cameraDistance);
    if ( this.viewName === 'head' ) {
      z += 2;
      y = y * z + 4 * size.y / 5;
    } else if ( this.viewName === 'upper' ) {
      z += 4.5;
      y = y * z + 2 * size.y / 3;
    } else {
      z += 12;
      y = y * z;
    }
    x = x * z;

    this.controlsEnd = new THREE.Vector3(x, y, 0);
    this.cameraEnd = new THREE.Vector3(x, y, z).applyEuler( new THREE.Euler( (opt.cameraRotateX || opt.cameraRotateX), (opt.cameraRotateY || this.opt.cameraRotateY), 0 ) );

    if ( this.cameraClock === null ) {
      this.controls.target.copy( this.controlsEnd );
      this.camera.position.copy( this.cameraEnd );
    }
    this.controlsStart = this.controls.target.clone();
    this.cameraStart = this.camera.position.clone();
    this.cameraClock = 0;

  }

  /**
  * Render scene.
  */
  render() {
    if ( this.isRunning ) this.renderer.render( this.scene, this.camera );
  }

  /**
  * Resize avatar.
  */
  onResize() {
    this.camera.aspect = this.nodeAvatar.clientWidth / this.nodeAvatar.clientHeight;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize( this.nodeAvatar.clientWidth, this.nodeAvatar.clientHeight );
    this.controls.update();
    this.render();
  }

  /**
  * Update avatar pose.
  * @param {number} t High precision timestamp in ms.
  */
  updatePoseBase(t) {
    const alpha = (t - this.poseTime) / this.posePeriod;
    for( const [key,v] of Object.entries(this.poseTarget) ) {
      const o = this.poseAvatar[key];
      if (o) {
        if ( alpha > 1 || !this.poseBase.hasOwnProperty(key) ) {
          o.copy(v);
        } else {
          if ( o.isQuaternion ) {
            o.copy( this.poseBase[key].slerp(v, this.easing(alpha) ));
          } else if ( v.isVector3 ) {
            o.copy( this.poseBase[key].lerp(v, this.easing(alpha) ));
          }
        }
      }
    }
  }

  /**
  * Update avatar pose deltas
  */
  updatePoseDelta() {
    for( const [key,d] of Object.entries(this.poseDelta) ) {
      const o = this.poseAvatar[key];
      if ( o.isQuaternion ) {
        const q = new THREE.Quaternion().setFromEuler(new THREE.Euler(d.x,d.y,d.z));
        o.multiply(q);
      } else if ( o.isVector3 ) {
        o.add( d );
      }
    }
  }


  /**
  * Get given pose as a string.
  * @param {Object} pose Pose
  * @param {number} [prec=0.001] Precision used in values
  * @return {string} Pose as a string
  */
  getPoseString(pose,prec=1000){
    let s = '{';
    Object.entries(pose).forEach( (x,i) => {
      const ids = x[0].split('.');
      if ( ids[1] === 'position' || ids[1] === 'rotation' || ids[1] === 'quaternion' ) {
        const key = (ids[1] === 'quaternion' ? (ids[0]+'.rotation') : x[0]);
        const val = (x[1].isQuaternion ? new THREE.Euler().setFromQuaternion(x[1]) : x[1]);
        s += (i?", ":"") + "'" + key + "':{";
        s += 'x:' + Math.round(val.x * prec) / prec;
        s += ', y:' + Math.round(val.y * prec) / prec;
        s += ', z:' + Math.round(val.z * prec) / prec;
        s += '}';
      }
    });
    s += '}';
    return s;
  }


  /**
  * Change body weight from current leg to another.
  * @param {Object} p Pose
  */
  mirrorPose(p) {
    const r = {};
    for( let [key,v] of Object.entries(p) ) {

      // Create a mirror image
      if ( v.isQuaternion ) {
        if ( key.startsWith('Left') ) {
          key = 'Right' + key.substring(4);
        } else if ( key.startsWith('Right') ) {
          key = 'Left' + key.substring(5);
        }
        v.x *= -1;
        v.w *= -1;
      }

      r[key] = v;
    }
    this.poseWeightOnLeft = !this.poseWeightOnLeft;
    return r;
  }

  /**
  * Create a new pose.
  * @param {Object} t Pose template
  * @return {Object} A new pose object.
  */
  poseFactory(t) {
    const r = {};
    for( let [key,val] of Object.entries(t) ) {
      const ids = key.split('.');
      let v;
      if ( ids[1] === 'position' || ids[1] === 'scale' ) {
        v = new THREE.Vector3(val.x,val.y,val.z);
      } else if ( ids[1] === 'rotation' ) { // NOTE: Internally all rotations are quaternions
        v = new THREE.Quaternion().setFromEuler(new THREE.Euler(val.x,val.y,val.z,'XYZ')).normalize();
      } else if ( ids[1] === 'quaternion' ) {
        key = ids[0] + '.rotation'; // NOTE: Internally all rotations are quaternions
        v = new THREE.Quaternion(val.x,val.y,val.z,val.w).normalize();
      }
      if (v) r[key] = v;
    }
    return r;
  }

  /**
  * Set a new pose and start transition timer.
  * @param {Object} t Pose template
  */
  setPose(t) {

    if ( this.posePrev === t ) {

      // Same pose, shift weight
      this.poseTarget = this.mirrorPose( this.poseTarget );

    } else {

      // Create a new pose from the template
      this.poseTarget = this.poseFactory(t);

      // Templates have thw weight on left leg, so switch if necessary
      if ( !this.poseWeightOnLeft ) {
        this.poseTarget = this.mirrorPose( this.poseTarget );
      }

      // Make sure deltas are included in the target
      Object.keys(this.poseDelta).forEach( key => {
        if ( !this.poseTarget.hasOwnProperty(key) ) {
          this.poseTarget[key] = this.poseBase[key].clone();
        }
      });

      this.posePrev = t;
    }

    this.posePeriod = 2000;
    this.poseTime = this.animClock + this.animFrameDur;
  }

  /**
  * Get morph target value.
  * @param {string} mt Morph target
  * @return {number} Value
  */
  getValue(mt) {
    if ( mt === 'headRotateX' ) {
      return this.poseDelta['Head.rotation'].x;
    } else if ( mt === 'headRotateY' ) {
      return this.poseDelta['Head.rotation'].y;
    } else if ( mt === 'headRotateZ' ) {
      return this.poseDelta['Head.rotation'].z;
    } else if ( mt === 'chestInhale' ) {
      return this.poseDelta['Spine1.scale'].x * 20;
    } else {
      return this.morphs[0].morphTargetInfluences[this.morphs[0].morphTargetDictionary[mt]];
    }
  }


  /**
  * Set morph target value.
  * @param {string} mt Morph target
  * @param {number} v Value
  */
  setValue(mt,v) {
    if ( mt === 'headRotateX' ) {
      this.poseDelta['Head.rotation'].x = v;
      this.poseDelta['Spine1.rotation'].x =v/2;
      this.poseDelta['Spine.rotation'].x = v/8;
      this.poseDelta['Hips.rotation'].x = v/24;
    } else if ( mt === 'headRotateY' ) {
      this.poseDelta['Head.rotation'].y = v;
      this.poseDelta['Spine1.rotation'].y = v/2;
      this.poseDelta['Spine.rotation'].y = v/2;
      this.poseDelta['Hips.rotation'].y = v/4;
      this.poseDelta['LeftUpLeg.rotation'].y = v/2;
      this.poseDelta['RightUpLeg.rotation'].y = v/2;
      this.poseDelta['LeftLeg.rotation'].y = v/4;
      this.poseDelta['RightLeg.rotation'].y = v/4;
    } else if ( mt === 'headRotateZ' ) {
      this.poseDelta['Head.rotation'].z = v;
      this.poseDelta['Spine1.rotation'].z = v/12;
      this.poseDelta['Spine.rotation'].z = v/12;
      this.poseDelta['Hips.rotation'].z = v/24;
    } else if ( mt === 'chestInhale' ) {
      const scale = v/20;
      const d = { x: scale, y: (scale/2), z: (3 * scale) };
      const dneg = { x: (1/(1+scale) - 1), y: (1/(1 + scale/2) - 1), z: (1/(1 + 3 * scale) - 1) };
      this.poseDelta['Spine1.scale'] = d;
      this.poseDelta['Neck.scale'] = dneg;
      this.poseDelta['LeftArm.scale'] = dneg;
      this.poseDelta['RightArm.scale'] = dneg;
      this.poseDelta['LeftShoulder.position'].y = v/150;
      this.poseDelta['RightShoulder.position'].y = v/150;
    } else {
      this.morphs.forEach( x => x.morphTargetInfluences[x.morphTargetDictionary[mt]] = v );
    }
  }


  /**
  * Get mood names.
  * @return {string[]} Mood names.
  */
  getMoodNames() {
    return Object.keys(this.animMoods);
  }

  /**
  * Get current mood.
  * @return {string[]} Mood name.
  */
  getMood() {
    return this.opt.avatarMood;
  }

  /**
  * Set mood.
  * @param {string} s Mood name.
  */
  setMood(s) {
    s = (s || '').trim().toLowerCase();
    if ( !this.animMoods.hasOwnProperty(s) ) throw new Error("Unknown mood.");
    this.moodName = s;
    this.mood = this.animMoods[this.moodName];

    // Reset morph target baseline to 0
    for( let mt of Object.keys(this.morphs[0].morphTargetDictionary) ) {
      this.setBaselineValue( mt, this.mood.baseline.hasOwnProperty(mt) ? this.mood.baseline[mt] : 0 );
    }

    // Set/replace animations
    this.mood.anims.forEach( x => {
      let i = this.animQueue.findIndex( y => y.template.name === x.name );
      if ( i !== -1 ) {
        this.animQueue.splice(i, 1);
      }
      this.animQueue.push( this.animFactory( x, -1 ) );
    });

  }


  /**
  * Get morph target names.
  * @return {string[]} Morph target names.
  */
  getMorphTargetNames() {
    return [
      'headRotateX', 'headRotateY', 'headRotateZ',
      'eyesRotateX', 'eyesRotateY', 'chestInhale',
      ...Object.keys(this.morphs[0].morphTargetDictionary)
    ].sort();
  }

  /**
  * Get baseline value for the morph target.
  * @param {string} mt Morph target name
  * @return {number} Value, undefined if not in baseline
  */
  getBaselineValue( mt ) {
    if ( mt === 'eyesRotateY' ) {
      const ll = this.getBaselineValue('eyeLookOutLeft');
      if ( ll === undefined ) return undefined;
      const lr = this.getBaselineValue('eyeLookInLeft');
      if ( lr === undefined ) return undefined;
      const rl = this.getBaselineValue('eyeLookOurRight');
      if ( rl === undefined ) return undefined;
      const rr = this.getBaselineValue('eyeLookInRight');
      if ( rr === undefined ) return undefined;
      return ll - lr;
    } else if ( mt === 'eyesRotateX' ) {
      const d = this.getBaselineValue('eyesLookDown');
      if ( d === undefined ) return undefined;
      const u = this.getBaselineValue('eyeLookUp');
      if ( u === undefined ) return undefined;
      return d - u;
    } else {
      return (this.animBaseline.hasOwnProperty(mt) ? this.animBaseline[mt].target : undefined);
    }
  }

  /**
  * Set baseline for morph target.
  * @param {string} mt Morph target name
  * @param {number} v Value, null if to be removed from baseline
  */
  setBaselineValue( mt, v ) {
    if ( mt === 'eyesRotateY' ) {
      this.setBaselineValue('eyeLookOutLeft', (v === null) ? null : (v>0 ? v : 0) );
      this.setBaselineValue('eyeLookInLeft', (v === null) ? null : (v>0 ? 0 : -v) );
      this.setBaselineValue('eyeLookOutRight', (v === null) ? null : (v>0 ? 0 : -v) );
      this.setBaselineValue('eyeLookInRight', (v === null) ? null : (v>0 ? v : 0) );
    } else if ( mt === 'eyesRotateX' ) {
      this.setBaselineValue('eyesLookDown', (v === null) ? null : (v>0 ? v : 0) );
      this.setBaselineValue('eyesLookUp', (v === null) ? null : (v>0 ? 0 : -v) );
    } if ( mt === 'eyeLookOutLeft' || mt === 'eyeLookInLeft' ||
            mt === 'eyeLookOutRight' || mt === 'eyeLookInRight' ||
            mt === 'eyesLookDown' || mt === 'eyesLookUp' ) {
      // skip these
    } else {
      if ( v === null ) {
        if ( this.animBaseline.hasOwnProperty(mt) ) {
          delete this.animBaseline[mt];
        }
      } else {
        this.animBaseline[mt] = { target: v };
      }
    }
  }

  /**
  * Get fixed value for the morph target.
  * @param {string} mt Morph target name
  * @return {number} Value, undefined if not fixed
  */
  getFixedValue( mt ) {
    if ( mt === 'eyesRotateY' ) {
      const ll = this.getFixedValue('eyeLookOutLeft');
      if ( ll === undefined ) return undefined;
      const lr = this.getFixedValue('eyeLookInLeft');
      if ( lr === undefined ) return undefined;
      const rl = this.getFixedValue('eyeLookOutRight');
      if ( rl === undefined ) return undefined;
      const rr = this.getFixedValue('eyeLookInRight');
      if ( rr === undefined ) return undefined;
      return ll - lr;
    } else if ( mt === 'eyesRotateX' ) {
      const d = this.getFixedValue('eyesLookDown');
      if ( d === undefined ) return undefined;
      const u = this.getFixedValue('eyeLookUp');
      if ( u === undefined ) return undefined;
      return d - u;
    } else {
      return (this.animFixed.hasOwnProperty(mt) ? this.animFixed[mt].target : undefined);
    }
  }

  /**
  * Fix morph target.
  * @param {string} mt Morph target name
  * @param {number} v Value, null if to be removed
  */
  setFixedValue( mt, v ) {
    if ( mt === 'eyesRotateY' ) {
      this.setFixedValue('eyeLookOutLeft', (v === null) ? null : (v>0 ? v : 0 ) );
      this.setFixedValue('eyeLookInLeft', (v === null) ? null : (v>0 ? 0 : -v ) );
      this.setFixedValue('eyeLookOutRight', (v === null) ? null : (v>0 ? 0 : -v ) );
      this.setFixedValue('eyeLookInRight', (v === null) ? null : (v>0 ? v : 0 ) );
    } else if ( mt === 'eyesRotateX' ) {
      this.setFixedValue('eyesLookDown', (v === null) ? null : (v>0 ? v : 0 ) );
      this.setFixedValue('eyesLookUp', (v === null) ? null : (v>0 ? 0 : -v ) );
    } else {
      if ( v === null ) {
        if ( this.animFixed.hasOwnProperty(mt) ) {
          delete this.animFixed[mt];
        }
      } else {
        this.animFixed[mt] = { target: v };
      }
    }
  }


  /**
  * Create a new animation based on an animation template.
  * @param {Object} t Animation template
  * @param {number} [loop=false] Number of loops, false if not looped
  * @param {number} [scaleTime=1] Scale template times
  * @param {number} [scaleValue=1] Scale template values
  * @return {Object} New animation object.
  */
  animFactory( t, loop = false, scaleTime = 1, scaleValue = 1 ) {
    const o = { template: t, ts: [0], vs: {} };

    // Follow the hierarchy of objects
    let a = t;
    while(1) {
      if ( a.hasOwnProperty(this.stateName) ) {
        a = a[this.stateName];
      } else if ( a.hasOwnProperty(this.moodName) ) {
        a = a[this.moodName];
      } else if ( a.hasOwnProperty(this.poseName) ) {
        a = a[this.poseName];
      } else if ( a.hasOwnProperty(this.viewName) ) {
        a = a[this.viewName];
      } else if ( this.avatar.body && a.hasOwnProperty(this.avatar.body) ) {
        a = a[this.avatar.body];
      } else if ( a.hasOwnProperty('alt') ) {

        // Go through alternatives with probabilities
        let b = a.alt[0];
        if ( a.alt.length > 1 ) {
         // Flip a coin
         const coin = Math.random();
         let p = 0;
         for( let i=0; i<a.alt.length; i++ ) {
           p += a.alt[i].p || (1-p)/(a.alt.length-i);
           if (coin<p) {
             b = a.alt[i];
             break;
           }
         }
        }
        a = b;

      } else {
        break;
      }
    }

    // Time series
    const delay = a.delay ? (Array.isArray(a.delay) ? this.gaussianRandom(a.delay[0], a.delay[1], a.delay[2]) : a.delay ) : 0;
    if ( a.hasOwnProperty('dt') ) {
      a.dt.forEach( (x,i) => {
        o.ts[i+1] = o.ts[i] + (Array.isArray(x) ? this.gaussianRandom(x[0],x[1],x[2]) : x);
      });
    }
    o.ts = o.ts.map( x => this.animClock + delay + x * scaleTime );

    // Values
    for( let [mt,vs] of Object.entries(a.vs) ) {
      const base = this.getBaselineValue(mt);
      const v = vs.map( x => {
        if ( typeof x === 'string' || x instanceof String ) {
          return x.slice();
        } else if ( Array.isArray(x) ) {
          return (base === undefined ? 0 : base) + scaleValue * this.gaussianRandom(x[0],x[1],x[2]);
        } else {
          return (base === undefined ? 0 : base) + scaleValue * x;
        }
      });

      if ( mt === 'eyesRotateY' ) {
        o.vs['eyeLookOutLeft'] = [null, ...v.map( x => (x>0) ? x : 0 ) ];
        o.vs['eyeLookInLeft'] = [null, ...v.map( x => (x>0) ? 0 : -x ) ];
        o.vs['eyeLookOutRight'] = [null, ...v.map( x => (x>0) ? 0 : -x ) ];
        o.vs['eyeLookInRight'] = [null, ...v.map( x => (x>0) ? x : 0 ) ];
      } else if ( mt === 'eyesRotateX' ) {
        o.vs['eyesLookDown'] = [null, ...v.map( x => (x>0) ? x : 0 ) ];
        o.vs['eyesLookUp'] = [null, ...v.map( x => (x>0) ? 0 : -x ) ];
      } else {
        o.vs[mt] = [null, ...v];
      }
    }
    for( let mt of Object.keys(o.vs) ) {
      while( (o.vs[mt].length-1) < o.ts.length ) o.vs[mt].push( o.vs[mt][ o.vs[mt].length - 1 ]);
    }

    // Mood
    if ( t.hasOwnProperty("mood") ) o.mood = t.mood.slice();

    // Loop
    if ( loop ) o.loop = loop;

    return o;
  }

  /**
  * Calculate the correct value based on a given time using the given function.
  * @param {number[]} ts Time sequence
  * @param {number[]} vs Value sequence
  * @param {number} t Time.
  * @param {function} [fun=null] Ease in and out function, null = use linear function
  * @return {number} Value based on the given time.
  */
  valueAnimationSeq(ts,vs,t,fun = null) {
    let iMin = 0;
    let iMax = ts.length-1;
    if ( t <= ts[iMin] ) return vs[iMin];
    if ( t >= ts[iMax] ) return vs[iMax];
    while( t > ts[iMin+1] ) iMin++;
    iMax = iMin + 1;
    let k = (vs[iMax] - vs[iMin]) / (ts[iMax] - ts[iMin]);
    if ( fun ) k = fun( ( t - ts[iMin] ) / (ts[iMax] - ts[iMin]) ) * k;
    const b = vs[iMin] - (k * ts[iMin]);
    return (k * t + b);
  }

  /**
  * Return gaussian distributed random value between start and end with skew.
  * @param {number} start Start value.
  * @param {number} end End value.
  * @param {number} [skew=1] Skew.
  * @return {number} Gaussian random value.
  */
  gaussianRandom(start,end,skew=1) {
    let r = 0;
    for( let i=0; i<5; i++) r += Math.random();
    return start + Math.pow(r/5,skew) * (end - start);
  }

  /**
  * Create a sigmoid function.
  * @param {number} k Sharpness of ease.
  * @return {function} Sigmoid function.
  */
  sigmoidFactory(k) {
    function base(t) { return (1 / (1 + Math.exp(-k * t))) - 0.5; }
    var corr = 0.5 / base(1);
    return function (t) { return corr * base(2 * Math.max(Math.min(t, 1), 0) - 1) + 0.5; };
  }

  /**
  * Convert value from one range to another.
  * @param {number} value Value
  * @param {number[]} r1 Source range
  * @param {number[]} r2 Target range
  * @return {number} Scaled value
  */
  convertRange( value, r1, r2 ) {
    return (value-r1[0]) * (r2[1]-r2[0]) / (r1[1]-r1[0]) + r2[0];
  }

  /**
  * Animate the avatar.
  * @param {number} t High precision timestamp in ms.
  */
  animate(t) {

    // Are we running?
    if ( this.isRunning ) {
      requestAnimationFrame( this.animate.bind(this) );
    } else {
      return;
    }

    // Delta time
    let dt = t - this.animTimeLast;
    if ( dt < this.animFrameDur ) return;
    dt = dt / this.animSlowdownRate;
    this.animClock += dt;
    this.animTimeLast = t;

    // Start from baseline
    const o = {};
    for( let [mt,x] of Object.entries(this.animBaseline) ) {
      const v = this.getValue(mt);
      if ( v !== x.target ) {
        if ( x.t0 === undefined ) {
          x.t0 = this.animClock;
          x.v0 = v;
        }
        o[mt] = this.valueAnimationSeq( [x.t0,x.t0+1000], [x.v0,x.target], this.animClock, this.easing );
      } else {
        x.t0 = undefined;
      }
    }

    // Animations
    for( let i = 0; i < this.animQueue.length; i++ ) {
      const x = this.animQueue[i];
      if ( this.animClock >= x.ts[0] ) {
        for( let [mt,vs] of Object.entries(x.vs) ) {
          if ( mt === 'subtitles' ) {
            o[mt] = (o.hasOwnProperty(mt) ? o[mt] + vs : "" + vs);
            delete x.vs[mt];
          } else if ( mt === 'speak' ) {
            o[mt] = (o.hasOwnProperty(mt) ? o[mt] + ' ' + vs : "" + vs);
            delete x.vs[mt];
          } else if ( mt === 'pose' ) {
            o[mt] = ""+vs[1];
            delete x.vs[mt];
          } else {
            if ( vs[0] === null ) vs[0] = this.getValue(mt);
            o[mt] = this.valueAnimationSeq( x.ts, vs, this.animClock, this.easing );
            if ( this.animBaseline.hasOwnProperty(mt) ) this.animBaseline[mt].t0 = undefined;
            for( let j=0; j<i; j++ ) {
              if ( this.animQueue[j].vs.hasOwnProperty(mt) ) delete this.animQueue[j].vs[mt];
            }
          }
        }
        if ( this.animClock >= x.ts[x.ts.length-1] ) {
          if ( x.hasOwnProperty('mood') ) this.setMood(x.mood);
          if ( x.loop ) {
            let restrain = ( this.isSpeaking && (x.template.name === 'head' || x.template.name === 'eyes') ) ? 4 : 1;
            this.animQueue[i] = this.animFactory( x.template, (x.loop > 0 ? x.loop - 1 : x.loop), 1, 1/restrain );
          } else {
            this.animQueue.splice(i--, 1);
          }
        }
      }
    }

    // Set fixed
    for( let [mt,x] of Object.entries(this.animFixed) ) {
      const v = this.getValue(mt);
      if ( v !== x.target ) {
        if ( x.t0 === undefined ) {
          x.t0 = this.animClock;
          x.v0 = v;
        }
        o[mt] = this.valueAnimationSeq( [x.t0,x.t0+1000], [x.v0,x.target], this.animClock, this.easing );
      } else {
        if ( o.hasOwnProperty(mt) ) delete o[mt];
        x.t0 = undefined;
      }
      if ( this.animBaseline.hasOwnProperty(mt) ) this.animBaseline[mt].t0 = undefined;
    }

    // Update values
    for( let [mt,x] of Object.entries(o) ) {
      if ( mt === 'subtitles' ) {
        if( this.onSubtitles && typeof this.onSubtitles === "function" ) {
          this.onSubtitles(""+x);
        }
      } else if ( mt === 'speak' ) {
        this.speakText(""+x);
      } else if ( mt === 'pose' ) {
        this.poseName = ""+x;
        this.setPose( this.poseTemplates[ this.poseName ] );
      } else {
        this.setValue(mt,x);
      }
    }

    // Animate
    this.updatePoseBase(this.animClock);
    if ( this.mixer ) {
      this.mixer.update(dt / 1000 * this.mixer.timeScale);
    }
    this.updatePoseDelta();

    // Hip-feet balance
    const box = new THREE.Box3();
    box.setFromObject( this.armature );
    const ltoePos = new THREE.Vector3();
    const rtoePos = new THREE.Vector3();
    this.armature.getObjectByName('LeftToeBase').getWorldPosition(ltoePos);
    this.armature.getObjectByName('RightToeBase').getWorldPosition(rtoePos);
    const hips = this.armature.getObjectByName('Hips');
    hips.position.y -= box.min.y / 2;
    hips.position.x -= (ltoePos.x+rtoePos.x)/4;
    hips.position.z -= (ltoePos.z+rtoePos.z)/2;

    // Camera
    if ( this.cameraClock !== null && this.cameraClock < 2000 ) {
      this.cameraClock += dt;
      if ( this.cameraClock > 2000 ) this.cameraClock = 2000;
      this.camera.position.copy( this.cameraStart.lerp( this.cameraEnd, this.cameraClock / 2000 ) );
      this.controls.target.copy( this.controlsStart.lerp( this.controlsEnd, this.cameraClock / 2000 ) );
      this.controls.update();
    }

    // Autorotate
    if ( this.controls.autoRotate ) this.controls.update();

    this.render();

  }

  /**
  * Reset all the visemes for lips.
  */
  resetLips() {
    Object.values(this.visemes).forEach( x => {
      this.morphs.forEach( y => y.morphTargetInfluences[y.morphTargetDictionary['viseme_'+x]] );
    });
  }

  /**
  * Convert the number string into Finnish words.
  * @param {string} x Number string
  * @return {string} The number in words in Finnish
  */
  numberToFinnishWords(x) {
    const w = [];
    const dg = ['nolla', 'yksi', 'kaksi', 'kolme', 'neljä', 'viisi', 'kuusi',
    'seitsemän', 'kahdeksan', 'yhdeksän', "kymmenen","yksitoista","kaksitoista",
    "kolmetoista","neljätoista","viisitoista","kuusitoista",'seitsemäntoista',
    'kahdeksantoista', 'yhdeksäntoista'];
    let n = parseFloat(x);
    if ( n === undefined ) return x;
    let p = (n,z,w0,w1,w2) => {
      if ( n < z ) return n;
      const d = Math.floor(n/z);
      w.push( w0 + ((d === 1) ? w1 : this.numberToFinnishWords(d.toString()) + w2) );
      return n - d * z;
    }
    if ( n < 0 ) {
      w.push('miinus ');
      n = Math.abs(n);
    }
    n = p(n,1000000000,' ','miljardi',' miljardia');
    n = p(n,1000000,' ','miljoona',' miljoonaa');
    n = p(n,1000,'', 'tuhat','tuhatta');
    n = p(n,100,' ','sata','sataa');
    if ( n > 20 ) n = p(n,10,'','','kymmentä');
    if ( n >= 1) {
      let d = Math.floor(n);
      w.push( dg[d] );
      n -= d;
    }
    if ( n >= 0 && parseFloat(x) < 1) w.push( 'nolla' );
    if ( n > 0 ) {
      let d = (n % 1).toFixed(1) * 10;
      if ( d > 0 ) w.push( ' pilkku ' + dg[d] );
    }
    return w.join('').trim();
  }


  /**
  * Convert symbols to Finnish words.
  * @param {string} s String
  */
  symbolsToFinnishWords(s) {
    return s.replace('/[#_*\'\":;]/g','')
        .replaceAll('%',' prosenttia ')
        .replaceAll('€',' euroa ')
        .replaceAll('&',' ja ')
        .replaceAll('+',' plus ')
        .replace(/(\D)\1\1+/g, "$1$1") // max 2 repeating chars
        .replaceAll('  ',' ') // Only one repeating space
        .replace(/(\d)\,(\d)/g, '$1 pilkku $2') // Number separator
        .replace(/\d+/g, this.numberToFinnishWords.bind(this)) // Numbers to words
        .trim();
  }

  /**
  * Add text to the speech queue.
  * @param {string} s Text.
  * @param {Options} [opt=null] Text-specific options for TTS language, voice, rate and pitch, mood and mute
  * @param {subtitlesfn} [onsubtitles=null] Callback when a subtitle is written
  * @param {number[][]} [excludes=null] Array of [start, end] index arrays to not speak
  */
  speakText(s, opt = null, onsubtitles = null, excludes = null ) {
    opt = opt || {};

    // Classifiers
    const dividersSentence = /[!\.\?\n\p{Extended_Pictographic}]/ug;
    const dividersWord = /[ !\.\?\n\p{Extended_Pictographic}]/ug;
    const speakables = /[\p{L}\p{N},]/ug;
    const emojis = /[\p{Extended_Pictographic}]/ug;

    let t = 0; // time counter
    let markdownWord = ''; // markdown word
    let textWord = ''; // text-to-speech word
    let textSentence = ''; // text-to-speech sentence
    let lipsyncAnim = []; // lip-sync animation sequence
    const letters = [...s];
    for( let i=0; i<letters.length; i++ ) {
      const isLast = i === (letters.length-1);

      // Add letter to spoken word
      if ( letters[i].match(speakables) ) {
        if ( !excludes || excludes.every( x => (i < x[0]) || (i > x[1]) ) ) {
          textWord += letters[i];
        }
      }

      // Add letter to subtitles
      if ( onsubtitles ) {
        markdownWord += letters[i];
      }

      // Add words to sentence and animations
      if ( letters[i].match(dividersWord) || isLast ) {

        // Add to text-to-speech sentence
        if ( textWord.length ) {
          textWord = this.symbolsToFinnishWords(textWord);
          textSentence += ' ' + textWord;
        }

        // Push subtitles to animation queue
        if ( markdownWord.length ) {
          lipsyncAnim.push( {
            template: { name: 'subtitles' },
            ts: [t-0.2],
            vs: {
              subtitles: markdownWord
            },
          });
          markdownWord = '';
        }

        // Push visemes to animation queue
        if ( textWord.length ) {
          const chars = [...textWord];
          for( let j=0; j<chars.length; j++ ) {
            const viseme = this.visemes[chars[j].toLowerCase()];
            if ( viseme ) {
              lipsyncAnim.push( {
                template: { name: 'viseme' },
                ts: [ t-0.5, t+0.5, t+1.5 ],
                vs: {
                  ['viseme_'+viseme]: [null,(viseme === 'PP' || viseme === 'FF') ? 1 : 0.6,0]
                }
              });
              t += this.pauses[chars[j]] || 1;
            }
          }
          textWord = '';
        }
      }

      // Process sentences
      if ( letters[i].match(dividersSentence) || isLast ) {

        // Send sentence to Text-to-speech queue
        textSentence = textSentence.trim();
        if ( textSentence.length || (isLast && lipsyncAnim.length) ) {
          const o = {
            anim: lipsyncAnim
          };
          if ( opt.avatarMood ) o.mood = opt.avatarMood;
          if ( !opt.axisZ ) o.text = textSentence;
          if ( onsubtitles ) o.onSubtitles = onsubtitles;
          if ( opt.ttsLang ) o.lang = opt.ttsLang;
          if ( opt.ttsVoice ) o.voice = opt.ttsVoice;
          if ( opt.ttsRate ) o.rate = opt.ttsRate;
          if ( opt.ttsVoice ) o.pitch = opt.ttsPitch;
          if ( opt.ttsVolume ) o.volume = opt.ttsVolume;
          this.speechQueue.push(o);

          // Reset sentence and animation sequence
          textSentence = '';
          lipsyncAnim = [];
          t = 0;
        }

        // Send emoji, if the divider was a known emoji
        if ( letters[i].match(emojis) ) {
          let emoji = this.animEmojis[letters[i]];
          if ( emoji && emoji.link ) emoji = this.animEmojis[emoji.link];
          if ( emoji ) {
            this.speechQueue.push( { emoji: emoji } );
          }
        }

        this.speechQueue.push( { break: 300 } );
      }

    }

    this.speechQueue.push( { break: 1000 } );

    // Start speaking (if not already)
    this.startSpeaking();
  }

  /**
  * Setup the convolver node based on an impulse.
  * @param {string} [url=null] URL for the impulse, dry impulse if null
  */
  async setReverb( url=null ) {
    if ( url ) {
      // load impulse response from file
      let response = await fetch(url);
      let arraybuffer = await response.arrayBuffer();
      this.audioReverbNode.buffer = await this.audioCtx.decodeAudioData(arraybuffer);
    } else {
      // dry impulse
      const samplerate = this.audioCtx.sampleRate;
      const impulse = this.audioCtx.createBuffer(2, samplerate, samplerate);
      impulse.getChannelData(0)[0] = 1;
      impulse.getChannelData(1)[0] = 1;
      this.audioReverbNode.buffer = impulse;
    }
  }

  /**
  * Set audio gain.
  * @param {number} gain Gain.
  */
  setGain( gain ) {
    this.audioGainNode.gain.value = gain;
  }

  /**
  * Add audio to the speech queue.
  * @param {Object} r Audio message { audio: [], chars: [], ts: [], ds: [] }
  * @param {subtitlesfn} [onsubtitles=null] Callback when a subtitle is written
  */
  speakAudio(r, onsubtitles = null ) {
    const o = {};

    if ( r.chars ) {
      let lipsyncAnim = [];
      let word = '';
      let sWord = 0;
      for( let i=0; i<r.chars.length; i++ ) {
        const c = r.chars[i];
        const s = r.ts[i];
        const d = r.ds[i];

        // Subtitle
        if ( onsubtitles ) {
          word += c;
          if ( c === ' ' ) {
            lipsyncAnim.push( {
              template: { name: 'subtitles' },
              ts: [sWord],
              vs: {
                subtitles: word
              }
            });
            word = '';
            sWord = s;
          }
        }

        // Viseme
        const viseme = this.visemes[c.toLowerCase()];
        if ( viseme ) {

          lipsyncAnim.push( {
            template: { name: 'viseme' },
            ts: [ s - 25, s + 25, s + d + 50 ],
            vs: {
              ['viseme_'+viseme]: [null,(viseme === 'PP' || viseme === 'FF') ? 1 : 0.6,0]
            }
          });
        }
      }

      if ( word.length ) {
        lipsyncAnim.push( {
          template: { name: 'subtitles' },
          ts: [ sWord ],
          vs: {
            subtitles: word
          }
        });
      }

      if ( lipsyncAnim.length ) {
        o.anim = lipsyncAnim;
      }

    }

    if ( r.audio ) {
      o.audio = this.audioCtx.decodeAudioData(r.audio);
    }

    if ( onsubtitles ) {
      o.onSubtitles = onsubtitles;
    }

    if ( Object.keys(o).length ) {
      this.speechQueue.push(o);
      this.startSpeaking();
    }

  }

  // ElevenLabs audio
  async playAudio() {
    if ( this.audioPlaylist.length ) {
      const item = this.audioPlaylist.shift();
      this.audioSource = this.audioCtx.createBufferSource();
      this.audioSource.buffer = item.audio;
      this.audioSource.playbackRate.value = 1 / this.animSlowdownRate;
      this.audioSource.connect(this.audioGainNode);
      this.audioGainNode.connect(this.audioReverbNode);
      this.audioReverbNode.connect(this.audioCtx.destination);
      this.audioSource.addEventListener('ended', () => {
        this.playAudio();
      }, { once: true });

      // Rescale lipsync and push to queue
      if ( item.anim ) {
        item.anim.forEach( x => {
          for(let i=0; i<x.ts.length; i++) {
            x.ts[i] = this.animClock + x.ts[i];
          }
          this.animQueue.push(x);
        });
      }

      this.audioSource.start(0);

    } else {
      this.stateName = 'idle';
      this.isSpeaking = false;
      this.startSpeaking();
    }
  }

  /**
  * Take the next queue item from the speech queue, convert it to text, and
  * load the audio file.
  * @param {boolean} [force=false] If true, forces to proceed (e.g. after break)
  */
  async startSpeaking( force = false ) {
    if ( !this.armature || (this.isSpeaking && !force) ) return;
    if ( this.audioCtx.state === "suspended" ) {
      this.audioCtx.resume();
    }
    this.stateName = 'talking';
    this.isSpeaking = true;
    if ( this.speechQueue.length === 0 ) {
      this.stateName = 'idle';
      this.isSpeaking = false;
      return;
    }
    let line = this.speechQueue.shift();
    if ( line.emoji ) {

      // Look at the camera
      this.lookAtCamera(500);

      // Only emoji
      let duration = line.emoji.dt.reduce((a,b) => a+b,0);
      this.animQueue.push( this.animFactory( line.emoji ) );
      setTimeout( this.startSpeaking.bind(this), duration/1.5, true );
    } else if ( line.break ) {
      // Break
      setTimeout( this.startSpeaking.bind(this), line.break, true );
    } else if ( line.audio ) {

      // Look at the camera
      this.lookAtCamera(500);

      // Make a playlist
      this.audioPlaylist.push({ anim: line.anim, audio: await line.audio });
      this.onSubtitles = line.onSubtitles || null;
      this.resetLips();
      if ( line.mood ) this.setMood( line.mood );
      this.playAudio();

    } else if ( line.text ) {

      // Look at the camera
      this.lookAtCamera(500);

      // Spoken text
      try {
        const o = {
          method: "POST",
          headers: {
            "Content-Type": "application/json; charset=utf-8"
          },
          body: JSON.stringify({
            "input": {
              "text": line.text
            },
            "voice": {
              "languageCode": line.lang || this.avatar.ttsLang || this.opt.ttsLang,
              "name": line.voice || this.avatar.ttsVoice || this.opt.ttsVoice
            },
            "audioConfig": {
              "audioEncoding": this.ttsAudioEncoding,
              "speakingRate": (line.rate || this.avatar.ttsRate || this.opt.ttsRate) + this.mood.speech.deltaRate,
              "pitch": (line.pitch || this.avatar.ttsPitch || this.opt.ttsPitch) + this.mood.speech.deltaPitch,
              "volumeGainDb": (line.volume || this.avatar.ttsVolume || this.opt.ttsVolume) + this.mood.speech.deltaVolume
            }
          })
        };

        // JSON Web Token
        if ( this.opt.jwtGet && typeof this.opt.jwtGet === "function" ) {
          o.headers["Authorization"] = "Bearer " + await this.opt.jwtGet();
        }

        const res = await fetch( this.opt.ttsEndpoint + (this.opt.ttsApikey ? "?key=" + this.opt.ttsApikey : ''), o);

        const data = await res.json();

        if ( res.status === 200 && data && data.audioContent ) {

          // Audio data
          const buf = this.b64ChunksToArrayBuffer([data.audioContent]);
          const audio = await this.audioCtx.decodeAudioData( buf );

          // Rescale based on the duration
          let d = 1000 * audio.duration; // Duration in ms
          if ( d > this.opt.ttsTrimEnd ) d = d - this.opt.ttsTrimEnd;
          const lastElement = line.anim[ line.anim.length-1 ];
          let t = lastElement.ts[ lastElement.ts.length-1 ] + 1;
          line.anim.forEach( x => {
            for(let i=0; i<x.ts.length; i++) {
              x.ts[i] = (x.ts[i] * d/t) + this.opt.ttsTrimStart;
            }
          });

          // Make a playlist
          this.audioPlaylist.push({ anim: line.anim, audio: audio });
          this.onSubtitles = line.onSubtitles || null;
          this.resetLips();
          if ( line.mood ) this.setMood( line.mood );
          this.playAudio();

        } else {
          this.stateName = 'idle';
          this.isSpeaking = false;
          this.startSpeaking();
        }
      } catch (error) {
        console.error("Error:", error);
        this.stateName = 'idle';
        this.isSpeaking = false;
        this.startSpeaking();
      }
    } else if ( line.anim ) {
      // Only subtitles
      this.onSubtitles = line.onSubtitles || null;
      this.resetLips();
      if ( line.mood ) this.setMood( line.mood );
      line.anim.forEach( (x,i) => {
        for(let j=0; j<x.ts.length; j++) {
          x.ts[j] = this.animClock  + 10 * i;
        }
        this.animQueue.push(x);
      });
      setTimeout( this.startSpeaking.bind(this), 10 * line.anim.length, true );
    } else {
      this.stateName = 'idle';
      this.isSpeaking = false;
      this.startSpeaking();
    }
  }

  /**
  * Pause speaking.
  */
  pauseSpeaking() {
    this.audioPlaylist.length = 0;
    this.stateName = 'idle';
    this.isSpeaking = false;
    this.animQueue = this.animQueue.filter( x  => x.template.name !== 'viseme' );
    if ( this.armature ) {
      this.resetLips();
      this.render();
    }
  }

  /**
  * Stop speaking and clear the speech queue.
  */
  stopSpeaking() {
    this.audioPlaylist.length = 0;
    this.speechQueue.length = 0;
    this.animQueue = this.animQueue.filter( x  => x.template.name !== 'viseme' );
    this.stateName = 'idle';
    this.isSpeaking = false;
    if ( this.armature ) {
      this.resetLips();
      this.render();
    }
  }

  /**
  * Turn head and eyes to look at the camera.
  * @param {number} t Time in milliseconds
  */
  lookAtCamera(t) {
    this.lookAt( null, null, t );
  }

  /**
  * Turn head and eyes to look at the point (x,y).
  * @param {number} x X-coordinate relative to visual viewport
  * @param {number} y Y-coordinate relative to visual viewport
  * @param {number} t Time in milliseconds
  */
  lookAt(x,y,t) {

    // Eyes position
    const rect = this.nodeAvatar.getBoundingClientRect();
    const lEye = this.armature.getObjectByName('LeftEye');
    const rEye = this.armature.getObjectByName('RightEye');
    lEye.updateMatrixWorld();
    rEye.updateMatrixWorld();
    const plEye = new THREE.Vector3().setFromMatrixPosition(lEye.matrixWorld);
    const prEye = new THREE.Vector3().setFromMatrixPosition(rEye.matrixWorld);
    const pEyes = new THREE.Vector3().addVectors( plEye, prEye ).divideScalar( 2 );
    pEyes.project(this.camera);
    let eyesx = (pEyes.x + 1) / 2 * rect.width + rect.left;
    let eyesy  = -(pEyes.y - 1) / 2 * rect.height + rect.top;

    // if coordinate not specified, look at the camera
    if ( x === null ) x = eyesx;
    if ( y === null ) y = eyesy;

    // Use body/camera rotation to determine the required head rotation
    let q = this.poseTarget['Hips.rotation'].clone();
    q.multiply( this.poseTarget['Spine.rotation'] );
    q.multiply( this.poseTarget['Spine1.rotation'] );
    q.multiply( this.poseTarget['Spine2.rotation'] );
    q.multiply( this.poseTarget['Neck.rotation'] );
    q.multiply( this.poseTarget['Head.rotation'] );
    let e = new THREE.Euler().setFromQuaternion(q);
    let rx = e.x / (40/24); // Refer to setValue(headRotateX)
    let ry = e.y / (9/4); // Refer to setValue(headRotateY)
    let camerarx = Math.min(0.4, Math.max(-0.4,this.camera.rotation.x));
    let camerary = Math.min(0.4, Math.max(-0.4,this.camera.rotation.y));

    // Calculate new delta
    let maxx = Math.max( window.innerWidth - eyesx, eyesx );
    let maxy = Math.max( window.innerHeight - eyesy, eyesy );
    let rotx = this.convertRange(y,[eyesy-maxy,eyesy+maxy],[-0.3,0.6]) - rx + camerarx;
    let roty = this.convertRange(x,[eyesx-maxx,eyesx+maxx],[-0.8,0.8]) - ry + camerary;
    rotx = Math.min(0.6,Math.max(-0.3,rotx));
    roty = Math.min(0.8,Math.max(-0.8,roty));

    // Randomize head/eyes ratio
    let drotx = (Math.random() - 0.5) / 5;
    let droty = (Math.random() - 0.5) / 5;

    if ( t ) {
      const templateLookAt = {
        name: 'lookat',
        dt: [750,t],
        vs: {
          headRotateX: [ rotx + drotx ],
          headRotateY: [ roty + droty ],
          eyesRotateX: [ - 3 * drotx + 0.1 ],
          eyesRotateY: [ - 5 * droty ]
        }
      };
      this.animQueue.push( this.animFactory( templateLookAt ) );
    }
  }

  /**
  * Get slowdown.
  * @return {numeric} Slowdown factor.
  */
  getSlowdownRate(k) {
    return this.animSlowdownRate;
  }

  /**
  * Set slowdown.
  * @param {numeric} k Slowdown factor.
  */
  setSlowdownRate(k) {
    this.animSlowdownRate = k;
    this.audioSource.playbackRate.value = 1 / this.animSlowdownRate;
  }

  /**
  * Get autorotate speed.
  * @return {numeric} Autorotate speed.
  */
  getAutoRotateSpeed(k) {
    return this.controls.autoRotateSpeed;
  }

  /**
  * Set autorotate.
  * @param {numeric} speed Autorotate speed, e.g. value 2 = 30 secs per orbit at 60fps.
  */
  setAutoRotateSpeed(speed) {
    this.controls.autoRotateSpeed = speed;
    this.controls.autoRotate = (speed > 0);
  }

  /**
  * Start animation cycle.
  */
  start() {
    if ( this.armature && this.isRunning === false ) {
      this.animTimeLast = performance.now();
      this.isRunning = true;
      requestAnimationFrame( this.animate.bind(this) );
    }
  }

  /**
  * Stop animation cycle.
  */
  stop() {
    this.isRunning = false;
  }

  /**
  * Play RPM/Mixamo animation clip.
  * @param {string} url URL to animation file FBX
  * @param {progressfn} [onprogress=null] Callback for progress
  * @param {number} [repeat=1] Repetitions
  * @param {number} [ndx=0] Index of the clip
  * @param {number} [scale=0.01] Position scale factor
  */
  async playAnimation(url, onprogress=null, repeat=1, ndx=0, scale=0.01) {
    if ( !this.armature ) return;

    let item = this.animClips.find( x => x.url === url+'-'+ndx );
    if ( item ) {

      // Reset pose update
      let anim = this.animQueue.find( x => x.template.name === 'pose' );
      if ( anim ) {
        anim.ts[0] = Infinity;
      }

      // Set new pose
      Object.entries(item.pose).forEach( x => {
        this.poseBase[x[0]] = x[1].clone();
        this.poseTarget[x[0]] = x[1].clone();
      });

      // Create a new mixer
      this.mixer = new THREE.AnimationMixer(this.armature);
      this.mixer.addEventListener( 'finished', this.stopAnimation.bind(this), { once: true });

      // Play action
      const action = this.mixer.clipAction(item.clip);
      action.setLoop( THREE.LoopRepeat, repeat );
      action.clampWhenFinished = true;
      action.fadeIn(0.5).play();

    } else {

      // Load animation
      const loader = new FBXLoader();

      let fbx = await loader.loadAsync( url, onprogress );

      if ( fbx && fbx.animations && fbx.animations[ndx] ) {
        let anim = fbx.animations[ndx];

        // Rename and scale Mixamo tracks, create a pose
        const pose = {};
        anim.tracks.forEach( t => {
          t.name = t.name.replaceAll('mixamorig','');
          const ids = t.name.split('.');
          if ( ids[1] === 'position' ) {
            for(let i=0; i<t.values.length; i++ ) {
              t.values[i] = t.values[i] * scale;
            }
            pose[t.name] = new THREE.Vector3(t.values[0],t.values[1],t.values[2]);
          } else if ( ids[1] === 'quaternion' ) {
            pose[ids[0]+'.rotation'] = new THREE.Quaternion(t.values[0],t.values[1],t.values[2],t.values[3]);
          }

        });

        // Add to clips
        this.animClips.push({
          url: url+'-'+ndx,
          clip: anim,
          pose: pose
        });

        // Play
        this.playAnimation(url, onprogress, repeat, ndx, scale);

      } else {
        const msg = 'Animation ' + url + ' (ndx=' + ndx + ') not found';
        console.error(msg);
      }
    }
  }

  /**
  * Stop running animations.
  */
  stopAnimation() {
    this.poseTime = this.animClock;
    this.mixer = null;
    this.posePrev = null; // This forces the pose change
    let anim = this.animQueue.find( x => x.template.name === 'pose' );
    if ( anim ) {
      anim.ts[0] = this.animClock;
    }
  }


  /**
  * Play RPM/Mixamo pose.
  * @param {string} url URL to animation file FBX
  * @param {progressfn} [onprogress=null] Callback for progress
  * @param {number} [dur=5] Duration of the pose in seconds
  * @param {number} [ndx=0] Index of the clip
  * @param {number} [scale=0.01] Position scale factor
  */
  async playPose(url, onprogress=null, dur=5, ndx=0, scale=0.01) {
    if ( !this.armature ) return;

    // Check if we already have the pose template ready
    let pose = this.poseTemplates[url];
    if ( !pose ) {
      const item = this.animPoses.find( x => x.url === url+'-'+ndx );
      if ( item ) {
        pose = item.pose;
      }
    }

    // If we have the template, use it, otherwise try to load it
    if ( pose ) {

      let anim = this.animQueue.find( x => x.template.name === 'pose' );
      if ( anim ) {
        anim.ts[0] = this.animClock + (dur * 1000) + 2000;
      }
      this.setPose( pose );

    } else {

      // Load animation
      const loader = new FBXLoader();

      let fbx = await loader.loadAsync( url, onprogress );

      if ( fbx && fbx.animations && fbx.animations[ndx] ) {
        let anim = fbx.animations[ndx];

        // Create a pose
        const pose = {};
        anim.tracks.forEach( t => {

          // Rename and scale Mixamo tracks
          t.name = t.name.replaceAll('mixamorig','');
          const ids = t.name.split('.');
          if ( ids[1] === 'position' || ids[1] === 'scale' ) {
            pose[t.name] = {
              x: t.values[0] * scale,
              y: t.values[1] * scale,
              z: t.values[2] * scale
            };
          } else if ( ids[1] === 'quaternion' ) {
            pose[t.name] = {
              x: t.values[0],
              y: t.values[1],
              z: t.values[2],
              w: t.values[3]
            }
          }
        });

        // Add to pose
        this.animPoses.push({
          url: url+'-'+ndx,
          pose: pose
        });

        // Play
        this.playPose(url, onprogress, dur, ndx, scale);

      } else {
        const msg = 'Pose ' + url + ' (ndx=' + ndx + ') not found';
        console.error(msg);
      }
    }
  }

  /**
  * Stop the pose. (Functionality is the same as in stopAnimation.)
  */
  stopPose() {
    this.stopAnimation();
  }


}

export { TalkingHead };
