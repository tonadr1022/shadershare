// components/Navbar.js
import Link from "next/link";

const Navbar = () => {
  return (
    <nav className="bg-primary p-4 shadow-lg">
      <div className="max-w-7xl mx-auto flex justify-between items-center">
        <Link href="/" className="text-foreground text-2xl font-bold">
          MyLogo
        </Link>
        <div className="space-x-4">
          <Link href="/" className="text-foreground ">
            Home
          </Link>
          <Link href="/about" className="text-foreground ">
            About
          </Link>
          <Link href="/" className="text-foreground">
            Contact
          </Link>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
