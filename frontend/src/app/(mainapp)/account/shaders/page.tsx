"use client";
import { getUserShaders } from "@/api/shader-api";
import { useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import React from "react";

const ProfileShaders = () => {
  // const data = await getUserShaders();
  // console.log(data);

  const { data, isPending, isError } = useQuery({
    queryKey: ["shaders", "profile"],
    queryFn: getUserShaders,
  });

  if (data) {
    console.log(data);
  }
  const router = useRouter();
  return (
    <div>
      {isPending ? (
        <div>Loading...</div>
      ) : isError ? (
        <div>Error loading shaders</div>
      ) : (
        <div>
          {data?.map((shader: any) => (
            <div
              key={shader.id}
              onClick={() => router.push(`/view/${shader.id}`)}
            >
              <h3>{shader.title}</h3>
              <p>{shader.description}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ProfileShaders;

// const gShaders = [
//   {
//     ver: "0.1",
//     info: {
//       id: "tffGWH",
//       date: "1739128165",
//       viewed: 15,
//       name: "Synthwave Digital Rain",
//       username: "ChristinaCoffin",
//       description:
//         "just another fever dream of hacking noise, sci fi and vibe that I kept tweaking until I got something pretty and relaxing to look at \n\nseems to break on mac on and newer iphones currently :( grr\n\n",
//       likes: 0,
//       published: 1,
//       flags: 0,
//       usePreview: 0,
//       tags: [],
//     },
//     renderpass: [
//       {
//         inputs: [],
//         outputs: [{ id: "4dfGRr", channel: 0 }],
//         code: "\/\/\n\/\/ 'Synthwave Digital Rain'\n\/\/\n\/\/ Copyright (c) 2025 Christina Coffin + Light & Dark Arts.\n\/\/ http:\/\/bsky.app\/profile\/christinacoffin.bsky.social\n\/\/\n\/\/ created for an in-progress project.\n\/\/\n\/\/ Posted here to be educational and inspirational. I hope you enjoy.\n\/\/ best viewed in fullscreen in a dark room.\n\/\/\n\/\/ alot of this code wont make sense with its weird numbers and seemingly random mixes of them.\n\/\/\n\/\/ This is a product of slowly changing layered and animated noise, adding more layers and warping outputs\n\/\/ and then nudging things until i get the colors I want as a polishing step.\n\/\/\n\/\/ 2025-02-09 v.1\n\/\/\n#define PI 3.14159265359\n#define TWO_PI 6.28318530718\n#define SQ3 1.73205080757\n#define SIZE 100.0\n#define I_R 100.0\n#define F_R 400.0\n\n\nconst int nPtx = 25;\nconst float softness = 99.3;\n\nfloat random (int i){\n return fract(sin(float(i)*43.0)*4790.234);   \n}\nfloat softEdge(float edge, float amt){\n    return clamp(1.0 \/ (clamp(edge, 1.0\/amt, 1.0)*amt), 0.,1.);\n}\nfloat random (in vec2 _st) { \n    return fract(sin(dot(_st.xy, vec2(12.9898,78.233))) * 43758.54531237);\n}\n\n\/\/ Based on Morgan McGuire @morgan3d\n\/\/ https:\/\/www.shadertoy.com\/view\/4dS3Wd\nfloat noise (in vec2 _st) {\n    vec2 i = floor(_st);\n    vec2 f = fract(_st);\n\n    \/\/ Four corners in 2D of a tile\n    float a = random(i);\n    float b = random(i + vec2(1.0, 0.0));\n    float c = random(i + vec2(0.0, 1.0));\n    float d = random(i + vec2(1.0, 1.0));\n\n    vec2 u = f * f * (3. - 2.0 * f);\n\n    return mix(a, b, u.x) + \n            (c - a)* u.y * (1. - u.x) + \n            (d - b) * u.x * u.y;\n}\n\nfloat noise (float _st) { \n    return fract(abs(sin(_st)));\n}\n\n\nvec4 warp (float alpha,vec2 main, float seed,float dir){\n\n    float dist = length(main);\n    float chaos = dist * 0.3 * fract(seed);\n\n    float amnt = 0.6+sin(seed)*123.456;\n    float ang = atan(main.y , main.x);\n    \n    vec2 cached_m = main;\n    main.y *= 2.0;\n    main.x = abs(main.y);\n    main = mix( main, cached_m, dir );\n    seed *= main.x;    \n    ang = min( -main.y*(0.001) * abs(ang), abs(atan(main.y, abs(main.x))) );\n    \n    float t = iTime * 0.4 * dir;\n    t *= 1.5 * fract(seed);\/\/ time variance by seed\n    float n = noise(vec2( (seed+ang*amnt+t*0.1) + cos(alpha*13.8+noise(t+ang+seed)*3.0)*0.2+seed\/20.0,seed+t+ang));\n\n    n *= pow(noise(vec2(seed*194.0+ ang*amnt+t + cos(alpha*2.0*n+t*1.1+ang)*12.345* (length(main)*0.01),seed+t+ang)+alpha),0.1);\n    float capture_n0 = n*10.1;\n    n *= pow(noise(vec2(seed*194.1+ ang*amnt+t + cos(alpha*7.0*n+t*1.1+ang)*4.8*chaos,seed+t+ang)+alpha),2.0);\n    n *= pow(noise(vec2(seed*  4.2+ ang*amnt+t + cos(alpha*2.2*n+t*1.1+ang)*1.1*chaos,seed+t+ang)+alpha),3.0);\n    n *= pow(noise(vec2(seed*123.3+ ang*amnt+t + cos(alpha*2.3*n+t*1.1+ang)*0.8*chaos,seed+t+ang)+alpha),4.0);\n    n *= pow(alpha, 2.5 * pow(dist*0.00312, 0.37) );\n\n    float flareboost = chaos*0.12;\/\/ small scale up here, too much and colors start to clip\n    n *= flareboost * (1.3+ang+PI)\/0.9520 * (TWO_PI - ang - PI); \n\n    n += sqrt(alpha * alpha) * (0.26);\n    float hotness = 0.65;\n    n *= .27+( hotness + length(main*alpha*0.00123 ));\n    return vec4(pow(n*2.1, 2.2),n,n,n);\n}\n\n\n\n\nvoid mainImage( out vec4 fragColor, in vec2 fragCoord ){\n    float zoom = 444.0;\/\/ 444 default\n    vec2 uv = (fragCoord.xy * zoom - iResolution.xy* zoom * 0.5)\/iResolution.y;\n\tvec4 c = vec4(0.0);\n    vec4 accumColorPtx = vec4(0.0);    \n\t\n    float len = length(uv)* 0.9015;\/\/ dimming +  scale of flare-out amount (1.0->1.9 (dim))\n\tfloat alpha = pow(clamp(F_R - len + I_R-40.0,0.0,F_R)\/F_R, 2.0);\n    \n    vec2 vignetteUV;\n    vignetteUV = fragCoord.xy;\/\/ copy UV for vignette code       \n\n    vec2 uvp = fragCoord\/iResolution.xy;\n    vec2 tc = uvp;\n    float aspect = iResolution.x \/ iResolution.y;\n\tuvp.x *= aspect;\n\n    float np = float(nPtx);\n    \/\/ magic number offset so it looks a certain nice way at time 0.0 in shadertoy.\n    float ptxTime = 77.62 + (iTime*0.61);\/\/ animate all the soft particle blobs really slowly, this will change the overall lens coloration in screenspace\n    \n    for(int i = 0; i< nPtx; i++){\n        vec2 tc = uvp;        \n        float r = random(i);\n        float r2 = random(i+nPtx);\n        float r3 = random(i+nPtx*2); \n        tc.x -= sin(ptxTime*1.125 + r*30.0)*r;\n        tc.y -= cos(ptxTime*1.125 + r*40.0)*r2*0.5;                    \n        float l = length(tc - vec2(aspect*0.5, 0.5));\n        vec4 orb = vec4(r, r2, r3, softEdge(l, 7.00+float((i+100)*1)*0.00003*softness));\/\/ big soft particle orbs\n        orb.g -= fract( fragCoord.y )*12.0;\n\n        \/\/ to get the special mixing we want, we scale the value up and then take only the fractional remainder which will be the part we accumulate\n        orb.rgb *= 1999.15*float(i); \/\/ boost it , magic number here to get the screenspace lens and haloing\n        orb.rgb = fract(orb.rgb);\/\/ get the fractional amount, too much and it will accumulate too much and each blob is hard to see individually\n        accumColorPtx = mix(accumColorPtx, orb, orb.a);\n    }\n\n    \/\/ starting step, mix in accumulate ptx color to seed the rest of the noise accum for flares\n    c -= 4.1*accumColorPtx.r * warp(alpha,(\n                        vec2(-222,0) \/\/ this is to offset a dark artifact down the middle somewhere off to the side so stuff looks pretty again lol\n                                    +uv) *0.2925, 1114.621,1.0);\/\/ seed negative value so we get some negative colorspace flares potentially that can create a 'color burn'    \n    \n    c = clamp(c, vec4(0.0), vec4(1.0) );                                    \n    \n    c.r = sin(c.r);\n    c.g *= 0.51;\n    c.b *= 0.41;\n\n    c +=      vec4(1.0,-0.32, 1.7, 1.0) *  warp( alpha,uv*0.1,  0.1621, 1.0 ); \n    c +=                                   warp( alpha,uv*0.2, 72.621,  1.0 );\n\tc += .125*vec4(12.0,  1.0, 6.0, 1.0) * warp( alpha,uv    , 35.1412, 1.0 );\n\tc +=      vec4( 1.0,  0.0, 0.0, 1.0) * warp( alpha,uv    , 21.5637, 1.0 );    \n\tc +=      vec4( 0.0,  1.2, 1.0, 1.0) * warp( alpha,uv    ,  1.2637, 2.0 );\n    \n    c += accumColorPtx*(c+0.174);\/\/ add in the lenscover particle blobs that give the image most of its soft glow and colorisation\n    c += 0.1*accumColorPtx; \/\/ boost\/darken down base\n    c -= length(uv)*0.001;\/\/ radial vignette just to get some nicerfalloff away from center, so we can see the hue shifting happening, this also pushes darker colors and more contrast\n    c = clamp(c, vec4(0.0), vec4(1.0) );\n\tfragColor = c;\n\n}\n\n",
//         name: "Image",
//         description: "",
//         type: "image",
//       },
//     ],
//   },
//   {
//     ver: "0.1",
//     info: {
//       id: "X3ccDN",
//       date: "1735056470",
//       viewed: 30956,
//       name: "CRT Beam Simulator (60fps 120Hz)",
//       username: "BlurBusters",
//       description:
//         "CRT electron beam simulator, with realtime & slomo modes. This version is configured for 120Hz screens.\n- Uses @BlurBusters CRT Simulator algorithm\n- Uses @NOTimontyLottes Pixel variable black frame interpolation",
//       likes: 11,
//       published: 3,
//       flags: 0,
//       usePreview: 1,
//       tags: [],
//     },
//     renderpass: [
//       {
//         inputs: [
//           {
//             id: "4dfGRn",
//             filepath:
//               "\/media\/a\/8de3a3924cb95bd0e95a443fff0326c869f9d4979cd1d5b6e94e2a01f5be53e9.jpg",
//             previewfilepath:
//               "\/media\/ap\/8de3a3924cb95bd0e95a443fff0326c869f9d4979cd1d5b6e94e2a01f5be53e9.jpg",
//             type: "texture",
//             channel: 0,
//             sampler: {
//               filter: "mipmap",
//               wrap: "repeat",
//               vflip: "true",
//               srgb: "false",
//               internal: "byte",
//             },
//             published: 1,
//           },
//         ],
//         outputs: [{ id: "4dfGRr", channel: 0 }],
//         code: "\/\/ Github:  https:\/\/github.com\/blurbusters\/crt-beam-simulator\/\n\/\/ Article: https:\/\/www.blurbusters.com\/crt\n\/\/ New version coming January 2025 with additional settings\n\/\/ Please star and monitor the github\n\n\/*********************************************************************************************************************\/\n\/\/\n\/\/                     Blur Busters CRT Beam Simulator BFI\n\/\/                       With Seamless Gamma Correction\n\/\/\n\/\/         From Blur Busters Area 51 Display Science, Research & Engineering\n\/\/                      https:\/\/www.blurbusters.com\/area51\n\/\/\n\/\/             The World's First Realtime Blur-Reducing CRT Simulator\n\/\/       Best for 60fps on 240-480Hz+ Displays, Still Works on 120Hz+ Displays\n\/\/                 Original Version 2022. Publicly Released 2024.\n\/\/\n\/\/ CREDIT: Teamwork of Mark Rejhon @BlurBusters & Timothy Lottes @NOTimothyLottes\n\/\/ Gamma corrected CRT simulator in a shader using clever formula-by-scanline trick\n\/\/ (easily can generate LUTs, for other workflows like FPGAs or Javascript)\n\/\/ - @NOTimothyLottes provided the algorithm for per-pixel BFI (Variable MPRT, higher MPRT for bright pixels)\n\/\/ - @BlurBusters provided the algorithm for the CRT electron beam (2022, publicly released for first time)\n\/\/\n\/\/ Contact Blur Busters for help integrating this in your product (emulator, fpga, filter, display firmware, video processor)\n\/\/\n\/\/ This new algorithm has multiple breakthroughs:\n\/\/\n\/\/ - Seamless; no banding*!  (*Monitor\/OS configuration: SDR=on, HDR=off, ABL=off, APL=off, gamma=2.4)\n\/\/ - Phosphor fadebehind simulation in rolling scan.\n\/\/ - Works on LCDs and OLEDs.\n\/\/ - Variable per-pixel MPRT. Spreads brighter pixels over more refresh cycles than dimmer pixels.\n\/\/ - No image retention on LCDs or OLEDs.\n\/\/ - No integer divisor requirement. Recommended but not necessary (e.g. 60fps 144Hz works!)\n\/\/ - Gain adjustment (less motion blur at lower gain values, by trading off brightness)\n\/\/ - Realtime (for retro & emulator uses) and slo-mo modes (educational)\n\/\/ - Great for softer 60Hz motion blur reduction, less eyestrain than classic 60Hz BFI\/strobe.\n\/\/ - Algorithm can be ported to shader and\/or emulator and\/or FPGA and\/or display firmware.\n\/\/\n\/\/ For best real time CRT realism:\n\/\/\n\/\/ - Reasonably fast performing GPU (many integrated GPUs are unable to keep up)\n\/\/ - Fastest GtG pixel response (A settings-modified OLED looks good with this algorithm)\n\/\/ - As much Hz per CRT Hz! (960Hz better than 480Hz better than 240Hz)\n\/\/ - Integer divisors are still better (just not mandatory)\n\/\/ - Brightest SDR display with linear response (no ABL, no APL), as HDR boost adds banding\n\/\/     (unless you can modify the firmware to make it linear brightness during a rolling scan)\n\/\/\n\/\/ *** IMPORTANT ***\n\/\/ *** DISPLAY REQUIREMENTS ***\n\/\/\n\/\/ - Best for gaming LCD or OLED monitors with fast pixel response.\n\/\/ - More Hz per simulated CRT Hz is better (240Hz, 480Hz simulates 60Hz tubes more accurately than 120Hz).\n\/\/ - OLED (SDR mode) looks better than LCD, but still works on LCD\n\/\/ - May have minor banding with very slow GtG, asymmetric-GtG (VA LCDs), or excessively-overdriven.\n\/\/ - Designed for sample & hold displays with excess refresh rate (LCDs and OLEDs);\n\/\/     Not intended for use with strobed or impulsed displays. Please turn off your displays' BFI\/strobing.\n\/\/     This is because we need 100% software control of the flicker algorithm to simulate a CRT beam.\n\/\/\n\/\/ SDR MODE RECOMMENDED FOR NOW (Due to predictable gamma compensation math)\n\/\/\n\/\/ - Best results occur on display configured to standard SDR gamma curve and ABL\/APL disabled to go 100% bandfree\n\/\/ - Please set your display gamma to 2.2 or 2.4, turn off ABL\/APL in display settings, and set your OLED to SDR mode.  \n\/\/ - Will NOT work well with some FALD and MiniLED due to backlight lagbehind effects.\n\/\/ - Need future API access to OLED ABL\/ABL algorithm to compensate for OLED ABL\/APL windowing interference with algorithm.\n\/\/ - This code is heavily commented because of the complexity of the algorithm.\n\/\/\n\/*********************************************************************************************************************\/\n\/\/\n\/\/ MIT License\n\/\/ \n\/\/ Copyright 2024 Mark Rejhon (@BlurBusters) & Timothy Lottes (@NOTimothyLottes)\n\/\/\n\/\/ Permission is hereby granted, free of charge, to any person obtaining a copy\n\/\/ of this software and associated documentation files (the \u201cSoftware\u201d), to deal\n\/\/ in the Software without restriction, including without limitation the rights\n\/\/ to use, copy, modify, merge, publish, distribute, sublicense, and\/or sell\n\/\/ copies of the Software, and to permit persons to whom the Software is\n\/\/ furnished to do so, subject to the following conditions:\n\/\/\n\/\/ The above copyright notice and this permission notice shall be included in\n\/\/ all copies or substantial portions of the Software.\n\/\/\n\/\/ THE SOFTWARE IS PROVIDED \u201cAS IS\u201d, WITHOUT WARRANTY OF ANY KIND, EXPRESS OR\n\/\/ IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,\n\/\/ FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE\n\/\/ AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER\n\/\/ LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,\n\/\/ OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN\n\/\/ THE SOFTWARE.\n\/\/\n\/*********************************************************************************************************************\/\n\n\/\/------------------------------------------------------------------------------------------------\n\/\/ Constants Definitions\n\n\/\/ Play with the documented constants:\n\/\/ - REALTIME: Use FRAMES_PER_HZ=4 for 240Hz and FRAMES_PER_HZ=8 for 480Hz, to simulate a 60Hz tube in realtime\n\/\/ - SLOMO: Use crazy large FRAMES_PER_HZ numbers to watch a CRT tube like a slo-motion video. Try FRAMES_PER_HZ=100!\n\/\/ - FRAMESTEP: Use low frame rates to inspect frames.  Try FRAMES_PER_HZ=8 and FPS_DIVISOR=0.02! \n\/\/ All are floats (keep a .0 for integers)\n\n#define MOTION_SPEED    10.0\n\n  \/\/ Ratio of native Hz per CRT Hz.  More native Hz per CRT Hz simulates CRT butter.\n  \/\/   - Use 4.0 for 60fps at 240Hz realtime.\n  \/\/   - Use 2.4 for 60fps at 144Hz realtime.\n  \/\/   - Use 2.75 for 60fps at 165Hz realtime.\n  \/\/   - Use ~100 for super-slo-motion.\n  \/\/   - Best to keep it integer divisor but not essential (works!)\n#define FRAMES_PER_HZ   2.0     \/\/ For 120 Hz\n\n  \/\/ Your display's gamma value. Necessary to prevent horizontal-bands artifacts.\n#define GAMMA           2.4\n\n  \/\/ Brightness-vs-motionblur tradeoff for bright pixel.\n  \/\/   - Defacto simulates fast\/slow phosphor. \n  \/\/   - 1.0 is unchanged brightness (same as non-CRT, but no blur reduction for brightest pixels, only for dimmer piels).\n  \/\/   - 0.5 is half brightness spread over fewer frames (creates lower MPRT persistence for darker pixels).\n  \/\/   - ~0.7 recommended for 240Hz+, ~0.5 recommended for 120Hz due to limited inHz:outHz ratio.\n#define GAIN_VS_BLUR    0.5\n\n  \/\/ Splitscreen versus mode for comparing to non-CRT-simulated\n#define SPLITSCREEN     1        \/\/ 1 to enable splitscreen to compare to non-CRT, 0 to disable splitscreen\n#define SPLITSCREEN_X   0.50     \/\/ For user to compare; horizontal splitscreen percentage (0=verticals off, 0.5=left half, 1=full sim).\n#define SPLITSCREEN_Y   0.00     \/\/ For user to compare; vertical splitscreen percentage (0=horizontal off, 0.5=bottom half, 1=full sim).\n#define SPLITSCREEN_BORDER_PX 2  \/\/ Splitscreen border thickness in pixels\n#define SPLITSCREEN_MATCH_BRIGHTNESS 1    \/\/ 1 to match brightness of CRT, 0 for original brightness of original frame\n\n  \/\/ Reduced frame rate mode\n  \/\/   - This can be helpful to see individual CRT-simulated frames better (educational!)\n  \/\/   - 1.0 is framerate=Hz, 0.5 is framerate being half of Hz, 0.1 is framerate being 10% of real Hz.\n#define FPS_DIVISOR     1.0    \/\/ Slow down or speed up the simulation\n\n  \/\/ LCD SAVER SYSTEM\n  \/\/   - Prevents image retention from BFI interfering with LCD voltage polarity inversion algorithm\n  \/\/   - When LCD_ANTI_RETENTION is enabled:\n  \/\/     - Automatically prevents FRAMES_PER_HZ from remaining an even integer by conditionally adding a slew float.\n  \/\/     - FRAMES_PER_HZ 2 becomes 2.001, 4 becomes 4.001, and 6 becomes 6.001, etc.  \n  \/\/     - Scientific Reason: https:\/\/forums.blurbusters.com\/viewtopic.php?t=7539 BFI interaction with LCD voltage polarity inversion \n  \/\/     - Known Side effect: You've decoupled the CRT simulators' own VSYNC from the real displays' VSYNC.  But magically, there's no tearing artifacts :-)\n  \/\/     - Not needed for OLEDs, safe to turn off, but should be ON by default to be foolproof.\n#define LCD_ANTI_RETENTION  true\n#define LCD_INVERSION_COMPENSATION_SLEW 0.001\n\n  \/\/ CRT SCAN DIRECTION. Can be useful to counteract an OS rotation of your display\n  \/\/   - 1 default (top to bottom), recommended\n  \/\/   - 2 reverse (bottom to top)\n  \/\/   - 3 portrait (left to right)\n  \/\/   - 4 reverse portrait (right to left)\n#define SCAN_DIRECTION 1\n\n\/\/-------------------------------------------------------------------------------------------------\n\/\/ Utility Macros\n\n#define clampPixel(a) clamp(a, vec3(0.0), vec3(1.0))\n\n\/\/ Selection Function: Returns 'b' if 'p' is true, else 'a'.\nfloat SelF1(float a, float b, bool p) { return p ? b : a; }\n\n#define IS_INTEGER(x) (floor(x) == x)\n#define IS_EVEN_INTEGER(x) (IS_INTEGER(x) && IS_INTEGER(x\/2.0))\n\n\/\/ LCD SAVER (prevent image retention)\n\/\/ Adds a slew to FRAMES_PER_HZ when ANTI_RETENTION is enabled and FRAMES_PER_HZ is an exact even integer.\n\/\/ We support non-integer FRAMES_PER_HZ, so this is a magically convenient solution\n\/\/ This is likely best done at the high level\nconst float EFFECTIVE_FRAMES_PER_HZ = (LCD_ANTI_RETENTION && IS_EVEN_INTEGER(float(FRAMES_PER_HZ))) \n                                      ? float(FRAMES_PER_HZ) + LCD_INVERSION_COMPENSATION_SLEW \n                                      : float(FRAMES_PER_HZ);\n                                      \n\/\/-------------------------------------------------------------------------------------------------\n\/\/ sRGB Encoding and Decoding Functions, to gamma correct\/uncorrect\n\n\/\/ Encode linear color to sRGB. (applies gamma curve)\nfloat linear2srgb(float c){\n    vec3 j = vec3(0.0031308 * 12.92, 12.92, 1.0 \/ GAMMA);\n    vec2 k = vec2(1.055, -0.055);\n    return clamp(j.x, c * j.y, pow(c, j.z) * k.x + k.y);\n}\nvec3 linear2srgb(vec3 c){\n  return vec3(linear2srgb(c.r), linear2srgb(c.g), linear2srgb(c.b));\n}\n\n\/\/ Decode sRGB color to linear. (undoes gamma curve)\nfloat srgb2linear(float c){\n    vec3 j = vec3(0.04045, 1.0 \/ 12.92, GAMMA);\n    vec2 k = vec2(1.0 \/ 1.055, 0.055 \/ 1.055);\n    return SelF1(c * j.y, pow(c * k.x + k.y, j.z), c > j.x);\n}\nvec3 srgb2linear(vec3 c){\n  return vec3(srgb2linear(c.r), srgb2linear(c.g), srgb2linear(c.b));\n}\n\n\/\/------------------------------------------------------------------------------------------------\n\/\/ Gets pixel from the unprocessed framebuffer.\n\/\/\n\/\/ Placeholder for accessing the 3 trailing unprocessed frames (for simulating CRT on)\n\/\/   - Frame counter represents simulated CRT refresh cycle number.\n\/\/   - Always assign numbers to your refresh cycles. For reliability, keep a 3 frame trailing buffer.\n\/\/   - We index by frame counter because it is necessary for blending adjacent CRT refresh cycles, \n\/\/      for the phosphor fade algorithm on old frame at bottom, and new frames at top.\n\/\/   - Framebuffer to retrieve from should be unscaled (e.g. original game resolution or emulator resolution).\n\/\/   - (If you do optional additional processing such as scaling+scanlines+masks, do it post-processing after this stage)\n\/\/ DEMO version:\n\/\/   - We cheat by horizontally shifting shifted pixel reads from a texture.\n\/\/ PRODUCTION version:\n\/\/   - Put your own code to retrieve a pixel from your series of unprocessed frame buffers.\n\/\/     IMPORTANT: For integration into firmware\/software\/emulators\/games, this must be executed \n\/\/     at refresh cycle granularity independently of your underlying games' framerate! \n\/\/     There are three independent frequencies involved:\n\/\/     - Native Hz (your actual physical display)\n\/\/     - Simulated CRT Hz (Hz of simulated CRT tube)\n\/\/     - Underlying content frame rate (this shader doesn't need to know; TODO: Unless you plan to simulate VRR-CRT)\n\/\/\nvec3 getPixelFromOrigFrame(vec2 uv, float getFromHzNumber, float currentHzCounter)\n{\n\n    \/\/ We simulate missing framebuffers (for accurate real world case)\n    if ((getFromHzNumber > currentHzCounter) ||          \/\/ Frame not rendered yet\n        (getFromHzNumber < currentHzCounter - 2.0)) {    \/\/ Frame over 3 frames ago\n        return vec3(0.0, 0.0, 0.0);\n    }\n\n    \/\/ Continuous horizontal shift depending on hzCounter\n    float shiftAmount = MOTION_SPEED \/ 1000.0;\n    float baseShift = fract(getFromHzNumber * shiftAmount);\n\n    \/\/ We'll offset uv.x by baseShift, and round-off to screen coordinates to avoid seam artifacts\n    float px = 1.0 \/ iResolution.x;\n    uv.x = mod(uv.x + baseShift + px*0.1, 1.0) - px*0.1;\n\n    \/\/ Sample texture with no mip (textureLod)\n    vec4 c = textureLod(iChannel0, uv, 0.0);\n    return c.rgb;\n}\n\n\/\/-------------------------------------------------------------------------------------------------\n\/\/ CRT Rolling Scan Simulation With Phosphor Fade + Brightness Redistributor Algorithm\n\/\/\n\/\/ New variable 'per-pixel MPRT' algorithm that mimics CRT phosphor decay too.\n\/\/ - We emit as many photons as possible as early as possible, and if we can't emit it all (e.g. RGB 255)\n\/\/   then we continue emitting in the next refresh cycle until we've hit our target (gamma-compensated).\n\/\/ - This is a clever trick to keep CRT simulation brighter but still benefit motion clarity of most colors.\n\/\/   Besides, real CRT tubes behave roughly similar too! (overexcited phosphor take longer to decay)\n\/\/ - This also concurrently produces a phosphor-fade style behavior.\n\/\/ - Win-win!\n\/\/\n\/\/ Parameters:\n\/\/ - c2: total brightness * framesPerHz per channel.\n\/\/ - crtRasterPos: normalized raster position [0..1] representing current scan line\n\/\/ - phaseOffset: fractional start of the brightness interval [0..1] (0.0 at top, 1.0 at bottom).\n\/\/ - framesPerHz: Number of frames per Hz. (Does not have to be integer divisible!)\n\/\/\nvec3 getPixelFromSimulatedCRT(vec2 uv, float crtRasterPos, float crtHzCounter, float framesPerHz)\n{\n    \/\/ Get pixels from three consecutive refresh cycles\n    vec3 pixelPrev2 = srgb2linear(getPixelFromOrigFrame(uv, crtHzCounter - 2.0, crtHzCounter));\n    vec3 pixelPrev1 = srgb2linear(getPixelFromOrigFrame(uv, crtHzCounter - 1.0, crtHzCounter));\n    vec3 pixelCurr  = srgb2linear(getPixelFromOrigFrame(uv, crtHzCounter,      crtHzCounter));\n\n    vec3 result = vec3(0.0);\n\n    \/\/ Compute \"photon budgets\" for all three cycles\n    float brightnessScale = framesPerHz * GAIN_VS_BLUR;\n    vec3 colorPrev2 = pixelPrev2 * brightnessScale;\n    vec3 colorPrev1 = pixelPrev1 * brightnessScale;\n    vec3 colorCurr  = pixelCurr  * brightnessScale;\n      \n#if SCAN_DIRECTION == 1\n    float tubePos = (1.0 - uv.y);  \/\/ Top to bottom\n#elif SCAN_DIRECTION == 2\n    float tubePos = uv.y;          \/\/ Bottom to top\n#elif SCAN_DIRECTION == 3\n    float tubePos = uv.x;          \/\/ Left to right\n#elif SCAN_DIRECTION == 4\n    float tubePos = (1.0 - uv.x);  \/\/ Right to left\n#endif\n\n    \/\/ Process each color channel independently\n    for (int ch = 0; ch < 3; ch++) \n    {\n        \/\/ Get brightness lengths for all three cycles\n        float Lprev2 = colorPrev2[ch];\n        float Lprev1 = colorPrev1[ch];\n        float Lcurr  = colorCurr[ch];\n        \n        if (Lprev2 <= 0.0 && Lprev1 <= 0.0 && Lcurr <= 0.0) {\n            result[ch] = 0.0;\n            continue;\n        }\n        \n        \/\/ TODO: Optimize to use only 2 frames.\n        \/\/ Unfortunately I need all 3 right now because if I only do 2,\n        \/\/ I get artifacts at either top OR bottom edge (can't eliminate both)\n        \/\/ What I may do is use a phase offset (e.g. input framebuffer chain\n        \/\/ rotates forward in middle of emulated CRT Hz), as a workaround, and\n        \/\/ see if that solves the problem and reduces the queue to 2.\n        \/\/ (Will attempt later)\n\n        \/\/ Convert normalized values to frame space\n        float tubeFrame = tubePos * framesPerHz;\n        float fStart = crtRasterPos * framesPerHz;\n        float fEnd = fStart + 1.0;\n\n        \/\/ Define intervals for all three trailing refresh cycles\n        float startPrev2 = tubeFrame - framesPerHz;\n        float endPrev2   = startPrev2 + Lprev2;\n\n        float startPrev1 = tubeFrame;\n        float endPrev1   = startPrev1 + Lprev1;\n\n        float startCurr  = tubeFrame + framesPerHz; \/\/ Fix seam for top edge\n        float endCurr    = startCurr + Lcurr;\n        \n        \/\/ Calculate overlaps for all three cycles\n        #define INTERVAL_OVERLAP(Astart, Aend, Bstart, Bend) max(0.0, min(Aend, Bend) - max(Astart, Bstart))\n        float overlapPrev2 = INTERVAL_OVERLAP(startPrev2, endPrev2, fStart, fEnd);\n        float overlapPrev1 = INTERVAL_OVERLAP(startPrev1, endPrev1, fStart, fEnd);\n        float overlapCurr  = INTERVAL_OVERLAP(startCurr,  endCurr,  fStart, fEnd);\n\n        \/\/ Sum all overlaps for final brightness\n        result[ch] = overlapPrev2 + overlapPrev1 + overlapCurr;\n    }\n\n    return linear2srgb(result);\n}\n\n\/\/-------------------------------------------------------------------------------------------------\n\/\/ Main Image Function\n\/\/\nvoid mainImage(out vec4 fragColor, in vec2 fragCoord) {\n\n    \/\/ LCD SAVER (prevent image retention)\n    \/\/ Adds a slew to FRAMES_PER_HZ when ANTI_RETENTION is enabled and FRAMES_PER_HZ is an exact even integer.\n    \/\/ We support non-integer FRAMES_PER_HZ, so this is a magically convenient solution\n    \/\/ This may be best done at the high level (software) rather than shader level (here)\n    \/\/ But we do this here, just for safety's sake (see https:\/\/forums.blurbusters.com\/viewtopic.php?t=7539 )\n    float EFFECTIVE_FRAMES_PER_HZ = (LCD_ANTI_RETENTION && IS_EVEN_INTEGER(FRAMES_PER_HZ)) \n                                     ? FRAMES_PER_HZ + LCD_INVERSION_COMPENSATION_SLEW \n                                     : FRAMES_PER_HZ;\n                    \n    \/\/ Automatically use slo-mo mode for 60Hz visitors (useless at under ~100Hz)\n    if (EFFECTIVE_FRAMES_PER_HZ < 2.0) EFFECTIVE_FRAMES_PER_HZ = 100.0;\n\n    \/\/ uv: Normalized coordinates ranging from (0,0) at the bottom-left to (1,1) at the top-right.\n    vec2 uv = fragCoord \/ iResolution.xy;\n    \n    vec4 c = vec4(0.0, 0.0, 0.0, 1.0);\n\n    \/\/-------------------------------------------------------------------------------------------------\n    \/\/ CRT beam calculations\n    \n    \/\/ Frame counter, which may be compensated by slo-mo modes (FPS_DIVISOR). Does not need to be integer divisible.\n    float effectiveFrame = floor(float(iFrame) * FPS_DIVISOR);\n\n    \/\/ Normalized raster position [0..1] representing current position of simulated CRT electron beam\n    float crtRasterPos = mod(effectiveFrame, EFFECTIVE_FRAMES_PER_HZ) \/ EFFECTIVE_FRAMES_PER_HZ;\n\n    \/\/ CRT refresh cycle counter\n    float crtHzCounter = floor(effectiveFrame \/ EFFECTIVE_FRAMES_PER_HZ);\n\n#if SPLITSCREEN == 1\n    \/\/-------------------------------------------------------------------------------------------------\n    \/\/ Splitscreen processing\n\n    \/\/ crtTube: Boolean indicating whether the current pixel is within the CRT-BFI region.\n    \/\/ When splitscreen is off, apply CRT-BFI to entire screen\n    bool crtArea = !((uv.x > SPLITSCREEN_X) && (uv.y > SPLITSCREEN_Y));\n\n    \/\/ Calculate border regions (in pixels)\n    float borderXpx = abs(fragCoord.x - SPLITSCREEN_X * iResolution.x);\n    float borderYpx = abs(fragCoord.y - SPLITSCREEN_Y * iResolution.y);\n    \n    \/\/ Border only exists in the non-BFI region (x > SPLITSCREEN_X || y > SPLITSCREEN_Y)\n    bool inBorderX = borderXpx < float(SPLITSCREEN_BORDER_PX) && uv.y > SPLITSCREEN_Y;\n    bool inBorderY = borderYpx < float(SPLITSCREEN_BORDER_PX) && uv.x > SPLITSCREEN_X;\n    bool inBorder = (SPLITSCREEN == 1) && (inBorderX || inBorderY);\n\n    \/\/ We #ifdef the if statement away for shader efficiency (though this specific one didn't affect performance)\n    if (crtArea) {\n#endif\n\n        \/\/-----------------------------------------------------------------------------------------\n        \/\/ Get CRT simulated version of pixel\n        fragColor.rgb = getPixelFromSimulatedCRT(uv, crtRasterPos, crtHzCounter, EFFECTIVE_FRAMES_PER_HZ);\n\n#if SPLITSCREEN == 1\n    }\n    else if (!inBorder) {\n        fragColor.rgb = getPixelFromOrigFrame(uv, crtHzCounter, crtHzCounter);\n#if SPLITSCREEN_MATCH_BRIGHTNESS == 1\n        \/\/ Brightness compensation for unprocessed pixels through similar gamma-curve (match gamma of simulated CRT)\n        fragColor.rgb = srgb2linear(fragColor.rgb) * GAIN_VS_BLUR;\n        fragColor.rgb = clampPixel(linear2srgb(fragColor.rgb));\n#endif\n    }\n#endif\n}\n\n\/\/-------------------------------------------------------------------------------------------------\n\/\/ Please credit MARK REJHON (BLUR BUSTERS) & TIMOTHY LOTTE if this algorithm is used in your project\/product.\n\/\/ Hundreds of hours of research was done on related work that led to this algorithm.\n\/\/-------------------------------------------------------------------------------------------------\n",
//         name: "Image",
//         description: "",
//         type: "image",
//       },
//     ],
//   },
//   {
//     ver: "0.1",
//     info: {
//       id: "XfKfWd",
//       date: "1734588981",
//       viewed: 25455,
//       name: "CRT Beam Simulator (60fps 240Hz)",
//       username: "BlurBusters",
//       description:
//         "CRT electron beam simulator, with realtime & slomo modes. This version is configured for 240Hz screens.\n- Uses @BlurBusters CRT Simulator algorithm\n- Uses @NOTimontyLottes Pixel variable black frame interpolation",
//       likes: 19,
//       published: 3,
//       flags: 0,
//       usePreview: 1,
//       tags: [],
//     },
//     renderpass: [
//       {
//         inputs: [
//           {
//             id: "4dfGRn",
//             filepath:
//               "\/media\/a\/8de3a3924cb95bd0e95a443fff0326c869f9d4979cd1d5b6e94e2a01f5be53e9.jpg",
//             previewfilepath:
//               "\/media\/ap\/8de3a3924cb95bd0e95a443fff0326c869f9d4979cd1d5b6e94e2a01f5be53e9.jpg",
//             type: "texture",
//             channel: 0,
//             sampler: {
//               filter: "mipmap",
//               wrap: "repeat",
//               vflip: "true",
//               srgb: "false",
//               internal: "byte",
//             },
//             published: 1,
//           },
//         ],
//         outputs: [{ id: "4dfGRr", channel: 0 }],
//         code: "\/\/ Github:  https:\/\/github.com\/blurbusters\/crt-beam-simulator\/\n\/\/ Article: https:\/\/www.blurbusters.com\/crt\n\n\/\/ FIX PROBLEMS \/ FLICKER \/ BANDING: https:\/\/github.com\/blurbusters\/crt-beam-simulator\/issues\/4\n\/\/ New version coming January 2025 with additional settings\n\/\/ Please star and monitor the github\n\n\/*********************************************************************************************************************\/\n\/\/\n\/\/                     Blur Busters CRT Beam Simulator BFI\n\/\/                       With Seamless Gamma Correction\n\/\/\n\/\/         From Blur Busters Area 51 Display Science, Research & Engineering\n\/\/                      https:\/\/www.blurbusters.com\/area51\n\/\/\n\/\/             The World's First Realtime Blur-Reducing CRT Simulator\n\/\/       Best for 60fps on 240-480Hz+ Displays, Still Works on 120Hz+ Displays\n\/\/                 Original Version 2022. Publicly Released 2024.\n\/\/\n\/\/ CREDIT: Teamwork of Mark Rejhon @BlurBusters & Timothy Lottes @NOTimothyLottes\n\/\/ Gamma corrected CRT simulator in a shader using clever formula-by-scanline trick\n\/\/ (easily can generate LUTs, for other workflows like FPGAs or Javascript)\n\/\/ - @NOTimothyLottes provided the algorithm for per-pixel BFI (Variable MPRT, higher MPRT for bright pixels)\n\/\/ - @BlurBusters provided the algorithm for the CRT electron beam (2022, publicly released for first time)\n\/\/\n\/\/ Contact Blur Busters for help integrating this in your product (emulator, fpga, filter, display firmware, video processor)\n\/\/\n\/\/ This new algorithm has multiple breakthroughs:\n\/\/\n\/\/ - Seamless; no banding*!  (*Monitor\/OS configuration: SDR=on, HDR=off, ABL=off, APL=off, gamma=2.4)\n\/\/ - Phosphor fadebehind simulation in rolling scan.\n\/\/ - Works on LCDs and OLEDs.\n\/\/ - Variable per-pixel MPRT. Spreads brighter pixels over more refresh cycles than dimmer pixels.\n\/\/ - No image retention on LCDs or OLEDs.\n\/\/ - No integer divisor requirement. Recommended but not necessary (e.g. 60fps 144Hz works!)\n\/\/ - Gain adjustment (less motion blur at lower gain values, by trading off brightness)\n\/\/ - Realtime (for retro & emulator uses) and slo-mo modes (educational)\n\/\/ - Great for softer 60Hz motion blur reduction, less eyestrain than classic 60Hz BFI\/strobe.\n\/\/ - Algorithm can be ported to shader and\/or emulator and\/or FPGA and\/or display firmware.\n\/\/\n\/\/ For best real time CRT realism:\n\/\/\n\/\/ - Reasonably fast performing GPU (many integrated GPUs are unable to keep up)\n\/\/ - Fastest GtG pixel response (A settings-modified OLED looks good with this algorithm)\n\/\/ - As much Hz per CRT Hz! (960Hz better than 480Hz better than 240Hz)\n\/\/ - Integer divisors are still better (just not mandatory)\n\/\/ - Brightest SDR display with linear response (no ABL, no APL), as HDR boost adds banding\n\/\/     (unless you can modify the firmware to make it linear brightness during a rolling scan)\n\/\/\n\/\/ *** IMPORTANT ***\n\/\/ *** DISPLAY REQUIREMENTS ***\n\/\/\n\/\/ - Best for gaming LCD or OLED monitors with fast pixel response.\n\/\/ - More Hz per simulated CRT Hz is better (240Hz, 480Hz simulates 60Hz tubes more accurately than 120Hz).\n\/\/ - OLED (SDR mode) looks better than LCD, but still works on LCD\n\/\/ - May have minor banding with very slow GtG, asymmetric-GtG (VA LCDs), or excessively-overdriven.\n\/\/ - Designed for sample & hold displays with excess refresh rate (LCDs and OLEDs);\n\/\/     Not intended for use with strobed or impulsed displays. Please turn off your displays' BFI\/strobing.\n\/\/     This is because we need 100% software control of the flicker algorithm to simulate a CRT beam.\n\/\/\n\/\/ SDR MODE RECOMMENDED FOR NOW (Due to predictable gamma compensation math)\n\/\/\n\/\/ - Best results occur on display configured to standard SDR gamma curve and ABL\/APL disabled to go 100% bandfree\n\/\/ - Please set your display gamma to 2.2 or 2.4, turn off ABL\/APL in display settings, and set your OLED to SDR mode.  \n\/\/ - Will NOT work well with some FALD and MiniLED due to backlight lagbehind effects.\n\/\/ - Need future API access to OLED ABL\/ABL algorithm to compensate for OLED ABL\/APL windowing interference with algorithm.\n\/\/ - This code is heavily commented because of the complexity of the algorithm.\n\/\/\n\/*********************************************************************************************************************\/\n\/\/\n\/\/ MIT License\n\/\/ \n\/\/ Copyright 2024 Mark Rejhon (@BlurBusters) & Timothy Lottes (@NOTimothyLottes)\n\/\/\n\/\/ Permission is hereby granted, free of charge, to any person obtaining a copy\n\/\/ of this software and associated documentation files (the \u201cSoftware\u201d), to deal\n\/\/ in the Software without restriction, including without limitation the rights\n\/\/ to use, copy, modify, merge, publish, distribute, sublicense, and\/or sell\n\/\/ copies of the Software, and to permit persons to whom the Software is\n\/\/ furnished to do so, subject to the following conditions:\n\/\/\n\/\/ The above copyright notice and this permission notice shall be included in\n\/\/ all copies or substantial portions of the Software.\n\/\/\n\/\/ THE SOFTWARE IS PROVIDED \u201cAS IS\u201d, WITHOUT WARRANTY OF ANY KIND, EXPRESS OR\n\/\/ IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,\n\/\/ FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE\n\/\/ AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER\n\/\/ LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,\n\/\/ OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN\n\/\/ THE SOFTWARE.\n\/\/\n\/*********************************************************************************************************************\/\n\n\/\/------------------------------------------------------------------------------------------------\n\/\/ Constants Definitions\n\n\/\/ Play with the documented constants:\n\/\/ - REALTIME: Use FRAMES_PER_HZ=4 for 240Hz and FRAMES_PER_HZ=8 for 480Hz, to simulate a 60Hz tube in realtime\n\/\/ - SLOMO: Use crazy large FRAMES_PER_HZ numbers to watch a CRT tube like a slo-motion video. Try FRAMES_PER_HZ=100!\n\/\/ - FRAMESTEP: Use low frame rates to inspect frames.  Try FRAMES_PER_HZ=8 and FPS_DIVISOR=0.02! \n\/\/ All are floats (keep a .0 for integers)\n\n#define MOTION_SPEED    10.0\n\n  \/\/ Ratio of native Hz per CRT Hz.  More native Hz per CRT Hz simulates CRT butter.\n  \/\/   - Use 4.0 for 60fps at 240Hz realtime.\n  \/\/   - Use 2.4 for 60fps at 144Hz realtime.\n  \/\/   - Use 2.75 for 60fps at 165Hz realtime.\n  \/\/   - Use ~100 for super-slo-motion.\n  \/\/   - Best to keep it integer divisor but not essential (works!)\n#define FRAMES_PER_HZ   4.0     \/\/ For 240 Hz\n\n  \/\/ Your display's gamma value. Necessary to prevent horizontal-bands artifacts.\n#define GAMMA           2.4\n\n  \/\/ Brightness-vs-motionblur tradeoff for bright pixel.\n  \/\/   - Defacto simulates fast\/slow phosphor. \n  \/\/   - 1.0 is unchanged brightness (same as non-CRT, but no blur reduction for brightest pixels, only for dimmer piels).\n  \/\/   - 0.5 is half brightness spread over fewer frames (creates lower MPRT persistence for darker pixels).\n  \/\/   - ~0.7 recommended for 240Hz+, ~0.5 recommended for 120Hz due to limited inHz:outHz ratio.\n#define GAIN_VS_BLUR    0.7\n\n  \/\/ Splitscreen versus mode for comparing to non-CRT-simulated\n#define SPLITSCREEN     1        \/\/ 1 to enable splitscreen to compare to non-CRT, 0 to disable splitscreen\n#define SPLITSCREEN_X   0.50     \/\/ For user to compare; horizontal splitscreen percentage (0=verticals off, 0.5=left half, 1=full sim).\n#define SPLITSCREEN_Y   0.00     \/\/ For user to compare; vertical splitscreen percentage (0=horizontal off, 0.5=bottom half, 1=full sim).\n#define SPLITSCREEN_BORDER_PX 2  \/\/ Splitscreen border thickness in pixels\n#define SPLITSCREEN_MATCH_BRIGHTNESS 1    \/\/ 1 to match brightness of CRT, 0 for original brightness of original frame\n\n  \/\/ Reduced frame rate mode\n  \/\/   - This can be helpful to see individual CRT-simulated frames better (educational!)\n  \/\/   - 1.0 is framerate=Hz, 0.5 is framerate being half of Hz, 0.1 is framerate being 10% of real Hz.\n#define FPS_DIVISOR     1.0    \/\/ Slow down or speed up the simulation\n\n  \/\/ LCD SAVER SYSTEM\n  \/\/   - Prevents image retention from BFI interfering with LCD voltage polarity inversion algorithm\n  \/\/   - When LCD_ANTI_RETENTION is enabled:\n  \/\/     - Automatically prevents FRAMES_PER_HZ from remaining an even integer by conditionally adding a slew float.\n  \/\/     - FRAMES_PER_HZ 2 becomes 2.001, 4 becomes 4.001, and 6 becomes 6.001, etc.  \n  \/\/     - Scientific Reason: https:\/\/forums.blurbusters.com\/viewtopic.php?t=7539 BFI interaction with LCD voltage polarity inversion \n  \/\/     - Known Side effect: You've decoupled the CRT simulators' own VSYNC from the real displays' VSYNC.  But magically, there's no tearing artifacts :-)\n  \/\/     - Not needed for OLEDs, safe to turn off, but should be ON by default to be foolproof.\n#define LCD_ANTI_RETENTION  true\n#define LCD_INVERSION_COMPENSATION_SLEW 0.001\n\n  \/\/ CRT SCAN DIRECTION. Can be useful to counteract an OS rotation of your display\n  \/\/   - 1 default (top to bottom), recommended\n  \/\/   - 2 reverse (bottom to top)\n  \/\/   - 3 portrait (left to right)\n  \/\/   - 4 reverse portrait (right to left)\n#define SCAN_DIRECTION 1\n\n\/\/-------------------------------------------------------------------------------------------------\n\/\/ Utility Macros\n\n#define clampPixel(a) clamp(a, vec3(0.0), vec3(1.0))\n\n\/\/ Selection Function: Returns 'b' if 'p' is true, else 'a'.\nfloat SelF1(float a, float b, bool p) { return p ? b : a; }\n\n#define IS_INTEGER(x) (floor(x) == x)\n#define IS_EVEN_INTEGER(x) (IS_INTEGER(x) && IS_INTEGER(x\/2.0))\n\n\/\/ LCD SAVER (prevent image retention)\n\/\/ Adds a slew to FRAMES_PER_HZ when ANTI_RETENTION is enabled and FRAMES_PER_HZ is an exact even integer.\n\/\/ We support non-integer FRAMES_PER_HZ, so this is a magically convenient solution\n\/\/ This is likely best done at the high level\nconst float EFFECTIVE_FRAMES_PER_HZ = (LCD_ANTI_RETENTION && IS_EVEN_INTEGER(float(FRAMES_PER_HZ))) \n                                      ? float(FRAMES_PER_HZ) + LCD_INVERSION_COMPENSATION_SLEW \n                                      : float(FRAMES_PER_HZ);\n                                      \n\/\/-------------------------------------------------------------------------------------------------\n\/\/ sRGB Encoding and Decoding Functions, to gamma correct\/uncorrect\n\n\/\/ Encode linear color to sRGB. (applies gamma curve)\nfloat linear2srgb(float c){\n    vec3 j = vec3(0.0031308 * 12.92, 12.92, 1.0 \/ GAMMA);\n    vec2 k = vec2(1.055, -0.055);\n    return clamp(j.x, c * j.y, pow(c, j.z) * k.x + k.y);\n}\nvec3 linear2srgb(vec3 c){\n  return vec3(linear2srgb(c.r), linear2srgb(c.g), linear2srgb(c.b));\n}\n\n\/\/ Decode sRGB color to linear. (undoes gamma curve)\nfloat srgb2linear(float c){\n    vec3 j = vec3(0.04045, 1.0 \/ 12.92, GAMMA);\n    vec2 k = vec2(1.0 \/ 1.055, 0.055 \/ 1.055);\n    return SelF1(c * j.y, pow(c * k.x + k.y, j.z), c > j.x);\n}\nvec3 srgb2linear(vec3 c){\n  return vec3(srgb2linear(c.r), srgb2linear(c.g), srgb2linear(c.b));\n}\n\n\/\/------------------------------------------------------------------------------------------------\n\/\/ Gets pixel from the unprocessed framebuffer.\n\/\/\n\/\/ Placeholder for accessing the 3 trailing unprocessed frames (for simulating CRT on)\n\/\/   - Frame counter represents simulated CRT refresh cycle number.\n\/\/   - Always assign numbers to your refresh cycles. For reliability, keep a 3 frame trailing buffer.\n\/\/   - We index by frame counter because it is necessary for blending adjacent CRT refresh cycles, \n\/\/      for the phosphor fade algorithm on old frame at bottom, and new frames at top.\n\/\/   - Framebuffer to retrieve from should be unscaled (e.g. original game resolution or emulator resolution).\n\/\/   - (If you do optional additional processing such as scaling+scanlines+masks, do it post-processing after this stage)\n\/\/ DEMO version:\n\/\/   - We cheat by horizontally shifting shifted pixel reads from a texture.\n\/\/ PRODUCTION version:\n\/\/   - Put your own code to retrieve a pixel from your series of unprocessed frame buffers.\n\/\/     IMPORTANT: For integration into firmware\/software\/emulators\/games, this must be executed \n\/\/     at refresh cycle granularity independently of your underlying games' framerate! \n\/\/     There are three independent frequencies involved:\n\/\/     - Native Hz (your actual physical display)\n\/\/     - Simulated CRT Hz (Hz of simulated CRT tube)\n\/\/     - Underlying content frame rate (this shader doesn't need to know; TODO: Unless you plan to simulate VRR-CRT)\n\/\/\nvec3 getPixelFromOrigFrame(vec2 uv, float getFromHzNumber, float currentHzCounter)\n{\n\n    \/\/ We simulate missing framebuffers (for accurate real world case)\n    if ((getFromHzNumber > currentHzCounter) ||          \/\/ Frame not rendered yet\n        (getFromHzNumber < currentHzCounter - 2.0)) {    \/\/ Frame over 3 frames ago\n        return vec3(0.0, 0.0, 0.0);\n    }\n\n    \/\/ Continuous horizontal shift depending on hzCounter\n    float shiftAmount = MOTION_SPEED \/ 1000.0;\n    float baseShift = fract(getFromHzNumber * shiftAmount);\n\n    \/\/ We'll offset uv.x by baseShift, and round-off to screen coordinates to avoid seam artifacts\n    float px = 1.0 \/ iResolution.x;\n    uv.x = mod(uv.x + baseShift + px*0.1, 1.0) - px*0.1;\n\n    \/\/ Sample texture with no mip (textureLod)\n    vec4 c = textureLod(iChannel0, uv, 0.0);\n    return c.rgb;\n}\n\n\/\/-------------------------------------------------------------------------------------------------\n\/\/ CRT Rolling Scan Simulation With Phosphor Fade + Brightness Redistributor Algorithm\n\/\/\n\/\/ New variable 'per-pixel MPRT' algorithm that mimics CRT phosphor decay too.\n\/\/ - We emit as many photons as possible as early as possible, and if we can't emit it all (e.g. RGB 255)\n\/\/   then we continue emitting in the next refresh cycle until we've hit our target (gamma-compensated).\n\/\/ - This is a clever trick to keep CRT simulation brighter but still benefit motion clarity of most colors.\n\/\/   Besides, real CRT tubes behave roughly similar too! (overexcited phosphor take longer to decay)\n\/\/ - This also concurrently produces a phosphor-fade style behavior.\n\/\/ - Win-win!\n\/\/\n\/\/ Parameters:\n\/\/ - c2: total brightness * framesPerHz per channel.\n\/\/ - crtRasterPos: normalized raster position [0..1] representing current scan line\n\/\/ - phaseOffset: fractional start of the brightness interval [0..1] (0.0 at top, 1.0 at bottom).\n\/\/ - framesPerHz: Number of frames per Hz. (Does not have to be integer divisible!)\n\/\/\nvec3 getPixelFromSimulatedCRT(vec2 uv, float crtRasterPos, float crtHzCounter, float framesPerHz)\n{\n    \/\/ Get pixels from three consecutive refresh cycles\n    vec3 pixelPrev2 = srgb2linear(getPixelFromOrigFrame(uv, crtHzCounter - 2.0, crtHzCounter));\n    vec3 pixelPrev1 = srgb2linear(getPixelFromOrigFrame(uv, crtHzCounter - 1.0, crtHzCounter));\n    vec3 pixelCurr  = srgb2linear(getPixelFromOrigFrame(uv, crtHzCounter,      crtHzCounter));\n\n    vec3 result = vec3(0.0);\n\n    \/\/ Compute \"photon budgets\" for all three cycles\n    float brightnessScale = framesPerHz * GAIN_VS_BLUR;\n    vec3 colorPrev2 = pixelPrev2 * brightnessScale;\n    vec3 colorPrev1 = pixelPrev1 * brightnessScale;\n    vec3 colorCurr  = pixelCurr  * brightnessScale;\n      \n#if SCAN_DIRECTION == 1\n    float tubePos = (1.0 - uv.y);  \/\/ Top to bottom\n#elif SCAN_DIRECTION == 2\n    float tubePos = uv.y;          \/\/ Bottom to top\n#elif SCAN_DIRECTION == 3\n    float tubePos = uv.x;          \/\/ Left to right\n#elif SCAN_DIRECTION == 4\n    float tubePos = (1.0 - uv.x);  \/\/ Right to left\n#endif\n\n    \/\/ Process each color channel independently\n    for (int ch = 0; ch < 3; ch++) \n    {\n        \/\/ Get brightness lengths for all three cycles\n        float Lprev2 = colorPrev2[ch];\n        float Lprev1 = colorPrev1[ch];\n        float Lcurr  = colorCurr[ch];\n        \n        if (Lprev2 <= 0.0 && Lprev1 <= 0.0 && Lcurr <= 0.0) {\n            result[ch] = 0.0;\n            continue;\n        }\n        \n        \/\/ TODO: Optimize to use only 2 frames.\n        \/\/ Unfortunately I need all 3 right now because if I only do 2,\n        \/\/ I get artifacts at either top OR bottom edge (can't eliminate both)\n        \/\/ What I may do is use a phase offset (e.g. input framebuffer chain\n        \/\/ rotates forward in middle of emulated CRT Hz), as a workaround, and\n        \/\/ see if that solves the problem and reduces the queue to 2.\n        \/\/ (Will attempt later)\n\n        \/\/ Convert normalized values to frame space\n        float tubeFrame = tubePos * framesPerHz;\n        float fStart = crtRasterPos * framesPerHz;\n        float fEnd = fStart + 1.0;\n\n        \/\/ Define intervals for all three trailing refresh cycles\n        float startPrev2 = tubeFrame - framesPerHz;\n        float endPrev2   = startPrev2 + Lprev2;\n\n        float startPrev1 = tubeFrame;\n        float endPrev1   = startPrev1 + Lprev1;\n\n        float startCurr  = tubeFrame + framesPerHz; \/\/ Fix seam for top edge\n        float endCurr    = startCurr + Lcurr;\n        \n        \/\/ Calculate overlaps for all three cycles\n        #define INTERVAL_OVERLAP(Astart, Aend, Bstart, Bend) max(0.0, min(Aend, Bend) - max(Astart, Bstart))\n        float overlapPrev2 = INTERVAL_OVERLAP(startPrev2, endPrev2, fStart, fEnd);\n        float overlapPrev1 = INTERVAL_OVERLAP(startPrev1, endPrev1, fStart, fEnd);\n        float overlapCurr  = INTERVAL_OVERLAP(startCurr,  endCurr,  fStart, fEnd);\n\n        \/\/ Sum all overlaps for final brightness\n        result[ch] = overlapPrev2 + overlapPrev1 + overlapCurr;\n    }\n\n    return linear2srgb(result);\n}\n\n\/\/-------------------------------------------------------------------------------------------------\n\/\/ Main Image Function\n\/\/\nvoid mainImage(out vec4 fragColor, in vec2 fragCoord) {\n\n    \/\/ LCD SAVER (prevent image retention)\n    \/\/ Adds a slew to FRAMES_PER_HZ when ANTI_RETENTION is enabled and FRAMES_PER_HZ is an exact even integer.\n    \/\/ We support non-integer FRAMES_PER_HZ, so this is a magically convenient solution\n    \/\/ This may be best done at the high level (software) rather than shader level (here)\n    \/\/ But we do this here, just for safety's sake (see https:\/\/forums.blurbusters.com\/viewtopic.php?t=7539 )\n    float EFFECTIVE_FRAMES_PER_HZ = (LCD_ANTI_RETENTION && IS_EVEN_INTEGER(FRAMES_PER_HZ)) \n                                     ? FRAMES_PER_HZ + LCD_INVERSION_COMPENSATION_SLEW \n                                     : FRAMES_PER_HZ;\n                    \n    \/\/ Automatically use slo-mo mode for 60Hz visitors (useless at under ~100Hz)\n    if (EFFECTIVE_FRAMES_PER_HZ < 2.0) EFFECTIVE_FRAMES_PER_HZ = 100.0;\n\n    \/\/ uv: Normalized coordinates ranging from (0,0) at the bottom-left to (1,1) at the top-right.\n    vec2 uv = fragCoord \/ iResolution.xy;\n    \n    vec4 c = vec4(0.0, 0.0, 0.0, 1.0);\n\n    \/\/-------------------------------------------------------------------------------------------------\n    \/\/ CRT beam calculations\n    \n    \/\/ Frame counter, which may be compensated by slo-mo modes (FPS_DIVISOR). Does not need to be integer divisible.\n    float effectiveFrame = floor(float(iFrame) * FPS_DIVISOR);\n\n    \/\/ Normalized raster position [0..1] representing current position of simulated CRT electron beam\n    float crtRasterPos = mod(effectiveFrame, EFFECTIVE_FRAMES_PER_HZ) \/ EFFECTIVE_FRAMES_PER_HZ;\n\n    \/\/ CRT refresh cycle counter\n    float crtHzCounter = floor(effectiveFrame \/ EFFECTIVE_FRAMES_PER_HZ);\n\n#if SPLITSCREEN == 1\n    \/\/-------------------------------------------------------------------------------------------------\n    \/\/ Splitscreen processing\n\n    \/\/ crtTube: Boolean indicating whether the current pixel is within the CRT-BFI region.\n    \/\/ When splitscreen is off, apply CRT-BFI to entire screen\n    bool crtArea = !((uv.x > SPLITSCREEN_X) && (uv.y > SPLITSCREEN_Y));\n\n    \/\/ Calculate border regions (in pixels)\n    float borderXpx = abs(fragCoord.x - SPLITSCREEN_X * iResolution.x);\n    float borderYpx = abs(fragCoord.y - SPLITSCREEN_Y * iResolution.y);\n    \n    \/\/ Border only exists in the non-BFI region (x > SPLITSCREEN_X || y > SPLITSCREEN_Y)\n    bool inBorderX = borderXpx < float(SPLITSCREEN_BORDER_PX) && uv.y > SPLITSCREEN_Y;\n    bool inBorderY = borderYpx < float(SPLITSCREEN_BORDER_PX) && uv.x > SPLITSCREEN_X;\n    bool inBorder = (SPLITSCREEN == 1) && (inBorderX || inBorderY);\n\n    \/\/ We #ifdef the if statement away for shader efficiency (though this specific one didn't affect performance)\n    if (crtArea) {\n#endif\n\n        \/\/-----------------------------------------------------------------------------------------\n        \/\/ Get CRT simulated version of pixel\n        fragColor.rgb = getPixelFromSimulatedCRT(uv, crtRasterPos, crtHzCounter, EFFECTIVE_FRAMES_PER_HZ);\n\n#if SPLITSCREEN == 1\n    }\n    else if (!inBorder) {\n        fragColor.rgb = getPixelFromOrigFrame(uv, crtHzCounter, crtHzCounter);\n#if SPLITSCREEN_MATCH_BRIGHTNESS == 1\n        \/\/ Brightness compensation for unprocessed pixels through similar gamma-curve (match gamma of simulated CRT)\n        fragColor.rgb = srgb2linear(fragColor.rgb) * GAIN_VS_BLUR;\n        fragColor.rgb = clampPixel(linear2srgb(fragColor.rgb));\n#endif\n    }\n#endif\n}\n\n\/\/-------------------------------------------------------------------------------------------------\n\/\/ Please credit MARK REJHON (BLUR BUSTERS) & TIMOTHY LOTTE if this algorithm is used in your project\/product.\n\/\/ Hundreds of hours of research was done on related work that led to this algorithm.\n\/\/-------------------------------------------------------------------------------------------------\n",
//         name: "Image",
//         description: "",
//         type: "image",
//       },
//     ],
//   },
//   {
//     ver: "0.1",
//     info: {
//       id: "ssjyWc",
//       date: "1644259512",
//       viewed: 513049,
//       name: "Lover 2",
//       username: "FabriceNeyret2",
//       description:
//         'Fork of "Lover" by wyatt. https:\/\/shadertoy.com\/view\/fsjyR3  \ntrying to mimic Karthik Dondeti https:\/\/twitter.com\/d0ndeti\/status\/1479814051366539264 series.\n\n- A:use close curve, starting as circle. k partics\n- I: basic drawing\nstill, there are crossings.',
//       likes: 435,
//       published: 3,
//       flags: 48,
//       usePreview: 1,
//       tags: [],
//     },
//     renderpass: [
//       {
//         inputs: [
//           {
//             id: "4dXGR8",
//             filepath: "\/media\/previz\/buffer00.png",
//             previewfilepath: "\/media\/previz\/buffer00.png",
//             type: "buffer",
//             channel: 0,
//             sampler: {
//               filter: "linear",
//               wrap: "clamp",
//               vflip: "true",
//               srgb: "false",
//               internal: "byte",
//             },
//             published: 1,
//           },
//           {
//             id: "XsXGR8",
//             filepath: "\/media\/previz\/buffer01.png",
//             previewfilepath: "\/media\/previz\/buffer01.png",
//             type: "buffer",
//             channel: 1,
//             sampler: {
//               filter: "linear",
//               wrap: "clamp",
//               vflip: "true",
//               srgb: "false",
//               internal: "byte",
//             },
//             published: 1,
//           },
//           {
//             id: "4sXGR8",
//             filepath: "\/media\/previz\/buffer02.png",
//             previewfilepath: "\/media\/previz\/buffer02.png",
//             type: "buffer",
//             channel: 2,
//             sampler: {
//               filter: "linear",
//               wrap: "clamp",
//               vflip: "true",
//               srgb: "false",
//               internal: "byte",
//             },
//             published: 1,
//           },
//           {
//             id: "XdfGR8",
//             filepath: "\/media\/previz\/buffer03.png",
//             previewfilepath: "\/media\/previz\/buffer03.png",
//             type: "buffer",
//             channel: 3,
//             sampler: {
//               filter: "linear",
//               wrap: "clamp",
//               vflip: "true",
//               srgb: "false",
//               internal: "byte",
//             },
//             published: 1,
//           },
//         ],
//         outputs: [{ id: "4dfGRr", channel: 0 }],
//         code: '\/\/ Fork of "Lover" by wyatt. https:\/\/shadertoy.com\/view\/fsjyR3\n\/\/ 2022-02-07 18:41:05\n\nMain  Q = B( U ).zzzz; }\n',
//         name: "Image",
//         description: "",
//         type: "image",
//       },
//       {
//         inputs: [],
//         outputs: [],
//         code: "vec2 R; int I;\n#define A(U) texture(iChannel0,(U)\/R)\n#define B(U) texture(iChannel1,(U)\/R)\n#define C(U) texture(iChannel2,(U)\/R)\n#define D(U) texture(iChannel3,(U)\/R)\n#define Main void mainImage(out vec4 Q, in vec2 U) { R = iResolution.xy; I = iFrame;\nfloat G2 (float w, float s) {\n    return 0.15915494309*exp(-.5*w*w\/s\/s)\/(s*s);\n}\nfloat G1 (float w, float s) {\n    return 0.3989422804*exp(-.5*w*w\/s\/s)\/(s);\n}\nfloat heart (vec2 u) {\n    u -= vec2(.5,.4)*R;\n    u.y -= 10.*sqrt(abs(u.x));\n    u.y *= 1.;\n    u.x *= .8;\n    if (length(u)<.35*R.y) return 1.;\n    else return 0.;\n}\n\nfloat _12(vec2 U) {\n\n    return clamp(floor(U.x)+floor(U.y)*R.x,0.,R.x*R.y);\n\n}\n\nvec2 _21(float i) {\n\n    return clamp(vec2(mod(i,R.x),floor(i\/R.x))+.5,vec2(0),R);\n\n}\n\nfloat sg (vec2 p, vec2 a, vec2 b) {\n    float i = clamp(dot(p-a,b-a)\/dot(b-a,b-a),0.,1.);\n\tfloat l = (length(p-a-(b-a)*i));\n    return l;\n}\n\nfloat hash (vec2 p)\n{\n\tvec3 p3  = fract(vec3(p.xyx) * .1031);\n    p3 += dot(p3, p3.yzx + 33.33);\n    return fract((p3.x + p3.y) * p3.z);\n}\nfloat noise(vec2 p)\n{\n    vec4 w = vec4(\n        floor(p),\n        ceil (p)  );\n    float \n        _00 = hash(w.xy),\n        _01 = hash(w.xw),\n        _10 = hash(w.zy),\n        _11 = hash(w.zw),\n    _0 = mix(_00,_01,fract(p.y)),\n    _1 = mix(_10,_11,fract(p.y));\n    return mix(_0,_1,fract(p.x));\n}\nfloat fbm (vec2 p) {\n    float o = 0.;\n    for (float i = 0.; i < 3.; i++) {\n        o += noise(.1*p)\/3.;\n        o += .2*exp(-2.*abs(sin(.02*p.x+.01*p.y)))\/3.;\n        p *= 2.;\n    }\n    return o;\n}\nvec2 grad (vec2 p) {\n    float \n    n = fbm(p+vec2(0,1)),\n    e = fbm(p+vec2(1,0)),\n    s = fbm(p-vec2(0,1)),\n    w = fbm(p-vec2(1,0));\n    return vec2(e-w,n-s);\n}\n",
//         name: "Common",
//         description: "",
//         type: "common",
//       },
//       {
//         inputs: [
//           {
//             id: "4dXGRr",
//             filepath: "\/presets\/tex00.jpg",
//             previewfilepath: "\/presets\/tex00.jpg",
//             type: "keyboard",
//             channel: 2,
//             sampler: {
//               filter: "linear",
//               wrap: "clamp",
//               vflip: "true",
//               srgb: "false",
//               internal: "byte",
//             },
//             published: 1,
//           },
//           {
//             id: "4dXGR8",
//             filepath: "\/media\/previz\/buffer00.png",
//             previewfilepath: "\/media\/previz\/buffer00.png",
//             type: "buffer",
//             channel: 0,
//             sampler: {
//               filter: "linear",
//               wrap: "clamp",
//               vflip: "true",
//               srgb: "false",
//               internal: "byte",
//             },
//             published: 1,
//           },
//           {
//             id: "XdfGR8",
//             filepath: "\/media\/previz\/buffer03.png",
//             previewfilepath: "\/media\/previz\/buffer03.png",
//             type: "buffer",
//             channel: 3,
//             sampler: {
//               filter: "linear",
//               wrap: "clamp",
//               vflip: "true",
//               srgb: "false",
//               internal: "byte",
//             },
//             published: 1,
//           },
//         ],
//         outputs: [{ id: "4dXGR8", channel: 0 }],
//         code: "#define keyClick(a)   ( texelFetch(iChannel2,ivec2(a,0),0).x > 0.)\n\n#define  k ( .02 * R.x*R.y )\nMain \n    float i = _12(U);\n    Q = A(U);\n    \n    vec2 f = vec2(0);\n    \n    if ( i < k ) {\n    for (float j = -20.; j <= 20.; j++) \n        if (j!=0.) {\/\/  && j+i>=0. && j+i<R.x*R.y) {\n        vec4 a = A(_21(mod(i+j,k)));\n        \/\/if (j!=0. && j+i>=0. && j+i<R.x*R.y) {\n        \/\/vec4 a = A(_21(i+j));\n        vec2 r = a.xy-Q.xy;\n        float l = length(r);\n        f += 50.*r\/sqrt(l)*(l-abs(j))*(G1(j,10.)+2.*G1(j,5.));\n    }\n    for (float x = -2.; x <= 2.; x++)\n    for (float y = -2.; y <= 2.; y++) {\n        vec2 u = vec2(x,y);\n        vec4 d = D(Q.xy+u);\n        f -= 100.*d.w*u;\n    }\n    if (length(f)>.1) f = .1*normalize(f);\n    Q.zw += f-.03*Q.zw;\n    Q.xy += f+1.5*Q.zw*inversesqrt(1.+dot(Q.zw,Q.zw));\n    \n    vec4 m = .5*( A(_21(i-1.)) + A(_21(i+1.)) );\n    Q.zw = mix(Q.zw,m.zw,0.1);\n    Q.xy = mix(Q.xy,m.xy,0.01);\n    if (Q.x>R.x)Q.y=.5*R.y,Q.z=-10.;\n    if (Q.x<0.)Q.y=.5*R.y,Q.z=10.;\n    }\n     if (iFrame < 1 || keyClick(32)) {\n        if ( i > k ) \n          Q = vec4(R+i,0,0); \n        else\n          Q = vec4(.5*R + .25*R.y* cos( 6.28*i\/k + vec2(0,1.57)), 0,0 );\n    \/\/  Q = vec4(i-.5*R.x*R.y,.5*R.y,0,0);\n    }\n    \n\n}",
//         name: "Buffer A",
//         description: "",
//         type: "buffer",
//       },
//       {
//         inputs: [
//           {
//             id: "4dXGR8",
//             filepath: "\/media\/previz\/buffer00.png",
//             previewfilepath: "\/media\/previz\/buffer00.png",
//             type: "buffer",
//             channel: 0,
//             sampler: {
//               filter: "linear",
//               wrap: "clamp",
//               vflip: "true",
//               srgb: "false",
//               internal: "byte",
//             },
//             published: 1,
//           },
//           {
//             id: "XsXGR8",
//             filepath: "\/media\/previz\/buffer01.png",
//             previewfilepath: "\/media\/previz\/buffer01.png",
//             type: "buffer",
//             channel: 1,
//             sampler: {
//               filter: "linear",
//               wrap: "clamp",
//               vflip: "true",
//               srgb: "false",
//               internal: "byte",
//             },
//             published: 1,
//           },
//         ],
//         outputs: [{ id: "XsXGR8", channel: 0 }],
//         code: "void XY (vec2 U, inout vec4 Q, vec4 q) {\n    if (length(U-A(_21(q.x)).xy)<length(U-A(_21(Q.x)).xy)) Q.x = q.x;\n}\nvoid ZW (vec2 U, inout vec4 Q, vec4 q) {\n    if (length(U-A(_21(q.y)).xy)<length(U-A(_21(Q.y)).xy)) Q.y = q.y;\n}\nMain\n    Q = B(U);\n    for (int x=-1;x<=1;x++)\n    for (int y=-1;y<=1;y++) {\n        XY(U,Q,B(U+vec2(x,y)));\n    }\n    XY(U,Q,vec4(Q.x-3.));\n    XY(U,Q,vec4(Q.x+3.));\n    XY(U,Q,vec4(Q.x-7.));\n    XY(U,Q,vec4(Q.x+7.));\n    if (I%12==0) \n        Q.y = _12(U);\n    else\n    {\n        float k = exp2(float(11-(I%12)));\n        ZW(U,Q,B(U+vec2(0,k)));\n        ZW(U,Q,B(U+vec2(k,0)));\n        ZW(U,Q,B(U-vec2(0,k)));\n        ZW(U,Q,B(U-vec2(k,0)));\n    }\n    XY(U,Q,Q.yxzw);\n    if (I<1) Q = vec4(_12(U));\n    \n    vec4 a1 = A(_21(Q.x));\n    vec4 a2 = A(_21(Q.x+1.));\n    vec4 a3 = A(_21(Q.x-1.));\n    float l1 = sg(U,a1.xy,a2.xy);\n    float l2 = sg(U,a1.xy,a3.xy);\n    float l = min(l1,l2);\n    Q.z = Q.w = smoothstep(2.,1.,l);\n    Q.w -= .2*heart(U);\n    \n}",
//         name: "Buffer B",
//         description: "",
//         type: "buffer",
//       },
//       {
//         inputs: [
//           {
//             id: "4dXGR8",
//             filepath: "\/media\/previz\/buffer00.png",
//             previewfilepath: "\/media\/previz\/buffer00.png",
//             type: "buffer",
//             channel: 0,
//             sampler: {
//               filter: "linear",
//               wrap: "clamp",
//               vflip: "true",
//               srgb: "false",
//               internal: "byte",
//             },
//             published: 1,
//           },
//           {
//             id: "XsXGR8",
//             filepath: "\/media\/previz\/buffer01.png",
//             previewfilepath: "\/media\/previz\/buffer01.png",
//             type: "buffer",
//             channel: 1,
//             sampler: {
//               filter: "linear",
//               wrap: "clamp",
//               vflip: "true",
//               srgb: "false",
//               internal: "byte",
//             },
//             published: 1,
//           },
//         ],
//         outputs: [{ id: "4sXGR8", channel: 0 }],
//         code: "Main \n    Q = vec4(0);\n    for (float x = -30.; x <= 30.; x++)\n        Q += G1(x,10.)*B(U+vec2(x,0)).w;\n}",
//         name: "Buffer C",
//         description: "",
//         type: "buffer",
//       },
//       {
//         inputs: [
//           {
//             id: "4dXGR8",
//             filepath: "\/media\/previz\/buffer00.png",
//             previewfilepath: "\/media\/previz\/buffer00.png",
//             type: "buffer",
//             channel: 0,
//             sampler: {
//               filter: "linear",
//               wrap: "clamp",
//               vflip: "true",
//               srgb: "false",
//               internal: "byte",
//             },
//             published: 1,
//           },
//           {
//             id: "XsXGR8",
//             filepath: "\/media\/previz\/buffer01.png",
//             previewfilepath: "\/media\/previz\/buffer01.png",
//             type: "buffer",
//             channel: 1,
//             sampler: {
//               filter: "linear",
//               wrap: "clamp",
//               vflip: "true",
//               srgb: "false",
//               internal: "byte",
//             },
//             published: 1,
//           },
//           {
//             id: "4sXGR8",
//             filepath: "\/media\/previz\/buffer02.png",
//             previewfilepath: "\/media\/previz\/buffer02.png",
//             type: "buffer",
//             channel: 2,
//             sampler: {
//               filter: "linear",
//               wrap: "clamp",
//               vflip: "true",
//               srgb: "false",
//               internal: "byte",
//             },
//             published: 1,
//           },
//           {
//             id: "XdfGR8",
//             filepath: "\/media\/previz\/buffer03.png",
//             previewfilepath: "\/media\/previz\/buffer03.png",
//             type: "buffer",
//             channel: 3,
//             sampler: {
//               filter: "linear",
//               wrap: "clamp",
//               vflip: "true",
//               srgb: "false",
//               internal: "byte",
//             },
//             published: 1,
//           },
//         ],
//         outputs: [{ id: "XdfGR8", channel: 0 }],
//         code: "Main \n    Q = vec4(0);\n    for (float y = -30.; y <= 30.; y++)\n        Q += G1(y,10.)*C(U+vec2(0,y)).w;\n        \n    Q = mix(Q,D(U),.5);\n}",
//         name: "Buffer D",
//         description: "",
//         type: "buffer",
//       },
//     ],
//   },
//   {
//     ver: "0.1",
//     info: {
//       id: "M3ycWt",
//       date: "1739009435",
//       viewed: 457,
//       name: "Volumetric Radiance Cascades",
//       username: "Mathis",
//       description:
//         "Radiance cascades using voxels\nTemporal merging with probe occlusion, multibounce lighting and BRDF evaluation\n\nSee Image-tab for controls",
//       likes: 52,
//       published: 1,
//       flags: 48,
//       usePreview: 0,
//       tags: [],
//     },
//     renderpass: [
//       {
//         inputs: [
//           {
//             id: "4dX3Rr",
//             filepath: "\/media\/a\/\/media\/previz\/cubemap00.png",
//             previewfilepath: "\/media\/ap\/\/media\/previz\/cubemap00.png",
//             type: "cubemap",
//             channel: 3,
//             sampler: {
//               filter: "linear",
//               wrap: "clamp",
//               vflip: "true",
//               srgb: "false",
//               internal: "byte",
//             },
//             published: 1,
//           },
//           {
//             id: "4dXGR8",
//             filepath: "\/media\/previz\/buffer00.png",
//             previewfilepath: "\/media\/previz\/buffer00.png",
//             type: "buffer",
//             channel: 0,
//             sampler: {
//               filter: "nearest",
//               wrap: "clamp",
//               vflip: "true",
//               srgb: "false",
//               internal: "byte",
//             },
//             published: 1,
//           },
//           {
//             id: "XsXGR8",
//             filepath: "\/media\/previz\/buffer01.png",
//             previewfilepath: "\/media\/previz\/buffer01.png",
//             type: "buffer",
//             channel: 1,
//             sampler: {
//               filter: "nearest",
//               wrap: "clamp",
//               vflip: "true",
//               srgb: "false",
//               internal: "byte",
//             },
//             published: 1,
//           },
//           {
//             id: "4sXGR8",
//             filepath: "\/media\/previz\/buffer02.png",
//             previewfilepath: "\/media\/previz\/buffer02.png",
//             type: "buffer",
//             channel: 2,
//             sampler: {
//               filter: "nearest",
//               wrap: "clamp",
//               vflip: "true",
//               srgb: "false",
//               internal: "byte",
//             },
//             published: 1,
//           },
//         ],
//         outputs: [{ id: "4dfGRr", channel: 0 }],
//         code: "\/*\nA volumetric RC implementation\n    Scene\n        Volume resolution is 32X32X48, with 6 hemispheres per voxel\n        Everything is dynamic, temporal merging means some light lag is inevitable\n    Rays\n        A hemisphere traces (3x3)*(4^N) rays, where N is the LOD <- (0, 1, 2, 3, ..)\n    Probe placement\n        Must decide where we trace rays from inside the voxel\n        Very simple implementation in this shader -> choose the first empty voxel near the center if it exists\n            A better approach is beyond this shader :)\n    Merging\n        Weighted trilinear interpolation is used\n        Visibility determines the weight\n            Is computed by projecting lower cascades on the higher cascade probes to determine visibility\n            Uses the nearest hemisphere and its traced rays -> one texture fetch for visibility\n    Performance\n        Rays with almost the same direction are traced close to each other in the cubemap\n        Use acceleration structure when tracing rays\n    These are examples of other improvements:\n        Probe placement inside voxels\n            Find probe position using volume mipmaps\n        Overlap between 6 hemispheres in one voxel\n            A lot of rays cover the same directions from the same origin -> bad\n            But don't want to lose cos(theta) in the integral if rays are shared between hemispheres\n                Could store multiple weights per rays for the 3 closest hemispheres (max 3 hemisphere overlap)\n            Other implementations might have solved this ..\n\n\n\nControls:\n    Animation stops when the mouse is used\n        WASD - move the camera\n        Space - move faster\n        Mouse - rotate the camera\n*\/\n\n\nvec4 TextureCube(vec2 uv) {\n    float tcSign = -mod(floor(uv.y*I1024), 2.)*2. + 1.;\n    vec3 tcD = vec3(vec2(uv.x, mod(uv.y, 1024.))*I512 - 1., tcSign);\n    if (uv.y > 4096.) tcD = tcD.xzy;\n    else if (uv.y > 2048.) tcD = tcD.zxy;\n    return textureLod(iChannel3, tcD, 0.);\n}\n\nvec3 IntegrateVoxel(vec3 p, vec3 n) {\n    vec3 l = vec3(0.);\n    vec2 cubeUV = vec2(p.x + floor(p.y)*32., p.z);\n    float normalOffset;\n    vec3 an = abs(n);\n    if (an.x > max(an.y, an.z)) normalOffset = ((n.x < 0.)? 0. : 48.)*9.;\n    else if (an.y > an.z) normalOffset = ((n.y < 0.)? 48.*2. : 48.*3.)*9.;\n    else normalOffset = ((n.z < 0.)? 48.*4. : 48.*5.)*9.;\n    for (float i = 0.; i < 8.5; i++) {\n        l += TextureCube(cubeUV + vec2(0., normalOffset + i*48.)).xyz;\n    }\n    return l;\n}\n\nfloat SampleDotShadow(vec3 p, vec3 n) {\n    vec3 SUN_DIR = GetSunDir(iTime);\n    vec3 SUN_TAN = normalize(cross(SUN_DIR, vec3(0., 1., 0.)));\n    vec3 SUN_BIT = cross(SUN_TAN, SUN_DIR);\n    vec3 an = abs(n);\n    vec3 nt, nb;\n    if (an.x > max(an.y, an.z)) {\n        nt = vec3(0., 0., 1.);\n        nb = vec3(0., 1., 0.);\n    } else if (an.y > an.z) {\n        nt = vec3(1., 0., 0.);\n        nb = vec3(0., 0., 1.);\n    } else {\n        nt = vec3(1., 0., 0.);\n        nb = vec3(0., 1., 0.);\n    }\n    float o = 0.;\n    for (float x = -0.15; x < 0.2; x += 0.15) {\n        for (float y = -0.15; y < 0.2; y += 0.15) {\n            vec3 sp = p + nt*x + nb*y;\n            vec3 smPos = sp - (vec3(16., 16., 24.) + SUN_DIR*SUN_DIST);\n            vec2 smUV = vec2(dot(smPos, SUN_TAN), dot(smPos, SUN_BIT))\/SUN_SM_SIZE\/ASPECT*0.5 + 0.5;\n            if (texture(iChannel2, smUV).w > dot(smPos, -SUN_DIR)) o += 1.;\n        }\n    }\n    return max(0., dot(SUN_DIR, n))*o\/9.;\n}\n\nvec4 Trace(vec3 p, vec3 d, out vec3 vp, out vec4 vc) {\n    vec4 info = vec4(vec3(0.), 100000.);\n    vec3 signdir = (max(vec3(0.), sign(d))*2. - 1.);\n    vec3 iDir = 1.\/d;\n    float bbDF = DFBox(p, vec3(32., 32., 48.));\n    vec2 bb = ABox(p, iDir, vec3(0.01), vec3(31.99, 31.99, 47.99));\n    if (bbDF > 0. && (bb.x < 0. || bb.y < bb.x)) return vec4(-10.);\n    float tFAR = bb.y;\n    float t = ((bbDF < 0.)? 0. : bb.x + 0.001);\n    vec3 cp;\n    vec4 sC;\n    vec3 fp = floor(p + d*t);\n    vec3 lfp = fp - vec3(0., 1., 0.);\n    for (int i = 0; i < 128; i++) {\n        if (t > tFAR) break;\n        cp = p + d*t;\n        sC = texture(iChannel1, vec2(fp.x + (mod(fp.y + 0.5, 8.) - 0.5)*32. + 0.5, fp.z + floor(fp.y*0.125)*48. + 0.5)*IRES);\n        if (sC.w > 0.5) {\n            vp = lfp + 0.5;\n            vc = sC;\n            return vec4(lfp - fp, t);\n        }\n        lfp = fp;\n        fp += ABoxfarNormal(p, iDir, signdir, fp, fp + 1., t);\n    }\n    return vec4(-10.);\n}\n\nvec3 AcesFilm(vec3 x) {\n    return clamp((x*(2.51*x + 0.03))\/(x*(2.43*x + 0.59) + 0.14), 0., 1.);\n}\n\nvoid mainImage(out vec4 fragColor, in vec2 fragCoord) {\n    vec3 color = vec3(0.);\n    vec3 cameraPos = texture(iChannel0, vec2(3.5, 0.5)*IRES).xyz;\n    vec3 cameraEye = texture(iChannel0, vec2(2.5, 0.5)*IRES).xyz;\n    vec3 pDir = normalize(vec3((fragCoord*IRES*2. - 1.)*ASPECT, 1.)*TBN(cameraEye));\n    vec3 pPos;\n    vec4 pCol;\n    vec4 pHit = Trace(cameraPos, pDir, pPos, pCol);\n    if (pHit.x > -1.5) {\n        if (pCol.w > 1.5) {\n            color = pCol.xyz;\n        } else {\n            color += IntegrateVoxel(pPos, pHit.xyz);\n            color += SampleDotShadow(cameraPos + pDir*pHit.w + pHit.xyz*0.25, pHit.xyz)*GetSunLight(iTime);\n            color *= pCol.xyz;\n        }\n    } else {\n        color += GetSkyLight(pDir, iTime);\n    }\n    fragColor = vec4(pow(AcesFilm(max(vec3(0.), color)), vec3(0.45)), 1.);\n}",
//         name: "Image",
//         description: "",
//         type: "image",
//       },
//       {
//         inputs: [],
//         outputs: [],
//         code: "\/\/CONST\nconst float PI = 3.141592653;\nconst float I3 = 1.\/3.;\nconst float I9 = 1.\/9.;\nconst float I12 = 1.\/12.;\nconst float I32 = 1.\/32.;\nconst float I48 = 1.\/48.;\nconst float I256 = 1.\/256.;\nconst float I512 = 1.\/512.;\nconst float I1024 = 1.\/1024.;\nconst float SUN_DIST = 48.;\nconst float SUN_SM_SIZE = 32.;\nconst float ISUNRT = 2.*PI\/16.;\nconst float SUNRTO = 1.15;\n\n\/\/DEFINE\n#define RES iChannelResolution[0].xy\n#define IRES 1.\/iChannelResolution[0].xy\n#define ASPECT vec2(iChannelResolution[0].x\/iChannelResolution[0].y,1.)\n\n\/\/MATH\nvec3 BRDF_GGX(vec3 w_o, vec3 w_i, vec3 n, float alpha, vec3 F0) {\n    vec3 h = normalize(w_i + w_o);\n    float a2 = alpha*alpha;\n    float D = a2\/(3.141592653*pow(pow(dot(h, n), 2.)*(a2 - 1.) + 1., 2.));\n    vec3 F = F0 + (1. - F0)*pow(1. - dot(n, w_o), 5.);\n    float k = a2*0.5;\n    float G = 1.\/((dot(n, w_i)*(1. - k) + k)*(dot(n, w_o)*(1. - k) + k));\n    vec3 OUT = F*(D*G*0.25);\n    return ((isnan(OUT) != bvec3(false)) ? vec3(0.) : OUT);\n}\n\nmat3 TBN(vec3 N) {\n    vec3 Nb, Nt;\n    if (abs(N.y) > 0.999) {\n        Nb = vec3(1., 0., 0.);\n        Nt = vec3(0., 0., 1.);\n    } else {\n    \tNb = normalize(cross(N, vec3(0., 1., 0.)));\n    \tNt = normalize(cross(Nb, N));\n    }\n    return mat3(Nb.x, Nt.x, N.x, Nb.y, Nt.y, N.y, Nb.z, Nt.z, N.z);\n}\n\nfloat smin(float a, float b, float k) {\n    \/\/https:\/\/iquilezles.org\/articles\/smin\n    float h = max(k-abs(a-b),0.)\/k;\n    return min(a,b)-h*h*h*k*(1.0\/6.0);\n}\n\nfloat DFBox(vec2 p, vec2 b) {\n    vec2 d = abs(p - b*0.5) - b*0.5;\n    return min(max(d.x, d.y), 0.) + length(max(d, 0.));\n}\n\nfloat DFBox(vec3 p, vec3 b) {\n    vec3 d = abs(p - b*0.5) - b*0.5;\n    return min(max(d.x, max(d.y, d.z)), 0.) + length(max(d, 0.));\n}\n\nvec2 ABox(vec3 origin, vec3 idir, vec3 bmin, vec3 bmax) {\n    vec3 tMin = (bmin - origin)*idir;\n    vec3 tMax = (bmax - origin)*idir;\n    vec3 t1 = min(tMin, tMax);\n    vec3 t2 = max(tMin, tMax);\n    return vec2(max(max(t1.x, t1.y), t1.z), min(min(t2.x, t2.y), t2.z));\n}\n\nvec3 ABoxfarNormal(vec3 origin, vec3 idir, vec3 signdir, vec3 bmin, vec3 bmax, out float dist) {\n    vec3 tMin = (bmin - origin)*idir;\n    vec3 tMax = (bmax - origin)*idir;\n    vec3 t2 = max(tMin, tMax);\n    dist = min(min(t2.x, t2.y), t2.z);\n    if (t2.x < min(t2.y, t2.z)) return vec3(signdir.x, 0., 0.);\n    else if (t2.y < t2.z) return vec3(0., signdir.y, 0.);\n    else return vec3(0., 0., signdir.z);\n}\n\n\/\/SCENE\nvec3 GetSkyLight(vec3 d, float t) {\n    return vec3(0.75, 0.85, 1.)*1.25*pow(d.y*0.5 + 0.5, 2.);\n}\n\nvec3 GetSunLight(float t) {\n    return vec3(2., 1.5, 1.25);\n}\n\nvec3 GetSunDir(float t) {\n    float aniT = t*(1. - exp(-t*0.2));\n    float sunA = aniT*ISUNRT + SUNRTO;\n    float sunT = (pow(cos(aniT*ISUNRT*0.25), 5.)*0.5 + 0.5)*2. + 0.2;\n    return normalize(vec3(sin(sunA), sunT, cos(sunA)));\n}\n\n\/\/HEMISPHERE\nvec3 ComputeDirEven(vec2 uv, float probeSize) {\n    vec2 probeRel = uv - probeSize*0.5;\n    float probeThetai = max(abs(probeRel.x), abs(probeRel.y));\n    float probeTheta = probeThetai\/probeSize*3.14192653;\n    float probePhi = 0.;\n    if (probeRel.x + 0.5 > probeThetai && probeRel.y - 0.5 > -probeThetai) {\n        probePhi = probeRel.x - probeRel.y;\n    } else if (probeRel.y - 0.5 < -probeThetai && probeRel.x - 0.5 > -probeThetai) {\n        probePhi = probeThetai*2. - probeRel.y - probeRel.x;\n    } else if (probeRel.x - 0.5 < -probeThetai && probeRel.y + 0.5 < probeThetai) {\n        probePhi = probeThetai*4. - probeRel.x + probeRel.y;\n    } else if (probeRel.y + 0.5 > probeThetai && probeRel.x + 0.5 < probeThetai) {\n        probePhi = probeThetai*8. - (probeRel.y - probeRel.x);\n    }\n    probePhi = probePhi*3.141592653*2.\/(4. + 8.*floor(probeThetai));\n    return vec3(vec2(sin(probePhi), cos(probePhi))*sin(probeTheta), cos(probeTheta));\n}\n\nvec3 ComputeDir(vec2 uv, float probeSize) {\n    if (probeSize > 4.5) return ComputeDirEven(uv, probeSize);\n    vec2 probeRel = uv - 1.5;\n    if (length(probeRel) < 0.1) return vec3(0., 0., 1.);\n    float probePhi = atan(probeRel.x, probeRel.y) + 3.141592653*1.75;\n    float probeTheta = 3.141592653*0.25;\n    return vec3(vec2(sin(probePhi), cos(probePhi))*sin(probeTheta), cos(probeTheta));\n}\n\nvec2 ProjectDir(vec3 dir, float probeSize) {\n    if (dir.z <= 0.) return vec2(-1.);\n    float thetai = min(floor((1. - acos(length(dir.xy)\/length(dir))\/(3.141592653*0.5))*(probeSize*0.5)), probeSize*0.5 - 1.);\n    float phiF = atan(-dir.x, -dir.y);\n    float phiI = floor((phiF\/3.141592653*0.5 + 0.5)*(4. + 8.*thetai) + 0.5) + 0.5;\n    vec2 phiUV;\n    float phiLen = 2.*thetai + 1.;\n    float sideLen = phiLen + 1.;\n    if (phiI < phiLen) phiUV = vec2(sideLen - 0.5, sideLen - phiI);\n    else if (phiI < phiLen*2.) phiUV = vec2(sideLen - (phiI - phiLen), 0.5);\n    else if (phiI < phiLen*3.) phiUV = vec2(0.5, phiI - phiLen*2.);\n    else phiUV = vec2(phiI - phiLen*3., sideLen - 0.5);\n    return vec2((probeSize - sideLen)*0.5) + phiUV;\n}",
//         name: "Common",
//         description: "",
//         type: "common",
//       },
//       {
//         inputs: [
//           {
//             id: "4dXGRr",
//             filepath: "\/presets\/tex00.jpg",
//             previewfilepath: "\/presets\/tex00.jpg",
//             type: "keyboard",
//             channel: 1,
//             sampler: {
//               filter: "nearest",
//               wrap: "clamp",
//               vflip: "true",
//               srgb: "false",
//               internal: "byte",
//             },
//             published: 1,
//           },
//           {
//             id: "4dXGR8",
//             filepath: "\/media\/previz\/buffer00.png",
//             previewfilepath: "\/media\/previz\/buffer00.png",
//             type: "buffer",
//             channel: 0,
//             sampler: {
//               filter: "nearest",
//               wrap: "clamp",
//               vflip: "true",
//               srgb: "false",
//               internal: "byte",
//             },
//             published: 1,
//           },
//         ],
//         outputs: [{ id: "4dXGR8", channel: 0 }],
//         code: "\/\/Vars\n\nvec2 CameraEyeAngles(float t) {\n    float aniT = t*(1. - exp(-t*0.2))*ISUNRT - 0.3;\n    return vec2(-0.05 - (-cos(aniT)*0.5 + 0.5)*0.5, mod(-2.2 + (-cos(aniT*1.1)*0.5 + 0.5)*2., 2.*PI));\n}\n\nvoid mainImage(out vec4 fragColor, in vec2 fragCoord) {\n    vec4 info = texture(iChannel0, fragCoord*IRES);\n    if (iFrame == 0) {\n        if (fragCoord.x < 10. && fragCoord.y < 1.) {\n            if (fragCoord.x < 1.) info = vec4(0., 0., 0., 0.);\n            else if (fragCoord.x < 2.) info = vec4(-0.05, -2.2, 0., 0.);\n            else if (fragCoord.x < 3.) info = vec4(0., 0., 0., 1.);\n            else if (fragCoord.x < 4.) info = vec4(30., 8., 33., 1.);\n            else if (fragCoord.x < 5.) info = vec4(1.);\n        }\n    } else {\n\t\tif (fragCoord.x < 16. && fragCoord.y < 1.) {\n            if (fragCoord.x < 1.) {\n                \/\/Mouse\n                if (iMouse.z > 0.) {\n                    if (info.w == 0.) {\n                    \tinfo.w = 1.;\n                    \tinfo.xy = iMouse.zw;\n                    }\n                } else info.w = 0.;\n            } else if (fragCoord.x < 2.) {\n                \/\/Angles\n                if (texture(iChannel0, vec2(4.5, 0.5)*IRES).x > 0.5) {\n                    info.xy = CameraEyeAngles(iTime);\n                    info.zw = info.xy;\n                } else {\n                    vec4 LMouse = texture(iChannel0, vec2(0.5, 0.5)*IRES);\n                    if (LMouse.w == 0.)  info.zw = info.xy;\n                    if (LMouse.w == 1.) {\n                        info.x = info.z + (iMouse.y - LMouse.y)*0.01;\n                        info.x = clamp(info.x, -2.8*0.5, 2.8*0.5);\n                        \/\/X led\n                        info.y = info.w - (iMouse.x - LMouse.x)*0.02;\n                        info.y = mod(info.y, 3.1415926*2.);\n                    }\n                }\n            } else if (fragCoord.x < 3.) {\n                \/\/Player Eye\n                vec2 Angles = texture(iChannel0, vec2(1.5, 0.5)*IRES).xy;\n                if (texture(iChannel0, vec2(4.5, 0.5)*IRES).x > 0.5) Angles = CameraEyeAngles(iTime);\n                info.xyz = normalize(vec3(cos(Angles.x)*sin(Angles.y), sin(Angles.x), cos(Angles.x)*cos(Angles.y)));\n            } else if (fragCoord.x < 4.) {\n                \/\/Player Pos\n                if (texture(iChannel0, vec2(4.5, 0.5)*IRES).x > 0.5) {\n                    float aniT = iTime*(1. - exp(-iTime*0.2))*ISUNRT - 0.9;\n                    info.xyz = vec3(28., 7.5, 40.) + vec3(0., (-cos(aniT*0.5)*0.5 + 0.5)*19., -(-cos(aniT)*0.5 + 0.5)*30.);\n                } else {\n                    float Speed = 5.*iTimeDelta;\n                    if (texelFetch(iChannel1, ivec2(32, 0), 0).x > 0.) Speed = 16.*iTimeDelta;\n                    vec3 Eye = texture(iChannel0, vec2(2.5, 0.5)*IRES).xyz;\n                    if (texelFetch(iChannel1, ivec2(87, 0), 0).x > 0.) info.xyz += Eye*Speed; \/\/W\n                    if (texelFetch(iChannel1, ivec2(83, 0), 0).x > 0.) info.xyz -= Eye*Speed; \/\/S\n                    vec3 Tan = normalize(cross(vec3(Eye.x, 0., Eye.z), vec3(0., 1., 0.)));\n                    if (texelFetch(iChannel1, ivec2(65, 0), 0).x > 0.) info.xyz -= Tan*Speed; \/\/A\n                    if (texelFetch(iChannel1, ivec2(68, 0), 0).x > 0.) info.xyz += Tan*Speed; \/\/D\n                }\n            } else if (fragCoord.x < 5.) {\n                \/\/Animation flag\n                if (iMouse.z > 0.) info.x = 0.;\n            }\n        }\n    }\n    fragColor = info;\n}",
//         name: "Buffer A",
//         description: "",
//         type: "buffer",
//       },
//       {
//         inputs: [
//           {
//             id: "4dX3Rr",
//             filepath: "\/media\/a\/\/media\/previz\/cubemap00.png",
//             previewfilepath: "\/media\/ap\/\/media\/previz\/cubemap00.png",
//             type: "cubemap",
//             channel: 3,
//             sampler: {
//               filter: "nearest",
//               wrap: "clamp",
//               vflip: "true",
//               srgb: "false",
//               internal: "byte",
//             },
//             published: 1,
//           },
//           {
//             id: "4dXGR8",
//             filepath: "\/media\/previz\/buffer00.png",
//             previewfilepath: "\/media\/previz\/buffer00.png",
//             type: "buffer",
//             channel: 0,
//             sampler: {
//               filter: "nearest",
//               wrap: "clamp",
//               vflip: "true",
//               srgb: "false",
//               internal: "byte",
//             },
//             published: 1,
//           },
//           {
//             id: "XsXGR8",
//             filepath: "\/media\/previz\/buffer01.png",
//             previewfilepath: "\/media\/previz\/buffer01.png",
//             type: "buffer",
//             channel: 1,
//             sampler: {
//               filter: "nearest",
//               wrap: "clamp",
//               vflip: "true",
//               srgb: "false",
//               internal: "byte",
//             },
//             published: 1,
//           },
//           {
//             id: "4sXGR8",
//             filepath: "\/media\/previz\/buffer02.png",
//             previewfilepath: "\/media\/previz\/buffer02.png",
//             type: "buffer",
//             channel: 2,
//             sampler: {
//               filter: "nearest",
//               wrap: "clamp",
//               vflip: "true",
//               srgb: "false",
//               internal: "byte",
//             },
//             published: 1,
//           },
//         ],
//         outputs: [{ id: "4dX3Rr", channel: 0 }],
//         code: "\/\/Radiance cascades\n\nconst float LOD_MAX_POS   = 5022.;\nconst float LOD_POS[5]    = float[5](0., 2592., 3888., 4536., 4860.);\n\nvec4 TextureCube(vec2 uv) {\n    float tcSign = -mod(floor(uv.y*I1024), 2.)*2. + 1.;\n    vec3 tcD = vec3(vec2(uv.x, mod(uv.y, 1024.))*I512 - 1., tcSign);\n    if (uv.y > 4096.) tcD = tcD.xzy;\n    else if (uv.y > 2048.) tcD = tcD.zxy;\n    return textureLod(iChannel3, tcD, 0.);\n}\n\nvec4 TextureCube(vec2 uv, float lod) {\n    float tcSign = -mod(floor(uv.y*I1024), 2.)*2. + 1.;\n    vec3 tcD = vec3(vec2(uv.x, mod(uv.y, 1024.))*I512 - 1., tcSign);\n    if (uv.y > 4096.) tcD = tcD.xzy;\n    else if (uv.y > 2048.) tcD = tcD.zxy;\n    return textureLod(iChannel3, tcD, lod);\n}\n\nvec3 IntegrateVoxel(vec3 p, vec3 n) {\n    vec3 l = vec3(0.);\n    vec2 cubeUV = vec2(p.x + floor(p.y)*32., p.z);\n    float normalOffset;\n    vec3 an = abs(n);\n    if (an.x > max(an.y, an.z)) normalOffset = ((n.x < 0.)? 0. : 48.)*9.;\n    else if (an.y > an.z) normalOffset = ((n.y < 0.)? 48.*2. : 48.*3.)*9.;\n    else normalOffset = ((n.z < 0.)? 48.*4. : 48.*5.)*9.;\n    for (float i = 0.; i < 8.5; i++) {\n        l += TextureCube(cubeUV + vec2(0., normalOffset + i*48.)).xyz;\n    }\n    return l;\n}\n\nfloat SampleShadow(vec3 p, vec3 n, vec3 SUN_DIR) {\n    vec3 SUN_TAN = normalize(cross(SUN_DIR, vec3(0., 1., 0.)));\n    vec3 SUN_BIT = cross(SUN_TAN, SUN_DIR);\n    vec3 smPos = p - (vec3(16., 16., 24.) + SUN_DIR*SUN_DIST);\n    vec2 smUV = vec2(dot(smPos, SUN_TAN), dot(smPos, SUN_BIT))\/SUN_SM_SIZE\/ASPECT*0.5 + 0.5;\n    return float(texture(iChannel2, smUV).w > dot(smPos, -SUN_DIR));\n}\n\nvec4 NearestCS(vec3 fPos, vec2 lFaceUV, vec3 lSize, vec4 lDIUV0, vec4 lDIUV1,\n               vec3 vPos, float lLF, float lOff, float lPS, float lPow4) {\n    vec2 lVolumeUV = vec2(fPos.x + fPos.y*lSize.x + 0.5, fPos.z + 0.5);\n    vec3 rlPos = (fPos + 0.5)*lLF;\n    vec3 rPos = vPos - rlPos;\n    vec3 aPos = abs(rPos);\n    vec2 oFaceUV = vec2(0., lOff);\n    if (aPos.x > max(aPos.y, aPos.z)) {\n        oFaceUV.y += ((rPos.x < 0.)? 0. : 1.)*9.*lSize.z;\n        rPos = vec3(rPos.zy, aPos.x);\n    } else if (aPos.y > aPos.z) {\n        oFaceUV.y += ((rPos.y < 0.)? 2. : 3.)*9.*lSize.z;\n        rPos = vec3(rPos.xz, aPos.y);\n    } else {\n        oFaceUV.y += ((rPos.z < 0.)? 4. : 5.)*9.*lSize.z;\n        rPos = vec3(rPos.xy, aPos.z);\n    }\n    vec2 projUV = ProjectDir(rPos, lPS);\n    float oDirIndex = projUV.x + floor(projUV.y)*lPS;\n    vec2 oDirUV = vec2(floor(mod(oDirIndex, lPow4))*lSize.x*lSize.y, floor(oDirIndex\/lPow4)*lSize.z);\n    float projectedRayLen = TextureCube(oFaceUV + oDirUV + lVolumeUV).w;\n    if (projectedRayLen < length(rPos) - 0.5) return vec4(0., 0., 0., 0.00001);\n    vec4 lOut = TextureCube(lFaceUV + lDIUV0.xy + lVolumeUV) +\n                TextureCube(lFaceUV + lDIUV0.zw + lVolumeUV) +\n                TextureCube(lFaceUV + lDIUV1.xy + lVolumeUV) +\n                TextureCube(lFaceUV + lDIUV1.zw + lVolumeUV);\n    if (lOut.w < -0.5) return vec4(lOut.xyz*0.001, 0.001);\n    return vec4(lOut.xyz, 1.);\n}\n\nvec4 TrilinearCS(vec3 lPos, vec2 lFaceUV, float lDirIndex, float lProbeSize,\n                 vec3 lSize, float lPow4, vec3 vPos, float lLF, float lOff) {\n    vec4 lDIUV0 = vec4(floor(mod(lDirIndex, lPow4))*lSize.x*lSize.y, floor(lDirIndex\/lPow4)*lSize.z,\n                       floor(mod(lDirIndex + 1., lPow4))*lSize.x*lSize.y, floor((lDirIndex + 1.)\/lPow4)*lSize.z);\n    vec4 lDIUV1 = vec4(floor(mod(lDirIndex + lProbeSize, lPow4))*lSize.x*lSize.y,\n                       floor((lDirIndex + lProbeSize)\/lPow4)*lSize.z,\n                       floor(mod(lDirIndex + lProbeSize + 1., lPow4))*lSize.x*lSize.y,\n                       floor((lDirIndex + lProbeSize + 1.)\/lPow4)*lSize.z);\n    vec3 fPos = clamp(floor(lPos - 0.5), vec3(0.), lSize - 2.);\n    vec3 frPos = min(vec3(1.), lPos - 0.5 - fPos);\n    vec4 l000 = NearestCS(fPos, lFaceUV, lSize, lDIUV0, lDIUV1, vPos, lLF, lOff, lProbeSize, lPow4);\n    vec4 l100 = NearestCS(vec3(fPos.x + 1., fPos.y, fPos.z), lFaceUV,\n                          lSize, lDIUV0, lDIUV1, vPos, lLF, lOff, lProbeSize, lPow4);\n    vec4 l010 = NearestCS(vec3(fPos.x, fPos.y + 1., fPos.z), lFaceUV,\n                          lSize, lDIUV0, lDIUV1, vPos, lLF, lOff, lProbeSize, lPow4);\n    vec4 l110 = NearestCS(vec3(fPos.x + 1., fPos.y + 1., fPos.z), lFaceUV,\n                          lSize, lDIUV0, lDIUV1, vPos, lLF, lOff, lProbeSize, lPow4);\n    vec4 l001 = NearestCS(vec3(fPos.x, fPos.y, fPos.z + 1.), lFaceUV,\n                          lSize, lDIUV0, lDIUV1, vPos, lLF, lOff, lProbeSize, lPow4);\n    vec4 l101 = NearestCS(vec3(fPos.x + 1., fPos.y, fPos.z + 1.), lFaceUV,\n                          lSize, lDIUV0, lDIUV1, vPos, lLF, lOff, lProbeSize, lPow4);\n    vec4 l011 = NearestCS(vec3(fPos.x, fPos.y + 1., fPos.z + 1.), lFaceUV,\n                          lSize, lDIUV0, lDIUV1, vPos, lLF, lOff, lProbeSize, lPow4);\n    vec4 l111 = NearestCS(fPos + 1., lFaceUV, lSize, lDIUV0, lDIUV1, vPos, lLF, lOff, lProbeSize, lPow4);\n    float lweight = mix(mix(mix(l000.w, l100.w, frPos.x), mix(l010.w, l110.w, frPos.x), frPos.y),\n                    mix(mix(l001.w, l101.w, frPos.x), mix(l011.w, l111.w, frPos.x), frPos.y), frPos.z);\n    return vec4(mix(mix(mix(l000.xyz, l100.xyz, frPos.x), mix(l010.xyz, l110.xyz, frPos.x), frPos.y),\n                    mix(mix(l001.xyz, l101.xyz, frPos.x), mix(l011.xyz, l111.xyz, frPos.x), frPos.y),\n                    frPos.z)\/lweight, lweight);\n}\n\nbool OutsideGeo(vec3 sp) {\n    vec3 p = floor(sp) + 0.5;\n    return (texture(iChannel1, vec2(p.x + floor(mod(p.y, 8.))*32., p.z + floor(p.y*0.125)*48.)*IRES).w < 0.5);\n}\n\nvec3 GeoOffset(vec3 vertex) {\n    for (float x = -0.5; x < 1.; x++) {\n        for (float y = -0.5; y < 1.; y++) {\n            for (float z = -0.5; z < 1.; z++) {\n                if (OutsideGeo(vertex + vec3(x, y, z))) return vec3(x, y, z)*0.1;\n            }\n        }\n    }\n    return vec3(0.001);\n}\n\nvec4 Trace(vec3 p, vec3 d, out vec3 pPos, out vec4 pCol) {\n    vec4 info = vec4(vec3(0.), 100000.);\n    vec3 signdir = (max(vec3(0.), sign(d))*2. - 1.);\n    vec3 iDir = 1.\/d;\n    float bbDF = DFBox(p, vec3(32., 32., 48.));\n    vec2 bb = ABox(p, iDir, vec3(0.01), vec3(31.99, 31.99, 47.99));\n    if (bbDF > 0. && (bb.x < 0. || bb.y < bb.x)) return vec4(-10.);\n    float tFAR = bb.y;\n    float t = ((bbDF < 0.)? 0. : bb.x + 0.001);\n    vec3 cp;\n    vec4 sC;\n    vec3 fp = floor(p + d*t);\n    vec3 lfp = fp - vec3(0., 1., 0.);\n    for (int i = 0; i < 128; i++) {\n        if (t > tFAR) break;\n        cp = p + d*t;\n        sC = texture(iChannel1, vec2(fp.x + (mod(fp.y + 0.5, 8.) - 0.5)*32. + 0.5, fp.z + floor(fp.y*0.125)*48. + 0.5)*IRES);\n        if (sC.w > 0.5) {\n            pPos = lfp + 0.5;\n            pCol = sC;\n            return vec4(lfp - fp, t);\n        }\n        lfp = fp;\n        fp += ABoxfarNormal(p, iDir, signdir, fp, fp + 1., t);\n    }\n    return vec4(-10.);\n}\n\nvoid mainCubemap(out vec4 fragColor, in vec2 fragCoord, in vec3 rayOri, in vec3 rayDir) {\n    vec4 info = texture(iChannel3, rayDir);\n    vec2 uv; vec3 aDir = abs(rayDir);\n    if (aDir.z > max(aDir.x, aDir.y)) {\n        \/\/Z-side\n        uv = floor(((rayDir.xy\/aDir.z)*0.5 + 0.5)*1024.) + 0.5;\n        if (rayDir.z < 0.) uv.y += 1024.;\n    } else if (aDir.x > aDir.y) {\n        \/\/X-side\n        uv = floor(((rayDir.yz\/aDir.x)*0.5 + 0.5)*1024.) + 0.5;\n        if (rayDir.x > 0.) uv.y += 2048.;\n        else uv.y += 3072.;\n    } else {\n        \/\/Y-side\n        uv = floor(((rayDir.xz\/aDir.y)*0.5 + 0.5)*1024.) + 0.5;\n        if (rayDir.y > 0.) uv.y += 4096.;\n        else uv.y += 5120.;\n    }\n    \n    \/\/Cascades\n    if (uv.y < LOD_MAX_POS) {\n        float vLod = 0.;\n        vec2 vuv = uv;\n        float lOffset = 2592.;\n        for (int i = 1; i < 5; i++) {\n            lOffset = LOD_POS[i];\n            if (uv.y > lOffset) {\n                vLod += 1.;\n            } else {\n                vuv.y -= LOD_POS[i - 1];\n                break;\n            }\n        }\n        float vLodFactor = pow(2., vLod);\n        float vILodFactor = 1.\/vLodFactor;\n        float vProbeSize = 3.*vLodFactor;\n        vec3 vSize = vec3(32., 32., 48.)*vILodFactor;\n        vec3 vISize = vec3(I32, I32, I48)*vLodFactor;\n        float vFace = mod(floor(vuv.y*vISize.z*I9) + 0.5, 6.);\n        float vDirIndex = floor(mod(vuv.y*vISize.z, 9.))*pow(4., vLod) + floor(vuv.x*vISize.x*vISize.y) + 0.5;\n        vec3 vPos = vec3(mod(vuv.x, vSize.x), mod(floor(vuv.x*vISize.x) + 0.5, vSize.y), mod(vuv.y, vSize.z))*vLodFactor;\n        vec3 vN, vT, vB;\n        if (vFace < 2.) {\n            vT = vec3(0., 0., 1.);\n            vB = vec3(0., 1., 0.);\n            vN = vec3(((vFace < 1.)? -1. : 1.), 0., 0.);\n        } else if (vFace < 4.) {\n            vT = vec3(1., 0., 0.);\n            vB = vec3(0., 0., 1.);\n            vN = vec3(0., ((vFace < 3.)? -1. : 1.), 0.);\n        } else {\n            vT = vec3(1., 0., 0.);\n            vB = vec3(0., 1., 0.);\n            vN = vec3(0., 0., ((vFace < 5.)? -1. : 1.));\n        }\n        if (vLod > 0.5) {\n            vPos += GeoOffset(vPos);\n        } else {\n            vPos -= vN*0.25;\n        }\n        if (OutsideGeo(vPos)) {\n            info = vec4(0., 0., 0., 1.);\n            vec2 vDirUV = vec2(mod(vDirIndex, vProbeSize), floor(vDirIndex\/vProbeSize) + 0.5);\n            vec3 vDir = ComputeDir(vDirUV, vProbeSize);\n            vDir = vT*vDir.x + vB*vDir.y + vN*vDir.z;\n            vec3 pPos; vec4 pCol;\n            vec4 vHit = Trace(vPos, vDir, pPos, pCol);\n            if (vHit.x > -1.5) {\n                info.w = vHit.w;\n                if (pCol.w > 1.5) {\n                    info.xyz = pCol.xyz;\n                } else {\n                    vec3 SUN_DIR = GetSunDir(iTime);\n                    float sunDot = dot(SUN_DIR, vHit.xyz);\n                    if (sunDot > 0.) info.xyz += SampleShadow(pPos, vHit.xyz, SUN_DIR)*sunDot*GetSunLight(iTime);\n                    info.xyz += IntegrateVoxel(floor(pPos - vDir*0.001) + 0.5, vHit.xyz);\n                    info.xyz *= pCol.xyz;\n                }\n            } else {\n                info.w = 10000000.;\n                info.xyz += GetSkyLight(vDir, iTime);\n            }\n            \n            \/\/Normalized area * cos(theta)\n            if (vLod < 0.5) {\n                if (length(vDirUV) > 0.75) {\n                    info.xyz *= cos(0.25*3.141592653)\/8.;\n                } else {\n                    info.xyz *= (1. - cos(0.25*3.141592653));\n                }\n            } else {\n                vec2 vProbeRel = vDirUV - vProbeSize*0.5;\n                float vProbeThetai = max(abs(vProbeRel.x), abs(vProbeRel.y));\n                float vProbeTheta = acos(dot(vDir, vN));\n                info.xyz *= (cos(vProbeTheta - 0.5*3.141592653\/vProbeSize) -\n                             cos(vProbeTheta + 0.5*3.141592653\/vProbeSize))\/(4. + 8.*floor(vProbeThetai));\n            }\n            info.xyz *= dot(vDir, vN);\n            \n            \/\/Merging\n            vec3 lSize = vSize*0.5;\n            vec3 lISize = vISize*2.;\n            float lProbeSize = vProbeSize*2.;\n            if (vLod < 3.5*0. + 3.5) {\n                float lPow4 = pow(4., vLod + 1.);\n                vec3 lPos = clamp(vPos*vILodFactor*0.5, vec3(0.5), lSize - 0.5);\n                vec2 lFaceUV = vec2(0., lOffset + 9.*lSize.z*floor(vFace));\n                float lDirIndex0 = floor(vDirUV.x)*2. + floor(vDirUV.y)*lProbeSize*2. + 0.5;\n                vec4 lLight = TrilinearCS(lPos, lFaceUV, lDirIndex0, lProbeSize, lSize, lPow4, vPos, vLodFactor*2., lOffset);\n                float distInterp = clamp((info.w - vLodFactor)*vILodFactor*0.5, 0., 1.);\n                info.xyz = mix(info.xyz, lLight.xyz, distInterp);\n            }\n        } else {\n            info = vec4(0., 0., 0., -1.);\n        }\n    } else {\n        discard;\n    }\n    fragColor = info;\n}",
//         name: "Cube A",
//         description: "",
//         type: "cubemap",
//       },
//       {
//         inputs: [
//           {
//             id: "4dXGR8",
//             filepath: "\/media\/previz\/buffer00.png",
//             previewfilepath: "\/media\/previz\/buffer00.png",
//             type: "buffer",
//             channel: 0,
//             sampler: {
//               filter: "nearest",
//               wrap: "clamp",
//               vflip: "true",
//               srgb: "false",
//               internal: "byte",
//             },
//             published: 1,
//           },
//           {
//             id: "XsXGR8",
//             filepath: "\/media\/previz\/buffer01.png",
//             previewfilepath: "\/media\/previz\/buffer01.png",
//             type: "buffer",
//             channel: 1,
//             sampler: {
//               filter: "nearest",
//               wrap: "clamp",
//               vflip: "true",
//               srgb: "false",
//               internal: "byte",
//             },
//             published: 1,
//           },
//           {
//             id: "XsBSR3",
//             filepath:
//               "\/media\/a\/cb49c003b454385aa9975733aff4571c62182ccdda480aaba9a8d250014f00ec.png",
//             previewfilepath:
//               "\/media\/ap\/cb49c003b454385aa9975733aff4571c62182ccdda480aaba9a8d250014f00ec.png",
//             type: "texture",
//             channel: 2,
//             sampler: {
//               filter: "nearest",
//               wrap: "repeat",
//               vflip: "true",
//               srgb: "false",
//               internal: "byte",
//             },
//             published: 1,
//           },
//         ],
//         outputs: [{ id: "XsXGR8", channel: 0 }],
//         code: "\/\/Volume (32 x 32 x 48)\n\nvoid mainImage(out vec4 fragColor, in vec2 fragCoord) {\n    vec4 info = texture(iChannel1, fragCoord*IRES);\n    if (DFBox(fragCoord, vec2(256., 192.)) < 0.) {\n        vec3 vPos = vec3(mod(fragCoord.x, 32.), floor(fragCoord.x*I32) + floor(fragCoord.y*I48)*8. + 0.5, mod(fragCoord.y, 48.));\n        vec3 modP = vec3(vPos.xy, mod(vPos.z, 16.));\n        info = vec4(0.);\n        \n        \/\/Stone color\n        vec3 stoneColor = vec3(0.95, 0.925, 0.9);\n        \n        \/\/Bounding box\n        if (DFBox(vPos - vec3(1., 1., 1.), vec3(30., 100., 46.)) > 0.) info = vec4(stoneColor, 1.);\n        \n        \/\/Floor\n        if (vPos.y < 2. && fract(dot(vPos.xz, vec2(0.707))*0.125) > 0.35 &&\n            fract(dot(vPos.xz, vec2(0.707, -0.707))*0.125) > 0.35) info = vec4(stoneColor, 1.);\n            \/\/Temporal emissive\n            if (info.w > 0.5 && abs(vPos.y - 1.5) < 0.5 &&\n                length(vPos.xz - vec2(8., 8. + (sin(iTime - 1.5)*0.5 + 0.5)*24.)) < 5.)\n                info = vec4(1.5, 0.7, 0.2, 2.);\n        \n        \/\/Columns\n        if (length(vec2(vPos.x - 16., mod(vPos.z + 8., 16.) - 8.)) < 2.) info = vec4(stoneColor, 1.);\n            \/\/Arcs\n            if (vPos.y > 19.) modP.y -= 16.;\n            if (DFBox(vec3(vPos.x, modP.y, vPos.z) - vec3(14., 9., 0.), vec3(3., 10., 32.)) < 0. &&\n                length(modP.zy - vec2(8., 8.)) - abs(vPos.x - 15.5) > 6.) info = vec4(stoneColor, 1.);\n            if (DFBox(vec3(vPos.x, modP.y, vPos.z) - vec3(16., 9., 30.), vec3(16., 10., 3.)) < 0. &&\n                length(modP.xy - vec2(24., 8.)) - abs(vPos.z - 31.5) > 6.) info = vec4(stoneColor, 1.);\n            \/\/Cloth\n            if (vPos.z < 32.) {\n                vec3 aPos = vec3(abs(vPos.x - 18.), vPos.y, abs(vPos.z - 8.));\n                if (DFBox(vPos - vec3(17., 3., 1.), vec3(2., 13., 14.)) < 0. &&\n                    abs(vPos.x - (18.5 - float(vPos.y > 15. || aPos.z > 20. - vPos.y\n                    || aPos.z < 2. + (17. - vPos.y)*(17. - vPos.y)*0.02))) < 0.25 &&\n                    aPos.z > 1. + (17. - vPos.y)*(17. - vPos.y)*0.02) info = vec4(0.99, 0.4, 0.4, 1.);\n                aPos = vec3(abs(vPos.x - 18.), vPos.y, abs(vPos.z - 24.));\n                if (DFBox(vPos - vec3(17., 3., 17.), vec3(2., 13., 14.)) < 0. &&\n                    abs(vPos.x - (18.5 - float(vPos.y > 15. || aPos.z > 20. - vPos.y\n                    || aPos.z < 2. + (17. - vPos.y)*(17. - vPos.y)*0.02))) < 0.25 &&\n                    aPos.z > 1. + (17. - vPos.y)*(17. - vPos.y)*0.02) info = vec4(0.4, 0.99, 0.4, 1.);\n            }\n        \n        \/\/Second floor\n        if (DFBox(vPos - vec3(0., 15., 0.), vec3(16., 1., 48.)) < 0.) info = vec4(stoneColor, 1.);\n        if (DFBox(vPos - vec3(0., 15., 32.), vec3(32., 1., 16.)) < 0.) info = vec4(stoneColor, 1.);\n            \/\/Inner arc\n            if (vPos.x < 16. && mod(vPos.y, 16.) > 15. - pow(0.22*length(vec2(vPos.x - 8., modP.z - 8.)), 2.) &&\n                length(modP - vec3(12., 5., 8.)) > 10.) info = vec4(stoneColor, 1.);\n            if (vPos.x > 16. && vPos.z > 32. && mod(vPos.y, 16.) > 15. - pow(0.22*length(vec2(vPos.x - 24., modP.z - 8.)), 2.) &&\n                length(modP - vec3(24., 5., 4.)) > 10.) info = vec4(stoneColor, 1.);\n            \/\/Fountain (?)\n            if (vPos.y < 7. && length(vPos.xz - vec2(8., 40.)) < 2. + floor((vPos.y - 1.)*0.5) &&\n                vPos.y < 3. + length(vPos.xz - vec2(8., 40.))) info = vec4(stoneColor, 1.);\n                \/\/Lamp above\n                if (length(vec2(length(vPos.xz - vec2(8., 40.)) -\n                    3.5 - floor((13.5 - vPos.y)*0.333), vPos.y - 13.5)) < 0.5) info = vec4(0.8, 0.6, 0.2, 2.);\n                float lA = iTime;\n        \n        \/\/X+ wall (bricks)\n        if (vPos.x < 2. && mod(vPos.z + floor((vPos.y + 1.)\/4.)*2., 4.) > 1. &&\n            mod(vPos.y - 1., 4.) > 2.) info = vec4(stoneColor, 1.);\n        \n        \/\/Z- wall (lion approx)\n        if (smin(length(vPos - vec3(24., 8., 51.)) - 6.,\n            length(vPos - vec3(24., 7., 45.5)) - 2., 4.) < 0. &&\n            length(vec3(abs(vPos.x - 24.) - 2., vPos.y - 9., vPos.z - 44.)) > 1.) info = vec4(stoneColor, 1.);\n        \n        \/\/Z+ wall\n        if (vPos.x > 16.) {\n            if (length(vec3(mod(vPos.x + 1., 8.) - 4., mod(vPos.y, 8.) - 4., vPos.z - 0.15)) < 2.5) info = vec4(stoneColor, 1.);\n        }\n        \n        \/\/Ceiling\n        if (DFBox(vPos - vec3(0., 30., 0.), vec3(16., 2., 48.)) < 0.) info = vec4(stoneColor, 1.);\n        if (DFBox(vPos - vec3(0., 30., 32.), vec3(32., 2., 16.)) < 0.) info = vec4(stoneColor, 1.);\n        \n        \/\/Dynamic sphere\n        if (length(vPos - vec3(8. + (sin(iTime - 0.3)*0.5 + 0.5)*19., 24., 8.)) < 4.) info = vec4(0.5, 0.6, 0.9, 1.);\n    }\n    fragColor = info;\n}",
//         name: "Buffer B",
//         description: "",
//         type: "buffer",
//       },
//       {
//         inputs: [
//           {
//             id: "4dX3Rr",
//             filepath: "\/media\/a\/\/media\/previz\/cubemap00.png",
//             previewfilepath: "\/media\/ap\/\/media\/previz\/cubemap00.png",
//             type: "cubemap",
//             channel: 3,
//             sampler: {
//               filter: "nearest",
//               wrap: "clamp",
//               vflip: "true",
//               srgb: "false",
//               internal: "byte",
//             },
//             published: 1,
//           },
//           {
//             id: "4dXGR8",
//             filepath: "\/media\/previz\/buffer00.png",
//             previewfilepath: "\/media\/previz\/buffer00.png",
//             type: "buffer",
//             channel: 0,
//             sampler: {
//               filter: "nearest",
//               wrap: "clamp",
//               vflip: "true",
//               srgb: "false",
//               internal: "byte",
//             },
//             published: 1,
//           },
//           {
//             id: "XsXGR8",
//             filepath: "\/media\/previz\/buffer01.png",
//             previewfilepath: "\/media\/previz\/buffer01.png",
//             type: "buffer",
//             channel: 1,
//             sampler: {
//               filter: "nearest",
//               wrap: "clamp",
//               vflip: "true",
//               srgb: "false",
//               internal: "byte",
//             },
//             published: 1,
//           },
//         ],
//         outputs: [{ id: "4sXGR8", channel: 0 }],
//         code: "\/\/Shadow map\n\nvec4 TextureCube(vec2 uv) {\n    float tcSign = -mod(floor(uv.y*I1024), 2.)*2. + 1.;\n    vec3 tcD = vec3(vec2(uv.x, mod(uv.y, 1024.))*I512 - 1., tcSign);\n    if (uv.y > 4096.) tcD = tcD.xzy;\n    else if (uv.y > 2048.) tcD = tcD.zxy;\n    return textureLod(iChannel3, tcD, 0.);\n}\n\nvec4 Trace(vec3 p, vec3 d) {\n    vec4 info = vec4(vec3(0.), 100000.);\n    vec3 signdir = (max(vec3(0.), sign(d))*2. - 1.);\n    vec3 iDir = 1.\/d;\n    float bbDF = DFBox(p, vec3(32., 32., 48.));\n    vec2 bb = ABox(p, iDir, vec3(0.01), vec3(31.99, 31.99, 47.99));\n    if (bbDF > 0. && (bb.x < 0. || bb.y < bb.x)) return vec4(-10.);\n    float tFAR = bb.y;\n    float t = ((bbDF < 0.)? 0. : bb.x + 0.001);\n    vec3 cp;\n    vec4 sC;\n    vec3 fp = floor(p + d*t);\n    vec3 lfp = fp - vec3(0., 1., 0.);\n    for (int i = 0; i < 128; i++) {\n        if (t > tFAR) break;\n        cp = p + d*t;\n        sC = texture(iChannel1, vec2(fp.x + (mod(fp.y + 0.5, 8.) - 0.5)*32. + 0.5, fp.z + floor(fp.y*0.125)*48. + 0.5)*IRES);\n        if (sC.w > 0.5) return vec4(t);\n        lfp = fp;\n        fp += ABoxfarNormal(p, iDir, signdir, fp, fp + 1., t);\n    }\n    return vec4(-10.);\n}\n\nvoid mainImage(out vec4 fragColor, in vec2 fragCoord) {\n    vec3 SUN_DIR = GetSunDir(iTime);\n    vec3 SUN_TAN = normalize(cross(SUN_DIR, vec3(0., 1., 0.)));\n    vec3 SUN_BIT = cross(SUN_TAN, SUN_DIR);\n    vec2 sun_uv = (fragCoord.xy*IRES*2. - 1.)*ASPECT*SUN_SM_SIZE;\n    vec3 SUN_POS = vec3(16., 16., 24.) + SUN_DIR*SUN_DIST + SUN_TAN*sun_uv.x + SUN_BIT*sun_uv.y;\n    vec4 info = Trace(SUN_POS, -SUN_DIR);\n    fragColor = info;\n}",
//         name: "Buffer C",
//         description: "",
//         type: "buffer",
//       },
//     ],
//   },
//   {
//     ver: "0.1",
//     info: {
//       id: "WcX3DH",
//       date: "1739119998",
//       viewed: 35,
//       name: "ShinsecAI Background Wallpaper",
//       username: "Nanerbeet",
//       description:
//         "Click and drag to change position\nCombined https:\/\/www.shadertoy.com\/view\/wfsGDn and into a single background https:\/\/www.shadertoy.com\/view\/lscczl",
//       likes: 4,
//       published: 1,
//       flags: 0,
//       usePreview: 0,
//       tags: [],
//     },
//     renderpass: [
//       {
//         inputs: [],
//         outputs: [{ id: "4dfGRr", channel: 0 }],
//         code: "\/\/ The Universe Within - by Martijn Steinrucken aka BigWings 2018\n\/\/ Email:countfrolic@gmail.com Twitter:@The_ArtOfCode\n\/\/ License Creative Commons Attribution-NonCommercial-ShareAlike 3.0 Unported License.\n\n\/\/ After listening to an interview with Michael Pollan on the Joe Rogan\n\/\/ podcast I got interested in mystic experiences that people seem to\n\/\/ have when using certain psycoactive substances. \n\/\/\n\/\/ For best results, watch fullscreen, with music, in a dark room.\n\/\/ \n\/\/ I had an unused 'blockchain effect' lying around and used it as\n\/\/ a base for this effect. Uncomment the SIMPLE define to see where\n\/\/ this came from.\n\/\/ \n\/\/ Use the mouse to get some 3d parallax.\n\n\/\/ Music - Terrence McKenna Mashup - Jason Burruss Remixes\n\/\/ https:\/\/soundcloud.com\/jason-burruss-remixes\/terrence-mckenna-mashup\n\/\/\n\/\/ YouTube video of this effect:\n\/\/ https:\/\/youtu.be\/GAhu4ngQa48\n\/\/\n\/\/ YouTube Tutorial for this effect:\n\/\/ https:\/\/youtu.be\/3CycKKJiwis\n\n#define TIME (iTime * 0.2)\n\n#define S(a, b, t) smoothstep(a, b, t)\n#define NUM_LAYERS 4.\n\n\/\/#define SIMPLE\n\n\nfloat N21(vec2 p) {\n\tvec3 a = fract(vec3(p.xyx) * vec3(213.897, 653.453, 253.098));\n    a += dot(a, a.yzx + 79.76);\n    return fract((a.x + a.y) * a.z);\n}\n\nvec2 GetPos(vec2 id, vec2 offs, float t) {\n    float n = N21(id+offs);\n    float n1 = fract(n*10.);\n    float n2 = fract(n*100.);\n    float a = t+n;\n    return offs + vec2(sin(a*n1), cos(a*n2))*.4;\n}\n\nfloat GetT(vec2 ro, vec2 rd, vec2 p) {\n\treturn dot(p-ro, rd); \n}\n\nfloat LineDist(vec3 a, vec3 b, vec3 p) {\n\treturn length(cross(b-a, p-a))\/length(p-a);\n}\n\nfloat df_line( in vec2 a, in vec2 b, in vec2 p)\n{\n    vec2 pa = p - a, ba = b - a;\n\tfloat h = clamp(dot(pa,ba) \/ dot(ba,ba), 0., 1.);\t\n\treturn length(pa - ba * h);\n}\n\nfloat line(vec2 a, vec2 b, vec2 uv) {\n    float r1 = .04;\n    float r2 = .01;\n    \n    float d = df_line(a, b, uv);\n    float d2 = length(a-b);\n    float fade = S(1.5, .5, d2);\n    \n    fade += S(.05, .02, abs(d2-.75));\n    return S(r1, r2, d)*fade;\n}\n\nfloat NetLayer(vec2 st, float n, float t) {\n    vec2 id = floor(st)+n;\n\n    st = fract(st)-.5;\n   \n    vec2 p[9];\n    int i=0;\n    for(float y=-1.; y<=1.; y++) {\n    \tfor(float x=-1.; x<=1.; x++) {\n            p[i++] = GetPos(id, vec2(x,y), t);\n    \t}\n    }\n    \n    float m = 0.;\n    float sparkle = 0.;\n    \n    for(int i=0; i<9; i++) {\n        m += line(p[4], p[i], st);\n\n        float d = length(st-p[i]);\n\n        float s = (.005\/(d*d));\n        s *= S(1., .7, d);\n        float pulse = sin((fract(p[i].x)+fract(p[i].y)+t)*5.)*.4+.6;\n        pulse = pow(pulse, 20.);\n\n        s *= pulse;\n        sparkle += s;\n    }\n    \n    m += line(p[1], p[3], st);\n\tm += line(p[1], p[5], st);\n    m += line(p[7], p[5], st);\n    m += line(p[7], p[3], st);\n    \n    float sPhase = (sin(t+n)+sin(t*.1))*.25+.5;\n    sPhase += pow(sin(t*.1)*.5+.5, 50.)*5.;\n    m += sparkle*sPhase;\/\/(*.5+.5);\n    \n    return m;\n}\n\nvoid mainImage2( out vec4 fragColor, in vec2 fragCoord )\n{\n    vec2 uv = (fragCoord-iResolution.xy*.5)\/iResolution.y;\n\tvec2 M = iMouse.xy\/iResolution.xy-.5;\n    \n    float t = TIME*.1;\n    \n    float s = sin(t);\n    float c = cos(t);\n    mat2 rot = mat2(c, -s, s, c);\n    vec2 st = uv*rot;  \n\tM *= rot*2.;\n    \n    float m = 0.;\n    for(float i=0.; i<1.; i+=1.\/NUM_LAYERS) {\n        float z = fract(t+i);\n        float size = mix(15., 1., z);\n        float fade = S(0., .6, z)*S(1., .8, z);\n        \n        m += fade * NetLayer(st*size-M*z, i, TIME);\n    }\n    \n\tfloat fft  = texelFetch( iChannel0, ivec2(.7,0), 0 ).x;\n    float glow = -uv.y*fft*2.;\n   \n    vec3 baseCol = vec3(s, cos(t*.4), -sin(t*.24))*.4+.6;\n    vec3 col = baseCol*m;\n    col += baseCol*glow;\n    \n    #ifdef SIMPLE\n    uv *= 10.;\n    col = vec3(1)*NetLayer(uv, 0., TIME);\n    uv = fract(uv);\n    \/\/if(uv.x>.98 || uv.y>.98) col += 1.;\n    #else\n    col *= 1.-dot(uv,uv);\n    t = mod(TIME, 230.);\n    col *= S(0., 20., t)*S(224., 200., t);\n    #endif\n    \n    fragColor = vec4(col,1);\n}\n\nvoid mainImage(out vec4 fragColor, in vec2 fragCoord)\n{\n    \/\/ \u753b\u9762\u3092[-0.5, 0.5]\u7bc4\u56f2\u306b\u6b63\u898f\u5316\n    vec2 uv = fragCoord.xy \/ iResolution.xy - 0.5;\n    uv.x *= iResolution.x \/ iResolution.y; \/\/ \u30a2\u30b9\u30da\u30af\u30c8\u88dc\u6b63\n    uv -= ((iMouse.xy \/ iResolution.xy) - 0.5f) * 5.;\n    uv *= 0.125f;\n    \n\n    float time = TIME * 0.12; \/\/ \u30a2\u30cb\u30e1\u901f\u5ea6\u3086\u3063\u304f\u308a\u3081\n    \n    \/\/ \u753b\u9762\u5168\u4f53\u3092\u56de\u8ee2\n    float ang = 0.1 * sin(time);\n    float ca = cos(ang), sa = sin(ang);\n    mat2 rot = mat2(ca, -sa, sa, ca);\n    uv = rot * uv;\n\n    float accumR = 0.0;\n    float accumG = 0.3;\n    float accumB = 0.1;\n\n    float s = 0.0;\n    float stepSize = 0.032;  \n    float fractalConst = 0.66;\n    int loopCount = 80;\n\n    \/\/ \u884c\u5217\u306b\u3088\u308b\u308f\u305a\u304b\u306a\u975e\u5bfe\u79f0\u5909\u63db\n    \/\/ \u6570\u5024\u3092\u5c0f\u3055\u304f\u3059\u308c\u3070\u5909\u5f62\u3082\u8efd\u5fae\n    mat2 asymMat = mat2(2.0, 1.05,\n                       -0.02, 1.0);\n\n    for(int i=0; i<loopCount; i++)\n    {\n        vec3 p = s * vec3(uv, 0.0);\n\n        \/\/ \u7206\u5fc3\u5730\u30aa\u30d5\u30bb\u30c3\u30c8\n        p.xy += vec2(-0.25 + 0.2*sin(time*0.5), 0.3*cos(time*0.4));\n        p.z  += (s - 1.3) - 0.2*cos(time*0.3);\n\n        \/\/ \u53cd\u8ee2\u30d5\u30e9\u30af\u30bf\u30eb\u53cd\u5fa9\n        for(int j=0; j<7; j++){\n            p = abs(p)\/dot(p,p) - fractalConst;\n            \/\/ ---\u6700\u5c0f\u9650\u306e\u5909\u66f4\uff1a\u3053\u3053\u3067p.xy\u306b\u5fae\u5999\u306a\u5909\u63db\u3092\u639b\u3051\u308b---\n            p.xy = asymMat * p.xy;\n        }\n\n        float d2 = dot(p,p);\n\n        float weightR = 0.0015 * d2 * (1.1 + 0.5*sin(time + length(uv*12.0))); \n        float weightG = 0.0020 * d2 * (1.0 + 0.3*cos(time*0.8 + float(i)));\n        float weightB = 0.0010 * length(p.xy*10.) * (0.8 + 0.4*sin(float(i)*0.3 - time*0.2));\n\n        accumR += weightR;\n        accumG += weightG;\n        accumB += weightB;\n\n        s += stepSize;\n    }\n\n    float lenUV = length(uv);\n    accumR *= smoothstep(0.85, 0.0, lenUV);\n    accumG *= smoothstep(0.75, 0.0, lenUV);\n    accumB *= smoothstep(0.9,  0.0, lenUV);\n\n    vec3 col;\n    col.r = accumR*1.2 + 0.2*accumB;\n    col.g = (accumG + accumB)*0.5;\n    col.b = (accumB + 0.3*accumR);\n\n    float centerGlow = smoothstep(0.0, 0.25, 0.25 - lenUV) * 1.2;\n    col += vec3(centerGlow);\n\n    col = pow(col, vec3(0.9));\n    col = clamp(col, 0.0, 1.0);\n    \n    mainImage2(fragColor, fragCoord);\n\n    fragColor += vec4(col, 1.0);\n}",
//         name: "Image",
//         description: "",
//         type: "image",
//       },
//     ],
//   },
//   {
//     ver: "0.1",
//     info: {
//       id: "Wt33Wf",
//       date: "1580223238",
//       viewed: 539949,
//       name: "Cyber Fuji 2020",
//       username: "kaiware007",
//       description: "A Happy New Yeahhhhhhhhhhhhhhhhhh!!!!!!!!!!!!!",
//       likes: 548,
//       published: 3,
//       flags: 0,
//       usePreview: 1,
//       tags: [],
//     },
//     renderpass: [
//       {
//         inputs: [],
//         outputs: [{ id: "4dfGRr", channel: 0 }],
//         code: "\nfloat sun(vec2 uv, float battery)\n{\n \tfloat val = smoothstep(0.3, 0.29, length(uv));\n \tfloat bloom = smoothstep(0.7, 0.0, length(uv));\n    float cut = 3.0 * sin((uv.y + iTime * 0.2 * (battery + 0.02)) * 100.0) \n\t\t\t\t+ clamp(uv.y * 14.0 + 1.0, -6.0, 6.0);\n    cut = clamp(cut, 0.0, 1.0);\n    return clamp(val * cut, 0.0, 1.0) + bloom * 0.6;\n}\n\nfloat grid(vec2 uv, float battery)\n{\n    vec2 size = vec2(uv.y, uv.y * uv.y * 0.2) * 0.01;\n    uv += vec2(0.0, iTime * 4.0 * (battery + 0.05));\n    uv = abs(fract(uv) - 0.5);\n \tvec2 lines = smoothstep(size, vec2(0.0), uv);\n \tlines += smoothstep(size * 5.0, vec2(0.0), uv) * 0.4 * battery;\n    return clamp(lines.x + lines.y, 0.0, 3.0);\n}\n\nfloat dot2(in vec2 v ) { return dot(v,v); }\n\nfloat sdTrapezoid( in vec2 p, in float r1, float r2, float he )\n{\n    vec2 k1 = vec2(r2,he);\n    vec2 k2 = vec2(r2-r1,2.0*he);\n    p.x = abs(p.x);\n    vec2 ca = vec2(p.x-min(p.x,(p.y<0.0)?r1:r2), abs(p.y)-he);\n    vec2 cb = p - k1 + k2*clamp( dot(k1-p,k2)\/dot2(k2), 0.0, 1.0 );\n    float s = (cb.x<0.0 && ca.y<0.0) ? -1.0 : 1.0;\n    return s*sqrt( min(dot2(ca),dot2(cb)) );\n}\n\nfloat sdLine( in vec2 p, in vec2 a, in vec2 b )\n{\n    vec2 pa = p-a, ba = b-a;\n    float h = clamp( dot(pa,ba)\/dot(ba,ba), 0.0, 1.0 );\n    return length( pa - ba*h );\n}\n\nfloat sdBox( in vec2 p, in vec2 b )\n{\n    vec2 d = abs(p)-b;\n    return length(max(d,vec2(0))) + min(max(d.x,d.y),0.0);\n}\n\nfloat opSmoothUnion(float d1, float d2, float k){\n\tfloat h = clamp(0.5 + 0.5 * (d2 - d1) \/k,0.0,1.0);\n    return mix(d2, d1 , h) - k * h * ( 1.0 - h);\n}\n\nfloat sdCloud(in vec2 p, in vec2 a1, in vec2 b1, in vec2 a2, in vec2 b2, float w)\n{\n\t\/\/float lineVal1 = smoothstep(w - 0.0001, w, sdLine(p, a1, b1));\n    float lineVal1 = sdLine(p, a1, b1);\n    float lineVal2 = sdLine(p, a2, b2);\n    vec2 ww = vec2(w*1.5, 0.0);\n    vec2 left = max(a1 + ww, a2 + ww);\n    vec2 right = min(b1 - ww, b2 - ww);\n    vec2 boxCenter = (left + right) * 0.5;\n    \/\/float boxW = right.x - left.x;\n    float boxH = abs(a2.y - a1.y) * 0.5;\n    \/\/float boxVal = sdBox(p - boxCenter, vec2(boxW, boxH)) + w;\n    float boxVal = sdBox(p - boxCenter, vec2(0.04, boxH)) + w;\n    \n    float uniVal1 = opSmoothUnion(lineVal1, boxVal, 0.05);\n    float uniVal2 = opSmoothUnion(lineVal2, boxVal, 0.05);\n    \n    return min(uniVal1, uniVal2);\n}\n\nvoid mainImage( out vec4 fragColor, in vec2 fragCoord )\n{\n    vec2 uv = (2.0 * fragCoord.xy - iResolution.xy)\/iResolution.y;\n    float battery = 1.0;\n    \/\/if (iMouse.x > 1.0 && iMouse.y > 1.0) battery = iMouse.y \/ iResolution.y;\n    \/\/else battery = 0.8;\n    \n    \/\/if (abs(uv.x) < (9.0 \/ 16.0))\n    {\n        \/\/ Grid\n        float fog = smoothstep(0.1, -0.02, abs(uv.y + 0.2));\n        vec3 col = vec3(0.0, 0.1, 0.2);\n        if (uv.y < -0.2)\n        {\n            uv.y = 3.0 \/ (abs(uv.y + 0.2) + 0.05);\n            uv.x *= uv.y * 1.0;\n            float gridVal = grid(uv, battery);\n            col = mix(col, vec3(1.0, 0.5, 1.0), gridVal);\n        }\n        else\n        {\n            float fujiD = min(uv.y * 4.5 - 0.5, 1.0);\n            uv.y -= battery * 1.1 - 0.51;\n            \n            vec2 sunUV = uv;\n            vec2 fujiUV = uv;\n            \n            \/\/ Sun\n            sunUV += vec2(0.75, 0.2);\n            \/\/uv.y -= 1.1 - 0.51;\n            col = vec3(1.0, 0.2, 1.0);\n            float sunVal = sun(sunUV, battery);\n            \n            col = mix(col, vec3(1.0, 0.4, 0.1), sunUV.y * 2.0 + 0.2);\n            col = mix(vec3(0.0, 0.0, 0.0), col, sunVal);\n            \n            \/\/ fuji\n            float fujiVal = sdTrapezoid( uv  + vec2(-0.75+sunUV.y * 0.0, 0.5), 1.75 + pow(uv.y * uv.y, 2.1), 0.2, 0.5);\n            float waveVal = uv.y + sin(uv.x * 20.0 + iTime * 2.0) * 0.05 + 0.2;\n            float wave_width = smoothstep(0.0,0.01,(waveVal));\n            \n            \/\/ fuji color\n            col = mix( col, mix(vec3(0.0, 0.0, 0.25), vec3(1.0, 0.0, 0.5), fujiD), step(fujiVal, 0.0));\n            \/\/ fuji top snow\n            col = mix( col, vec3(1.0, 0.5, 1.0), wave_width * step(fujiVal, 0.0));\n            \/\/ fuji outline\n            col = mix( col, vec3(1.0, 0.5, 1.0), 1.0-smoothstep(0.0,0.01,abs(fujiVal)) );\n            \/\/col = mix( col, vec3(1.0, 1.0, 1.0), 1.0-smoothstep(0.03,0.04,abs(fujiVal)) );\n            \/\/col = vec3(1.0, 1.0, 1.0) *(1.0-smoothstep(0.03,0.04,abs(fujiVal)));\n            \n            \/\/ horizon color\n            col += mix( col, mix(vec3(1.0, 0.12, 0.8), vec3(0.0, 0.0, 0.2), clamp(uv.y * 3.5 + 3.0, 0.0, 1.0)), step(0.0, fujiVal) );\n            \n            \/\/ cloud\n            vec2 cloudUV = uv;\n            cloudUV.x = mod(cloudUV.x + iTime * 0.1, 4.0) - 2.0;\n            float cloudTime = iTime * 0.5;\n            float cloudY = -0.5;\n            float cloudVal1 = sdCloud(cloudUV, \n                                     vec2(0.1 + sin(cloudTime + 140.5)*0.1,cloudY), \n                                     vec2(1.05 + cos(cloudTime * 0.9 - 36.56) * 0.1, cloudY), \n                                     vec2(0.2 + cos(cloudTime * 0.867 + 387.165) * 0.1,0.25+cloudY), \n                                     vec2(0.5 + cos(cloudTime * 0.9675 - 15.162) * 0.09, 0.25+cloudY), 0.075);\n            cloudY = -0.6;\n            float cloudVal2 = sdCloud(cloudUV, \n                                     vec2(-0.9 + cos(cloudTime * 1.02 + 541.75) * 0.1,cloudY), \n                                     vec2(-0.5 + sin(cloudTime * 0.9 - 316.56) * 0.1, cloudY), \n                                     vec2(-1.5 + cos(cloudTime * 0.867 + 37.165) * 0.1,0.25+cloudY), \n                                     vec2(-0.6 + sin(cloudTime * 0.9675 + 665.162) * 0.09, 0.25+cloudY), 0.075);\n            \n            float cloudVal = min(cloudVal1, cloudVal2);\n            \n            \/\/col = mix(col, vec3(1.0,1.0,0.0), smoothstep(0.0751, 0.075, cloudVal));\n            col = mix(col, vec3(0.0, 0.0, 0.2), 1.0 - smoothstep(0.075 - 0.0001, 0.075, cloudVal));\n            col += vec3(1.0, 1.0, 1.0)*(1.0 - smoothstep(0.0,0.01,abs(cloudVal - 0.075)));\n        }\n\n        col += fog * fog * fog;\n        col = mix(vec3(col.r, col.r, col.r) * 0.5, col, battery * 0.7);\n\n        fragColor = vec4(col,1.0);\n    }\n    \/\/else fragColor = vec4(0.0);\n\n    \n}",
//         name: "Image",
//         description: "",
//         type: "image",
//       },
//     ],
//   },
//   {
//     ver: "0.1",
//     info: {
//       id: "MfVfz3",
//       date: "1734300935",
//       viewed: 16394,
//       name: "\u5927\u9f99\u732b - Tunnel Cable",
//       username: "totetmatt",
//       description: "tunnel runner",
//       likes: 121,
//       published: 3,
//       flags: 0,
//       usePreview: 0,
//       tags: [],
//     },
//     renderpass: [
//       {
//         inputs: [],
//         outputs: [{ id: "4dfGRr", channel: 0 }],
//         code: "#define hash(x) fract(sin(x) * 43758.5453123)\nvec3 pal(float t){return .5+.5*cos(6.28*(1.*t+vec3(.0,.1,.1)));}\n float stepNoise(float x, float n) { \/\/ From Kamoshika shader\n   const float factor = 0.3;\n   float i = floor(x);\n   float f = x - i;\n   float u = smoothstep(0.5 - factor, 0.5 + factor, f);\n   float res = mix(floor(hash(i) * n), floor(hash(i + 1.) * n), u);\n   res \/= (n - 1.) * 0.5;\n   return res - 1.;\n }\n vec3 path(vec3 p){\n   \n      vec3 o = vec3(0.);\n       o.x += stepNoise(p.z*.05,5.)*5.;\n      o.y += stepNoise(p.z*.07,3.975)*5.;\n     return o;\n   }\n   float diam2(vec2 p,float s){p=abs(p); return (p.x+p.y-s)*inversesqrt(3.);}\n   vec3 erot(vec3 p,vec3 ax,float t){return mix(dot(ax,p)*ax,p,cos(t))+cross(ax,p)*sin(t);}\nvoid mainImage( out vec4 fragColor, in vec2 fragCoord )\n{\n    \/\/ Normalized pixel coordinates (from 0 to 1)\n    vec2 uv = (fragCoord-.5*iResolution.xy)\/iResolution.y;\n\n vec3 col = vec3(0.);\n  \n  vec3 ro = vec3(0.,0.,-1.),rt=vec3(0.);\n  ro.z+=iTime*5.;\n  rt.z += iTime*5.;\n  ro+=path(ro);\n    rt+=path(rt);\n  vec3 z = normalize(rt-ro);\n  vec3 x = vec3(z.z,0.,-z.x);\n  float i=0.,e=0.,g=0.;\n  vec3 rd = mat3(x,cross(z,x),z)*erot(normalize(vec3(uv,1.)),vec3(0.,0.,1.),stepNoise(iTime+hash(uv.x*uv.y*iTime)*.05,6.));\n  for(;i++<99.;){\n     vec3 p= ro+rd*g;\n\n    p-=path(p);\n    float r = 0.;;\n    vec3 pp=p;\n    float sc=1.;\n    for(float j=0.;j++<4.;){\n        r = clamp(r+abs(dot(sin(pp*3.),cos(pp.yzx*2.))*.3-.1)\/sc,-.5,.5);\n        pp=erot(pp,normalize(vec3(.1,.2,.3)),.785+j);\n        pp+=pp.yzx+j*50.;\n        sc*=1.5;\n        pp*=1.5;\n      }\n      \n     float h = abs(diam2(p.xy,7.))-3.-r;\n   \n     p=erot(p,vec3(0.,0.,1.),path(p).x*.5+p.z*.2);\n    float t = length(abs(p.xy)-.5)-.1;\n     h= min(t,h);\n     g+=e=max(.001,t==h ?abs(h):(h));\n     col +=(t==h ?vec3(.3,.2,.1)*(100.*exp(-20.*fract(p.z*.25+iTime)))*mod(floor(p.z*4.)+mod(floor(p.y*4.),2.),2.) :vec3(.1))*.0325\/exp(i*i*e);;\n    }\n    col = mix(col,vec3(.9,.9,1.1),1.-exp(-.01*g*g*g));\n    \/\/ Output to screen\n    fragColor = vec4(col,1.0);\n}",
//         name: "Image",
//         description: "",
//         type: "image",
//       },
//     ],
//   },
//   {
//     ver: "0.1",
//     info: {
//       id: "WfXGDH",
//       date: "1739118026",
//       viewed: 38,
//       name: "Smooth MiniDualBlobs Textured",
//       username: "benoitM",
//       description: "Mapping metaballs field and dual to texture mapping",
//       likes: 3,
//       published: 3,
//       flags: 0,
//       usePreview: 0,
//       tags: [],
//     },
//     renderpass: [
//       {
//         inputs: [
//           {
//             id: "4dfGRn",
//             filepath:
//               "\/media\/a\/8de3a3924cb95bd0e95a443fff0326c869f9d4979cd1d5b6e94e2a01f5be53e9.jpg",
//             previewfilepath:
//               "\/media\/ap\/8de3a3924cb95bd0e95a443fff0326c869f9d4979cd1d5b6e94e2a01f5be53e9.jpg",
//             type: "texture",
//             channel: 0,
//             sampler: {
//               filter: "mipmap",
//               wrap: "repeat",
//               vflip: "true",
//               srgb: "false",
//               internal: "byte",
//             },
//             published: 1,
//           },
//         ],
//         outputs: [{ id: "4dfGRr", channel: 0 }],
//         code: "void mainImage(out vec4 o,vec2 u){\n    vec2 R = iResolution.xy, g,d;\n    float f,l,i;\n    u = ( u - .5*R ) \/ R.y;\n    for(i;i<6.;f+=1.\/l,g+=d\/(l*l))\n    {\n        d=u-cos(iTime*.3-i++*vec2(8,5))\/i;\n        l=dot(d,d);\n    }\n    o =  texture(iChannel0, abs(vec2(cos(log(f)),cos(20.*(u.y*g.x-u.x*g.y)\/length(g)))));\n}",
//         name: "Image",
//         description: "",
//         type: "image",
//       },
//     ],
//   },
//   {
//     ver: "0.1",
//     info: {
//       id: "l3cfW4",
//       date: "1737219704",
//       viewed: 6127,
//       name: "Starship [334]",
//       username: "Xor",
//       description: "Inspired by the debris from SpaceX's 7th Starship test.",
//       likes: 203,
//       published: 3,
//       flags: 0,
//       usePreview: 1,
//       tags: [],
//     },
//     renderpass: [
//       {
//         inputs: [
//           {
//             id: "XdfGRn",
//             filepath:
//               "\/media\/a\/e6e5631ce1237ae4c05b3563eda686400a401df4548d0f9fad40ecac1659c46c.jpg",
//             previewfilepath:
//               "\/media\/ap\/e6e5631ce1237ae4c05b3563eda686400a401df4548d0f9fad40ecac1659c46c.jpg",
//             type: "texture",
//             channel: 0,
//             sampler: {
//               filter: "mipmap",
//               wrap: "repeat",
//               vflip: "true",
//               srgb: "false",
//               internal: "byte",
//             },
//             published: 1,
//           },
//         ],
//         outputs: [{ id: "4dfGRr", channel: 0 }],
//         code: '\/*\n    "Starship" by @XorDev\n\n    Inspired by the debris from SpaceX\'s 7th Starship test:\n    https:\/\/x.com\/elonmusk\/status\/1880040599761596689\n    \n    My original twigl version:\n    https:\/\/x.com\/XorDev\/status\/1880344887033569682\n    \n    <512 Chars playlist: shadertoy.com\/playlist\/N3SyzR\n*\/\nvoid mainImage( out vec4 O, vec2 I)\n{\n    \/\/Resolution for scaling\n    vec2 r = iResolution.xy,\n    \/\/Center, rotate and scale\n    p = (I+I-r) \/ r.y * mat2(4,-3,3,4);\n    \/\/Time, trailing time and iterator variables\n    float t=iTime, T=t+.1*p.x, i;\n    \n    \/\/Iterate through 50 particles\n    for(\n        \/\/Clear fragColor\n        O *= i; i++<50.;\n    \n        \/\/\/Set color:\n        \/\/The sine gives us color index between -1 and +1.\n        \/\/Then we give each channel a separate frequency.\n        \/\/Red is the broadest, while blue dissipates quickly.\n        \/\/Add one to avoid negative color values (0 to 2).\n        O += (cos(sin(i)*vec4(1,2,3,0))+1.)\n        \n        \/\/\/Flashing brightness:\n        \/\/The brightness fluxuates exponentially between 1\/e and e.\n        \/\/Each particle has a flash frequency according to its index.\n        * exp(sin(i+.1*i*T))\n        \n        \/\/\/Trail particles with attenuating light:\n        \/\/The basic idea is to start with a point light falloff.\n        \/\/I used max on the coordinates so that I can scale the\n        \/\/positive and negative directions independently.\n        \/\/The x axis is scaled down a lot for a long trail.\n        \/\/Noise is added to the scaling factor for cloudy depth.\n        \/\/The y-axis is also stretched a little for a glare effect.\n        \/\/Try a higher value like 4 for more clarity\n        \/ length(max(p,\n            p \/ vec2(texture(iChannel0, p\/exp(sin(i)+5.)+vec2(t,i)\/8.).r*40.,2))\n        ))\n        \n        \/\/\/Shift position for each particle:\n        \/\/Frequencies to distribute particles x and y independently\n        \/\/i*i is a quick way to hide the sine wave periods\n        \/\/t to shift with time and p.x for leaving trails as it moves\n        p+=2.*cos(i*vec2(11,9)+i*i+T*.2);\n    \n    \/\/Add sky background and "tanh" tonemap\n    O = tanh(.01*p.y*vec4(0,1,2,3)+O*O\/1e4);\n}',
//         name: "Image",
//         description: "",
//         type: "image",
//       },
//     ],
//   },
//   {
//     ver: "0.1",
//     info: {
//       id: "Xds3zN",
//       date: "1364255835",
//       viewed: 1015180,
//       name: "Raymarching - Primitives",
//       username: "iq",
//       description:
//         "A set of raw primitives. All except the ellipsoid are exact euclidean distances. More info here: [url=https:\/\/iquilezles.org\/articles\/distfunctions]https:\/\/iquilezles.org\/articles\/distfunctions[\/url]",
//       likes: 1766,
//       published: 3,
//       flags: 0,
//       usePreview: 0,
//       tags: [],
//     },
//     renderpass: [
//       {
//         inputs: [],
//         outputs: [{ id: "4dfGRr", channel: 0 }],
//         code: '\/\/ The MIT License\n\/\/ Copyright \u00a9 2013 Inigo Quilez\n\/\/ Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and\/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions: The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software. THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.\n\/\/\n\/\/ The license is here only not because I want to (can one\n\/\/ license pieces of math?), but because people get upset\n\/\/ if I don\'t add one...\n\n\/\/ A list of useful distance function to simple primitives. All\n\/\/ these functions (except for ellipsoid) return an exact\n\/\/ euclidean distance, meaning they produce a better SDF than\n\/\/ what you\'d get if you were constructing them from boolean\n\/\/ operations (such as cutting an infinite cylinder with two planes).\n\n\/\/ List of other 3D SDFs:\n\/\/    https:\/\/www.shadertoy.com\/playlist\/43cXRl\n\/\/ and\n\/\/    https:\/\/iquilezles.org\/articles\/distfunctions\n\n#if HW_PERFORMANCE==0\n#define AA 1\n#else\n#define AA 2   \/\/ make this 2 or 3 for antialiasing\n#endif\n\n\/\/------------------------------------------------------------------\nfloat dot2( in vec2 v ) { return dot(v,v); }\nfloat dot2( in vec3 v ) { return dot(v,v); }\nfloat ndot( in vec2 a, in vec2 b ) { return a.x*b.x - a.y*b.y; }\n\nfloat sdPlane( vec3 p )\n{\n\treturn p.y;\n}\n\nfloat sdSphere( vec3 p, float s )\n{\n    return length(p)-s;\n}\n\nfloat sdBox( vec3 p, vec3 b )\n{\n    vec3 d = abs(p) - b;\n    return min(max(d.x,max(d.y,d.z)),0.0) + length(max(d,0.0));\n}\n\nfloat sdBoxFrame( vec3 p, vec3 b, float e )\n{\n       p = abs(p  )-b;\n  vec3 q = abs(p+e)-e;\n\n  return min(min(\n      length(max(vec3(p.x,q.y,q.z),0.0))+min(max(p.x,max(q.y,q.z)),0.0),\n      length(max(vec3(q.x,p.y,q.z),0.0))+min(max(q.x,max(p.y,q.z)),0.0)),\n      length(max(vec3(q.x,q.y,p.z),0.0))+min(max(q.x,max(q.y,p.z)),0.0));\n}\nfloat sdEllipsoid( in vec3 p, in vec3 r ) \/\/ approximated\n{\n    float k0 = length(p\/r);\n    float k1 = length(p\/(r*r));\n    return k0*(k0-1.0)\/k1;\n}\n\nfloat sdTorus( vec3 p, vec2 t )\n{\n    return length( vec2(length(p.xz)-t.x,p.y) )-t.y;\n}\n\nfloat sdCappedTorus(in vec3 p, in vec2 sc, in float ra, in float rb)\n{\n    p.x = abs(p.x);\n    float k = (sc.y*p.x>sc.x*p.y) ? dot(p.xy,sc) : length(p.xy);\n    return sqrt( dot(p,p) + ra*ra - 2.0*ra*k ) - rb;\n}\n\nfloat sdHexPrism( vec3 p, vec2 h )\n{\n    vec3 q = abs(p);\n\n    const vec3 k = vec3(-0.8660254, 0.5, 0.57735);\n    p = abs(p);\n    p.xy -= 2.0*min(dot(k.xy, p.xy), 0.0)*k.xy;\n    vec2 d = vec2(\n       length(p.xy - vec2(clamp(p.x, -k.z*h.x, k.z*h.x), h.x))*sign(p.y - h.x),\n       p.z-h.y );\n    return min(max(d.x,d.y),0.0) + length(max(d,0.0));\n}\n\nfloat sdOctogonPrism( in vec3 p, in float r, float h )\n{\n  const vec3 k = vec3(-0.9238795325,   \/\/ sqrt(2+sqrt(2))\/2 \n                       0.3826834323,   \/\/ sqrt(2-sqrt(2))\/2\n                       0.4142135623 ); \/\/ sqrt(2)-1 \n  \/\/ reflections\n  p = abs(p);\n  p.xy -= 2.0*min(dot(vec2( k.x,k.y),p.xy),0.0)*vec2( k.x,k.y);\n  p.xy -= 2.0*min(dot(vec2(-k.x,k.y),p.xy),0.0)*vec2(-k.x,k.y);\n  \/\/ polygon side\n  p.xy -= vec2(clamp(p.x, -k.z*r, k.z*r), r);\n  vec2 d = vec2( length(p.xy)*sign(p.y), p.z-h );\n  return min(max(d.x,d.y),0.0) + length(max(d,0.0));\n}\n\nfloat sdCapsule( vec3 p, vec3 a, vec3 b, float r )\n{\n\tvec3 pa = p-a, ba = b-a;\n\tfloat h = clamp( dot(pa,ba)\/dot(ba,ba), 0.0, 1.0 );\n\treturn length( pa - ba*h ) - r;\n}\n\nfloat sdRoundCone( in vec3 p, in float r1, float r2, float h )\n{\n    vec2 q = vec2( length(p.xz), p.y );\n    \n    float b = (r1-r2)\/h;\n    float a = sqrt(1.0-b*b);\n    float k = dot(q,vec2(-b,a));\n    \n    if( k < 0.0 ) return length(q) - r1;\n    if( k > a*h ) return length(q-vec2(0.0,h)) - r2;\n        \n    return dot(q, vec2(a,b) ) - r1;\n}\n\nfloat sdRoundCone(vec3 p, vec3 a, vec3 b, float r1, float r2)\n{\n    \/\/ sampling independent computations (only depend on shape)\n    vec3  ba = b - a;\n    float l2 = dot(ba,ba);\n    float rr = r1 - r2;\n    float a2 = l2 - rr*rr;\n    float il2 = 1.0\/l2;\n    \n    \/\/ sampling dependant computations\n    vec3 pa = p - a;\n    float y = dot(pa,ba);\n    float z = y - l2;\n    float x2 = dot2( pa*l2 - ba*y );\n    float y2 = y*y*l2;\n    float z2 = z*z*l2;\n\n    \/\/ single square root!\n    float k = sign(rr)*rr*rr*x2;\n    if( sign(z)*a2*z2 > k ) return  sqrt(x2 + z2)        *il2 - r2;\n    if( sign(y)*a2*y2 < k ) return  sqrt(x2 + y2)        *il2 - r1;\n                            return (sqrt(x2*a2*il2)+y*rr)*il2 - r1;\n}\n\nfloat sdTriPrism( vec3 p, vec2 h )\n{\n    const float k = sqrt(3.0);\n    h.x *= 0.5*k;\n    p.xy \/= h.x;\n    p.x = abs(p.x) - 1.0;\n    p.y = p.y + 1.0\/k;\n    if( p.x+k*p.y>0.0 ) p.xy=vec2(p.x-k*p.y,-k*p.x-p.y)\/2.0;\n    p.x -= clamp( p.x, -2.0, 0.0 );\n    float d1 = length(p.xy)*sign(-p.y)*h.x;\n    float d2 = abs(p.z)-h.y;\n    return length(max(vec2(d1,d2),0.0)) + min(max(d1,d2), 0.);\n}\n\n\/\/ vertical\nfloat sdCylinder( vec3 p, vec2 h )\n{\n    vec2 d = abs(vec2(length(p.xz),p.y)) - h;\n    return min(max(d.x,d.y),0.0) + length(max(d,0.0));\n}\n\n\/\/ arbitrary orientation\nfloat sdCylinder(vec3 p, vec3 a, vec3 b, float r)\n{\n    vec3 pa = p - a;\n    vec3 ba = b - a;\n    float baba = dot(ba,ba);\n    float paba = dot(pa,ba);\n\n    float x = length(pa*baba-ba*paba) - r*baba;\n    float y = abs(paba-baba*0.5)-baba*0.5;\n    float x2 = x*x;\n    float y2 = y*y*baba;\n    float d = (max(x,y)<0.0)?-min(x2,y2):(((x>0.0)?x2:0.0)+((y>0.0)?y2:0.0));\n    return sign(d)*sqrt(abs(d))\/baba;\n}\n\n\/\/ vertical\nfloat sdCone( in vec3 p, in vec2 c, float h )\n{\n    vec2 q = h*vec2(c.x,-c.y)\/c.y;\n    vec2 w = vec2( length(p.xz), p.y );\n    \n\tvec2 a = w - q*clamp( dot(w,q)\/dot(q,q), 0.0, 1.0 );\n    vec2 b = w - q*vec2( clamp( w.x\/q.x, 0.0, 1.0 ), 1.0 );\n    float k = sign( q.y );\n    float d = min(dot( a, a ),dot(b, b));\n    float s = max( k*(w.x*q.y-w.y*q.x),k*(w.y-q.y)  );\n\treturn sqrt(d)*sign(s);\n}\n\nfloat sdCappedCone( in vec3 p, in float h, in float r1, in float r2 )\n{\n    vec2 q = vec2( length(p.xz), p.y );\n    \n    vec2 k1 = vec2(r2,h);\n    vec2 k2 = vec2(r2-r1,2.0*h);\n    vec2 ca = vec2(q.x-min(q.x,(q.y < 0.0)?r1:r2), abs(q.y)-h);\n    vec2 cb = q - k1 + k2*clamp( dot(k1-q,k2)\/dot2(k2), 0.0, 1.0 );\n    float s = (cb.x < 0.0 && ca.y < 0.0) ? -1.0 : 1.0;\n    return s*sqrt( min(dot2(ca),dot2(cb)) );\n}\n\nfloat sdCappedCone(vec3 p, vec3 a, vec3 b, float ra, float rb)\n{\n    float rba  = rb-ra;\n    float baba = dot(b-a,b-a);\n    float papa = dot(p-a,p-a);\n    float paba = dot(p-a,b-a)\/baba;\n\n    float x = sqrt( papa - paba*paba*baba );\n\n    float cax = max(0.0,x-((paba<0.5)?ra:rb));\n    float cay = abs(paba-0.5)-0.5;\n\n    float k = rba*rba + baba;\n    float f = clamp( (rba*(x-ra)+paba*baba)\/k, 0.0, 1.0 );\n\n    float cbx = x-ra - f*rba;\n    float cby = paba - f;\n    \n    float s = (cbx < 0.0 && cay < 0.0) ? -1.0 : 1.0;\n    \n    return s*sqrt( min(cax*cax + cay*cay*baba,\n                       cbx*cbx + cby*cby*baba) );\n}\n\n\/\/ c is the sin\/cos of the desired cone angle\nfloat sdSolidAngle(vec3 pos, vec2 c, float ra)\n{\n    vec2 p = vec2( length(pos.xz), pos.y );\n    float l = length(p) - ra;\n\tfloat m = length(p - c*clamp(dot(p,c),0.0,ra) );\n    return max(l,m*sign(c.y*p.x-c.x*p.y));\n}\n\nfloat sdOctahedron(vec3 p, float s)\n{\n    p = abs(p);\n    float m = p.x + p.y + p.z - s;\n\n    \/\/ exact distance\n    #if 0\n    vec3 o = min(3.0*p - m, 0.0);\n    o = max(6.0*p - m*2.0 - o*3.0 + (o.x+o.y+o.z), 0.0);\n    return length(p - s*o\/(o.x+o.y+o.z));\n    #endif\n    \n    \/\/ exact distance\n    #if 1\n \tvec3 q;\n         if( 3.0*p.x < m ) q = p.xyz;\n    else if( 3.0*p.y < m ) q = p.yzx;\n    else if( 3.0*p.z < m ) q = p.zxy;\n    else return m*0.57735027;\n    float k = clamp(0.5*(q.z-q.y+s),0.0,s); \n    return length(vec3(q.x,q.y-s+k,q.z-k)); \n    #endif\n    \n    \/\/ bound, not exact\n    #if 0\n\treturn m*0.57735027;\n    #endif\n}\n\nfloat sdPyramid( in vec3 p, in float h )\n{\n    float m2 = h*h + 0.25;\n    \n    \/\/ symmetry\n    p.xz = abs(p.xz);\n    p.xz = (p.z>p.x) ? p.zx : p.xz;\n    p.xz -= 0.5;\n\t\n    \/\/ project into face plane (2D)\n    vec3 q = vec3( p.z, h*p.y - 0.5*p.x, h*p.x + 0.5*p.y);\n   \n    float s = max(-q.x,0.0);\n    float t = clamp( (q.y-0.5*p.z)\/(m2+0.25), 0.0, 1.0 );\n    \n    float a = m2*(q.x+s)*(q.x+s) + q.y*q.y;\n\tfloat b = m2*(q.x+0.5*t)*(q.x+0.5*t) + (q.y-m2*t)*(q.y-m2*t);\n    \n    float d2 = min(q.y,-q.x*m2-q.y*0.5) > 0.0 ? 0.0 : min(a,b);\n    \n    \/\/ recover 3D and scale, and add sign\n    return sqrt( (d2+q.z*q.z)\/m2 ) * sign(max(q.z,-p.y));;\n}\n\n\/\/ la,lb=semi axis, h=height, ra=corner\nfloat sdRhombus(vec3 p, float la, float lb, float h, float ra)\n{\n    p = abs(p);\n    vec2 b = vec2(la,lb);\n    float f = clamp( (ndot(b,b-2.0*p.xz))\/dot(b,b), -1.0, 1.0 );\n\tvec2 q = vec2(length(p.xz-0.5*b*vec2(1.0-f,1.0+f))*sign(p.x*b.y+p.z*b.x-b.x*b.y)-ra, p.y-h);\n    return min(max(q.x,q.y),0.0) + length(max(q,0.0));\n}\n\nfloat sdHorseshoe( in vec3 p, in vec2 c, in float r, in float le, vec2 w )\n{\n    p.x = abs(p.x);\n    float l = length(p.xy);\n    p.xy = mat2(-c.x, c.y, \n              c.y, c.x)*p.xy;\n    p.xy = vec2((p.y>0.0 || p.x>0.0)?p.x:l*sign(-c.x),\n                (p.x>0.0)?p.y:l );\n    p.xy = vec2(p.x,abs(p.y-r))-vec2(le,0.0);\n    \n    vec2 q = vec2(length(max(p.xy,0.0)) + min(0.0,max(p.x,p.y)),p.z);\n    vec2 d = abs(q) - w;\n    return min(max(d.x,d.y),0.0) + length(max(d,0.0));\n}\n\nfloat sdU( in vec3 p, in float r, in float le, vec2 w )\n{\n    p.x = (p.y>0.0) ? abs(p.x) : length(p.xy);\n    p.x = abs(p.x-r);\n    p.y = p.y - le;\n    float k = max(p.x,p.y);\n    vec2 q = vec2( (k<0.0) ? -k : length(max(p.xy,0.0)), abs(p.z) ) - w;\n    return length(max(q,0.0)) + min(max(q.x,q.y),0.0);\n}\n\n\/\/------------------------------------------------------------------\n\nvec2 opU( vec2 d1, vec2 d2 )\n{\n\treturn (d1.x<d2.x) ? d1 : d2;\n}\n\n\/\/------------------------------------------------------------------\n\n#define ZERO (min(iFrame,0))\n\n\/\/------------------------------------------------------------------\n\nvec2 map( in vec3 pos )\n{\n    vec2 res = vec2( pos.y, 0.0 );\n\n    \/\/ bounding box\n    if( sdBox( pos-vec3(-2.0,0.3,0.25),vec3(0.3,0.3,1.0) )<res.x )\n    {\n      res = opU( res, vec2( sdSphere(    pos-vec3(-2.0,0.25, 0.0), 0.25 ), 26.9 ) );\n\t  res = opU( res, vec2( sdRhombus(  (pos-vec3(-2.0,0.25, 1.0)).xzy, 0.15, 0.25, 0.04, 0.08 ),17.0 ) );\n    }\n\n    \/\/ bounding box\n    if( sdBox( pos-vec3(0.0,0.3,-1.0),vec3(0.35,0.3,2.5) )<res.x )\n    {\n\tres = opU( res, vec2( sdCappedTorus((pos-vec3( 0.0,0.30, 1.0))*vec3(1,-1,1), vec2(0.866025,-0.5), 0.25, 0.05), 25.0) );\n    res = opU( res, vec2( sdBoxFrame(    pos-vec3( 0.0,0.25, 0.0), vec3(0.3,0.25,0.2), 0.025 ), 16.9 ) );\n\tres = opU( res, vec2( sdCone(        pos-vec3( 0.0,0.45,-1.0), vec2(0.6,0.8),0.45 ), 55.0 ) );\n    res = opU( res, vec2( sdCappedCone(  pos-vec3( 0.0,0.25,-2.0), 0.25, 0.25, 0.1 ), 13.67 ) );\n    res = opU( res, vec2( sdSolidAngle(  pos-vec3( 0.0,0.00,-3.0), vec2(3,4)\/5.0, 0.4 ), 49.13 ) );\n    }\n\n    \/\/ bounding box\n    if( sdBox( pos-vec3(1.0,0.3,-1.0),vec3(0.35,0.3,2.5) )<res.x )\n    {\n\tres = opU( res, vec2( sdTorus(      (pos-vec3( 1.0,0.30, 1.0)).xzy, vec2(0.25,0.05) ), 7.1 ) );\n    res = opU( res, vec2( sdBox(         pos-vec3( 1.0,0.25, 0.0), vec3(0.3,0.25,0.1) ), 3.0 ) );\n    res = opU( res, vec2( sdCapsule(     pos-vec3( 1.0,0.00,-1.0),vec3(-0.1,0.1,-0.1), vec3(0.2,0.4,0.2), 0.1  ), 31.9 ) );\n\tres = opU( res, vec2( sdCylinder(    pos-vec3( 1.0,0.25,-2.0), vec2(0.15,0.25) ), 8.0 ) );\n    res = opU( res, vec2( sdHexPrism(    pos-vec3( 1.0,0.2,-3.0), vec2(0.2,0.05) ), 18.4 ) );\n    }\n\n    \/\/ bounding box\n    if( sdBox( pos-vec3(-1.0,0.35,-1.0),vec3(0.35,0.35,2.5))<res.x )\n    {\n\tres = opU( res, vec2( sdPyramid(    pos-vec3(-1.0,-0.6,-3.0), 1.0 ), 13.56 ) );\n\tres = opU( res, vec2( sdOctahedron( pos-vec3(-1.0,0.15,-2.0), 0.35 ), 23.56 ) );\n    res = opU( res, vec2( sdTriPrism(   pos-vec3(-1.0,0.15,-1.0), vec2(0.3,0.05) ),43.5 ) );\n    res = opU( res, vec2( sdEllipsoid(  pos-vec3(-1.0,0.25, 0.0), vec3(0.2, 0.25, 0.05) ), 43.17 ) );\n    res = opU( res, vec2( sdHorseshoe(  pos-vec3(-1.0,0.25, 1.0), vec2(cos(1.3),sin(1.3)), 0.2, 0.3, vec2(0.03,0.08) ), 11.5 ) );\n    }\n\n    \/\/ bounding box\n    if( sdBox( pos-vec3(2.0,0.3,-1.0),vec3(0.35,0.3,2.5) )<res.x )\n    {\n    res = opU( res, vec2( sdOctogonPrism(pos-vec3( 2.0,0.2,-3.0), 0.2, 0.05), 51.8 ) );\n    res = opU( res, vec2( sdCylinder(    pos-vec3( 2.0,0.14,-2.0), vec3(0.1,-0.1,0.0), vec3(-0.2,0.35,0.1), 0.08), 31.2 ) );\n\tres = opU( res, vec2( sdCappedCone(  pos-vec3( 2.0,0.09,-1.0), vec3(0.1,0.0,0.0), vec3(-0.2,0.40,0.1), 0.15, 0.05), 46.1 ) );\n    res = opU( res, vec2( sdRoundCone(   pos-vec3( 2.0,0.15, 0.0), vec3(0.1,0.0,0.0), vec3(-0.1,0.35,0.1), 0.15, 0.05), 51.7 ) );\n    res = opU( res, vec2( sdRoundCone(   pos-vec3( 2.0,0.20, 1.0), 0.2, 0.1, 0.3 ), 37.0 ) );\n    }\n    \n    return res;\n}\n\n\/\/ https:\/\/iquilezles.org\/articles\/boxfunctions\nvec2 iBox( in vec3 ro, in vec3 rd, in vec3 rad ) \n{\n    vec3 m = 1.0\/rd;\n    vec3 n = m*ro;\n    vec3 k = abs(m)*rad;\n    vec3 t1 = -n - k;\n    vec3 t2 = -n + k;\n\treturn vec2( max( max( t1.x, t1.y ), t1.z ),\n\t             min( min( t2.x, t2.y ), t2.z ) );\n}\n\nvec2 raycast( in vec3 ro, in vec3 rd )\n{\n    vec2 res = vec2(-1.0,-1.0);\n\n    float tmin = 1.0;\n    float tmax = 20.0;\n\n    \/\/ raytrace floor plane\n    float tp1 = (0.0-ro.y)\/rd.y;\n    if( tp1>0.0 )\n    {\n        tmax = min( tmax, tp1 );\n        res = vec2( tp1, 1.0 );\n    }\n    \/\/else return res;\n    \n    \/\/ raymarch primitives   \n    vec2 tb = iBox( ro-vec3(0.0,0.4,-0.5), rd, vec3(2.5,0.41,3.0) );\n    if( tb.x<tb.y && tb.y>0.0 && tb.x<tmax)\n    {\n        \/\/return vec2(tb.x,2.0);\n        tmin = max(tb.x,tmin);\n        tmax = min(tb.y,tmax);\n\n        float t = tmin;\n        for( int i=0; i<70 && t<tmax; i++ )\n        {\n            vec2 h = map( ro+rd*t );\n            if( abs(h.x)<(0.0001*t) )\n            { \n                res = vec2(t,h.y); \n                break;\n            }\n            t += h.x;\n        }\n    }\n    \n    return res;\n}\n\n\/\/ https:\/\/iquilezles.org\/articles\/rmshadows\nfloat calcSoftshadow( in vec3 ro, in vec3 rd, in float mint, in float tmax )\n{\n    \/\/ bounding volume\n    float tp = (0.8-ro.y)\/rd.y; if( tp>0.0 ) tmax = min( tmax, tp );\n\n    float res = 1.0;\n    float t = mint;\n    for( int i=ZERO; i<24; i++ )\n    {\n\t\tfloat h = map( ro + rd*t ).x;\n        float s = clamp(8.0*h\/t,0.0,1.0);\n        res = min( res, s );\n        t += clamp( h, 0.01, 0.2 );\n        if( res<0.004 || t>tmax ) break;\n    }\n    res = clamp( res, 0.0, 1.0 );\n    return res*res*(3.0-2.0*res);\n}\n\n\/\/ https:\/\/iquilezles.org\/articles\/normalsSDF\nvec3 calcNormal( in vec3 pos )\n{\n#if 0\n    vec2 e = vec2(1.0,-1.0)*0.5773*0.0005;\n    return normalize( e.xyy*map( pos + e.xyy ).x + \n\t\t\t\t\t  e.yyx*map( pos + e.yyx ).x + \n\t\t\t\t\t  e.yxy*map( pos + e.yxy ).x + \n\t\t\t\t\t  e.xxx*map( pos + e.xxx ).x );\n#else\n    \/\/ inspired by tdhooper and klems - a way to prevent the compiler from inlining map() 4 times\n    vec3 n = vec3(0.0);\n    for( int i=ZERO; i<4; i++ )\n    {\n        vec3 e = 0.5773*(2.0*vec3((((i+3)>>1)&1),((i>>1)&1),(i&1))-1.0);\n        n += e*map(pos+0.0005*e).x;\n      \/\/if( n.x+n.y+n.z>100.0 ) break;\n    }\n    return normalize(n);\n#endif    \n}\n\n\/\/ https:\/\/iquilezles.org\/articles\/nvscene2008\/rwwtt.pdf\nfloat calcAO( in vec3 pos, in vec3 nor )\n{\n\tfloat occ = 0.0;\n    float sca = 1.0;\n    for( int i=ZERO; i<5; i++ )\n    {\n        float h = 0.01 + 0.12*float(i)\/4.0;\n        float d = map( pos + h*nor ).x;\n        occ += (h-d)*sca;\n        sca *= 0.95;\n        if( occ>0.35 ) break;\n    }\n    return clamp( 1.0 - 3.0*occ, 0.0, 1.0 ) * (0.5+0.5*nor.y);\n}\n\n\/\/ https:\/\/iquilezles.org\/articles\/checkerfiltering\nfloat checkersGradBox( in vec2 p, in vec2 dpdx, in vec2 dpdy )\n{\n    \/\/ filter kernel\n    vec2 w = abs(dpdx)+abs(dpdy) + 0.001;\n    \/\/ analytical integral (box filter)\n    vec2 i = 2.0*(abs(fract((p-0.5*w)*0.5)-0.5)-abs(fract((p+0.5*w)*0.5)-0.5))\/w;\n    \/\/ xor pattern\n    return 0.5 - 0.5*i.x*i.y;                  \n}\n\nvec3 render( in vec3 ro, in vec3 rd, in vec3 rdx, in vec3 rdy )\n{ \n    \/\/ background\n    vec3 col = vec3(0.7, 0.7, 0.9) - max(rd.y,0.0)*0.3;\n    \n    \/\/ raycast scene\n    vec2 res = raycast(ro,rd);\n    float t = res.x;\n\tfloat m = res.y;\n    if( m>-0.5 )\n    {\n        vec3 pos = ro + t*rd;\n        vec3 nor = (m<1.5) ? vec3(0.0,1.0,0.0) : calcNormal( pos );\n        vec3 ref = reflect( rd, nor );\n        \n        \/\/ material        \n        col = 0.2 + 0.2*sin( m*2.0 + vec3(0.0,1.0,2.0) );\n        float ks = 1.0;\n        \n        if( m<1.5 )\n        {\n            \/\/ project pixel footprint into the plane\n            vec3 dpdx = ro.y*(rd\/rd.y-rdx\/rdx.y);\n            vec3 dpdy = ro.y*(rd\/rd.y-rdy\/rdy.y);\n\n            float f = checkersGradBox( 3.0*pos.xz, 3.0*dpdx.xz, 3.0*dpdy.xz );\n            col = 0.15 + f*vec3(0.05);\n            ks = 0.4;\n        }\n\n        \/\/ lighting\n        float occ = calcAO( pos, nor );\n        \n\t\tvec3 lin = vec3(0.0);\n\n        \/\/ sun\n        {\n            vec3  lig = normalize( vec3(-0.5, 0.4, -0.6) );\n            vec3  hal = normalize( lig-rd );\n            float dif = clamp( dot( nor, lig ), 0.0, 1.0 );\n          \/\/if( dif>0.0001 )\n        \t      dif *= calcSoftshadow( pos, lig, 0.02, 2.5 );\n\t\t\tfloat spe = pow( clamp( dot( nor, hal ), 0.0, 1.0 ),16.0);\n                  spe *= dif;\n                  spe *= 0.04+0.96*pow(clamp(1.0-dot(hal,lig),0.0,1.0),5.0);\n                \/\/spe *= 0.04+0.96*pow(clamp(1.0-sqrt(0.5*(1.0-dot(rd,lig))),0.0,1.0),5.0);\n            lin += col*2.20*dif*vec3(1.30,1.00,0.70);\n            lin +=     5.00*spe*vec3(1.30,1.00,0.70)*ks;\n        }\n        \/\/ sky\n        {\n            float dif = sqrt(clamp( 0.5+0.5*nor.y, 0.0, 1.0 ));\n                  dif *= occ;\n            float spe = smoothstep( -0.2, 0.2, ref.y );\n                  spe *= dif;\n                  spe *= 0.04+0.96*pow(clamp(1.0+dot(nor,rd),0.0,1.0), 5.0 );\n          \/\/if( spe>0.001 )\n                  spe *= calcSoftshadow( pos, ref, 0.02, 2.5 );\n            lin += col*0.60*dif*vec3(0.40,0.60,1.15);\n            lin +=     2.00*spe*vec3(0.40,0.60,1.30)*ks;\n        }\n        \/\/ back\n        {\n        \tfloat dif = clamp( dot( nor, normalize(vec3(0.5,0.0,0.6))), 0.0, 1.0 )*clamp( 1.0-pos.y,0.0,1.0);\n                  dif *= occ;\n        \tlin += col*0.55*dif*vec3(0.25,0.25,0.25);\n        }\n        \/\/ sss\n        {\n            float dif = pow(clamp(1.0+dot(nor,rd),0.0,1.0),2.0);\n                  dif *= occ;\n        \tlin += col*0.25*dif*vec3(1.00,1.00,1.00);\n        }\n        \n\t\tcol = lin;\n\n        col = mix( col, vec3(0.7,0.7,0.9), 1.0-exp( -0.0001*t*t*t ) );\n    }\n\n\treturn vec3( clamp(col,0.0,1.0) );\n}\n\nmat3 setCamera( in vec3 ro, in vec3 ta, float cr )\n{\n\tvec3 cw = normalize(ta-ro);\n\tvec3 cp = vec3(sin(cr), cos(cr),0.0);\n\tvec3 cu = normalize( cross(cw,cp) );\n\tvec3 cv =          ( cross(cu,cw) );\n    return mat3( cu, cv, cw );\n}\n\nvoid mainImage( out vec4 fragColor, in vec2 fragCoord )\n{\n    vec2 mo = iMouse.xy\/iResolution.xy;\n\tfloat time = 32.0 + iTime*1.5;\n\n    \/\/ camera\t\n    vec3 ta = vec3( 0.25, -0.75, -0.75 );\n    vec3 ro = ta + vec3( 4.5*cos(0.1*time + 7.0*mo.x), 2.2, 4.5*sin(0.1*time + 7.0*mo.x) );\n    \/\/ camera-to-world transformation\n    mat3 ca = setCamera( ro, ta, 0.0 );\n\n    vec3 tot = vec3(0.0);\n#if AA>1\n    for( int m=ZERO; m<AA; m++ )\n    for( int n=ZERO; n<AA; n++ )\n    {\n        \/\/ pixel coordinates\n        vec2 o = vec2(float(m),float(n)) \/ float(AA) - 0.5;\n        vec2 p = (2.0*(fragCoord+o)-iResolution.xy)\/iResolution.y;\n#else    \n        vec2 p = (2.0*fragCoord-iResolution.xy)\/iResolution.y;\n#endif\n\n        \/\/ focal length\n        const float fl = 2.5;\n        \n        \/\/ ray direction\n        vec3 rd = ca * normalize( vec3(p,fl) );\n\n         \/\/ ray differentials\n        vec2 px = (2.0*(fragCoord+vec2(1.0,0.0))-iResolution.xy)\/iResolution.y;\n        vec2 py = (2.0*(fragCoord+vec2(0.0,1.0))-iResolution.xy)\/iResolution.y;\n        vec3 rdx = ca * normalize( vec3(px,fl) );\n        vec3 rdy = ca * normalize( vec3(py,fl) );\n        \n        \/\/ render\t\n        vec3 col = render( ro, rd, rdx, rdy );\n\n        \/\/ gain\n        \/\/ col = col*3.0\/(2.5+col);\n        \n\t\t\/\/ gamma\n        col = pow( col, vec3(0.4545) );\n\n        tot += col;\n#if AA>1\n    }\n    tot \/= float(AA*AA);\n#endif\n    \n    fragColor = vec4( tot, 1.0 );\n}',
//         name: "Image",
//         description: "",
//         type: "image",
//       },
//     ],
//   },
//   {
//     ver: "0.1",
//     info: {
//       id: "tlVGDt",
//       date: "1580222118",
//       viewed: 418516,
//       name: "Octagrams",
//       username: "whisky_shusuky",
//       description: "Inspired by arabesque.\nhttps:\/\/cineshader.com\/editor",
//       likes: 555,
//       published: 3,
//       flags: 0,
//       usePreview: 0,
//       tags: [],
//     },
//     renderpass: [
//       {
//         inputs: [],
//         outputs: [{ id: "4dfGRr", channel: 0 }],
//         code: 'precision highp float;\n\n\nfloat gTime = 0.;\nconst float REPEAT = 5.0;\n\n\/\/ \u56de\u8ee2\u884c\u5217\nmat2 rot(float a) {\n\tfloat c = cos(a), s = sin(a);\n\treturn mat2(c,s,-s,c);\n}\n\nfloat sdBox( vec3 p, vec3 b )\n{\n\tvec3 q = abs(p) - b;\n\treturn length(max(q,0.0)) + min(max(q.x,max(q.y,q.z)),0.0);\n}\n\nfloat box(vec3 pos, float scale) {\n\tpos *= scale;\n\tfloat base = sdBox(pos, vec3(.4,.4,.1)) \/1.5;\n\tpos.xy *= 5.;\n\tpos.y -= 3.5;\n\tpos.xy *= rot(.75);\n\tfloat result = -base;\n\treturn result;\n}\n\nfloat box_set(vec3 pos, float iTime) {\n\tvec3 pos_origin = pos;\n\tpos = pos_origin;\n\tpos .y += sin(gTime * 0.4) * 2.5;\n\tpos.xy *=   rot(.8);\n\tfloat box1 = box(pos,2. - abs(sin(gTime * 0.4)) * 1.5);\n\tpos = pos_origin;\n\tpos .y -=sin(gTime * 0.4) * 2.5;\n\tpos.xy *=   rot(.8);\n\tfloat box2 = box(pos,2. - abs(sin(gTime * 0.4)) * 1.5);\n\tpos = pos_origin;\n\tpos .x +=sin(gTime * 0.4) * 2.5;\n\tpos.xy *=   rot(.8);\n\tfloat box3 = box(pos,2. - abs(sin(gTime * 0.4)) * 1.5);\t\n\tpos = pos_origin;\n\tpos .x -=sin(gTime * 0.4) * 2.5;\n\tpos.xy *=   rot(.8);\n\tfloat box4 = box(pos,2. - abs(sin(gTime * 0.4)) * 1.5);\t\n\tpos = pos_origin;\n\tpos.xy *=   rot(.8);\n\tfloat box5 = box(pos,.5) * 6.;\t\n\tpos = pos_origin;\n\tfloat box6 = box(pos,.5) * 6.;\t\n\tfloat result = max(max(max(max(max(box1,box2),box3),box4),box5),box6);\n\treturn result;\n}\n\nfloat map(vec3 pos, float iTime) {\n\tvec3 pos_origin = pos;\n\tfloat box_set1 = box_set(pos, iTime);\n\n\treturn box_set1;\n}\n\n\nvoid mainImage( out vec4 fragColor, in vec2 fragCoord ) {\n\tvec2 p = (fragCoord.xy * 2. - iResolution.xy) \/ min(iResolution.x, iResolution.y);\n\tvec3 ro = vec3(0., -0.2 ,iTime * 4.);\n\tvec3 ray = normalize(vec3(p, 1.5));\n\tray.xy = ray.xy * rot(sin(iTime * .03) * 5.);\n\tray.yz = ray.yz * rot(sin(iTime * .05) * .2);\n\tfloat t = 0.1;\n\tvec3 col = vec3(0.);\n\tfloat ac = 0.0;\n\n\n\tfor (int i = 0; i < 99; i++){\n\t\tvec3 pos = ro + ray * t;\n\t\tpos = mod(pos-2., 4.) -2.;\n\t\tgTime = iTime -float(i) * 0.01;\n\t\t\n\t\tfloat d = map(pos, iTime);\n\n\t\td = max(abs(d), 0.01);\n\t\tac += exp(-d*23.);\n\n\t\tt += d* 0.55;\n\t}\n\n\tcol = vec3(ac * 0.02);\n\n\tcol +=vec3(0.,0.2 * abs(sin(iTime)),0.5 + sin(iTime) * 0.2);\n\n\n\tfragColor = vec4(col ,1.0 - t * (0.02 + 0.02 * sin (iTime)));\n}\n\n\/** SHADERDATA\n{\n\t"title": "Octgrams",\n\t"description": "Lorem ipsum dolor",\n\t"model": "person"\n}\n*\/',
//         name: "Image",
//         description: "",
//         type: "image",
//       },
//     ],
//   },
// ];
