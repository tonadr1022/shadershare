import { ShaderData } from "@/types/shader";

export const SimpleMultipass: ShaderData = {
  title: "MultipassSimple",
  description: "",
  render_passes: [
    {
      name: "Buffer A",
      pass_index: 0,
      code: `void mainImage( out vec4 fragColor, in vec2 fragCoord ) {
    vec2 uv = fragCoord/iResolution.xy;
    vec3 col = 0.5 + 0.5*cos(iTime+uv.xyx+vec3(0,2,4));
    fragColor = vec4(col,1.0); 
}
`,
    },
    {
      name: "Image",
      pass_index: 1,
      code: `void mainImage( out vec4 fragColor, in vec2 fragCoord ) {
    fragColor = vec4(texture(iChannel0,fragCoord).xyz,1.0); 
}`,
    },
  ],
};

export const MultipassExample: ShaderData = {
  title: "Multipass",
  description:
    "A simple multipass example. src: https://www.shadertoy.com/view/4ddSz4",
  render_passes: [
    {
      name: "Buffer A",
      pass_index: 0,
      code: `vec4 readMemory(vec2 coords) {
    return texture(iChannel0, (coords + 0.5)/iChannelResolution[0].xy);
}


void mainImage( out vec4 fragColor, in vec2 fragCoord ) {
    //Read data
    vec4 data1 = readMemory(vec2(0,0));
    vec2 pos1 = data1.xy;
    vec2 vel1 = data1.zw;
    
    vec4 data2 = readMemory(vec2(1,1));
    vec2 pos2 = data2.xy;
    vec2 vel2 = data2.zw;
    
    
    //Set initial values
    if(pos1.x == 0.0 && pos1.y == 0.0)
       pos1 = vec2(20,30); 
    if(pos2.x == 0.0 && pos2.y == 0.0)
       pos2 = vec2(iChannelResolution[0].x - 20.0,30); 
    if(vel1.x == 0.0 && vel1.y == 0.0)
       vel1 = vec2(1,1); 
    if(vel2.x == 0.0 && vel2.y == 0.0)
       vel2 = vec2(-1,1); 
    
    //Update positions
    pos1 += vel1;    
    pos2 += vel2;
    
    
    //Check boundaries and bounce
    if(pos1.x > iResolution.x)
        vel1.x = -1.0;
    if(pos1.x < 0.0)
        vel1.x = 1.0;
    if(pos1.y > iResolution.y)
        vel1.y = -1.0;
    if(pos1.y < 0.0)
        vel1.y = 1.0;
    
    if(pos2.x > iResolution.x)
        vel2.x = -1.0;
    if(pos2.x < 0.0)
        vel2.x = 1.0;
    if(pos2.y > iResolution.y)
        vel2.y = -1.0;
    if(pos2.y < 0.0)
        vel2.y = 1.0;
    
   
    //Write data
    if(fragCoord.x < 1.0 && fragCoord.y < 1.0) 
    	fragColor = vec4(pos1.x, pos1.y, vel1.x, vel1.y);
    else if(fragCoord.x < 2.0 && fragCoord.y < 2.0) 
    	fragColor = vec4(pos2.x, pos2.y, vel2.x, vel2.y);
    else
       discard;
}`,
    },
    {
      name: "Image",
      pass_index: 1,
      code: `vec4 readMemory(vec2 coords) {
    return texture(iChannel0, (coords + 0.5)/iChannelResolution[0].xy);
}

void mainImage( out vec4 fragColor, in vec2 fragCoord ) {
    vec4 data1 = readMemory(vec2(0,0));
    vec4 data2 = readMemory(vec2(1,1)); 
    
    vec2 pos1 = data1.xy;
    vec2 pos2 = data2.xy;
    
    vec4 col = vec4(0,0,0,1);
    if (distance(pos1, fragCoord.xy) < 20.0)
        col = vec4(1,0,0,1);
    else if (distance(pos2, fragCoord.xy) < 15.0)
        col = vec4(1,1,0,1);
    
	fragColor = col;
}`,
    },
  ],
};

export const MultiPassRed: ShaderData = {
  title: "MultiPassRed",
  description: "",
  render_passes: [
    {
      name: "Buffer A",
      pass_index: 0,
      code: ` vec4 readMemory(vec2 coords) {
    return texture(iChannel0, (coords + 0.5)/iChannelResolution[0].xy);
}
void mainImage(out vec4 fragColor, in vec2 fragCoord) {
    vec4 data1 = readMemory(fragCoord);
    if (data1.x == 0. && data1.y == 0. &&
        data1.z == 0.) {
        data1 = vec4(fragCoord/iChannelResolution[0].xy,0.,1.);
        }
    data1.zyw = vec3(fragCoord.y/iChannelResolution[0].y,0.,1.);
    data1.x += 0.001;
    if (data1.x > 1.0) {
        data1.x = 0.;
    }
    fragColor = data1;
}
`,
    },
    {
      name: "Image",
      pass_index: 1,
      code: `vec4 readMemory(vec2 coords) {
    return texture(iChannel0, (coords + 0.5)/iChannelResolution[0].xy);
}

void mainImage( out vec4 fragColor, in vec2 fragCoord ) {
    vec4 data1 = readMemory(fragCoord);
	fragColor = data1;
}`,
    },
  ],
};

export const Examples: ShaderData[] = [
  MultipassExample,
  MultiPassRed,
  SimpleMultipass,
];
