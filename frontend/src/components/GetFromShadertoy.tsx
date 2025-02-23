"use client";

import React, { useState } from "react";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import axiosInstance from "@/api/api";
import { toast } from "sonner";
import { useQuery } from "@tanstack/react-query";

const GetFromShadertoy = () => {
  const [link, setLink] = useState("");
  const [stt, setStt] = useState("");

  const { data, error, refetch, isLoading } = useQuery({
    queryKey: ["shadertoy", link],
    queryFn: async () => {
      const res = await axiosInstance.get(`/shadertoy/${link}`);
      if (res.status === 404) {
        toast.error("Shader not found");
      } else if (res.status === 200) {
        setStt(JSON.stringify(res.data));
      }
      return res.data;
    },
    enabled: false,
  });

  const handleClick = async () => {
    try {
      await refetch();
    } catch (err) {
      toast.error("Error fetching data");
    }
  };

  return (
    <>
      <div>
        <div className="flex">
          <Input value={link} onChange={(e) => setLink(e.target.value)} />
          <Button onClick={handleClick}>Fetch Shader</Button>
        </div>
        <div>
          {isLoading && <p>Loading...</p>}
          {stt && <pre>{stt}</pre>}
        </div>
      </div>
    </>
  );
};

export default GetFromShadertoy;
