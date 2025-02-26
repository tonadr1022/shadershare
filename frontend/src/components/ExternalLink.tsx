const ExternalLink = ({
  children,
  href,
  blank = true,
}: {
  href: string;
  children: React.ReactNode;
  blank?: boolean;
}) => {
  return (
    <a
      className="hover:underline text-blue-500"
      target={blank ? "_blank" : "_self"}
      href={href}
    >
      {children}
    </a>
  );
};
export default ExternalLink;
