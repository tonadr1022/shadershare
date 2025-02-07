"use client";

import { Button } from "@/components/ui/button";
import { apiBaseURL, apiPath } from "@/api/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FaGoogle, FaGithub } from "react-icons/fa";

const loginButtonData = [
  {
    name: "Github",
    icon: <FaGithub className="w-4 h-4 mr-2" />,
    url: `${apiBaseURL}${apiPath}/auth/github`,
  },
  {
    name: "Google",
    icon: <FaGoogle className="w-4 h-4 mr-2" />,
    url: `${apiBaseURL}${apiPath}/auth/google`,
  },
];

export default function LoginForm() {
  return (
    <div className="flex flex-col min-h-[50vh] h-full w-full items-center justify-center px-4">
      <Card className="mx-auto max-w-sm">
        <CardHeader>
          <CardTitle className="text-2xl">Login</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-center">
          {loginButtonData.map((button) => (
            <Button
              variant="outline"
              className="w-full"
              key={button.name}
              onClick={() => {
                window.location.href = button.url;
              }}
            >
              {button.icon}
              Sign in with {button.name}
            </Button>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
