import Image from "next/image"; // Using Next.js Image component for optimized loading

const ProfileImage = ({ src, alt, size = 100 }) => {
  return (
    <div className="profile-image" style={{ width: size, height: size }}>
      <Image src={src} alt={alt} width={size} height={size} />
    </div>
  );
};

export default ProfileImage;
