export type RenderPass = {
  code: string;
  pass_idx: number;
};

export type ShaderData = {
  title: string;
  description: string;
  render_passes: RenderPass[];
};
