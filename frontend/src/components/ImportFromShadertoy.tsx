"use client";
import {
  AccessLevel,
  BufferProps,
  DefaultTextureProps,
  ShaderData,
  ShaderInput,
  ShaderOutputFull,
  ShaderOutputName,
  shaderOutputNamesStrs,
  ShaderOutputType,
  ShaderToyShader,
  TextureProps,
} from "@/types/shader";
import React, { useCallback } from "react";
import Dropzone, { DropzoneState } from "shadcn-dropzone";
import { toast } from "sonner";

const textureLinks = [
  "https://i.postimg.cc/vT9GNW3N/08b42b43ae9d3c0605da11d0eac86618ea888e62cdd9518ee8b9097488b31560.png",
  "https://i.postimg.cc/h4Hj1GpY/0a40562379b63dfb89227e6d172f39fdce9022cba76623f1054a2c83d6c0ba5d.png",
  "https://i.postimg.cc/Fs3KWQ6H/0c7bf5fe9462d5bffbd11126e82908e39be3ce56220d900f633d58fb432e56f5.png",
  "https://i.postimg.cc/g0kk2L2x/10eb4fe0ac8a7dc348a2cc282ca5df1759ab8bf680117e4047728100969e7b43.jpg",
  "https://i.postimg.cc/VkFkwWmy/1f7dca9c22f324751f2a5a59c9b181dfe3b5564a04b724c657732d0bf09c99db.jpg",
  "https://i.postimg.cc/m2fLF5rf/3083c722c0c738cad0f468383167a0d246f91af2bfa373e9c5c094fb8c8413e0.png",
  "https://i.postimg.cc/jdHs64WW/3871e838723dd6b166e490664eead8ec60aedd6b8d95bc8e2fe3f882f0fd90f0.jpg",
  "https://i.postimg.cc/1t8mpx6P/52d2a8f514c4fd2d9866587f4d7b2a5bfa1a11a0e772077d7682deb8b3b517e5.jpg",
  "https://i.postimg.cc/SKskh0g8/79520a3d3a0f4d3caa440802ef4362e99d54e12b1392973e4ea321840970a88a.jpg",
  "https://i.postimg.cc/BvYZLZjM/85a6d68622b36995ccb98a89bbb119edf167c914660e4450d313de049320005c.png",
  "https://i.postimg.cc/fR5DpWfD/8979352a182bde7c3c651ba2b2f4e0615de819585cc37b7175bcefbca15a6683.jpg",
  "https://i.postimg.cc/NjtjZzh7/8de3a3924cb95bd0e95a443fff0326c869f9d4979cd1d5b6e94e2a01f5be53e9.jpg",
  "https://i.postimg.cc/L4Z45p23/92d7758c402f0927011ca8d0a7e40251439fba3a1dac26f5b8b62026323501aa.jpg",
  "https://i.postimg.cc/B6RqphcF/95b90082f799f48677b4f206d856ad572f1d178c676269eac6347631d4447258.jpg",
  "https://i.postimg.cc/Z5JJwv3w/ad56fba948dfba9ae698198c109e71f118a54d209c0ea50d77ea546abad89c57.png",
  "https://i.postimg.cc/zfc5DdQQ/bd6464771e47eed832c5eb2cd85cdc0bfc697786b903bfd30f890f9d4fc36657.jpg",
  "https://i.postimg.cc/jd4bnq9P/cb49c003b454385aa9975733aff4571c62182ccdda480aaba9a8d250014f00ec.png",
  "https://i.postimg.cc/d1ZFh2PV/cbcbb5a6cfb55c36f8f021fbb0e3f69ac96339a39fa85cd96f2017a2192821b5.png",
  "https://i.postimg.cc/d38KBJ0M/cd4c518bc6ef165c39d4405b347b51ba40f8d7a065ab0e8d2e4f422cbc1e8a43.jpg",
  "https://i.postimg.cc/2ypDh1rF/e6e5631ce1237ae4c05b3563eda686400a401df4548d0f9fad40ecac1659c46c.jpg",
  "https://i.postimg.cc/XNF33kk2/f735bee5b64ef98879dc618b016ecf7939a5756040c2cde21ccb15e69a6e1cfb.png",
  "https://i.postimg.cc/65XKQ4HB/fb918796edc3d2221218db0811e240e72e340350008338b0c07a52bd353666a6.jpg",
];
const parseJsonFile = (file: File) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        if (!event.target) {
          reject("no event target");
          return;
        }
        if (typeof event.target.result !== "string") {
          reject("wrong type for parsing JSON");
          return;
        }
        const jsonObj = JSON.parse(event.target.result);
        resolve(jsonObj);
      } catch (e) {
        reject(e);
      }
    };
    reader.onerror = (e) => reject(e);
    reader.readAsText(file);
  });
};

type ShadertoyImportArray = {
  date: Date;
  numShaders: number;
  shaders: ShaderToyShader[];
  userName: string;
};
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const isShadertoyImportArray = (data: any): data is ShadertoyImportArray => {
  return (
    data && typeof data.numShaders === "number" && Array.isArray(data.shaders)
  );
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const isShadertoyImport = (data: any): data is ShaderToyShader => {
  try {
    return (
      data &&
      Array.isArray(data.renderpass) &&
      data.info &&
      typeof data.info.id === "string"
    );
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
  } catch (e) {
    return false;
  }
};

const ImportFromShadertoy = () => {
  const handleUpload = useCallback(async (acceptedFiles: File[]) => {
    const shadertoyShaders: ShaderToyShader[] = [];
    for (const file of acceptedFiles) {
      if (file.type !== "application/json") {
        toast.error(`File ${file.name} is not of type JSON.`);
        continue;
      }

      try {
        const parsedJSON = await parseJsonFile(file);
        if (isShadertoyImportArray(parsedJSON)) {
          toast.success("upload array");
          for (const shader of parsedJSON.shaders) {
            shadertoyShaders.push(shader);
          }
        } else if (isShadertoyImport(parsedJSON)) {
          toast.success("upload shader");
          shadertoyShaders.push(parsedJSON);
        } else {
          toast.error(`File ${file.name} is not a Shadertoy export.`);
          continue;
        }

        // eslint-disable-next-line @typescript-eslint/no-unused-vars
      } catch (e) {
        toast.error("Cannot import: invalid JSON");
      }
    }
    const newShaders: ShaderData[] = [];
    for (const stShader of shadertoyShaders) {
      let validShader = true;
      const errors: string[] = [];
      const info = stShader.info;
      const shader: ShaderData = {
        shader: {
          id: "",
          user_id: "",
          access_level: AccessLevel.PRIVATE,
          created_at: "",
          preview_img_url: "",
          updated_at: "",
          description: `${info.description}

Imported From Shadertoy. See original at https://shadertoy.com/view/${info.id}`,
          title: info.name,
        },
        shader_outputs: [],
      };
      for (const rp of stShader.renderpass) {
        if (!shaderOutputNamesStrs.includes(rp.name)) {
          errors.push(
            "Failed to import Shadertoy shader: renderpass name: " + rp.name,
          );
          validShader = false;
          break;
        }
        const types = ["common", "image", "buffer"];
        if (!types.includes(rp.type)) {
          errors.push(
            "Failed to import Shadertoy shader: unsupported renderpass type: " +
              rp.type,
          );
          validShader = false;
          break;
        }
        const out: ShaderOutputFull = {
          shader_inputs: [],
          type: rp.type as ShaderOutputType,
          code: rp.code,
          name: rp.name as ShaderOutputName,
        };
        for (let i = 0; i < rp.inputs.length; i++) {
          const stInput = rp.inputs[i];
          const newInput: ShaderInput = {
            idx: i,
            type: "buffer",
            properties: { name: "Buffer A" },
          };

          if (stInput.ctype === "buffer") {
            newInput.type = "buffer";
            newInput.properties = { name: "Buffer A" };
            const props = newInput.properties as BufferProps;
            if (stInput.channel === 0) {
              props.name = "Buffer A";
            } else if (stInput.channel === 1) {
              props.name = "Buffer B";
            } else if (stInput.channel === 2) {
              props.name = "Buffer C";
            } else if (stInput.channel === 3) {
              props.name = "Buffer D";
            }
          } else if (stInput.ctype === "texture") {
            newInput.properties = DefaultTextureProps;
            const props = newInput.properties as TextureProps;
            props.filter = stInput.sampler.filter;
            props.wrap = stInput.sampler.wrap;
            props.vflip = stInput.sampler.vflip;
            const parts = stInput.src.split("/");
            if (parts.length === 0) {
              errors.push("invalid texture URL");
              validShader = false;
              break;
            }
            const texFilename = parts[parts.length - 1];
            const url = textureLinks.find((link) => link.includes(texFilename));
            if (!url) {
              errors.push("texture URL not found: " + texFilename);
              validShader = false;
              break;
            }
            newInput.url = url;
            newInput.type = "texture";
          } else {
            errors.push("Shader input type not supported: " + stInput.ctype);
            validShader = false;
            break;
          }
        }
        for (const err of errors) {
          toast.error(err);
        }
        if (!validShader) break;
      }

      if (!validShader) {
        continue;
      }
      toast.success("hello parse");
      // upload shader
    }
  }, []);
  return (
    <div className="h-24">
      <Dropzone onDrop={handleUpload}>
        {(dropzone: DropzoneState) => (
          <div className="h-24 flex flex-col justify-center" id="test">
            {dropzone.isDragAccept ? (
              <h6 className="">Drop Here</h6>
            ) : (
              <div className="flex items-center flex-col gap-1.5">
                <h6>Drop or Click to Upload and Import Shadertoy JSON files</h6>
              </div>
            )}
          </div>
        )}
      </Dropzone>
    </div>
  );
};

export default ImportFromShadertoy;
