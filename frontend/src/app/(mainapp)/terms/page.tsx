import React from "react";

import "./style.css";

type SectionProps = {
  heading: string;
  children: React.ReactNode;
};

const TermsSection = ({ heading, children }: SectionProps) => {
  return (
    <div className="flex flex-col bg-primary-foreground rounded-md p-4 w-full">
      <h3 className="pb-2">{heading}</h3>
      <div className="flex flex-col gap-2 text-sm">{children}</div>
    </div>
  );
};

const TermsPage = () => {
  return (
    <div className="terms-page flex flex-col items-center pt-8 gap-8  container mx-auto">
      <h1 className="text-center">Privacy Policy and Terms of Service</h1>
      <div className=" flex flex-col  items-center gap-4">
        <p className="text-center">
          By using this website, you agree to our Privacy Policy and Terms of
          Service.
        </p>
        <TermsSection heading="Cookies">
          <p>
            Cookies are required to use ShaderShare. They are used solely to
            identify users and maintain sessions.
          </p>
          <p>
            Cookies are not used to track any user actions or store any content
            they search for.
          </p>
        </TermsSection>
        <TermsSection heading="User Content">
          <p>
            Users are allowed to upload their shaders and share them with the
            community.
          </p>
          <p>
            Users are not allowed to upload any content that violates copyright
            laws or is not owned by them.
          </p>
        </TermsSection>
        <TermsSection heading="User Data">
          <p>
            User data is not shared with any third parties. It is used solely to
            provide the service.
          </p>
        </TermsSection>
        <TermsSection heading="Terms of Service">
          <p>ShaderShare is not responsible for any content you create.</p>
          <p>
            ShaderShare reserves the right to suspend any user account without
            further notice or block any content without futher notice.
          </p>
          <p>
            Although ShaderShare owns content storage, users retain all rights
            to their creations and can decide a license.
          </p>
        </TermsSection>
      </div>
    </div>
  );
};

export default TermsPage;
